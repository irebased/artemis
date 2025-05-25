import { useMemo } from 'react';
import { BaseType } from '@/types/bases';
import { InputData } from '@/app/useDashboardParams';

function customBase64Decode(str: string): string {
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

function decodeText(text: string, base: BaseType): string {
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

export function useAsciiDistribution(texts: InputData[], base: BaseType, asciiRange: string) {
  return useMemo(() => {
    const distributions = texts.map(input => {
      const decodedText = decodeText(input.text, base);
      const counts = new Array(256).fill(0);
      for (const char of decodedText) {
        const code = char.charCodeAt(0);
        if (code < 256) {
          counts[code]++;
        }
      }
      return {
        text: input.text,
        color: input.color,
        counts
      };
    });
    let start = 0;
    let end = 256;
    if (asciiRange === 'ascii') {
      end = 128;
    } else if (asciiRange === 'input') {
      const usedCodes = new Set();
      distributions.forEach(dist => {
        dist.counts.forEach((count, code) => {
          if (count > 0) usedCodes.add(code);
        });
      });
      if (usedCodes.size > 0) {
        const usedCodesArr = Array.from(usedCodes) as number[];
        start = Math.min(...usedCodesArr);
        end = Math.max(...usedCodesArr) + 1;
      }
    }
    return { distributions, start, end };
  }, [texts, base, asciiRange]);
}