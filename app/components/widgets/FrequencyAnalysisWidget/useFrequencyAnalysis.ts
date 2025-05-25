import { useMemo } from 'react';
import { Ciphertext } from '@/types/ciphertext';

export function useFrequencyAnalysis(inputs: Ciphertext[], ngramSize: number = 1, ngramMode: 'sliding' | 'block' = 'sliding') {
  return useMemo(() => {
    const frequencies = inputs.map(input => {
      const text = input.text;
      const freq: Record<string, number> = {};
      const n = Math.max(1, ngramSize);
      let total = 0;
      if (ngramMode === 'sliding') {
        total = text.length - n + 1 > 0 ? text.length - n + 1 : 0;
        for (let i = 0; i <= text.length - n; i++) {
          const ngram = text.slice(i, i + n);
          freq[ngram] = (freq[ngram] || 0) + 1;
        }
      } else if (ngramMode === 'block') {
        // Block mode: only count full blocks (ignore incomplete blocks at the end). Spaces are included as part of n-grams.
        total = Math.floor(text.length / n);
        for (let i = 0; i + n <= text.length; i += n) {
          const ngram = text.slice(i, i + n);
          freq[ngram] = (freq[ngram] || 0) + 1;
        }
      }
      const percentages: Record<string, number> = {};
      for (const [ngram, count] of Object.entries(freq)) {
        percentages[ngram] = total > 0 ? (count / total) * 100 : 0;
      }
      return {
        text: input.text,
        color: input.color,
        frequencies: percentages
      };
    });
    const allNgrams = new Set<string>();
    frequencies.forEach(freq => {
      Object.keys(freq.frequencies).forEach(ngram => allNgrams.add(ngram));
    });
    const sortedNgrams = Array.from(allNgrams).sort();
    return { frequencies, sortedChars: sortedNgrams };
  }, [inputs, ngramSize, ngramMode]);
}