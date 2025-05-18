'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import FrequencyAnalysisWidget, { defaultGridSize as freqDefault } from '../components/widgets/FrequencyAnalysisWidget';
import { AsciiDistributionWidget, defaultGridSize as asciiDefault } from '../components/widgets/AsciiDistributionWidget';
import FrequencyStdDevWidget, { defaultGridSize as stddevDefault } from '../components/widgets/FrequencyStdDev';
import { IndexOfCoincidenceWidget, defaultGridSize as icDefault } from '@/components/widgets/IndexOfCoincidenceWidget';
import { ShannonEntropyWidget, defaultGridSize as entropyDefault } from '@/components/widgets/ShannonEntropyWidget';
import { BASE_OPTIONS, BaseType } from '@/types/bases';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import WidgetContainer from '../components/widgets/WidgetContainer';

const AVAILABLE_WIDGETS = {
  frequency: 'Frequency Analysis',
  ascii: 'ASCII Distribution',
  freqstddev: 'Frequency Std Dev',
  coincidence: 'Index of Coincidence',
  entropy: 'Shannon Entropy',
};

type WidgetKey = keyof typeof AVAILABLE_WIDGETS;

const ResponsiveGridLayout = WidthProvider(Responsive);

const WIDGET_DEFAULTS: Record<string, { w: number; h: number }> = {
  frequency: freqDefault,
  ascii: asciiDefault,
  freqstddev: stddevDefault,
  coincidence: icDefault,
  entropy: entropyDefault,
};

const BREAKPOINTS = { lg: 1024, md: 768, sm: 0 };
const COLS = { lg: 3, md: 2, sm: 1 };

function generateLayout(widgets, cols) {
  return widgets.map((widget, i) => ({
    i: widget,
    x: i % cols,
    y: Math.floor(i / cols),
    ...WIDGET_DEFAULTS[widget] || { w: 1, h: 2 },
  }));
}

function mergeLayoutsWithWidgets(layouts, widgets, cols) {
  const newLayouts = { lg: [], md: [], sm: [] };
  for (const bp of Object.keys(cols)) {
    const existing = layouts[bp] || [];
    const existingMap = Object.fromEntries(existing.map(l => [l.i, l]));
    let nextX = 0, nextY = 0;
    newLayouts[bp] = widgets.map((widget, i) => {
      if (existingMap[widget]) {
        return existingMap[widget];
      } else {

        const def = WIDGET_DEFAULTS[widget] || { w: 1, h: 2 };
        const layoutItem = {
          i: widget,
          x: nextX,
          y: nextY,
          ...def,
        };

        nextX = (nextX + def.w) % cols[bp];
        if (nextX === 0) nextY++;
        return layoutItem;
      }
    });
  }
  return newLayouts;
}

