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
import { useDashboardParams, INPUT_COLORS, AsciiRange } from './useDashboardParams';
import TextInputCard from '../components/TextInputCard';
import WidgetSelectorCard from '../components/WidgetSelectorCard';
import WidgetGrid from '../components/WidgetGrid';
import { Ciphertext } from '@/types/ciphertext';

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
    asciiRange,
    setAsciiRange,
    setInputsForUrlSync,
    loading,
  } = useDashboardParams(WIDGET_DEFAULTS, COLS, generateLayout, mergeLayoutsWithWidgets);

  useEffect(() => {
    setInputsForUrlSync(inputs.filter(input => input.text.trim() !== ''));
  }, [inputs, setInputsForUrlSync]);

  const adjustedTexts = useMemo(() =>
    inputs
      .filter(input => input.text.trim() !== '')
      .map(input => ({
        ...input,
        text: processText(input.text, {
          ignorePunctuation: input.ignorePunctuation,
          ignoreWhitespace: input.ignoreWhitespace,
          ignoreCasing: input.ignoreCasing
        })
      }))
  , [inputs]);

  if (loading) {
    return <div className="max-w-[1600px] mx-auto py-8 px-4 text-center text-lg">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-4">
      <TextInputCard
        inputs={inputs}
        setInputs={setInputs}
        INPUT_COLORS={INPUT_COLORS}
        BASE_OPTIONS={BASE_OPTIONS}
      />
      <WidgetSelectorCard
        widgets={widgets}
        setWidgets={setWidgets}
        AVAILABLE_WIDGETS={AVAILABLE_WIDGETS}
      />
      <WidgetGrid
        widgets={widgets}
        layouts={layouts}
        handleLayoutChange={handleLayoutChange}
        COLS={COLS}
        BREAKPOINTS={BREAKPOINTS}
        adjustedTexts={adjustedTexts}
        asciiBase={asciiBase}
        asciiRange={asciiRange}
        setAsciiRange={val => setAsciiRange(val as AsciiRange)}
        icMode={icMode}
        setIcMode={setIcMode}
        entropyMode={entropyMode}
        setEntropyMode={setEntropyMode}
        entropyWindow={entropyWindow}
        setEntropyWindow={setEntropyWindow}
      />
    </div>
  );
}
