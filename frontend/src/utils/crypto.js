/**
 * Client-Side SHA-1 Hashing using standard Web Crypto API.
 * This guarantees that passwords never leave the browser in plaintext or full hash.
 * Only the 5-character prefix is sent to the server (k-Anonymity model).
 */
export async function sha1(text) {
  if (!text) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexString = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hexString.toUpperCase();
}

/**
 * Split SHA-1 into k-anonymity prefix (5 chars) and suffix (35 chars)
 */
export function splitHash(fullHash) {
  if (!fullHash || fullHash.length !== 40) {
    return { prefix: '', suffix: '' };
  }
  return {
    prefix: fullHash.slice(0, 5),
    suffix: fullHash.slice(5)
  };
}
