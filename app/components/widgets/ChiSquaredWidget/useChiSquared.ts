import { useMemo } from 'react';
import { Ciphertext } from '@/types/ciphertext';
import { decodeText } from '@/utils/decoderUtils';
import { sampleTexts } from '@/data/samples';



export function useChiSquared(
  inputs: Ciphertext[],
  selectedTextIndex: number,
  baseDataIndex: number | 'sample'
) {
  return useMemo(() => {
    if (inputs.length === 0 || selectedTextIndex < 0 || selectedTextIndex >= inputs.length) {
      return { chiSquared: null, pValue: null, degreesOfFreedom: null };
    }

    const selectedInput = inputs[selectedTextIndex];
    const selectedText = decodeText(selectedInput.text, selectedInput.encoding);

    let baseText: string;
    if (baseDataIndex === 'sample') {
      baseText = decodeText(sampleTexts[selectedInput.encoding] || sampleTexts.ascii, selectedInput.encoding);
    } else {
      if (baseDataIndex < 0 || baseDataIndex >= inputs.length) {
        return { chiSquared: null, pValue: null, degreesOfFreedom: null };
      }
      const baseInput = inputs[baseDataIndex];
      baseText = decodeText(baseInput.text, baseInput.encoding);
    }

    // Calculate character frequencies for both texts
    const selectedFreq = new Array(256).fill(0);
    const baseFreq = new Array(256).fill(0);

    for (const char of selectedText) {
      const code = char.charCodeAt(0);
      if (code < 256) {
        selectedFreq[code]++;
      }
    }

    for (const char of baseText) {
      const code = char.charCodeAt(0);
      if (code < 256) {
        baseFreq[code]++;
      }
    }

    // Calculate chi-squared statistic
    let chiSquared = 0;
    let degreesOfFreedom = 0;

    for (let i = 0; i < 256; i++) {
      const observed = selectedFreq[i];
      const expected = baseFreq[i];

      if (expected > 0) {
        chiSquared += Math.pow(observed - expected, 2) / expected;
        degreesOfFreedom++;
      } else if (observed > 0) {
        // If expected is 0 but observed is not, add a large penalty
        chiSquared += observed * 1000;
        degreesOfFreedom++;
      }
    }

    // Subtract 1 for the constraint that frequencies sum to the same total
    degreesOfFreedom = Math.max(0, degreesOfFreedom - 1);

            // Calculate p-value using chi-squared distribution
    let pValue = null;
    if (degreesOfFreedom > 0) {
      if (chiSquared === 0) {
        // Perfect match - p-value should be 1
        pValue = 1;
      } else {
        // Simple approximation for chi-squared p-value
        // For chi-squared distribution with df degrees of freedom
        const df = degreesOfFreedom;
        const chi = chiSquared;

        // Use a simple approximation based on chi-squared distribution properties
        // For chi-squared with df degrees of freedom:
        // - Mean = df
        // - Variance = 2*df
        // - For large df, approximately normal

        const ratio = chi / df;

        if (ratio <= 1) {
          // Chi-squared is less than or equal to degrees of freedom
          // This suggests the distributions are similar
          pValue = Math.max(0.1, 1 - ratio);
        } else {
          // Chi-squared is greater than degrees of freedom
          // This suggests the distributions are different
          pValue = Math.exp(-(ratio - 1) / 2);
        }

        pValue = Math.max(0, Math.min(1, pValue));
      }
    }

    return {
      chiSquared: chiSquared,
      pValue: pValue,
      degreesOfFreedom: degreesOfFreedom,
      selectedTextLength: selectedText.length,
      baseTextLength: baseText.length
    };
  }, [inputs, selectedTextIndex, baseDataIndex]);
}