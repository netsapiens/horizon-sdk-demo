# Remote-auth vendor backend (reference)

A runnable reference for the **vendor/server side** of the Horizon `remoteAuth`
flow. The browser-side extension calls `auth.requestRemoteAuth(...)` (see the
**Remote Auth** tab in the demo app); the NetSapiens API then POSTs a signed,
single-use authorization **code** to your `callbackUrl`. This server is what
receives that webhook and turns it into a vendor token.

It implements the NetSapiens remote-auth webhook contract: the `sha256=` HMAC
over `request_id + code + timestamp`, the PKCE code exchange (with an `S256`
`code_challenge` check), and the response shaping. The webhook also carries an
`X-NS-Cluster-Verification` JWT, signed by NetSapiens INSight and verifiable
against its published JWKS.

## What it does

```
NetSapiens API ── POST callbackUrl (signed code) ──▶  this server
                                                       │ 1. verify X-NS-Signature HMAC
                                                       │    (+ X-NS-Cluster-Verification JWT)
                                                       │ 2. exchange code (PKCE) at
                                                       │    validation_endpoint → NS token
                                                       │ 3. mint VENDOR token for that user
                                                       ▼
NetSapiens API ◀──── 2xx { access_token, ... } ───────┘
   │ shapes into RemoteAuthResponse, resolves the extension's promise
```

### The webhook you receive

Headers:

```
X-NS-Request-ID: remauth_<uniqid>
X-NS-Signature: sha256=<HMAC_SHA256(request_id + code + timestamp, secret)>
X-NS-Cluster-Verification: <RS256 JWT signed by INSight>
```

Body:

```json
{
  "request_id": "remauth_66542d5f3a1b28.12345678",
  "code": "<authorization code>",
  "code_verifier": "<PKCE verifier — only the vendor sees it>",
  "user": {
    "uid": "1042@acme.example.com",
    "domain": "acme.example.com",
    "displayName": "Alice Example"
  },
  "expires_in": 600,
  "validation_endpoint": "https://acme.example.com/oauth2/token",
  "timestamp": 1716720479,
  "pkce_enabled": true,
  "signature": "<duplicate of X-NS-Signature value>"
}
```

### The three things you MUST do

1. **Verify authenticity — both signals** (`lib/verify.js`). The HMAC proves the
   sender holds your app's shared secret; the cluster JWT (verified against
   INSight's JWKS) proves it's a real NetSapiens cluster. Either alone is
   insufficient. The HMAC is computed over the **string**
   `request_id + code + timestamp`, **not** the raw body.
2. **Exchange the code with PKCE** (`lib/exchange.js`) — `POST
validation_endpoint` form-encoded with `grant_type=authorization_code`,
   `code`, `code_verifier`, `username=user.uid`. No `client_id`/`client_secret`.
   The NS token it returns proves the user's identity.
3. **Mint your own vendor token** (`lib/token.js`) and return it as
   `{ access_token, token_type, expires_in, refresh_token? }`. The platform maps
   that onto the SDK's `RemoteAuthResponse` via an **explicit allow-list**:
   `access_token → accessToken`, `token_type → tokenType`
   (default `Bearer`), `expires_in → expiresAt` (absolute unix seconds,
   `time() + expires_in`), `refresh_token → refreshToken`, and
   `cluster_verification → clusterVerification` — each only if present. `vendorId`
   and a NetSapiens `user` block are added by the platform from the request/session.
   **Any other field you return is dropped** — there is no generic `metadata`
   pass-through today.

> Identity is bound server-side to the caller's **trusted session**, never to the
> request's `user.uid` (which is attacker-controllable). You receive the already
> validated identity — don't trust a `user.uid` from anywhere else.

## Run

```bash
npm install
cp .env.example .env   # fill in HORIZON_CALLBACK_SECRET, HORIZON_APP_ID, VENDOR_JWT_SECRET
node --env-file=.env server.js   # Node 20+ ; or: export the vars and `npm start`
```

The server listens on `PORT` (default 8787) at `CALLBACK_PATH`
(default `/horizon/callback`). Register `https://<your-host>:8787/horizon/callback`
as the app's callback URL, and put its hostname on the app's allowed-hostnames
list in Registered Apps.

## Local smoke test (no NetSapiens cluster)

`MOCK_MODE=1` skips the cluster-JWT verification and the live code exchange so
you can exercise signature verification + response shaping locally. **Never set
it in production.**

```bash
# terminal 1 — server in mock mode
HORIZON_CALLBACK_SECRET=test-secret VENDOR_JWT_SECRET=dev-secret MOCK_MODE=1 npm start

# terminal 2 — POST a correctly-signed mock webhook
HORIZON_CALLBACK_SECRET=test-secret npm run sign
```

Expected: `status: 200` and a JSON body with a freshly minted
`access_token`. Flip the secret in either terminal and you'll get
`401 invalid_signature` — the HMAC check working.

## Production notes

- Keep `HORIZON_CALLBACK_SECRET` and `VENDOR_JWT_SECRET` out of source control.
- Terminate TLS in front of this (`callbackUrl` must be HTTPS).
- The auth code is single-use and short-lived (`expires_in`); exchange it
  promptly and return within the platform's `remote_timeout_seconds`.
- This issues a self-signed JWT for illustration. Swap `lib/token.js` for however
  your product really issues tokens/sessions.
- The platform sends `X-NS-Signature` and `X-NS-Cluster-Verification`
  **best-effort** (e.g. the cluster JWT depends on a live INSight fetch). This
  reference requires **both** for defense in depth, so a degraded webhook missing
  one is rejected. That's the secure default; relax it only with a deliberate
  reason.
