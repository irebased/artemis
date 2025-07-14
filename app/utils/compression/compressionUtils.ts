import pako from 'pako';
import { makeBase64UrlSafe, makeBase64UrlUnsafe } from '../base64/base64Utils';

/**
 * Compress data with pako and encode as URL-safe base64
 * @param input String or Uint8Array to compress
 * @returns Promise that resolves to URL-safe base64 compressed string
 */
export function compressLZMA(input: string | Uint8Array): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const inputData = typeof input === 'string' ? new TextEncoder().encode(input) : input;
      const compressed = pako.deflate(inputData, { level: 9 });
      const base64 = btoa(String.fromCharCode.apply(null, compressed));
      resolve(makeBase64UrlSafe(base64));
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Decompress URL-safe base64 data with pako
 * @param base64url URL-safe base64 compressed string
 * @returns Promise that resolves to decompressed string
 */
export function decompressLZMA(base64url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const base64 = makeBase64UrlUnsafe(base64url);
      const compressed = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const decompressed = pako.inflate(compressed);
      const result = new TextDecoder().decode(decompressed);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}