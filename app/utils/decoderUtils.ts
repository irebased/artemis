import { BaseType } from '@/types/bases';
import { customBase64Decode } from './base64';

export function decodeText(
  text: string,
  base: BaseType,
): string {
  let decoded = text;
  try {
    switch (base) {
      case 'base64':
        decoded = customBase64Decode(text);
        break;
      case 'hex':
        if (/^[0-9A-Fa-f\s]*$/.test(text)) {
          decoded = text.match(/.{1,2}/g)?.map(byte => String.fromCharCode(parseInt(byte, 16))).join('') || '';
        }
        break;
      case 'decimal':
        if (/^[0-9\s]*$/.test(text)) {
          decoded = text.split(/\s+/).map(num => String.fromCharCode(parseInt(num, 10))).join('');
        }
        break;
      case 'octal':
        if (/^[0-7\s]*$/.test(text)) {
          decoded = text.split(/\s+/).map(num => String.fromCharCode(parseInt(num, 8))).join('');
        }
        break;
      case 'ascii':
      default:
        decoded = text;
    }
    return decoded;
  } catch (e) {
    console.error('Error decoding text:', e);
    return text;
  }
}