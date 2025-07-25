import React from 'react';

interface FrequencyData {
  text: string;
  color: string;
  frequencies: Record<string, number>;
}

interface FrequencyAnalysisTableProps {
  frequencies: FrequencyData[];
  sortedNgrams: string[];
  sortByInput?: number;
  sortDirection?: 'asc' | 'desc';
}

export default function FrequencyAnalysisTable({ frequencies, sortedNgrams, sortByInput, sortDirection }: FrequencyAnalysisTableProps) {
  if (!frequencies || frequencies.length === 0) {
    return <p>No data to display.</p>;
  }

    // Calculate total n-grams for each input
  const getTotalNgrams = (freqData: FrequencyData) => {
    // Since we're working with percentages, we need to find the total
    // by looking at the text length and n-gram size
    // For now, let's use a simpler approach: sum all percentages and assume they add to 100
    const totalPercentage = Object.values(freqData.frequencies).reduce((sum, p) => sum + p, 0);
    if (totalPercentage === 0) return 0;

    // Find the smallest non-zero percentage to estimate total
    const nonZeroPercentages = Object.values(freqData.frequencies).filter(p => p > 0);
    if (nonZeroPercentages.length === 0) return 0;

    const minPercentage = Math.min(...nonZeroPercentages);
    // If min percentage is 1%, then total is roughly 100
    // If min percentage is 10%, then total is roughly 10
    return Math.round(100 / minPercentage);
  };

  // Calculate count from percentage
  const getCountFromPercentage = (percentage: number, totalNgrams: number) => {
    if (percentage === 0) return 0;
    return Math.round((percentage / 100) * totalNgrams);
  };

  // Sort n-grams based on sort settings
  const getSortedNgrams = () => {
    // If no sorting is applied, return original order
    if (sortByInput === undefined || sortDirection === undefined) {
      return sortedNgrams;
    }

    // Create a copy to sort
    const ngramsToSort = [...sortedNgrams];

    const inputIndex = sortByInput;
    const inputFrequencies = frequencies[inputIndex]?.frequencies || {};

    ngramsToSort.sort((a, b) => {
      const aFreq = inputFrequencies[a] || 0;
      const bFreq = inputFrequencies[b] || 0;

      if (sortDirection === 'asc') {
        return aFreq - bFreq;
      } else {
        return bFreq - aFreq;
      }
    });

    return ngramsToSort;
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
                    <thead>
            <tr>
              <th className="text-left p-2 border-b sticky left-0 bg-white dark:bg-gray-900 z-10">N-gram</th>
              {frequencies.map((freqData, inputIndex) => (
                <React.Fragment key={inputIndex}>
                  <th
                    className="text-center p-2 border-b border-l"
                    style={{
                      color: freqData.color,
                      borderLeftColor: freqData.color,
                      borderLeftWidth: '2px'
                    }}
                    colSpan={2}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: freqData.color, display: 'inline-block' }}
                      />
                      <span className="font-medium">
                        {freqData.text.slice(0, 8)}{freqData.text.length > 8 ? '...' : ''}
                      </span>
                    </div>
                  </th>
                </React.Fragment>
              ))}
            </tr>
            <tr>
              <th className="text-left p-2 border-b sticky left-0 bg-white dark:bg-gray-900 z-10"></th>
              {frequencies.map((freqData, inputIndex) => (
                <React.Fragment key={inputIndex}>
                  <th
                    className="text-center p-2 border-b border-l"
                    style={{
                      color: freqData.color,
                      borderLeftColor: freqData.color,
                      borderLeftWidth: '2px'
                    }}
                  >
                    Count
                  </th>
                  <th
                    className="text-center p-2 border-b"
                    style={{ color: freqData.color }}
                  >
                    %
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
                      <tbody>
              {getSortedNgrams().map((ngram, ngramIndex) => {
                const totalNgrams = frequencies.map(freqData => getTotalNgrams(freqData));

              return (
                <tr key={ngramIndex} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-2 font-mono sticky left-0 bg-white dark:bg-gray-900 z-10 border-r">
                    {ngram}
                  </td>
                  {frequencies.map((freqData, inputIndex) => {
                    const percentage = freqData.frequencies[ngram] || 0;
                    const count = getCountFromPercentage(percentage, totalNgrams[inputIndex]);

                    return (
                      <React.Fragment key={inputIndex}>
                                                <td
                          className="p-2 text-center border-l"
                          style={{
                            borderLeftColor: freqData.color,
                            borderLeftWidth: '2px'
                          }}
                        >
                          <span style={{ color: freqData.color }}>
                            {count > 0 ? `x${count}` : 'x0'}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <span style={{ color: freqData.color }}>
                            ({percentage.toFixed(1)}%)
                          </span>
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}