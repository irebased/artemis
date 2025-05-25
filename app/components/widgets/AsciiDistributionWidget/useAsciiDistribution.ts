import { useMemo } from 'react';
import { Ciphertext } from '@/types/ciphertext';
import { decodeText } from '@/utils/decoderUtils';

export function useAsciiDistribution(inputs: Ciphertext[], asciiRange: string) {
  return useMemo(() => {
    const distributions = inputs.map(input => {
      const decodedText = decodeText(input.text, input.encoding);
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
        encoding: input.encoding,
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
  }, [inputs, asciiRange]);
}