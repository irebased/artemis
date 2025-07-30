import { useMemo } from 'react';
import { Ciphertext } from '@/types/ciphertext';
import { ExpectedBinOccupancySettings } from '@/types/dashboard/dashboardTypes';
import { getProcessedText } from '@/utils/textUtils';
import jStat from 'jstat';

export interface BinOccupancyResult {
  input: Ciphertext;
  processedText: string;
  sortedFrequencies: number[]; // Character frequencies sorted by count (highest to lowest)
  totalCharacters: number;
  uniqueCharacters: number;
}

// Expected bin occupancy for random distribution
function expectedBinOccupancy(nBins: number, nBalls: number, confidence: number) {
  const k = Array.from({ length: nBins }, (_, i) => i + 1);
  const z_k = k.map(k_val => jStat.normal.inv((nBins - k_val + 0.375) / (nBins + 0.25), 0, 1));

  const mean = nBalls / nBins;
  const stdDev = Math.sqrt(nBalls * (nBins - 1) / (nBins * nBins));
  const expected = z_k.map(z => mean + stdDev * z);

  // Ensure expected values are monotonically decreasing (sorted by frequency descending)
  // This is crucial for the statistical model - expected values should never increase
  for (let i = 1; i < expected.length; i++) {
    if (expected[i] > expected[i - 1]) {
      expected[i] = expected[i - 1];
    }
  }

  // Confidence bands
  const zBand = jStat.normal.inv(0.5 + confidence / 2, 0, 1);
  const upper = expected.map(exp => exp + zBand * stdDev);
  const lower = expected.map(exp => Math.max(0, exp - zBand * stdDev));

  return { expected, lower, upper };
}

export function useExpectedBinOccupancy(
  inputs: Ciphertext[],
  settings: ExpectedBinOccupancySettings
): {
  results: BinOccupancyResult[];
  expected: number[];
  lower: number[];
  upper: number[];
  loading: boolean;
  nBins: number;
  nBalls: number;
} {
  const results = useMemo(() => {
    if (!inputs.length) return [];

    return inputs.map(input => {
      const processedText = getProcessedText(input);
      if (!processedText) {
        return {
          input,
          processedText: '',
          sortedFrequencies: [],
          totalCharacters: 0,
          uniqueCharacters: 0,
        };
      }

      // Create character frequency map
      const charFreq: Record<string, number> = {};
      for (const char of processedText) {
        charFreq[char] = (charFreq[char] || 0) + 1;
      }

      const totalChars = processedText.length;
      const uniqueChars = Object.keys(charFreq).length;

      // Get frequencies sorted by count (highest to lowest) - like Python's sorted(obs, reverse=True)
      const sortedFrequencies = Object.values(charFreq).sort((a, b) => b - a);

      return {
        input,
        processedText,
        sortedFrequencies,
        totalCharacters: totalChars,
        uniqueCharacters: uniqueChars,
      };
    });
  }, [inputs]);

  // Calculate expected values using the first input's data
  const expectedData = useMemo(() => {
    if (!results.length) return { expected: [], lower: [], upper: [], nBins: 0, nBalls: 0 };

    const firstResult = results[0];
    const nBalls = firstResult.totalCharacters;
    const nBins = Math.max(...results.map(r => r.sortedFrequencies.length));

    const { expected, lower, upper } = expectedBinOccupancy(nBins, nBalls, settings.confidenceLevel);

    return { expected, lower, upper, nBins, nBalls };
  }, [results, settings.confidenceLevel]);

  return {
    results,
    expected: expectedData.expected,
    lower: expectedData.lower,
    upper: expectedData.upper,
    nBins: expectedData.nBins,
    nBalls: expectedData.nBalls,
    loading: false
  };
}