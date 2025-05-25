'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { defaultGridSize as entropyDefault } from '@/components/widgets/ShannonEntropyWidget/useShannonEntropyChart';
import { defaultGridSize as icDefault } from '@/components/widgets/IndexOfCoincidenceWidget/useIndexOfCoincidenceChart';
import { defaultGridSize as stddevDefault } from '@/components/widgets/FrequencyStdDevWidget/useFrequencyStdDevChart';
import { defaultGridSize as freqDefault } from '@/components/widgets/FrequencyAnalysisWidget/useFrequencyAnalysisChart';
import { defaultGridSize as asciiDefault } from '@/components/widgets/AsciiDistributionWidget/useAsciiDistributionChart';
import { BASE_OPTIONS, BaseType } from '@/types/bases';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useDashboardParams, INPUT_COLORS, AsciiRange } from './useDashboardParams';
import TextInputCard from '../components/TextInputCard';
import WidgetSelectorCard from '../components/WidgetSelectorCard';
import WidgetGrid from '../components/WidgetGrid';
import { useTheme } from 'next-themes';

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
    layoutLocked,
    setLayoutLocked,
    loading,
  } = useDashboardParams(WIDGET_DEFAULTS, COLS, generateLayout, mergeLayoutsWithWidgets);

  const { theme } = useTheme();

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

  const darkModeLockedButtonStyle ='bg-gray-800 text-blue-400 border-blue-400';
  const darkModeUnlockedButtonStyle = 'bg-gray-900 text-gray-400 border-gray-700 hover:text-blue-400';
  const lightModeLockedButtonStyle = 'bg-gray-100 text-blue-800 border-blue-800';
  const lightModeUnlockedButtonStyle = 'bg-gray-200 text-gray-400 border-gray-300 hover:text-blue-400';

  const lightModeButtonStyle = theme === 'light' ? lightModeLockedButtonStyle : lightModeUnlockedButtonStyle;

  const darkModeButtonStyle = theme === 'dark' ? darkModeLockedButtonStyle : darkModeUnlockedButtonStyle;

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Text Analysis Dashboard</h1>
        <button
          className={`flex items-center px-3 py-1 rounded border ${theme == 'dark' ? darkModeButtonStyle : lightModeButtonStyle}`}
          onClick={() => setLayoutLocked(!layoutLocked)}
          title={layoutLocked ? 'Unlock layout (enable drag, resize, add/remove)' : 'Lock layout (disable drag, resize, add/remove)'}
        >
          {layoutLocked ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11V7a3 3 0 10-6 0v4" />
              <rect width="12" height="8" x="6" y="11" rx="2" stroke="currentColor" strokeWidth={2} fill="none"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 018 0" />
              <rect width="12" height="8" x="6" y="11" rx="2" stroke="currentColor" strokeWidth={2} fill="none"/>
            </svg>
          )}
          {layoutLocked ? 'Locked' : 'Unlocked'}
        </button>
      </div>
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
        layoutLocked={layoutLocked}
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
        layoutLocked={layoutLocked}
      />
    </div>
  );
}
