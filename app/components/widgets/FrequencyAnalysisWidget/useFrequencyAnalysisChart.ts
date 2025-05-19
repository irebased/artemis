import { useMemo } from 'react';

export function useFrequencyAnalysisChart(texts) {
  const data = useMemo(() => {
    const frequencies = texts.map(input => {
      const freq = {};
      const total = input.text.length;
      for (const char of input.text) {
        freq[char] = (freq[char] || 0) + 1;
      }

      const percentages = {};
      for (const [char, count] of Object.entries(freq)) {
        // @ts-ignore
        percentages[char] = (count / total) * 100;
      }
      return {
        text: input.text,
        color: input.color,
        frequencies: percentages
      };
    });

    const allChars = new Set();
    frequencies.forEach(freq => {
      Object.keys(freq.frequencies).forEach(char => allChars.add(char));
    });
    const sortedChars = Array.from(allChars).sort();
    const datasets = frequencies.map(freq => ({
      label: `Text ${freq.text.slice(0, 20)}${freq.text.length > 20 ? '...' : ''}`,
      // @ts-ignore
      data: sortedChars.map(char => freq.frequencies[char] || 0),
      backgroundColor: freq.color,
      borderColor: freq.color,
      borderWidth: 1,
    }));
    return {
      labels: sortedChars,
      datasets,
    };
  }, [texts]);

  const options = useMemo(() => ({
    responsive: true,
    indexAxis: 'y',
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
        text: '',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.x !== undefined ? context.parsed.x : context.parsed.y;
            return `${label}: ${value.toFixed(2)}%`;
          }
        }
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Character'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Frequency (%)'
        }
      }
    }
  }), [texts]);

  return { data, options };
}