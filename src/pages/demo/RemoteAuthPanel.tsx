/**
 * DemoPage tab: Remote Auth — trusted identity handshake with your own backend.
 *
 * Demonstrates the full `horizonContext.auth` contract live: request a token,
 * read the session-cached token, and clear it. The NetSapiens platform binds the
 * identity to the caller's trusted session, issues a single-use auth *code*, and
 * POSTs it (signed) to the backend's registered callback endpoint. The backend verifies the
 * signature, exchanges the code (PKCE) for a token proving the user, mints its
 * own vendor token, and returns it — which resolves the promise.
 *
 * This panel only exercises the client half of the flow — it requires a Horizon
 * host plus the per-app admin config (remote auth enabled, allowed hostnames,
 * signing secret). Against a host without it, the request rejects/timeouts and
 * the panel renders the error, which is the point: the contract is what the demo
 * shows. The signing, code exchange, and response shaping are handled by the
 * platform server-side; the response is mapped through an explicit allow-list
 * (no generic `metadata` pass-through today). See examples/vendor-backend for a
 * runnable reference of the backend side.
 */
import type {
  RemoteAuthError,
  RemoteAuthResponse,
} from '@netsapiens/horizon-sdk';
import { useCallback, useState } from 'react';
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import type { DemoStyles, DemoTheme } from './styles';
import { CodeBlock } from '../../components/CodeBlock';
import { subheading } from './styles';

// Demo vendor identity. `vendorId` names which backend to authenticate against
// and is the key the token is cached under.
//
// There is deliberately NO callbackUrl here: where the webhook is sent is
// registration data, set by an administrator in Registered Apps. It used to be a
// request field, which meant browser-side code chose where a redeemable
// authorization code was POSTed.
const VENDOR_ID = 'horizon-demo-backend';
const SCOPES = ['contacts:read'];

// ⚠️ VESTIGIAL, and only here to compile.
//
// The API ignores any callbackUrl in the request — the destination is
// registration data now. But this demo depends on @netsapiens/horizon-sdk 0.2.4,
// whose `RemoteAuthRequest.callbackUrl` is still REQUIRED, so the live call below
// cannot omit it yet. Drop this constant (and the property at its call site) at
// the next SDK bump, once the field is optional. The snippets on this page
// already show the current shape, because that is what a partner should copy.
const LEGACY_IGNORED_CALLBACK_URL = 'https://demo.example.com/horizon/callback';

const CLIENT_SNIPPET = `// Simplest form: authenticate as soon as the app loads, no button.
const { token, status, error, retry } = useRemoteAuth(
  horizonContext,
  '${VENDOR_ID}',
  { scopes: ${JSON.stringify(SCOPES)} },
);
// status: 'idle' | 'pending' | 'ready' | 'error'

// Or drive it yourself — for a "Connect X" button, where the user picks which
// integration to authenticate against.
const { auth } = horizonContext;
let onDemand = auth.getRemoteAuthToken('${VENDOR_ID}');
if (!onDemand) {
  onDemand = await auth.requestRemoteAuth(
    { vendorId: '${VENDOR_ID}', scopes: ${JSON.stringify(SCOPES)} },
    { timeout: 60000 },
  );
}

// token: { vendorId, accessToken, tokenType?, expiresAt?, refreshToken?, metadata? }
await fetch('https://demo.example.com/api/contacts', {
  headers: { Authorization: \`\${token.tokenType ?? 'Bearer'} \${token.accessToken}\` },
});

auth.clearRemoteAuthToken('${VENDOR_ID}'); // sign out of the vendor`;

