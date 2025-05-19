import { useMemo } from 'react';

export function useAsciiDistributionChart(texts, base, asciiRange) {
  const data = useMemo(() => {
    const distributions = texts.map(input => {
      const counts = new Array(256).fill(0);
      for (const char of input.text) {
        const code = char.charCodeAt(0);
        if (code < 256) {
          counts[code]++;
        }
      }
      return {
        text: input.text,
        color: input.color,
        counts
      };
    });

    let start = 0;
    let end = 256;
    if (asciiRange === 'ascii') {
      end = 128;
    } else if (asciiRange === 'input') {
      const usedCodes = new Set();
      distributions.forEach(dist => {
        dist.counts.forEach((count, code) => {
          if (count > 0) usedCodes.add(code);
        });
      });
      if (usedCodes.size > 0) {
        const usedCodesArr = Array.from(usedCodes) as number[];
        start = Math.min(...usedCodesArr);
        end = Math.max(...usedCodesArr) + 1;
      }
    }

    const datasets = distributions.map(dist => ({
      label: `Text ${dist.text.slice(0, 20)}${dist.text.length > 20 ? '...' : ''}`,
      data: dist.counts.slice(start, end),
      backgroundColor: dist.color,
      borderColor: dist.color,
      borderWidth: 1,
    }));

    const labels = Array.from({ length: end - start }, (_, i) => {
      const code = start + i;
      return code;
    });
    return {
      labels,
      datasets,
    };
  }, [texts, base, asciiRange]);

  const options = useMemo(() => ({
    responsive: true,
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
            const value = context.parsed.y;
            return `${label}: ${value}`;
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
          text: 'Count'
        }
      },
      x: {
        title: {
          display: true,
          text: base.toUpperCase()
        }
      }
    }
  }), [texts, base, asciiRange]);

  return { data, options };
}