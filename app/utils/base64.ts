export function customBase64Decode(str: string): string {
  const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  str = str.replace(/[^A-Za-z0-9+/]/g, '');
  const pad = str.length % 4;
  if (pad) {
    str += '='.repeat(4 - pad);
  }
  let result = '';
  let i = 0;
  while (i < str.length) {
    const chunk = str.slice(i, i + 4);
    if (chunk.length < 4) break;
    const b1 = base64Chars.indexOf(chunk[0]);
    const b2 = base64Chars.indexOf(chunk[1]);
    const b3 = base64Chars.indexOf(chunk[2]);
    const b4 = base64Chars.indexOf(chunk[3]);
    if (b1 === -1 || b2 === -1) break;
    result += String.fromCharCode((b1 << 2) | (b2 >> 4));
    if (b3 !== -1) {
      result += String.fromCharCode(((b2 & 0x0F) << 4) | (b3 >> 2));
    }
    if (b4 !== -1) {
      result += String.fromCharCode(((b3 & 0x03) << 6) | b4);
    }
    i += 4;
  }
  return result;
}