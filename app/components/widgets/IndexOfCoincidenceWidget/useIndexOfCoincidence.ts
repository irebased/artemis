import { useMemo } from 'react';
import { InputData } from '@/app/useDashboardParams';
import { BaseType } from '@/types/bases';

export const IC_BASELINES = {
  ascii: { english: 0.065, random: 0.01805 },
  base64: { english: 0.02811, random: 0.01387 },
  hex: { english: 0.13985, random: 0.05714 },
  decimal: { english: 0.25448, random: 0.09769 },
  octal: { english: 0.20402, random: 0.12121 },
} as const;

export function useIndexOfCoincidence(texts: InputData[], base: BaseType) {
  return useMemo(() => {
    return texts.map(input => {
      const text = input.text;
      const n = text.length;

      if (n < 2) return { text, color: input.color, ic: 0, periodics: [], total: n, unique: 0 };

      const freq: Record<string, number> = {};
      for (const char of text) {
        freq[char] = (freq[char] || 0) + 1;
      }
      const sum = Object.values(freq).reduce((acc, count) => acc + count * (count - 1), 0);
      const ic = sum / (n * (n - 1));

      const periodics = [];
      for (let period = 2; period <= Math.min(20, Math.floor(n / 2)); period++) {
        const groups: string[][] = Array.from({ length: period }, () => []);
        for (let i = 0; i < n; i++) {
          groups[i % period].push(text[i]);
        }
        const groupICs = groups.map(group => {
          const groupFreq: Record<string, number> = {};
          for (const char of group) {
            groupFreq[char] = (groupFreq[char] || 0) + 1;
          }
          const groupN = group.length;
          if (groupN < 2) return 0;
          const groupSum = Object.values(groupFreq).reduce((acc, count) => acc + count * (count - 1), 0);
          return groupSum / (groupN * (groupN - 1));
        });
        const avgIC = groupICs.reduce((a, b) => a + b, 0) / groupICs.length;
        periodics.push({ period, ic: avgIC });
      }
      return {
        text,
        color: input.color,
        ic,
        periodics,
        total: n,
        unique: Object.keys(freq).length,
      };
    });
  }, [texts, base]);
}