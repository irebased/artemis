import { Line } from 'react-chartjs-2';
import { Ciphertext } from '@/types/ciphertext';
import { useIndexOfCoincidence, IC_BASELINES } from './useIndexOfCoincidence';
import { useIndexOfCoincidenceChart } from './useIndexOfCoincidenceChart';
import WidgetWithSettings from '../WidgetWithSettings';
import IndexOfCoincidenceSettingsForm, { IndexOfCoincidenceSettings } from './IndexOfCoincidenceSettingsForm';
import { BaseType } from '@/types/bases';

interface IndexOfCoincidenceWidgetProps {
  inputs: Ciphertext[];
  base: BaseType;
  indexOfCoincidenceSettings: IndexOfCoincidenceSettings;
  setIndexOfCoincidenceSettings: (settings: IndexOfCoincidenceSettings) => void;
  setAnyModalOpen?: (open: boolean) => void;
}

export default function IndexOfCoincidenceWidget({
  inputs,
  base,
  indexOfCoincidenceSettings,
  setIndexOfCoincidenceSettings,
  setAnyModalOpen,
}: IndexOfCoincidenceWidgetProps) {
  const { mode, ngramSize = 1, ngramMode = 'sliding' } = indexOfCoincidenceSettings;
  const results = useIndexOfCoincidence(inputs, ngramSize, ngramMode);
  const baseline = IC_BASELINES[base];
  const { data: periodLineData, options: lineOptions } = useIndexOfCoincidenceChart(results, mode, baseline);

  return (
    <WidgetWithSettings
      title="Index of Coincidence"
      settingsComponent={
        <IndexOfCoincidenceSettingsForm
          settings={indexOfCoincidenceSettings}
          setSettings={setIndexOfCoincidenceSettings}
        />
      }
      setAnyModalOpen={setAnyModalOpen}
    >
      {mode === 'summary' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Text</th>
                <th className="text-left p-2">IC</th>
                { ngramSize == 1 &&
                  <>
                    <th className="text-left p-2">English baseline</th>
                    <th className="text-left p-2">Random text baseline</th>
                  </>
                }
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td className="p-2" style={{ color: r.color }}>
                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: r.color, display: 'inline-block' }} />
                    {r.text.slice(0, 7)}{r.text.length > 7 ? '...' : ''}
                  </td>
                  <td className="p-2 font-bold text-gray-400">{r.ioc.toFixed(4)}</td>
                  { ngramSize == 1 &&
                    <>
                      <td className="p-2 text-gray-400">{r.baseline.toFixed(4)}</td>
                      <td className="p-2 text-gray-400">{r.randomBaseline.toFixed(4)}</td>
                    </>
                  }
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 w-full h-full relative">
          {periodLineData ? (
            <Line data={periodLineData} options={lineOptions} className="absolute inset-0 w-full h-full" />
          ) : (
            <p>No data to display.</p>
          )}
        </div>
      )}
    </WidgetWithSettings>
  );
}
