'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import FrequencyAnalysisWidget from '../components/widgets/FrequencyAnalysisWidget/FrequencyAnalysisWidget';
import AsciiDistributionWidget from '../components/widgets/AsciiDistributionWidget/AsciiDistributionWidget';
import FrequencyStdDevWidget from '../components/widgets/FrequencyStdDevWidget/FrequencyStdDev';
import IndexOfCoincidenceWidget from '@/components/widgets/IndexOfCoincidenceWidget/IndexOfCoincidenceWidget';
import ShannonEntropyWidget from '@/components/widgets/ShannonEntropyWidget/ShannonEntropyWidget';
import { defaultGridSize as entropyDefault } from '@/components/widgets/ShannonEntropyWidget/useShannonEntropyChart';
import { defaultGridSize as icDefault } from '@/components/widgets/IndexOfCoincidenceWidget/useIndexOfCoincidenceChart';
import { defaultGridSize as stddevDefault } from '@/components/widgets/FrequencyStdDevWidget/useFrequencyStdDevChart';
import { defaultGridSize as freqDefault } from '@/components/widgets/FrequencyAnalysisWidget/useFrequencyAnalysisChart';
import { defaultGridSize as asciiDefault } from '@/components/widgets/AsciiDistributionWidget/useAsciiDistributionChart';
import { BASE_OPTIONS, BaseType } from '@/types/bases';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import WidgetContainer from '../components/widgets/WidgetContainer';
import { useDashboardParams, INPUT_COLORS } from './useDashboardParams';

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
const COLS = { lg: 4, md: 2, sm: 1 };

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

function processText(text, { ignorePunctuation, ignoreWhitespace, ignoreCasing }) {
  let result = text;
  if (ignorePunctuation) result = result.replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, '');
  if (ignoreWhitespace) result = result.replace(/\s+/g, '');
  if (ignoreCasing) result = result.toLowerCase();
  return result;
}

export default function DashboardPage() {
  const {
    inputs,
    setInputs,
    widgets,
    setWidgets,
    asciiBase,
    setAsciiBase,
    entropyMode,
    setEntropyMode,
    entropyWindow,
    setEntropyWindow,
    icMode,
    setIcMode,
    layouts,
    setLayouts,
    handleLayoutChange,
    ignorePunctuation,
    setIgnorePunctuation,
    ignoreWhitespace,
    setIgnoreWhitespace,
    ignoreCasing,
    setIgnoreCasing,
    asciiRange,
    setAsciiRange,
    setInputsForUrlSync,
  } = useDashboardParams(WIDGET_DEFAULTS, COLS, generateLayout, mergeLayoutsWithWidgets);

  const [activeInput, setActiveInput] = useState<{ id: number; text: string; color: string }>(inputs[0] || { id: 1, text: '', color: INPUT_COLORS[0] });
  const [pills, setPills] = useState<{ id: number; text: string; color: string }[]>(inputs.slice(1));

  useEffect(() => {
    if (inputs.length > 0) {
      setActiveInput(inputs[0]);
      setPills(inputs.slice(1));
    }
  }, [inputs]);

  useEffect(() => {
    setInputsForUrlSync([activeInput, ...pills].filter(input => input.text.trim() !== ''));
  }, [activeInput, pills, setInputsForUrlSync]);

  const updateAllInputs = useCallback((newActive, newPills) => {
    setActiveInput(newActive);
    setPills(newPills);
    setInputs([newActive, ...newPills]);
  }, [setInputs]);

  const handleAddInput = useCallback(() => {
    if (!activeInput.text.trim() || pills.length >= 4) return;
    const nextColor = INPUT_COLORS[(pills.length + 1) % INPUT_COLORS.length];
    const newPill = { ...activeInput, color: activeInput.color };
    const newActive = { id: Date.now(), text: '', color: nextColor };
    updateAllInputs(newActive, [...pills, newPill]);
  }, [activeInput, pills, updateAllInputs]);

  const handleRemovePill = useCallback((id: number) => {
    const newPills = pills.filter(p => p.id !== id);
    const allInputs = [activeInput, ...newPills].map((input, idx) => ({ ...input, color: INPUT_COLORS[idx] }));
    updateAllInputs(allInputs[0], allInputs.slice(1));
  }, [activeInput, pills, updateAllInputs]);

  const handlePillClick = useCallback((pill) => {
    const newPills = pills.map(p => (p.id === pill.id ? { ...activeInput } : p));
    updateAllInputs(pill, newPills);
  }, [activeInput, pills, updateAllInputs]);

  const handleTextChange = useCallback((e) => {
    setActiveInput({ ...activeInput, text: e.target.value });
  }, [activeInput]);

  const adjustedTexts = useMemo(() =>
    [activeInput, ...pills]
      .filter(input => input.text.trim() !== '')
      .map(input => ({
        ...input,
        text: processText(input.text, { ignorePunctuation, ignoreWhitespace, ignoreCasing })
      }))
  , [activeInput, pills, ignorePunctuation, ignoreWhitespace, ignoreCasing]);

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-4">
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-semibold">Input Texts</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-2 mb-4">
            {pills.map((pill) => (
              <div
                key={pill.id}
                className="flex items-center px-3 py-1 rounded-full cursor-pointer"
                style={{ backgroundColor: pill.color, color: '#fff' }}
                onClick={() => handlePillClick(pill)}
              >
                <span className="mr-2">{pill.text.slice(0, 10) + (pill.text.length > 10 ? '…' : '')}</span>
                <button
                  className="ml-2 text-white hover:text-gray-200 focus:outline-none"
                  onClick={e => { e.stopPropagation(); handleRemovePill(pill.id); }}
                  aria-label="Remove text"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <textarea
            className="w-full h-40 p-2 border rounded resize-none"
            style={{border: `1px solid ${INPUT_COLORS[(pills.length) % INPUT_COLORS.length]}`}}
            value={activeInput.text}
            onChange={handleTextChange}
            placeholder={`Enter text here...`}
          />
          <div className="flex w-100 justify-end">
              <button
                onClick={handleAddInput}
              className={`mt-4 px-4 py-2 rounded ${activeInput.text.trim() && pills.length < 4 ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              disabled={!activeInput.text.trim() || pills.length >= 4}
            >
              Add Another Text
            </button>
          </div>
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
        rowHeight={200}
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
            WidgetComponent = <FrequencyAnalysisWidget texts={adjustedTexts} gridH={layoutItem.h} />;
          } else if (widget === 'ascii') {
            WidgetComponent = (
              <AsciiDistributionWidget
                texts={adjustedTexts}
                base={asciiBase}
                gridW={layoutItem.w}
                asciiRange={asciiRange}
                setAsciiRange={setAsciiRange}
              />
            );
          } else if (widget === 'freqstddev') {
            WidgetComponent = <FrequencyStdDevWidget texts={adjustedTexts} gridH={layoutItem.h} />;
          } else if (widget === 'coincidence') {
            WidgetComponent = (
              <IndexOfCoincidenceWidget
                texts={adjustedTexts}
                base={asciiBase}
                view={icMode}
                onViewChange={setIcMode}
              />
            );
          } else if (widget === 'entropy') {
            WidgetComponent = (
              <ShannonEntropyWidget
                texts={adjustedTexts}
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
