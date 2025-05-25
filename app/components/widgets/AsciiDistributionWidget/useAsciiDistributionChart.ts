import { useMemo } from 'react';
import { BaseType } from '@/types/bases';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels, Title);

export const defaultGridSize = { w: 2, h: 2 };

function customBase64Decode(str: string): string {
  // Base64 character set
  const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  // Remove any non-base64 characters
  str = str.replace(/[^A-Za-z0-9+/]/g, '');

  // Add padding if needed
  const pad = str.length % 4;
  if (pad) {
    str += '='.repeat(4 - pad);
  }

  let result = '';
  let i = 0;

  while (i < str.length) {
    // Get 4 base64 characters
    const chunk = str.slice(i, i + 4);
    if (chunk.length < 4) break;

    // Convert to 3 bytes
    const b1 = base64Chars.indexOf(chunk[0]);
    const b2 = base64Chars.indexOf(chunk[1]);
    const b3 = base64Chars.indexOf(chunk[2]);
    const b4 = base64Chars.indexOf(chunk[3]);

    if (b1 === -1 || b2 === -1) break;

    // First byte
    result += String.fromCharCode((b1 << 2) | (b2 >> 4));

    // Second byte
    if (b3 !== -1) {
      result += String.fromCharCode(((b2 & 0x0F) << 4) | (b3 >> 2));
    }

    // Third byte
    if (b4 !== -1) {
      result += String.fromCharCode(((b3 & 0x03) << 6) | b4);
    }

    i += 4;
  }

  return result;
}

function decodeText(text: string, base: BaseType): string {
  try {
    switch (base) {
      case 'base64':
        return customBase64Decode(text);
      case 'hex':
        // Only attempt hex decoding if the text looks like hex
        if (/^[0-9A-Fa-f\s]*$/.test(text)) {
          return text.match(/.{1,2}/g)?.map(byte => String.fromCharCode(parseInt(byte, 16))).join('') || '';
        }
        return text;
      case 'decimal':
        // Only attempt decimal decoding if the text looks like decimal numbers
        if (/^[0-9\s]*$/.test(text)) {
          return text.split(/\s+/).map(num => String.fromCharCode(parseInt(num, 10))).join('');
        }
        return text;
      case 'octal':
        // Only attempt octal decoding if the text looks like octal numbers
        if (/^[0-7\s]*$/.test(text)) {
          return text.split(/\s+/).map(num => String.fromCharCode(parseInt(num, 8))).join('');
        }
        return text;
      case 'ascii':
      default:
        return text;
    }
  } catch (e) {
    console.error('Error decoding text:', e);
    return text; // Return original text if decoding fails
  }
}

export function useAsciiDistributionChart({ distributions, start, end }, base) {
  const data = useMemo(() => {
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
  }, [distributions, start, end]);

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
  }), [distributions, start, end, base]);

  return { data, options };
}