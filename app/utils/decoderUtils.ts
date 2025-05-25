import { BaseType } from '@/types/bases';
import { customBase64Decode } from './base64';

export function decodeText(text: string, base: BaseType): string {
  try {
    switch (base) {
      case 'base64':
        return customBase64Decode(text);
      case 'hex':
        if (/^[0-9A-Fa-f\s]*$/.test(text)) {
          return text.match(/.{1,2}/g)?.map(byte => String.fromCharCode(parseInt(byte, 16))).join('') || '';
        }
        return text;
      case 'decimal':
        if (/^[0-9\s]*$/.test(text)) {
          return text.split(/\s+/).map(num => String.fromCharCode(parseInt(num, 10))).join('');
        }
        return text;
      case 'octal':
        if (/^[0-7\s]*$/.test(text)) {
          return text.split(/\s+/).map(num => String.fromCharCode(parseInt(num, 8))).join('');
        }
        return text;
      case 'ascii':
      default:
        return text;
    }
  } catch (e) {
    console.error('Error decoding text:', e);
    return text;
  }
}