/**
 * Step 3: mint the VENDOR'S OWN token for the verified user. This is the token
 * the SDK ultimately hands back to the extension as `RemoteAuthResponse`.
 *
 * Here it's a self-signed JWT for illustration; in a real vendor backend this is
 * wherever your product issues sessions/tokens (your OAuth server, a DB-backed
 * opaque token, a real Salesforce/HubSpot token from your own OAuth app, etc.).
 * The key point: it is YOUR token, scoped to the user the NS exchange proved.
 */
import jwt from 'jsonwebtoken';

/**
 * @param {object} user      the user block from the webhook (uid/domain/displayName)
 * @param {object} nsToken   the NS token response from the code exchange (proof)
 * @param {object} opts      { secret, ttlSeconds }
 * @returns {{ access_token: string, token_type: string, expires_in: number }}
 */
export function mintVendorToken(user, nsToken, { secret, ttlSeconds }) {
  const accessToken = jwt.sign(
    {
      sub: user.uid,
      domain: user.domain,
      name: user.displayName,
      // Carry a reference to the NS proof if useful for your audit trail.
      ns_verified: Boolean(nsToken?.access_token),
    },
    secret,
    { expiresIn: ttlSeconds, issuer: 'horizon-remote-auth-vendor-backend' },
  );

  // snake_case OAuth shape. The NetSapiens platform maps this onto the SDK's
  // RemoteAuthResponse via an EXPLICIT ALLOW-LIST:
  //   access_token  -> accessToken
  //   token_type    -> tokenType   (defaults to 'Bearer' if omitted)
  //   expires_in    -> expiresAt   (absolute unix seconds: time() + expires_in)
  //   refresh_token -> refreshToken (only if present)
  //   cluster_verification -> clusterVerification (only if present)
  // Only those are mapped — any OTHER field you return is silently dropped.
  // There is no generic `metadata` pass-through today.
  return {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: ttlSeconds,
  };
}
