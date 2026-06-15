/**
 * Local smoke test: build a webhook payload, sign it the way the NetSapiens API
 * would (HMAC-SHA256 over `request_id + code + timestamp`), and POST it to the
 * running server. Use with MOCK_MODE=1 so the server skips the cluster-JWT
 * verification and the live code exchange.
 *
 *   HORIZON_CALLBACK_SECRET=test-secret MOCK_MODE=1 npm start   # terminal 1
 *   HORIZON_CALLBACK_SECRET=test-secret npm run sign            # terminal 2
 *
 * It does NOT send X-NS-Cluster-Verification, so it only works against a server
 * in MOCK_MODE. Real webhooks always carry both headers.
 */
import crypto from 'node:crypto';

const SECRET = process.env.HORIZON_CALLBACK_SECRET || 'test-secret';
const URL = process.env.TARGET_URL || 'http://localhost:8787/horizon/callback';

const request_id = `remauth_${crypto.randomBytes(6).toString('hex')}`;
const code = crypto.randomBytes(16).toString('hex');
const timestamp = Math.floor(Date.now() / 1000);

const signature = crypto
  .createHmac('sha256', SECRET)
  .update(`${request_id}${code}${timestamp}`)
  .digest('hex');

const body = {
  request_id,
  code,
  code_verifier: crypto.randomBytes(32).toString('base64url'),
  user: {
    uid: '1042@acme.example.com',
    domain: 'acme.example.com',
    displayName: 'Alice Example',
  },
  expires_in: 600,
  validation_endpoint: 'https://acme.example.com/oauth2/token',
  timestamp,
  pkce_enabled: true,
  signature,
};

const res = await fetch(URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-NS-Request-ID': request_id,
    'X-NS-Signature': `sha256=${signature}`,
    // No X-NS-Cluster-Verification — MOCK_MODE only.
  },
  body: JSON.stringify(body),
});

console.log('status:', res.status);
console.log('response:', JSON.stringify(await res.json(), null, 2));
