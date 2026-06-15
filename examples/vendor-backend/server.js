/**
 * Reference vendor backend for the Horizon remoteAuth flow.
 *
 * Receives the signed webhook the NetSapiens API POSTs to your `callbackUrl`,
 * verifies it, exchanges the PKCE code for proof of the user's identity, mints
 * the vendor's own token, and returns it. The Horizon platform shapes a 2xx
 * JSON response into the SDK's `RemoteAuthResponse` and resolves the
 * extension's `auth.requestRemoteAuth(...)` promise.
 *
 * This implements the NetSapiens remote-auth webhook contract (HMAC + cluster
 * JWT verification, PKCE code exchange, vendor-token minting). Run with
 * MOCK_MODE=1 to exercise it end-to-end with no cluster (see README +
 * scripts/sign.js).
 */
import express from 'express';

import { exchangeCodeForNsToken } from './lib/exchange.js';
import { mintVendorToken } from './lib/token.js';
import { verifyClusterToken, verifyHmacSignature } from './lib/verify.js';

const {
  PORT = '8787',
  CALLBACK_PATH = '/horizon/callback',
  HORIZON_CALLBACK_SECRET,
  HORIZON_APP_ID = 'horizon-extension-demo',
  INSIGHT_JWKS_URL = 'https://insight.netsapiens.com/.well-known/jwks.json',
  INSIGHT_ISSUER = 'https://insight.netsapiens.com',
  VENDOR_JWT_SECRET = 'dev-only-insecure-secret',
  VENDOR_TOKEN_TTL_SECONDS = '3600',
  MOCK_MODE = '0',
} = process.env;

const mock = MOCK_MODE === '1';
const ttlSeconds = Number(VENDOR_TOKEN_TTL_SECONDS);

const app = express();
app.use(express.json());

app.get('/healthz', (_req, res) => res.json({ ok: true, mock }));

app.post(CALLBACK_PATH, async (req, res) => {
  const body = req.body || {};
  const requestId = req.get('X-NS-Request-ID') || body.request_id;
  const log = (msg, extra) =>
    console.log(`[${requestId ?? 'no-request-id'}] ${msg}`, extra ?? '');

  try {
    // --- 1. Verify authenticity (BOTH signals; either alone is insufficient) ---
    const hmac = verifyHmacSignature(
      body,
      req.get('X-NS-Signature'),
      HORIZON_CALLBACK_SECRET,
    );
    if (!hmac.ok) {
      log('HMAC verification failed', hmac.reason);
      return res
        .status(401)
        .json({ error: 'invalid_signature', reason: hmac.reason });
    }
    log('HMAC verified');

    if (mock) {
      log('MOCK_MODE: skipping cluster-JWT verification');
    } else {
      await verifyClusterToken(req.get('X-NS-Cluster-Verification'), {
        jwksUri: INSIGHT_JWKS_URL,
        issuer: INSIGHT_ISSUER,
        expectedAppId: HORIZON_APP_ID,
      });
      log('cluster JWT verified');
    }

    // --- 2. Exchange the code (PKCE) for a NetSapiens token proving identity ---
    let nsToken;
    if (mock) {
      log('MOCK_MODE: skipping live code exchange');
      nsToken = {
        access_token: `mock-ns-token-for-${body.user?.uid}`,
        mock: true,
      };
    } else {
      nsToken = await exchangeCodeForNsToken(body);
      log('code exchanged for NS token');
    }

    // --- 3. Mint the vendor's OWN token for that verified user and return it ---
    const vendorToken = mintVendorToken(body.user, nsToken, {
      secret: VENDOR_JWT_SECRET,
      ttlSeconds,
    });
    log('minted vendor token', { sub: body.user?.uid });

    // 2xx + JSON. The platform maps { access_token, token_type, expires_in,
    // refresh_token? } onto RemoteAuthResponse via an explicit allow-list —
    // any other field is dropped (no generic metadata pass-through today).
    return res.status(200).json(vendorToken);
  } catch (err) {
    // Non-2xx / timeout / unparseable -> the platform returns 502 RA009 to the
    // SDK and the extension's promise rejects.
    log('callback failed', err.message);
    return res
      .status(401)
      .json({ error: 'verification_failed', message: err.message });
  }
});

app.listen(Number(PORT), () => {
  console.log(
    `vendor backend listening on :${PORT}${CALLBACK_PATH}` +
      (mock ? '  [MOCK_MODE — not for production]' : ''),
  );
  if (!HORIZON_CALLBACK_SECRET) {
    console.warn(
      'WARNING: HORIZON_CALLBACK_SECRET is unset — all webhooks will be rejected.',
    );
  }
});
