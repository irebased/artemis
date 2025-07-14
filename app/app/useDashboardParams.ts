import { useEffect, useState, useCallback } from 'react';
import pako from 'pako';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { BASE_OPTIONS, BaseType } from '@/types/bases';
import { Ciphertext } from '@/types/ciphertext';
import { makeBase64UrlSafe, makeBase64UrlUnsafe } from '@/utils/base64/base64Utils';

import {
  AsciiRange,
  INPUT_COLORS,
  FrequencyAnalysisSettings,
  ShannonEntropySettings,
  AsciiDistributionSettings,
  IndexOfCoincidenceSettings,
  KolmogorovSmirnovSettings,
  ChiSquaredSettings,
} from '@/types/dashboard/dashboardTypes';
import { addInput, removeInput, updateInputText } from '@/utils/inputs/inputManager';
import {
  DEFAULT_FREQUENCY_ANALYSIS_SETTINGS,
  DEFAULT_SHANNON_ENTROPY_SETTINGS,
  DEFAULT_ASCII_DISTRIBUTION_SETTINGS,
  DEFAULT_INDEX_OF_COINCIDENCE_SETTINGS,
  DEFAULT_KOLMOGOROV_SMIRNOV_SETTINGS,
  DEFAULT_CHI_SQUARED_SETTINGS,
} from '@/utils/settings/dashboardSettings/dashboardSettingsManager';
import { parseAllUrlParameters } from '@/utils/urlParsing/urlParameterParser';
import { synchronizeDashboardState, synchronizeLayoutChanges } from '@/utils/urlSync/urlStateSynchronizer';
import { initializeLayouts } from '@/utils/layout/layoutManager';
import { processWidgetSettings, getDefaultWidgetSettings } from '@/utils/settings/widgetSettingsProcessor';

