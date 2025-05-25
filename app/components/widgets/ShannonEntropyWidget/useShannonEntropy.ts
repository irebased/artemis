import { useMemo } from 'react';
import { Ciphertext } from '@/types/ciphertext';

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

export function useShannonEntropy(inputs: Ciphertext[], windowSize: number = 1) {
  return useMemo(() => {
    return inputs.map(input => {
      try {
        const text = input.text;
        if (!text) {
          return {
            text: input.text,
            color: input.color,
            entropy: 0,
            windowEntropy: []
          };
        }

        // Calculate overall entropy
        const freq: Record<string, number> = {};
        for (const char of text) {
          freq[char] = (freq[char] || 0) + 1;
        }
        const unique = Object.keys(freq).length;
        const total = text.length;
        let entropy = 0;
        for (const count of Object.values(freq)) {
          const p = count / total;
          entropy -= p * Math.log2(p);
        }

        // Calculate sliding window entropy
        const windowEntropy = [];
        for (let i = 0; i <= text.length - windowSize; i++) {
          const window = text.slice(i, i + windowSize);
          const windowFreq: Record<string, number> = {};
          for (const char of window) {
            windowFreq[char] = (windowFreq[char] || 0) + 1;
          }
          let windowEnt = 0;
          for (const count of Object.values(windowFreq)) {
            const p = count / windowSize;
            windowEnt -= p * Math.log2(p);
          }
          windowEntropy.push({
            position: i,
            entropy: windowEnt
          });
        }

        return {
          text: input.text,
          color: input.color,
          entropy,
          unique,
          baseline: ENTROPY_BASELINES[input.encoding]['english'],
          randomBaseline: ENTROPY_BASELINES[input.encoding]['random'],
          windowEntropy
        };
      } catch (error) {
        console.error('Error processing text:', error);
        return {
          text: input.text,
          color: input.color,
          unique: 0,
          entropy: 0,
          windowEntropy: []
        };
      }
    });
  }, [inputs, windowSize]);
}