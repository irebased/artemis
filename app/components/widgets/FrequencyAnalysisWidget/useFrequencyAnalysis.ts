import { useMemo } from 'react';
import { InputData } from '@/app/useDashboardParams';

export function useFrequencyAnalysis(texts: InputData[]) {
  return useMemo(() => {
    const frequencies = texts.map(input => {
      const freq: Record<string, number> = {};
      const total = input.text.length;
      for (const char of input.text) {
        freq[char] = (freq[char] || 0) + 1;
      }
      const percentages: Record<string, number> = {};
      for (const [char, count] of Object.entries(freq)) {
        percentages[char] = (count / total) * 100;
      }
      return {
        text: input.text,
        color: input.color,
        frequencies: percentages
      };
    });
    const allChars = new Set<string>();
    frequencies.forEach(freq => {
      Object.keys(freq.frequencies).forEach(char => allChars.add(char));
    });
    const sortedChars = Array.from(allChars).sort();
    return { frequencies, sortedChars };
  }, [texts]);
}