export function useDashboardParams(WIDGET_DEFAULTS, COLS, generateLayout, mergeLayoutsWithWidgets) {
  const [inputs, setInputs] = useState<Ciphertext[]>([{
    id: 1,
    text: '',
    encoding: 'ascii',
    ignorePunctuation: false,
    ignoreWhitespace: false,
    ignoreCasing: false,
    color: INPUT_COLORS[0],
  }]);
  const [dashboardName, setDashboardName] = useState<string>('Artemis Dashboard');
  const [widgets, setWidgets] = useState<string[]>([]);
  const [asciiBase, setAsciiBase] = useState<BaseType>('ascii');
  const [entropyMode, setEntropyMode] = useState<'raw' | 'sliding'>('raw');
  const [entropyWindow, setEntropyWindow] = useState<number>(64);
  const [icMode, setIcMode] = useState<'summary' | 'period'>('summary');
  const [layouts, setLayouts] = useState(() =>
    initializeLayouts(widgets, { COLS, generateLayout, mergeLayoutsWithWidgets })
  );
  const [asciiRange, setAsciiRange] = useState<'extended' | 'ascii' | 'input'>('extended');

  const [inputsForUrlSync, setInputsForUrlSync] = useState<Ciphertext[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [layoutLocked, setLayoutLocked] = useState(false);
  const [frequencyAnalysisSettings, setFrequencyAnalysisSettings] = useState<FrequencyAnalysisSettings>(DEFAULT_FREQUENCY_ANALYSIS_SETTINGS);
  const [shannonEntropySettings, setShannonEntropySettings] = useState<ShannonEntropySettings>(DEFAULT_SHANNON_ENTROPY_SETTINGS);
  const [asciiDistributionSettings, setAsciiDistributionSettings] = useState<AsciiDistributionSettings>(DEFAULT_ASCII_DISTRIBUTION_SETTINGS);
  const [indexOfCoincidenceSettings, setIndexOfCoincidenceSettings] = useState<IndexOfCoincidenceSettings>(DEFAULT_INDEX_OF_COINCIDENCE_SETTINGS);
  const [kolmogorovSmirnovSettings, setKolmogorovSmirnovSettings] = useState<KolmogorovSmirnovSettings>(DEFAULT_KOLMOGOROV_SMIRNOV_SETTINGS);
  const [chiSquaredSettings, setChiSquaredSettings] = useState<ChiSquaredSettings>(DEFAULT_CHI_SQUARED_SETTINGS);

  const handleAddInput = useCallback(() => {
    addInput(inputs, setInputs);
  }, [inputs]);

  const handleRemoveInput = useCallback((id: number) => {
    removeInput(id, setInputs);
  }, []);

  const handleUpdateInputText = useCallback((id: number, text: string) => {
    updateInputText(id, text, setInputs);
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    parseAllUrlParameters(query, WIDGET_DEFAULTS).then((params) => {
      // Set inputs if provided
      if (params.inputs) {
        setInputs(params.inputs);
      }

      // Set layouts if provided
      if (params.layouts) {
        setLayouts(params.layouts);
      }

      // Set other parameters
      if (params.dashboardName) {
        setDashboardName(params.dashboardName);
      }
      if (params.widgets) {
        setWidgets(params.widgets);
      }
      if (params.entropyMode) {
        setEntropyMode(params.entropyMode);
      }
      if (params.entropyWindow) {
        setEntropyWindow(params.entropyWindow);
      }
      if (params.ignorePunctuation !== undefined) {
        setInputs(prev => prev.map(input => ({ ...input, ignorePunctuation: params.ignorePunctuation! })));
      }
      if (params.ignoreWhitespace !== undefined) {
        setInputs(prev => prev.map(input => ({ ...input, ignoreWhitespace: params.ignoreWhitespace! })));
      }
      if (params.ignoreCasing !== undefined) {
        setInputs(prev => prev.map(input => ({ ...input, ignoreCasing: params.ignoreCasing! })));
      }
      if (params.asciiRange) {
        setAsciiRange(params.asciiRange);
      }
      if (params.layoutLocked !== undefined) {
        setLayoutLocked(params.layoutLocked);
      }
      // Process widget settings using the registry-based processor
      const widgetSettings = processWidgetSettings(params);

      if (widgetSettings['frequency-analysis']) {
        setFrequencyAnalysisSettings(widgetSettings['frequency-analysis']);
      }
      if (widgetSettings['shannon-entropy']) {
        setShannonEntropySettings(widgetSettings['shannon-entropy']);
      }
      if (widgetSettings['ascii-distribution']) {
        setAsciiDistributionSettings(widgetSettings['ascii-distribution']);
      }
      if (widgetSettings['index-of-coincidence']) {
        setIndexOfCoincidenceSettings(widgetSettings['index-of-coincidence']);
      }
      if (widgetSettings['kolmogorov-smirnov']) {
        setKolmogorovSmirnovSettings(widgetSettings['kolmogorov-smirnov']);
      }
      if (widgetSettings['chi-squared']) {
        setChiSquaredSettings(widgetSettings['chi-squared']);
      }

      setLoading(false);
    });
  }, []);

    useEffect(() => {
    synchronizeDashboardState({
      inputs,
      inputsForUrlSync,
      widgets,
      layouts,
      asciiDistributionSettings,
      indexOfCoincidenceSettings,
      loading,
      layoutLocked,
      frequencyAnalysisSettings,
      shannonEntropySettings,
      kolmogorovSmirnovSettings,
      chiSquaredSettings,
      dashboardName,
    });
  }, [inputs, inputsForUrlSync, widgets, layouts, asciiDistributionSettings, indexOfCoincidenceSettings, loading, layoutLocked, frequencyAnalysisSettings, shannonEntropySettings, kolmogorovSmirnovSettings, chiSquaredSettings, dashboardName]);

  const handleLayoutChange = useCallback((currentLayout, allLayouts) => {
    setLayouts(allLayouts);
    synchronizeLayoutChanges({
      widgets,
      inputs,
      asciiBase,
      entropyMode,
      entropyWindow,
      icMode,
      layouts: allLayouts,
      asciiRange,
    });
  }, [widgets, inputs, asciiBase, entropyMode, entropyWindow, icMode, asciiRange]);

  return {
    inputs,
    setInputs,
    setInputsForUrlSync,
    addInput: handleAddInput,
    removeInput: handleRemoveInput,
    updateInputText: handleUpdateInputText,
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
    loading,
    layoutLocked,
    setLayoutLocked,
    frequencyAnalysisSettings,
    setFrequencyAnalysisSettings,
    shannonEntropySettings,
    setShannonEntropySettings,
    asciiDistributionSettings,
    setAsciiDistributionSettings,
    indexOfCoincidenceSettings,
    setIndexOfCoincidenceSettings,
    kolmogorovSmirnovSettings,
    setKolmogorovSmirnovSettings,
    chiSquaredSettings,
    setChiSquaredSettings,
    dashboardName,
    setDashboardName,
  };
}