import { useMemo } from 'react';
import { Ciphertext } from '@/types/ciphertext';

export const IC_BASELINES = {
  ascii: { english: 0.0616, random: 0.01805 },
  base64: { english: 0.0282, random: 0.01387 },
  hex: { english: 0.1399, random: 0.05714 },
  decimal: { english: 0.2085, random: 0.09769 },
  octal: { english: 0.1799, random: 0.12121 },
} as const;

export function useIndexOfCoincidence(
  inputs: Ciphertext[],
  ngramSize: number = 1,
  ngramMode: 'sliding' | 'block' = 'sliding'
) {
  // Helper to get n-grams
  function getNgrams(text: string, n: number, mode: 'sliding' | 'block') {
    const ngrams: string[] = [];
    if (n <= 1) return text.split('');
    if (mode === 'sliding') {
      for (let i = 0; i <= text.length - n; i++) {
        ngrams.push(text.slice(i, i + n));
      }
    } else {
      for (let i = 0; i + n <= text.length; i += n) {
        ngrams.push(text.slice(i, i + n));
      }
    }
    return ngrams;
  }

  return useMemo(() => {
    return inputs.map(input => {
      try {
        const text = input.text;
        const n = ngramSize || 1;
        const mode = ngramMode || 'sliding';
        const ngrams = getNgrams(text, n, mode);

        const freq: Record<string, number> = {};
        for (const gram of ngrams) {
          freq[gram] = (freq[gram] || 0) + 1;
        }
        const N = ngrams.length;
        const uniqueNgrams = Object.keys(freq).length;
        const sum = Object.values(freq).reduce((acc, count) => acc + count * (count - 1), 0);
        const ioc = N > 1 ? sum / (N * (N - 1)) : 0;

        const periodicity = [];
        for (let period = 2; period <= Math.min(20, Math.floor(N / 2)); period++) {
          // Split ngrams into groups by index mod period
          const groups = Array.from({ length: period }, () => []);
          for (let i = 0; i < N; i++) {
            groups[i % period].push(ngrams[i]);
          }
          // Compute IC for each group
          const groupICs: number[] = groups.map(group => {
            const groupFreq: Record<string, number> = {};
            for (const gram of group) {
              groupFreq[gram] = (groupFreq[gram] || 0) + 1;
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
          uniqueNgrams,
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
          uniqueNgrams: 0,
          baseline: IC_BASELINES[input.encoding]['english'],
          randomBaseline: IC_BASELINES[input.encoding]['random'],
          periodicity: []
        };
      }
    });
  }, [inputs, ngramSize, ngramMode]);
}