export default function DashboardPage() {
  const [inputText, setInputText] = useState('');
  const [widgets, setWidgets] = useState<WidgetKey[]>([]);
  const [asciiBase, setAsciiBase] = useState<BaseType>('ascii');
  const [entropyMode, setEntropyMode] = useState<'raw' | 'sliding'>('raw');
  const [entropyWindow, setEntropyWindow] = useState<number>(64);
  const [icMode, setIcMode] = useState<'summary' | 'period'>('summary');

  const [layouts, setLayouts] = useState(() => ({
    lg: generateLayout(widgets, COLS.lg),
    md: generateLayout(widgets, COLS.md),
    sm: generateLayout(widgets, COLS.sm),
  }));

  useEffect(() => {
    setLayouts(prev => mergeLayoutsWithWidgets(prev, widgets, COLS));
  }, [widgets]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const zParam = query.get('z');
    if (zParam) {
      try {
        const decoded = JSON.parse(decompressFromEncodedURIComponent(zParam));
        if (decoded.widgets) setWidgets(decoded.widgets);
        if (decoded.data) setInputText(decoded.data);
        if (decoded.base && BASE_OPTIONS.includes(decoded.base as BaseType)) setAsciiBase(decoded.base as BaseType);
        if (decoded.entropyMode === 'sliding' || decoded.entropyMode === 'raw') setEntropyMode(decoded.entropyMode);
        if (decoded.entropyWindow && !isNaN(parseInt(decoded.entropyWindow))) setEntropyWindow(Number(decoded.entropyWindow));
        if (decoded.icMode === 'summary' || decoded.icMode === 'period') setIcMode(decoded.icMode);
        if (decoded.layout) setLayouts(decoded.layout);
        return;
      } catch (e) {}
    }
    const widgetParam = query.get('widgets');
    const dataParam = query.get('data');
    const baseParam = query.get('base');
    const modeParam = query.get('entropyMode');
    const windowParam = query.get('entropyWindow');
    const icModeParam = query.get('icMode');
    const layoutParam = query.get('layout');

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

    if (layoutParam) {
      try {
        const decoded = JSON.parse(decompressFromEncodedURIComponent(layoutParam));
        setLayouts(decoded);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const paramsObj = {
      widgets,
      data: inputText,
      base: asciiBase,
      entropyMode,
      entropyWindow,
      icMode,
      layout: layouts,
    };
    const compressed = compressToEncodedURIComponent(JSON.stringify(paramsObj));

    // Build legacy params
    const compressedText = compressToEncodedURIComponent(inputText);
    const legacyParams = new URLSearchParams();
    if (widgets.length > 0) legacyParams.set('widgets', widgets.join(','));
    if (inputText) legacyParams.set('data', compressedText);
    if (asciiBase) legacyParams.set('base', asciiBase);
    if (entropyMode) legacyParams.set('entropyMode', entropyMode);
    if (entropyMode === 'sliding') legacyParams.set('entropyWindow', entropyWindow.toString());
    if (icMode) legacyParams.set('icMode', icMode);
    if (layouts) {
      const layoutParam = compressToEncodedURIComponent(JSON.stringify(layouts));
      legacyParams.set('layout', layoutParam);
    }
    const legacyQuery = legacyParams.toString();

    // Decide which to use
    let newUrl;
    if (compressed.length + 2 < legacyQuery.length) {
      newUrl = `${window.location.pathname}?z=${compressed}`;
    } else {
      newUrl = `${window.location.pathname}?${legacyQuery}`;
    }
    window.history.replaceState(null, '', newUrl);
  }, [inputText, widgets, asciiBase, entropyMode, entropyWindow, icMode, layouts]);

  const toggleWidget = (widget: WidgetKey) => {
    setWidgets((prev) =>
      prev.includes(widget) ? prev.filter((w) => w !== widget) : [...prev, widget]
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4">
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

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={BREAKPOINTS}
        cols={COLS}
        rowHeight={250}
        isResizable={true}
        onLayoutChange={(currentLayout, allLayouts) => {
          setLayouts(allLayouts);

          const compressedText = compressToEncodedURIComponent(inputText);
          const params = new URLSearchParams();
          if (widgets.length > 0) params.set('widgets', widgets.join(','));
          if (inputText) params.set('data', compressedText);
          if (asciiBase) params.set('base', asciiBase);
          if (entropyMode) params.set('entropyMode', entropyMode);
          if (entropyMode === 'sliding') params.set('entropyWindow', entropyWindow.toString());
          if (icMode) params.set('icMode', icMode);
          if (allLayouts) {
            const layoutParam = compressToEncodedURIComponent(JSON.stringify(allLayouts));
            params.set('layout', layoutParam);
          }
          const newUrl = `${window.location.pathname}?${params.toString()}`;
          window.history.replaceState(null, '', newUrl);
        }}
        measureBeforeMount={false}
        useCSSTransforms={true}
        compactType="vertical"
      >
        {widgets.map((widget) => {
          let WidgetComponent = null;
          if (widget === 'frequency') {
            WidgetComponent = <FrequencyAnalysisWidget text={inputText} />;
          } else if (widget === 'ascii') {
            WidgetComponent = (
              <AsciiDistributionWidget
                text={inputText}
                base={asciiBase}
              />
            );
          } else if (widget === 'freqstddev') {
            WidgetComponent = <FrequencyStdDevWidget text={inputText} />;
          } else if (widget === 'coincidence') {
            WidgetComponent = (
              <IndexOfCoincidenceWidget
                text={inputText}
                base={asciiBase}
                view={icMode}
                onViewChange={setIcMode}
              />
            );
          } else if (widget === 'entropy') {
            WidgetComponent = (
              <ShannonEntropyWidget
                text={inputText}
                base={asciiBase}
                mode={entropyMode}
                windowSize={entropyWindow}
                onModeChange={setEntropyMode}
                onWindowSizeChange={setEntropyWindow}
              />
            );
          }
          return (
            <div key={widget} data-grid={layouts.lg.find((l) => l.i === widget)}>
              <WidgetContainer>
                {WidgetComponent}
              </WidgetContainer>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
}
