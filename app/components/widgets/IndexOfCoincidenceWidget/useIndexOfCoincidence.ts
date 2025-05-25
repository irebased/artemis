import { useMemo } from 'react';
import { Ciphertext } from '@/types/ciphertext';

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
        for (let period = 2; period <= Math.min(20, Math.floor(n / 2)); period++) {
          // Split text into groups by index mod period
          const groups = Array.from({ length: period }, () => []);
          for (let i = 0; i < n; i++) {
            groups[i % period].push(text[i]);
          }
          // Compute IC for each group
          const groupICs: number[] = groups.map(group => {
            const groupFreq: Record<string, number> = {};
            for (const char of group) {
              groupFreq[char] = (groupFreq[char] || 0) + 1;
            }
            const groupN = group.length;
            if (groupN < 2) return 0;
            const groupSum = Object.values(groupFreq).reduce((acc: number, count: number) => acc + count * (count - 1), 0);
            return groupSum / (groupN * (groupN - 1));
          });
          // Average IC for this period
          const avgIC = groupICs.reduce((a: number, b: number) => a + b, 0) / groupICs.length;
          periodicity.push({
            period,
            ic: avgIC
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