import { Line } from 'react-chartjs-2';
import { Ciphertext } from '@/types/ciphertext';
import { useShannonEntropy, ENTROPY_BASELINES, BaseType } from './useShannonEntropy';
import { useShannonEntropyChart, defaultGridSize } from './useShannonEntropyChart';
import WidgetWithSettings from '../WidgetWithSettings';
import ShannonEntropySettingsForm from './ShannonEntropySettingsForm';

interface ShannonEntropyWidgetProps {
  inputs: Ciphertext[];
  base: BaseType;
  width?: number;
  height?: number;
  shannonEntropySettings: { mode: 'raw' | 'sliding'; windowSize: 16 | 32 | 64 | 128 | 256 };
  setShannonEntropySettings: (settings: { mode: 'raw' | 'sliding'; windowSize: 16 | 32 | 64 | 128 | 256 }) => void;
  setAnyModalOpen?: (open: boolean) => void;
}

export default function ShannonEntropyWidget({
  inputs,
  base,
  width,
  height,
  shannonEntropySettings,
  setShannonEntropySettings,
  setAnyModalOpen,
}: ShannonEntropyWidgetProps) {
  const { mode, windowSize } = shannonEntropySettings;
  const results = useShannonEntropy(inputs, windowSize);
  const { data: slidingLineData, options: slidingLineOptions } = useShannonEntropyChart(results, windowSize);

  return (
    <WidgetWithSettings
      title="Shannon Entropy"
      settingsComponent={
        <ShannonEntropySettingsForm
          settings={shannonEntropySettings}
          setSettings={setShannonEntropySettings}
        />
      }
      setAnyModalOpen={setAnyModalOpen}
    >
      {mode === 'raw' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Text</th>
                <th className="text-left p-2">Entropy</th>
                <th className="text-left p-2">English baseline</th>
                <th className="text-left p-2">Random text baseline</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td className="p-2" style={{ color: r.color }}>
                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: r.color, display: 'inline-block' }} />
                    {r.text.slice(0, 7)}{r.text.length > 7 ? '...' : ''}
                  </td>
                  <td className="p-2 font-bold">{r.entropy.toFixed(4)}</td>
                  <td className="p-2 text-gray-400">{r.baseline.toFixed(4)}</td>
                  <td className="p-2 text-gray-400">{r.randomBaseline.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 w-full h-full relative">
          {slidingLineData ? (
            <Line data={slidingLineData} options={slidingLineOptions} className="absolute inset-0 w-full h-full" />
          ) : (
            <p>No data to display.</p>
          )}
        </div>
      )}
    </WidgetWithSettings>
  );
}