const BACKEND_SNIPPET = `// Your backend webhook — the NetSapiens API POSTs a single-use CODE here
// (not a token). Headers: X-NS-Request-ID, X-NS-Timestamp,
// X-NS-Signature: sha256=<hex>, X-NS-Signature-Version: 2,
// X-NS-Platform-Assertion: <RS256 JWT>, X-NS-Cluster-Verification: <RS256 JWT>.
// Body: { request_id, code, code_verifier, user: { uid, domain, displayName },
//   vendor_id, app_id, platform: { client_id, client, cluster_id, ... },
//   expires_in, validation_endpoint, timestamp, pkce_enabled }
//
// Capture the RAW body — signature v2 is an HMAC over the exact bytes, so
// JSON.stringify(req.body) will not match.
app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));

app.post('/horizon/callback', async (req, res) => {
  const { code, validation_endpoint } = req.body;
  const timestamp = req.get('X-NS-Timestamp');

  // 1. Verify the HMAC (v2). It signs "<timestamp>." + the RAW request body.
  //    There is no 'signature' field in the body: a signature cannot cover a
  //    body containing it.
  const [algo, sig] = (req.get('X-NS-Signature') ?? '').split('=');
  const expected = crypto
    .createHmac('sha256', process.env.HORIZON_CALLBACK_SECRET)
    .update(\`\${timestamp}.\`)
    .update(req.rawBody)
    .digest('hex');
  const ok =
    algo === 'sha256' &&
    sig?.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  if (!ok) return res.status(401).json({ error: 'invalid_signature' });
  // Reject a stale timestamp too — it is inside the signed string, so this is
  // what stops a captured webhook being replayed.
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300)
    return res.status(401).json({ error: 'stale_timestamp' });
  // HMAC is the required gate. X-NS-Platform-Assertion (always available, signed
  // by the calling cluster) and X-NS-Cluster-Verification (NetSapiens-issued,
  // may be absent) are RS256 JWTs verified against published JWKS.

  // 2. Exchange the code (PKCE) at the validation_endpoint for an NS token
  //    that cryptographically proves the user's identity.
  const nsToken = await exchangeCodeWithPkce(validation_endpoint, code);

  // 3. Mint YOUR OWN vendor token, bound to the identity the exchange PROVED
  //    (nsToken.uid) — never the request body's user.uid. Return OAuth
  //    snake_case; the NetSapiens API maps it onto RemoteAuthResponse via an
  //    explicit allow-list: access_token->accessToken, token_type->tokenType,
  //    expires_in->expiresAt (absolute unix: time()+expires_in),
  //    refresh_token->refreshToken. vendorId + a user block are added by the
  //    platform. Extra keys are dropped (no metadata pass-through today).
  res.json({
    access_token: mintVendorToken(nsToken),
    token_type: 'Bearer',
    expires_in: 3600,
  });
});`;

type Status = 'idle' | 'pending' | 'connected' | 'error';

