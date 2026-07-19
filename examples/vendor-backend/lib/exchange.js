/**
 * Step 2 of the vendor's responsibilities: exchange the single-use code at the
 * `validation_endpoint` from the webhook, using the PKCE `code_verifier` that
 * the webhook also delivered (only the vendor ever sees it).
 *
 * The NetSapiens token endpoint detects the PKCE flow from the presence of
 * `code_verifier`, checks `SHA-256(code_verifier) == code_challenge` stored on
 * the code, validates `username` against the identity the code was minted for,
 * and returns a NetSapiens access token BOUND TO THE USER. That token is the
 * proof of identity the vendor needs before minting its own token. No
 * client_id / client_secret are presented.
 */

/**
 * @param {object} body           parsed webhook body (needs code, code_verifier,
 *                                 validation_endpoint, user.uid)
 * @param {object} [opts]
 * @param {string} [opts.redirectUri]  this server's registered callback URL;
 *                                 many token endpoints require it to match.
 * @returns {Promise<object>} the NetSapiens token response (proves the user)
 */
export async function exchangeCodeForNsToken(body, { redirectUri } = {}) {
  const { code, code_verifier, validation_endpoint, user } = body;

  if (!validation_endpoint) {
    throw new Error('webhook is missing validation_endpoint');
  }

  // ns-api advertises the token path as /oauth/token in the webhook, but the
  // live route is /oauth2/token (the /oauth/token form 404s). Correct that one
  // segment while keeping the cluster host the (verified) webhook supplied.
  const tokenEndpoint = validation_endpoint.replace(
    /\/oauth\/token(\?|$)/,
    '/oauth2/token$1',
  );

  const form = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    code_verifier,
    username: user.uid,
  });
  if (redirectUri) form.set('redirect_uri', redirectUri);

  const res = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });

  if (!res.ok) {
    // Keep the upstream body OUT of anything returned to the webhook caller;
    // it's only for this server's logs.
    const text = await res.text().catch(() => '');
    throw new Error(`code exchange failed: ${res.status} ${text.slice(0, 200)}`);
  }
  return res.json(); // e.g. { access_token, token_type, expires_in, uid, domain, ... }
}
