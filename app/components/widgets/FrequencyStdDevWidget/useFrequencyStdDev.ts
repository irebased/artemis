import { useMemo } from 'react';
import { Ciphertext } from '@/types/ciphertext';

export function useFrequencyStdDev(inputs: Ciphertext[]) {
  return useMemo(() => {
    if (!inputs) return [];
    return inputs.map(input => {
      try {
        const freq: Record<string, number> = {};
        const total = input.text.length;
        for (const char of input.text) {
          freq[char] = (freq[char] || 0) + 1;
        }
        const percentages: Record<string, number> = {};
        for (const [char, count] of Object.entries(freq)) {
          percentages[char] = (count / total) * 100;
        }
        const values = Object.values(percentages);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
        const stdDev = Math.sqrt(variance);
        return {
          text: input.text,
          color: input.color,
          mean,
          stdDev
        };
      } catch (error) {
        console.error('Error processing text:', error);
        return {
          text: input.text,
          color: input.color,
          mean: 0,
          stdDev: 0
        };
      }
    });
  }, [inputs]);
}