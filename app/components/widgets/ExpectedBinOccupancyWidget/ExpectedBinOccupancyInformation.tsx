import React from 'react';

export function ExpectedBinOccupancyInformation() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Expected Bin Occupancy Analysis</h3>

      <p>
        This widget analyzes character frequency distributions by comparing actual character counts against expected random distributions.
        Each character's frequency is treated as a "bin" and sorted by occupancy (highest to lowest).
      </p>

      <h4 className="text-md font-semibold">Statistical Method:</h4>
      <ul className="list-disc list-inside space-y-2">
        <li>
          <strong>Character Frequencies:</strong> Count occurrences of each character in the processed text
        </li>
        <li>
          <strong>Sorting:</strong> Sort character frequencies by count (highest to lowest) - like Python's <code>sorted(obs, reverse=True)</code>
        </li>
        <li>
          <strong>Random Distribution Model:</strong> Treats character allocation as random distribution of "balls" (characters) into "bins" (frequency ranks)
        </li>
        <li>
          <strong>Expected Values:</strong> Calculated using normal quantiles: z_k = Φ⁻¹((n_bins - k + 0.5) / n_bins)
        </li>
        <li>
          <strong>Mean and Variance:</strong> mean = n_balls / n_bins, std_dev = √(n_balls * (n_bins - 1) / n_bins²)
        </li>
        <li>
          <strong>Expected Counts:</strong> expected = mean + std_dev * z_k
        </li>
        <li>
          <strong>Confidence Bands:</strong> Based on normal distribution around expected values
        </li>
      </ul>

      <h4 className="text-md font-semibold">Settings:</h4>
      <ul className="list-disc list-inside space-y-2">
        <li>
          <strong>Confidence Level:</strong> 68% (1σ), 95% (2σ), or 99.7% (3σ) confidence intervals
        </li>
        <li>
          <strong>Show Confidence Bands:</strong> Display upper and lower confidence bounds
        </li>
        <li>
          <strong>Show Expected Curve:</strong> Display the expected random distribution
        </li>
      </ul>

      <h4 className="text-md font-semibold">Interpretation:</h4>
      <ul className="list-disc list-inside space-y-2">
        <li>
          <strong>X-Axis:</strong> Bin Rank (1, 2, 3, ...) - sorted by character frequency (highest to lowest)
        </li>
        <li>
          <strong>Y-Axis:</strong> Characters in Bin - actual character counts
        </li>
        <li>
          <strong>Above Confidence Band:</strong> Character frequency is significantly higher than random expectation
        </li>
        <li>
          <strong>Below Confidence Band:</strong> Character frequency is significantly lower than random expectation
        </li>
        <li>
          <strong>Within Band:</strong> Character frequency is consistent with random distribution
        </li>
        <li>
          <strong>Expected Curve:</strong> Shows theoretical random distribution of characters into frequency ranks
        </li>
      </ul>

      <p className="text-sm text-gray-600">
        This analysis is particularly useful for detecting non-random patterns in text, such as those found in ciphers,
        encoded messages, or natural language with unusual character distributions compared to random allocation.
        The approach exactly matches the Python statistical implementation.
      </p>
    </div>
  );
}