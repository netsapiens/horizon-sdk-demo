/**
 * Step 2 of the vendor's responsibilities: exchange the single-use code at the
 * `validation_endpoint` from the webhook, using the PKCE `code_verifier` that
 * the webhook also delivered (only the vendor ever sees it).
 *
 * The NetSapiens token endpoint detects the PKCE flow from the presence of
 * `code_verifier`, checks `SHA-256(code_verifier) == code_challenge` stored on
 * the code, and returns a NetSapiens access token BOUND TO THE USER. That token
 * is the proof of identity the vendor needs before minting its own token. No
 * client_id / client_secret are presented.
 */

/**
 * @param {object} body  the parsed webhook body (needs code, code_verifier,
 *                        validation_endpoint, user.uid)
 * @returns {Promise<object>} the NetSapiens token response (proves the user)
 */
export async function exchangeCodeForNsToken(body) {
  const { code, code_verifier, validation_endpoint, user } = body;

  const form = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    code_verifier,
    username: user.uid,
  });

  const res = await fetch(validation_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`code exchange failed: ${res.status} ${text.slice(0, 200)}`);
  }
  return res.json(); // e.g. { access_token, token_type, expires_in, ... }
}
