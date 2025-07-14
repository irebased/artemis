/**
 * Make base64 string URL safe by replacing characters that need encoding in URLs
 * @param base64 The standard base64 string
 * @returns URL-safe base64 string
 */
export function makeBase64UrlSafe(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Convert URL-safe base64 back to standard base64 format
 * @param base64url The URL-safe base64 string
 * @returns Standard base64 string
 */
export function makeBase64UrlUnsafe(base64url: string): string {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  // Only add padding if the length is not already a multiple of 4
  const remainder = base64.length % 4;
  if (remainder > 0) {
    base64 += '='.repeat(4 - remainder);
  }
  return base64;
}