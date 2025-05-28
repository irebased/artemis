import { Ciphertext } from '@/types/ciphertext';
import { useKolmogorovSmirnov } from './useKolmogorovSmirnov';

interface KolmogorovSmirnovWidgetProps {
  inputs: Ciphertext[];
  kolmogorovSmirnovSettings: { ngramSize: number; ngramMode: 'sliding' | 'block' };
  setKolmogorovSmirnovSettings: (settings: { ngramSize: number; ngramMode: 'sliding' | 'block' }) => void;
}

export default function KolmogorovSmirnovWidget({ inputs, kolmogorovSmirnovSettings, setKolmogorovSmirnovSettings }: KolmogorovSmirnovWidgetProps) {
  const results = useKolmogorovSmirnov(inputs);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-2">Text</th>
              <th className="text-left p-2">Encoding</th>
              <th className="text-left p-2">KS Statistic</th>
              <th className="text-left p-2">p-value</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i}>
                <td className="p-2" style={{ color: r.color }}>
                  <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: r.color, display: 'inline-block' }} />
                  {r.text.slice(0, 7)}{r.text.length > 7 ? '...' : ''}
                </td>
                <td className="p-2">{r.encoding}</td>
                <td className="p-2 font-bold">{r.ksStatistic.toFixed(4)}</td>
                <td className="p-2">{r.pValue < 0.0001 ? '<0.0001' : r.pValue.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}