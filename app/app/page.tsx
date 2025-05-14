'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import FrequencyAnalysisWidget from '../components/widgets/FrequencyAnalysisWidget';
import { AsciiDistributionWidget } from '../components/widgets/AsciiDistributionWidget';
import FrequencyStdDevWidget from '../components/widgets/FrequencyStdDev';
import { IndexOfCoincidenceWidget } from '@/components/widgets/IndexOfCoincidenceWidget';
import { ShannonEntropyWidget } from '@/components/widgets/ShannonEntropyWidget';
import { BASE_OPTIONS, BaseType } from '@/types/bases';

const AVAILABLE_WIDGETS = {
  frequency: 'Frequency Analysis',
  ascii: 'ASCII Distribution',
  freqstddev: 'Frequency Std Dev',
  coincidence: 'Index of Coincidence',
  entropy: 'Shannon Entropy',
};

type WidgetKey = keyof typeof AVAILABLE_WIDGETS;


export default function DashboardPage() {
  const [inputText, setInputText] = useState('');
  const [widgets, setWidgets] = useState<WidgetKey[]>([]);
  const [asciiBase, setAsciiBase] = useState<BaseType>('ascii');
  const [entropyMode, setEntropyMode] = useState<'raw' | 'sliding'>('raw');
  const [entropyWindow, setEntropyWindow] = useState<number>(64);
  const [icMode, setIcMode] = useState<'summary' | 'period'>('summary');


  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const widgetParam = query.get('widgets');
    const dataParam = query.get('data');
    const baseParam = query.get('base');
    const modeParam = query.get('entropyMode');
    const windowParam = query.get('entropyWindow');
    const icModeParam = query.get('icMode');

    if (widgetParam) {
      const widgetList = widgetParam
        .split(',')
        .filter((w) => w in AVAILABLE_WIDGETS) as WidgetKey[];
      setWidgets(widgetList);
    }

    if (dataParam) {
      const decoded = decompressFromEncodedURIComponent(dataParam);
      if (decoded) setInputText(decoded);
    }

    if (baseParam && BASE_OPTIONS.includes(baseParam as BaseType)) {
      setAsciiBase(baseParam as BaseType);
    }

    if (modeParam === 'sliding' || modeParam === 'raw') {
      setEntropyMode(modeParam);
    }

    if (windowParam && !isNaN(parseInt(windowParam))) {
      setEntropyWindow(parseInt(windowParam));
    }

    if (icModeParam === 'summary' || icModeParam === 'period') {
      setIcMode(icModeParam);
    }

  }, []);

  useEffect(() => {
    const compressedText = compressToEncodedURIComponent(inputText);
    const params = new URLSearchParams();

    if (widgets.length > 0) params.set('widgets', widgets.join(','));
    if (inputText) params.set('data', compressedText);
    if (asciiBase) params.set('base', asciiBase);
    if (entropyMode) params.set('entropyMode', entropyMode);
    if (entropyMode === 'sliding') params.set('entropyWindow', entropyWindow.toString());
    if (icMode) params.set('icMode', icMode);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [inputText, widgets, asciiBase, entropyMode, entropyWindow, icMode]);

  const toggleWidget = (widget: WidgetKey) => {
    setWidgets((prev) =>
      prev.includes(widget) ? prev.filter((w) => w !== widget) : [...prev, widget]
    );
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-semibold">Input Text</h2>
        </CardHeader>
        <CardBody>
          <textarea
            className="w-full h-40 p-2 border rounded resize-none"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your text here..."
          />
          <div className="mt-4">
            <label className="mr-2 font-medium">Text encoding:</label>
            <select
              value={asciiBase}
              onChange={(e) => setAsciiBase(e.target.value as BaseType)}
              className="p-2 border rounded"
            >
              {BASE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </CardBody>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-semibold">Available Widgets</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {Object.entries(AVAILABLE_WIDGETS).map(([key, name]) => (
              <button
                key={key}
                onClick={() => toggleWidget(key as WidgetKey)}
                className={`px-3 py-1 rounded ${
                  widgets.includes(key as WidgetKey)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-800'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {widgets.map((widget) => {
        if (widget === 'frequency') {
          return <FrequencyAnalysisWidget key={widget} text={inputText} />;
        }
        if (widget === 'ascii') {
          return (
            <AsciiDistributionWidget
              key={widget}
              text={inputText}
              base={asciiBase}
            />
          );
        }
        if (widget === 'freqstddev') {
          return <FrequencyStdDevWidget key={widget} text={inputText} />;
        }
        if (widget === 'coincidence') {
          return (
            <IndexOfCoincidenceWidget
              key={widget}
              text={inputText}
              base={asciiBase}
              view={icMode}
              onViewChange={setIcMode}
            />
          );
        }
        if (widget === 'entropy') {
          return (
            <ShannonEntropyWidget
              key={widget}
              text={inputText}
              base={asciiBase}
              mode={entropyMode}
              windowSize={entropyWindow}
              onModeChange={setEntropyMode}
              onWindowSizeChange={setEntropyWindow}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
