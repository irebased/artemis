import { useMemo } from 'react';
import { Ciphertext } from '@/types/ciphertext';
import { BaseType } from '@/types/bases';

export const IC_BASELINES = {
  ascii: { english: 0.065, random: 0.01805 },
  base64: { english: 0.02811, random: 0.01387 },
  hex: { english: 0.13985, random: 0.05714 },
  decimal: { english: 0.25448, random: 0.09769 },
  octal: { english: 0.20402, random: 0.12121 },
} as const;

export function useIndexOfCoincidence(inputs: Ciphertext[]) {
  return useMemo(() => {
    return inputs.map(input => {
      try {
        const text = input.text;

        const freq: Record<string, number> = {};
        for (const char of text) {
          freq[char] = (freq[char] || 0) + 1;
        }
        const n = text.length;
        const uniqueChars = Object.keys(freq).length;
        const sum = Object.values(freq).reduce((acc, count) => acc + count * (count - 1), 0);
        const ioc = n > 1 ? sum / (n * (n - 1)) : 0;

        const periodicity = [];
        for (let period = 1; period <= Math.min(20, Math.floor(n / 2)); period++) {
          let matches = 0;
          let comparisons = 0;
          for (let i = 0; i < n - period; i++) {
            if (text[i] === text[i + period]) {
              matches++;
            }
            comparisons++;
          }
          periodicity.push({
            period,
            ioc: comparisons > 0 ? matches / comparisons : 0
          });
        }

        return {
          text: input.text,
          color: input.color,
          ioc,
          uniqueChars,
          baseline: IC_BASELINES[input.encoding]['english'],
          randomBaseline: IC_BASELINES[input.encoding]['random'],
          periodicity
        };
      } catch (error) {
        console.error('Error processing text:', error);
        return {
          text: input.text,
          color: input.color,
          ioc: 0,
          uniqueChars: 0,
          baseline: IC_BASELINES[input.encoding]['english'],
          randomBaseline: IC_BASELINES[input.encoding]['random'],
          periodicity: []
        };
      }
    });
  }, [inputs]);
}