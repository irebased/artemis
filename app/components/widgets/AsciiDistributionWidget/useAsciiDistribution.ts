import { useMemo } from 'react';
import { Ciphertext } from '@/types/ciphertext';
import { getAsciiDistribution } from '@/app/tools/AsciiDistribution/asciiDistribution';

export function useAsciiDistribution(inputs: Ciphertext[], asciiRange: string) {
  return useMemo(() => getAsciiDistribution(inputs, asciiRange), [inputs, asciiRange]);
}