export default function RemoteAuthPanel({
  s,
  themeTokens,
}: {
  s: DemoStyles;
  themeTokens: DemoTheme;
}) {
  const { auth, ui } = useHorizonContext();

  // Seed from the session cache so a prior connection survives a tab switch.
  const [token, setToken] = useState<RemoteAuthResponse | null>(() =>
    auth?.getRemoteAuthToken ? auth.getRemoteAuthToken(VENDOR_ID) : null,
  );
  const [status, setStatus] = useState<Status>(token ? 'connected' : 'idle');
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (!auth?.requestRemoteAuth) return;
    setStatus('pending');
    setError(null);
    try {
      const res = await auth.requestRemoteAuth(
        {
          vendorId: VENDOR_ID,
          scopes: SCOPES,
          callbackUrl: LEGACY_IGNORED_CALLBACK_URL, // ignored by the API; see above
        },
        { timeout: 60000 },
      );
      setToken(res);
      setStatus('connected');
    } catch (e) {
      const err = e as Partial<RemoteAuthError> & { message?: string };
      setError(
        err.errorDescription ??
          err.error ??
          err.message ??
          'Remote auth failed',
      );
      setStatus('error');
    }
  }, [auth]);

  const disconnect = useCallback(() => {
    auth?.clearRemoteAuthToken?.(VENDOR_ID);
    setToken(null);
    setStatus('idle');
    setError(null);
  }, [auth]);

  const Button = ui?.Button;

  // Plain button fallback so the panel still works if the host UI kit is absent.
  const actionButton = (
    label: string,
    onClick: () => void,
    opts: { disabled?: boolean; color?: 'primary' | 'error' } = {},
  ) =>
    Button ? (
      <Button
        variant='contained'
        color={opts.color ?? 'primary'}
        disabled={opts.disabled}
        onClick={onClick}
      >
        {label}
      </Button>
    ) : (
      <button
        onClick={onClick}
        disabled={opts.disabled}
        style={{
          padding: `${themeTokens.spacing.sm} ${themeTokens.spacing.lg}`,
          backgroundColor:
            opts.color === 'error'
              ? themeTokens.colors.error
              : themeTokens.colors.primary,
          color: '#fff',
          border: 'none',
          borderRadius: themeTokens.borderRadius.sm,
          cursor: opts.disabled ? 'default' : 'pointer',
          opacity: opts.disabled ? 0.6 : 1,
          fontFamily: themeTokens.typography.fontFamily.sans,
          fontSize: themeTokens.typography.fontSize.sm,
        }}
      >
        {label}
      </button>
    );

  return (
    <div style={s.surface.card}>
      <h2
        style={{ ...s.text.subheading, marginBottom: themeTokens.spacing.md }}
      >
        Remote authentication
      </h2>
      <p style={{ ...s.text.muted, marginBottom: themeTokens.spacing.lg }}>
        When the app needs to call <em>your</em> backend on behalf of the
        signed-in user, the host relays a trusted identity handshake — your
        server proves the request came from Horizon (HMAC signature), exchanges
        the delivered code for proof of identity, and issues its own vendor
        token. The app never handles Horizon credentials.
      </p>

      {/* Live demo */}
      <div
        style={{ ...s.surface.elevated, marginBottom: themeTokens.spacing.lg }}
      >
        <div style={subheading(s, themeTokens)}>Try it</div>
        <p style={{ ...s.text.muted, marginBottom: themeTokens.spacing.md }}>
          Requests a token from <code>{VENDOR_ID}</code> via{' '}
          <code>auth.requestRemoteAuth()</code>. Requires a host with remote
          auth wired up and the callback hostname allow-listed for this app;
          otherwise the request rejects and you'll see the error here.
        </p>

        <div
          style={{
            display: 'flex',
            gap: themeTokens.spacing.sm,
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: themeTokens.spacing.md,
          }}
        >
          {status !== 'connected'
            ? actionButton(
                status === 'pending' ? 'Connecting…' : 'Connect to backend',
                connect,
                { disabled: status === 'pending' },
              )
            : actionButton('Disconnect', disconnect, { color: 'error' })}

          <span
            style={{
              ...s.text.body,
              color:
                status === 'connected'
                  ? themeTokens.colors.success
                  : status === 'error'
                    ? themeTokens.colors.error
                    : themeTokens.colors.text.secondary,
              fontWeight: themeTokens.typography.fontWeight.medium,
            }}
          >
            {status === 'connected'
              ? '● Connected'
              : status === 'pending'
                ? '○ Awaiting host handshake…'
                : status === 'error'
                  ? '● Failed'
                  : '○ Not connected'}
          </span>
        </div>

        {status === 'error' && error && (
          <div
            style={{
              padding: themeTokens.spacing.sm,
              backgroundColor: themeTokens.colors.error + '15',
              borderLeft: `4px solid ${themeTokens.colors.error}`,
              borderRadius: themeTokens.borderRadius.sm,
              ...s.text.body,
              color: themeTokens.colors.text.primary,
            }}
          >
            {error}
          </div>
        )}

        {status === 'connected' && token && (
          <CodeBlock>{JSON.stringify(token, null, 2)}</CodeBlock>
        )}
      </div>

      {/* The flow */}
      <div style={subheading(s, themeTokens)}>How the handshake works</div>
      <ol
        style={{
          ...s.text.body,
          paddingLeft: themeTokens.spacing.lg,
          marginBottom: themeTokens.spacing.lg,
        }}
      >
        <li>
          App calls{' '}
          <code>
            useRemoteAuth(context, vendorId)&nbsp;— or{' '}
            <code>auth.requestRemoteAuth(&#123; vendorId, scopes &#125;)</code>
          </code>{' '}
          and awaits the promise. The host relays it to the NetSapiens platform.
        </li>
        <li>
          The API binds the identity to the caller's <em>trusted session</em>{' '}
          (not the request's <code>user.uid</code>, which is
          attacker-controllable), checks the signed-in user is entitled to this
          app, reads your <strong>registered</strong> callback endpoint(s),
          issues a single-use PKCE <strong>code</strong>, and POSTs it — signed
          — to the first endpoint that answers. The destination is never taken
          from the request.
        </li>
        <li>
          Backend verifies the <code>X-NS-Signature</code> HMAC (v2 — over{' '}
          <code>&quot;&lt;X-NS-Timestamp&gt;.&quot; + the raw body</code>, so
          hash the bytes before parsing), exchanges the code at the{' '}
          <code>validation_endpoint</code> for an NS token proving the user,
          then mints its own vendor token.
        </li>
        <li>
          The vendor token comes back as the <code>RemoteAuthResponse</code>,
          cached for the session; later reads come from{' '}
          <code>getRemoteAuthToken(vendorId)</code>.
        </li>
      </ol>

      {/* Client snippet */}
      <div style={subheading(s, themeTokens)}>In the app</div>
      <div style={{ marginBottom: themeTokens.spacing.lg }}>
        <CodeBlock>{CLIENT_SNIPPET}</CodeBlock>
      </div>

      {/* Backend snippet */}
      <div style={subheading(s, themeTokens)}>In your backend</div>
      <CodeBlock>{BACKEND_SNIPPET}</CodeBlock>

      <p style={{ ...s.text.muted, marginTop: themeTokens.spacing.md }}>
        Admin setup (per app, in Registered Apps): enable remote auth, list the
        allowed callback hostname(s), and set the callback signing secret your
        backend uses to verify <code>X-NS-Signature</code>.
      </p>
    </div>
  );
}
