import { useMemo } from 'react';
import { BaseType } from '@/types/bases';
import { InputData } from '@/app/useDashboardParams';
import { decodeText } from '../../../utils/decoderUtils';

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