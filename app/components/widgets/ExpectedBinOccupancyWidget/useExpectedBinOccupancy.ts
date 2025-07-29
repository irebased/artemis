import { useMemo } from 'react';
import { Ciphertext } from '@/types/ciphertext';
import { ExpectedBinOccupancySettings } from '@/types/dashboard/dashboardTypes';
import { getProcessedText } from '@/utils/textUtils';

export interface BinOccupancyResult {
  input: Ciphertext;
  processedText: string;
  sortedFrequencies: number[]; // Character frequencies sorted by count (highest to lowest)
  totalCharacters: number;
  uniqueCharacters: number;
}

// Inverse normal cumulative distribution function (accurate approximation)
function inverseNormalCDF(p: number): number {
  // More accurate approximation that's still simpler than the original
  // Based on the Beasley-Springer-Moro algorithm

  if (p <= 0 || p >= 1) {
    return p <= 0 ? -Infinity : Infinity;
  }

  const q = p - 0.5;

  if (Math.abs(q) <= 0.42) {
    // Central region - use polynomial approximation
    const r = q * q;
    return q * (((((((r * 2509.0809287301226727 + 33430.575583588128105) * r + 67265.770927008700853) * r + 45921.953931549871457) * r + 13731.693765509461125) * r + 1971.5909503065514427) * r + 133.14166789178437745) * r + 3.387132872796366608) / (((((((r * 5226.495278852854561 + 28729.085735721942674) * r + 39307.89580009271061) * r + 21213.794301586595867) * r + 5394.1960214247511077) * r + 687.1870074920579083) * r + 42.313330701600911252) * r + 1);
  } else {
    // Tail regions - use simpler approximation
    const r = q < 0 ? p : 1 - p;
    const t = Math.sqrt(-2 * Math.log(r));

    if (t <= 5) {
      // Near tail
      const u = t - 1.6;
      return q < 0 ? -u : u;
    } else {
      // Far tail
      const u = t - 5;
      return q < 0 ? -(5 + u) : (5 + u);
    }
  }
}

// Expected bin occupancy for random distribution (Python equivalent)
function expectedBinOccupancy(nBins: number, nBalls: number, confidence: number) {
  const k = Array.from({ length: nBins }, (_, i) => i + 1);
  const z_k = k.map(k_val => inverseNormalCDF((k_val - 0.3769420) / (nBins + 0.249831))); // An even better approximation than anything Gasp could come up with

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
  const zBand = inverseNormalCDF(0.5 + confidence / 2);
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