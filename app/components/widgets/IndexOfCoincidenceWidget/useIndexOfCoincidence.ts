import { useMemo } from 'react';
import { Ciphertext } from '@/types/ciphertext';
import { getNgrams } from './ngramUtils';
import { getProcessedText } from '@/utils/textUtils';

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
  ngramMode: 'sliding' | 'block' = 'sliding',
  maxPeriod: number = 20
) {
  return useMemo(() => {
    return inputs.map(input => {
      try {
        const processedText = getProcessedText(input);
        const text = processedText;
        const n = Math.max(1, Math.floor(ngramSize || 1)); // Ensure positive integer
        const mode = ngramMode || 'sliding';
        const ngrams = getNgrams(text, n, mode);

        // Handle case where no n-grams can be created (shouldn't happen with new logic, but keep for safety)
        if (ngrams.length === 0) {
          return {
            text: input.text,
            processedText,
            color: input.color,
            ioc: 0,
            uniqueNgrams: 0,
            baseline: IC_BASELINES[input.encoding]['english'],
            randomBaseline: IC_BASELINES[input.encoding]['random'],
            periodicity: []
          };
        }

        const freq: Record<string, number> = {};
        for (const gram of ngrams) {
          freq[gram] = (freq[gram] || 0) + 1;
        }
        const N = ngrams.length;
        const uniqueNgrams = Object.keys(freq).length;
        const sum = Object.values(freq).reduce((acc, count) => acc + count * (count - 1), 0);
        const ioc = N > 1 ? sum / (N * (N - 1)) : 0;

        const periodicity = [];
        // Only calculate periodicity if we have enough n-grams
        if (N >= 2) {
          for (let period = 2; period <= Math.min(maxPeriod, Math.floor(N / 2)); period++) {
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
        }

        return {
          text: input.text,
          processedText,
          color: input.color,
          ioc,
          uniqueNgrams,
          baseline: IC_BASELINES[input.encoding]['english'],
          randomBaseline: IC_BASELINES[input.encoding]['random'],
          periodicity
        };
      } catch (error) {
        console.error('Error processing text:', error);
        const processedText = getProcessedText(input);
        return {
          text: input.text,
          processedText,
          color: input.color,
          ioc: 0,
          uniqueNgrams: 0,
          baseline: IC_BASELINES[input.encoding]['english'],
          randomBaseline: IC_BASELINES[input.encoding]['random'],
          periodicity: []
        };
      }
    });
  }, [inputs, ngramSize, ngramMode, maxPeriod]);
}