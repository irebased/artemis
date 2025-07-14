import pako from 'pako';

/**
 * Compress settings object with pako and encode as base64
 * @param obj Settings object to compress
 * @returns Base64 encoded compressed settings string
 */
export function compressSettings(obj: any): string {
  const json = JSON.stringify(obj);
  const compressed = pako.deflate(json, { level: 9 });
  return btoa(String.fromCharCode.apply(null, compressed));
}

/**
 * Decompress base64 encoded settings string
 * @param str Base64 encoded compressed settings string
 * @returns Decompressed settings object
 */
export function decompressSettings(str: string): any {
  const compressed = Uint8Array.from(atob(str), c => c.charCodeAt(0));
  const decompressed = pako.inflate(compressed);
  return JSON.parse(new TextDecoder().decode(decompressed));
}