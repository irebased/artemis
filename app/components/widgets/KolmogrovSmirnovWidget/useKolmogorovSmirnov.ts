import { useMemo } from 'react';
import { Ciphertext } from '@/types/ciphertext';
import { getReferenceDistribution } from './englishReferenceDistributions';

// Kolmogorov-Smirnov D statistic
function ksStatistic(emp1: Record<string, number>, emp2: Record<string, number>): number {
  const allKeys = Array.from(new Set([...Object.keys(emp1), ...Object.keys(emp2)])).sort();
  let sum1 = 0, sum2 = 0;
  let total1 = 0, total2 = 0;
  for (const k in emp1) total1 += emp1[k];
  for (const k in emp2) total2 += emp2[k];
  let maxDiff = 0;
  let cdf1 = 0, cdf2 = 0;
  for (const k of allKeys) {
    cdf1 += (emp1[k] || 0) / total1;
    cdf2 += (emp2[k] || 0) / total2;
    maxDiff = Math.max(maxDiff, Math.abs(cdf1 - cdf2));
  }
  return maxDiff;
}

// Approximate p-value for KS test (large N)
function ksPValue(D: number, n: number): number {
  // Kolmogorov distribution approximation
  if (n <= 0) return 1;
  const sqrtNe = Math.sqrt(n);
  const lambda = (sqrtNe + 0.12 + 0.11 / sqrtNe) * D;
  // Use the asymptotic formula
  let sum = 0, sign = 1;
  for (let k = 1; k <= 100; k++) {
    sum += sign * Math.exp(-2 * k * k * lambda * lambda);
    sign *= -1;
  }
  return Math.max(0, Math.min(1, 2 * sum));
}

export function useKolmogorovSmirnov(inputs: Ciphertext[]) {
  return useMemo(() => {
    return inputs.map(input => {
      const { encoding, text, color } = input;
      // Get symbol array for this encoding
      let symbols: string[];
      if (encoding === 'ascii') {
        symbols = text.split('');
      } else if (encoding === 'octal') {
        symbols = Array.from(text).map(c => c.charCodeAt(0).toString(8).padStart(3, '0'));
      } else if (encoding === 'decimal') {
        symbols = Array.from(text).map(c => c.charCodeAt(0).toString(10).padStart(3, '0'));
      } else if (encoding === 'hex') {
        symbols = Array.from(text).map(c => c.charCodeAt(0).toString(16).padStart(2, '0'));
      } else if (encoding === 'base64') {
        if (typeof Buffer !== 'undefined') {
          symbols = Buffer.from(text, 'utf-8').toString('base64').split('');
        } else if (typeof btoa !== 'undefined') {
          symbols = btoa(unescape(encodeURIComponent(text))).split('');
        } else {
          symbols = text.split('');
        }
      } else {
        symbols = text.split('');
      }
      // Empirical distribution
      const freq: Record<string, number> = {};
      for (const s of symbols) freq[s] = (freq[s] || 0) + 1;
      // Reference distribution
      const ref = getReferenceDistribution(encoding);
      // KS statistic
      const D = ksStatistic(freq, ref);
      // p-value (approximate, using input length)
      const p = ksPValue(D, symbols.length);
      return {
        text,
        color,
        encoding,
        ksStatistic: D,
        pValue: p,
      };
    });
  }, [inputs]);
}