'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import FrequencyAnalysisWidget from '../components/widgets/FrequencyAnalysisWidget';
import { AsciiDistributionWidget, BASE_OPTIONS } from '../components/widgets/AsciiDistributionWidget';

const AVAILABLE_WIDGETS = {
  frequency: 'Frequency Analysis',
  ascii: 'ASCII Distribution',
};

type WidgetKey = keyof typeof AVAILABLE_WIDGETS;
type BaseType = (typeof BASE_OPTIONS)[number];

export default function DashboardPage() {
  const [inputText, setInputText] = useState('');
  const [widgets, setWidgets] = useState<WidgetKey[]>([]);
  const [asciiBase, setAsciiBase] = useState<BaseType>('ascii');

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const widgetParam = query.get('widgets');
    const dataParam = query.get('data');
    const baseParam = query.get('base');

    if (widgetParam) {
      const widgetList = widgetParam
        .split(',')
        .filter((w) => w in AVAILABLE_WIDGETS) as WidgetKey[];
      setWidgets(widgetList);
    } else {
      setWidgets([]);
    }

    if (dataParam) {
      const decoded = decompressFromEncodedURIComponent(dataParam);
      if (decoded) {
        setInputText(decoded);
      }
    }

    if (baseParam && BASE_OPTIONS.includes(baseParam as BaseType)) {
      setAsciiBase(baseParam as BaseType);
    }
  }, []);

  useEffect(() => {
    const compressedText = compressToEncodedURIComponent(inputText);
    const params = new URLSearchParams();
    if (widgets.length > 0) {
      params.set('widgets', widgets.join(','));
    }
    if (inputText) {
      params.set('data', compressedText);
    }
    if (asciiBase) {
      params.set('base', asciiBase);
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [inputText, widgets, asciiBase]);

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
                    : 'bg-gray-800 hover:bg-gray-900'
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
              initialBase={asciiBase}
              onBaseChange={setAsciiBase}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
