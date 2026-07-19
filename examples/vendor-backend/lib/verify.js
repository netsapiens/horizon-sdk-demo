/**
 * Webhook authenticity verification for the Horizon remoteAuth callback.
 *
 * Two signals, with different roles:
 *
 *   1. HMAC (`X-NS-Signature`) — the PRIMARY, always-required gate. Proves the
 *      sender holds this app's shared callback secret. A webhook that fails (or
 *      omits) the HMAC is rejected outright.
 *   2. Cluster JWT (`X-NS-Cluster-Verification`) — an OPTIONAL, additive
 *      attestation. RS256, signed by INSight, verified against INSight's
 *      published JWKS. Proves the webhook came from a real NetSapiens cluster and
 *      names the client/cluster — without any pre-shared secret. The platform
 *      sends it best-effort (it depends on a live INSight fetch and cluster
 *      config), so it can legitimately be absent. Policy here: verify it WHEN
 *      PRESENT and reject on failure (a genuine cluster sends a valid one); skip
 *      cleanly when absent, since the HMAC already authenticated the sender.
 */
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';

/**
 * Verify the `X-NS-Signature` HMAC.
 *
 * The signed material is the STRING `request_id + code + timestamp` (NOT the raw
 * request body), HMAC-SHA256, hex-encoded. The header is `sha256=` prefixed.
 *
 * @returns {{ ok: boolean, reason?: string }}
 */
export function verifyHmacSignature(body, signatureHeader, sharedSecret) {
  if (!signatureHeader) return { ok: false, reason: 'missing X-NS-Signature' };
  if (!sharedSecret)
    return { ok: false, reason: 'no shared secret configured' };

  const [algo, sig] = signatureHeader.split('=');
  if (algo !== 'sha256')
    return { ok: false, reason: `unsupported algo: ${algo}` };
  if (!sig) return { ok: false, reason: 'malformed signature header' };

  const signedData = `${body.request_id}${body.code}${body.timestamp}`;
  const expected = crypto
    .createHmac('sha256', sharedSecret)
    .update(signedData)
    .digest('hex');

  // Constant-time compare. Bail before timingSafeEqual if lengths differ — it
  // throws on unequal-length buffers.
  const a = Buffer.from(sig, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: 'signature mismatch' };
  }
  return { ok: true };
}

let jwks; // lazily created; the client caches keys internally
function getJwksClient(jwksUri) {
  if (!jwks)
    jwks = new JwksClient({ jwksUri, cache: true, cacheMaxAge: 600_000 });
  return jwks;
}

/**
 * Verify the `X-NS-Cluster-Verification` RS256 JWT against INSight's JWKS.
 *
 * Resolves to the decoded claims on success; rejects on any failure. Requires
 * the JWT's `scope` to be `verification` and its `appId` to match this app.
 */
export async function verifyClusterToken(
  token,
  { jwksUri, issuer, expectedAppId },
) {
  if (!token) throw new Error('missing X-NS-Cluster-Verification');

  const decodedHeader = jwt.decode(token, { complete: true });
  const kid = decodedHeader?.header?.kid;
  if (!kid) throw new Error('cluster JWT has no kid');

  const key = await getJwksClient(jwksUri).getSigningKey(kid);
  const claims = jwt.verify(token, key.getPublicKey(), {
    algorithms: ['RS256'],
    issuer,
  });

  if (claims.scope !== 'verification') {
    throw new Error(`unexpected JWT scope: ${claims.scope}`);
  }
  if (claims.appId !== expectedAppId) {
    throw new Error(
      `appId mismatch: expected ${expectedAppId}, got ${claims.appId}`,
    );
  }
  return claims;
}
