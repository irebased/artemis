import React from 'react';

export default function ChiSquaredInformation() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Chi-Squared Test</h3>

      <p>
        The Chi-Squared test compares the character frequency distribution of one text
        against a reference distribution (either another text or a sample text).
      </p>

      <p>
        <strong>Chi-Squared Value:</strong> A measure of how different the two distributions are.
        Higher values indicate greater differences between the distributions.
      </p>

      <p>
        <strong>P-Value:</strong> The probability that the observed difference occurred by chance.
        Lower p-values suggest the distributions are significantly different.
      </p>

      <p>
        <strong>Degrees of Freedom:</strong> The number of independent categories in the comparison.
      </p>

      <p className="text-sm text-gray-600">
        <strong>Interpretation:</strong> A low p-value (&lt; 0.05) suggests the text being evaluated
        has a significantly different character distribution from the base data, which could indicate
        different languages, encoding issues, or encryption.
      </p>
    </div>
  );
}