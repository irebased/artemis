'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import FrequencyAnalysisWidget, { defaultGridSize as freqDefault } from '../components/widgets/FrequencyAnalysisWidget/FrequencyAnalysisWidget';
import { AsciiDistributionWidget, defaultGridSize as asciiDefault } from '../components/widgets/AsciiDistributionWidget/AsciiDistributionWidget';
import FrequencyStdDevWidget, { defaultGridSize as stddevDefault } from '../components/widgets/FrequencyStdDevWidget/FrequencyStdDev';
import { IndexOfCoincidenceWidget, defaultGridSize as icDefault } from '@/components/widgets/IndexOfCoincidenceWidget/IndexOfCoincidenceWidget';
import { ShannonEntropyWidget, defaultGridSize as entropyDefault } from '@/components/widgets/ShannonEntropyWidget/ShannonEntropyWidget';
import { BASE_OPTIONS, BaseType } from '@/types/bases';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import WidgetContainer from '../components/widgets/WidgetContainer';
import { useDashboardParams } from './useDashboardParams';

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

// Utility function to process text based on ignore options
function processText(text, { ignorePunctuation, ignoreWhitespace, ignoreCasing }) {
  let result = text;
  if (ignorePunctuation) result = result.replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, '');
  if (ignoreWhitespace) result = result.replace(/\s+/g, '');
  if (ignoreCasing) result = result.toLowerCase();
  return result;
}

export default function DashboardPage() {
  const {
    inputText, setInputText,
    widgets, setWidgets,
    asciiBase, setAsciiBase,
    entropyMode, setEntropyMode,
    entropyWindow, setEntropyWindow,
    icMode, setIcMode,
    layouts, setLayouts,
    handleLayoutChange,
    ignorePunctuation, setIgnorePunctuation,
    ignoreWhitespace, setIgnoreWhitespace,
    ignoreCasing, setIgnoreCasing,
  } = useDashboardParams(WIDGET_DEFAULTS, COLS, generateLayout, mergeLayoutsWithWidgets);

  // Compute adjusted text
  const adjustedText = useMemo(() => processText(inputText, { ignorePunctuation, ignoreWhitespace, ignoreCasing }), [inputText, ignorePunctuation, ignoreWhitespace, ignoreCasing]);

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
          <br/>
          <div className="mb-4 flex flex-wrap gap-4">
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={ignorePunctuation} onChange={e => setIgnorePunctuation(e.target.checked)} />
              <span>Ignore punctuation</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={ignoreWhitespace} onChange={e => setIgnoreWhitespace(e.target.checked)} />
              <span>Ignore whitespace</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={ignoreCasing} onChange={e => setIgnoreCasing(e.target.checked)} />
              <span>Ignore casing</span>
            </label>
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
                onClick={() => setWidgets((prev) =>
                  prev.includes(key as WidgetKey) ? prev.filter((w) => w !== key) : [...prev, key as WidgetKey]
                )}
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
        onLayoutChange={handleLayoutChange}
        measureBeforeMount={false}
        useCSSTransforms={true}
        compactType="vertical"
      >
        {widgets.map((widget) => {
          let WidgetComponent = null;
          const layoutItem = layouts.lg.find((l) => l.i === widget) || { w: 1, h: 1 };
          if (widget === 'frequency') {
            WidgetComponent = <FrequencyAnalysisWidget text={adjustedText} gridH={layoutItem.h} />;
          } else if (widget === 'ascii') {
            WidgetComponent = (
              <AsciiDistributionWidget
                text={adjustedText}
                base={asciiBase}
                gridW={layoutItem.w}
              />
            );
          } else if (widget === 'freqstddev') {
            WidgetComponent = <FrequencyStdDevWidget text={adjustedText} gridH={layoutItem.h} />;
          } else if (widget === 'coincidence') {
            WidgetComponent = (
              <IndexOfCoincidenceWidget
                text={adjustedText}
                base={asciiBase}
                view={icMode}
                onViewChange={setIcMode}
              />
            );
          } else if (widget === 'entropy') {
            WidgetComponent = (
              <ShannonEntropyWidget
                text={adjustedText}
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
