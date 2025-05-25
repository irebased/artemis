import { useMemo } from 'react';
import { InputData } from '@/app/useDashboardParams';

export const ENTROPY_BASELINES = {
  ascii: { english: 4.321011139059028, random: 5.696167170226023 },
  base64: { english: 5.397278374532011, random: 6.0 },
  hex: { english: 3.1145264801712846, random: 4.0 },
  decimal: { english: 2.729561401738525, random: 3.3005590923909547 },
  octal: { english: 2.723477924808014, random: 3.0 },
} as const;

export type BaseType = keyof typeof ENTROPY_BASELINES;

export type EntropyResult = {
  text: string;
  color: string;
  entropy: number;
  sliding: number[];
  total: number;
  unique: number;
};

export function useShannonEntropy(texts: InputData[], windowSize: number): EntropyResult[] {
  return useMemo(() => {
    return texts.map(input => {
      const text = input.text;
      if (text.length === 0) {
        return {
          text,
          color: input.color,
          entropy: 0,
          sliding: [],
          total: 0,
          unique: 0
        };
      }

      // Calculate character frequencies
      const freq: Record<string, number> = {};
      for (const char of text) {
        freq[char] = (freq[char] || 0) + 1;
      }

      const total = text.length;
      const unique = Object.keys(freq).length;

      // Calculate overall entropy
      const entropy = -Object.values(freq).reduce((sum, count) => {
        const p = count / total;
        return sum + p * Math.log2(p);
      }, 0);

      // Calculate sliding window entropy
      const sliding: number[] = [];
      for (let i = 0; i <= text.length - windowSize; i++) {
        const window = text.slice(i, i + windowSize);
        const windowFreq: Record<string, number> = {};

        // Calculate frequencies for this window
        for (const char of window) {
          windowFreq[char] = (windowFreq[char] || 0) + 1;
        }

        // Calculate entropy for this window
        const windowEntropy = -Object.values(windowFreq).reduce((sum, count) => {
          const p = count / windowSize;
          return sum + p * Math.log2(p);
        }, 0);

        sliding.push(windowEntropy);
      }

      return {
        text,
        color: input.color,
        entropy,
        sliding,
        total,
        unique,
      };
    });
  }, [texts, windowSize]);
}