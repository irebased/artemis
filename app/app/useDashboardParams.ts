import { useEffect, useState, useCallback } from 'react';
import pako from 'pako';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { BASE_OPTIONS, BaseType } from '@/types/bases';
import { Ciphertext } from '@/types/ciphertext';

// Helper: make base64 URL safe
function makeBase64UrlSafe(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Helper: make base64 URL unsafe (convert back to standard base64)
function makeBase64UrlUnsafe(base64url: string): string {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return base64;
}

// Helper: compress with pako and encode as base64
function compressLZMA(input) {
  return new Promise((resolve, reject) => {
    try {
      const inputData = typeof input === 'string' ? new TextEncoder().encode(input) : input;
      const compressed = pako.deflate(inputData, { level: 9 });
      const base64 = btoa(String.fromCharCode.apply(null, compressed));
      resolve(makeBase64UrlSafe(base64));
    } catch (error) {
      reject(error);
    }
  });
}

// Helper: decode base64 and decompress with pako
function decompressLZMA(base64url) {
  return new Promise((resolve, reject) => {
    try {
      const base64 = makeBase64UrlUnsafe(base64url);
      const compressed = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const decompressed = pako.inflate(compressed);
      const result = new TextDecoder().decode(decompressed);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

export type AsciiRange = 'extended' | 'ascii' | 'input';

export const INPUT_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#a855f7'];

export type FrequencyAnalysisSettings = {
  ngramSize: number;
  ngramMode: 'sliding' | 'block';
};

export type ShannonEntropySettings = {
  mode: 'raw' | 'sliding';
  windowSize: 16 | 32 | 64 | 128 | 256;
};

export type AsciiDistributionSettings = {
  range: 'extended' | 'ascii' | 'input';
};

export type IndexOfCoincidenceSettings = {
  mode: 'summary' | 'period';
  ngramSize?: number;
  ngramMode?: 'sliding' | 'block';
};

function compressSettings(obj: any): string {
  const json = JSON.stringify(obj);
  const compressed = pako.deflate(json, { level: 9 });
  return btoa(String.fromCharCode.apply(null, compressed));
}

function decompressSettings(str: string): any {
  const compressed = Uint8Array.from(atob(str), c => c.charCodeAt(0));
  const decompressed = pako.inflate(compressed);
  return JSON.parse(new TextDecoder().decode(decompressed));
}

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
  const [widgets, setWidgets] = useState<string[]>([]);
  const [asciiBase, setAsciiBase] = useState<BaseType>('ascii');
  const [entropyMode, setEntropyMode] = useState<'raw' | 'sliding'>('raw');
  const [entropyWindow, setEntropyWindow] = useState<number>(64);
  const [icMode, setIcMode] = useState<'summary' | 'period'>('summary');
  const [layouts, setLayouts] = useState(() => ({
    lg: generateLayout(widgets, COLS.lg),
    md: generateLayout(widgets, COLS.md),
    sm: generateLayout(widgets, COLS.sm),
  }));
  const [asciiRange, setAsciiRange] = useState<'extended' | 'ascii' | 'input'>('extended');

  const [inputsForUrlSync, setInputsForUrlSync] = useState<Ciphertext[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [layoutLocked, setLayoutLocked] = useState(false);
  const [frequencyAnalysisSettings, setFrequencyAnalysisSettings] = useState<FrequencyAnalysisSettings>({
    ngramSize: 1,
    ngramMode: 'sliding',
  });
  const [shannonEntropySettings, setShannonEntropySettings] = useState<ShannonEntropySettings>({
    mode: 'raw',
    windowSize: 64,
  });
  const [asciiDistributionSettings, setAsciiDistributionSettings] = useState<AsciiDistributionSettings>({
    range: 'extended',
  });
  const [indexOfCoincidenceSettings, setIndexOfCoincidenceSettings] = useState<IndexOfCoincidenceSettings>({
    mode: 'summary',
    ngramSize: 1,
    ngramMode: 'sliding',
  });

  const addInput = useCallback(() => {
    if (inputs.length < 5) {
      setInputs(prev => [...prev, {
        id: prev.length + 1,
        text: '',
        encoding: 'ascii',
        ignorePunctuation: false,
        ignoreWhitespace: false,
        ignoreCasing: false,
        color: INPUT_COLORS[prev.length]
      }]);
    }
  }, [inputs.length]);

  const removeInput = useCallback((id: number) => {
    setInputs(prev => prev.filter(input => input.id !== id));
  }, []);

  const updateInputText = useCallback((id: number, text: string) => {
    setInputs(prev => prev.map(input =>
      input.id === id ? { ...input, text } : input
    ));
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const lzdataParam = query.get('lzdata');
    let asyncLoads = 0;
    let asyncDone = 0;
    let loadedInputs = false;
    let loadedLayouts = false;
    function finishLoading() {
      if ((lzdataParam ? loadedInputs : true) && loadedLayouts) {
        setLoading(false);
      }
    }
    if (lzdataParam) {
      asyncLoads++;
      decompressLZMA(lzdataParam)
        .then((json) => {
          try {
            const decoded = JSON.parse(json as string);
            if (Array.isArray(decoded)) {
              setInputs(decoded);
              loadedInputs = true;
              finishLoading();
              return;
            }
          } catch (e) {
            loadedInputs = true;
            finishLoading();
          }
        })
        .catch(() => { loadedInputs = true; finishLoading(); });
    } else {
      loadedInputs = true;
    }
    const widgetParam = query.get('widgets');
    const modeParam = query.get('entropyMode');
    const windowParam = query.get('entropyWindow');
    const layoutParam = query.get('layout');
    const ignorePunctParam = query.get('ignorePunctuation');
    const ignoreWSParam = query.get('ignoreWhitespace');
    const ignoreCaseParam = query.get('ignoreCasing');
    const asciiRangeParam = query.get('asciiRange');
    const lockParam = query.get('lock');
    const freqSettingsParam = query.get('freqSettings');
    const entropySettingsParam = query.get('entropySettings');
    const asciiSettingsParam = query.get('asciiSettings');
    const icSettingsParam = query.get('icSettings');

    if (widgetParam) {
      const widgetList = widgetParam
        .split(',')
        .filter((w) => w in WIDGET_DEFAULTS) as string[];
      setWidgets(widgetList);
    }
    if (modeParam === 'sliding' || modeParam === 'raw') {
      setEntropyMode(modeParam);
    }
    if (windowParam && !isNaN(parseInt(windowParam))) {
      setEntropyWindow(parseInt(windowParam));
    }
    if (layoutParam) {
      try {
        const decoded = JSON.parse(decompressFromEncodedURIComponent(layoutParam));
        setLayouts(decoded);
        loadedLayouts = true;
        finishLoading();
      } catch (e) {}
    }
    const lzlayoutParam = query.get('lzdata_layout');
    if (lzlayoutParam) {
      asyncLoads++;
      decompressLZMA(lzlayoutParam)
        .then((json) => {
          try {
            const decoded = JSON.parse(json as string);
            setLayouts(decoded);
            loadedLayouts = true;
            finishLoading();
          } catch (e) {
            loadedLayouts = true;
            finishLoading();
          }
        })
        .catch(() => { loadedLayouts = true; finishLoading(); });
    } else {
      loadedLayouts = true;
    }
    if (ignorePunctParam !== null) setInputs(prev => prev.map(input => ({ ...input, ignorePunctuation: ignorePunctParam === 'true' })));
    if (ignoreWSParam !== null) setInputs(prev => prev.map(input => ({ ...input, ignoreWhitespace: ignoreWSParam === 'true' })));
    if (ignoreCaseParam !== null) setInputs(prev => prev.map(input => ({ ...input, ignoreCasing: ignoreCaseParam === 'true' })));
    if (asciiRangeParam === 'extended' || asciiRangeParam === 'ascii' || asciiRangeParam === 'input') setAsciiRange(asciiRangeParam);
    if (lockParam === '1' || lockParam === 'true') {
      setLayoutLocked(true);
    } else {
      setLayoutLocked(false);
    }
    if (freqSettingsParam) {
      try {
        const settings = decompressSettings(freqSettingsParam);
        setFrequencyAnalysisSettings(settings);
      } catch (e) {
        // fallback to defaults
      }
    }
    if (entropySettingsParam) {
      try {
        const settings = decompressSettings(entropySettingsParam);
        setShannonEntropySettings(settings);
      } catch (e) {
        // fallback to defaults
      }
    }
    if (asciiSettingsParam) {
      try {
        const settings = decompressSettings(asciiSettingsParam);
        setAsciiDistributionSettings(settings);
      } catch (e) {
        // fallback to defaults
      }
    }
    if (icSettingsParam) {
      try {
        const settings = decompressSettings(icSettingsParam);
        setIndexOfCoincidenceSettings(settings);
      } catch (e) {
        // fallback to defaults
      }
    }
    finishLoading();
  }, []);

  useEffect(() => {
    if (loading) return;
    // Use override if provided, else use internal state
    const urlInputs = inputsForUrlSync || inputs;
    compressLZMA(JSON.stringify(urlInputs)).then(compressed => {
      const params = new URLSearchParams();
      if (widgets.length > 0) params.set('widgets', widgets.join(','));
      if (layoutLocked) params.set('lock', '1');
      if (frequencyAnalysisSettings) {
        params.set('freqSettings', compressSettings(frequencyAnalysisSettings));
      }
      if (shannonEntropySettings) {
        params.set('entropySettings', compressSettings(shannonEntropySettings));
      }
      if (asciiDistributionSettings) {
        params.set('asciiSettings', compressSettings(asciiDistributionSettings));
      }
      if (indexOfCoincidenceSettings) {
        params.set('icSettings', compressSettings(indexOfCoincidenceSettings));
      }
      if (layouts) {
        compressLZMA(JSON.stringify(layouts)).then((lzlayoutRaw) => {
          const lzlayout = lzlayoutRaw as string;
          params.set('lzdata_layout', lzlayout);
          params.set('lzdata', compressed as string);
          const newUrl = `${window.location.pathname}?${params.toString()}`;
          window.history.replaceState(null, '', newUrl);
        });
      }
    });
  }, [inputs, inputsForUrlSync, widgets, layouts, asciiDistributionSettings, indexOfCoincidenceSettings, loading, layoutLocked, frequencyAnalysisSettings, shannonEntropySettings]);

  const handleLayoutChange = useCallback((currentLayout, allLayouts) => {
    setLayouts(allLayouts);
    const paramsObj = {
      widgets,
      data: inputs.map(input => input.text),
      base: asciiBase,
      entropyMode,
      entropyWindow,
      icMode,
      layout: allLayouts,
      ignorePunctuation: inputs.every(input => input.ignorePunctuation),
      ignoreWhitespace: inputs.every(input => input.ignoreWhitespace),
      ignoreCasing: inputs.every(input => input.ignoreCasing),
      asciiRange,
    };
    compressLZMA(JSON.stringify(paramsObj)).then((lzdataRaw) => {
      const lzdata = lzdataRaw as string;
      const legacyParams = new URLSearchParams();
      if (widgets.length > 0) legacyParams.set('widgets', widgets.join(','));
      if (inputs.length > 0) legacyParams.set('data', inputs.map(input => compressToEncodedURIComponent(input.text)).join(','));
      if (asciiBase) legacyParams.set('base', asciiBase);
      if (entropyMode) legacyParams.set('entropyMode', entropyMode);
      if (entropyMode === 'sliding') legacyParams.set('entropyWindow', entropyWindow.toString());
      if (icMode) legacyParams.set('icMode', icMode);
      if (allLayouts) {
        compressLZMA(JSON.stringify(allLayouts)).then((lzlayoutRaw) => {
          const lzlayout = lzlayoutRaw as string;
          legacyParams.set('lzdata_layout', lzlayout);
          legacyParams.set('ignorePunctuation', String(inputs.every(input => input.ignorePunctuation)));
          legacyParams.set('ignoreWhitespace', String(inputs.every(input => input.ignoreWhitespace)));
          legacyParams.set('ignoreCasing', String(inputs.every(input => input.ignoreCasing)));
          legacyParams.set('asciiRange', asciiRange);
          const legacyQuery = legacyParams.toString();
          let newUrl;
          if ((lzdata as string).length + 2 < legacyQuery.length) {
            newUrl = `${window.location.pathname}?lzdata=${lzdata}`;
          } else {
            newUrl = `${window.location.pathname}?${legacyQuery}`;
          }
          window.history.replaceState(null, '', newUrl);
        });
      } else {
        legacyParams.set('ignorePunctuation', String(inputs.every(input => input.ignorePunctuation)));
        legacyParams.set('ignoreWhitespace', String(inputs.every(input => input.ignoreWhitespace)));
        legacyParams.set('ignoreCasing', String(inputs.every(input => input.ignoreCasing)));
        legacyParams.set('asciiRange', asciiRange);
        const legacyQuery = legacyParams.toString();
        let newUrl;
        if ((lzdata as string).length + 2 < legacyQuery.length) {
          newUrl = `${window.location.pathname}?lzdata=${lzdata}`;
        } else {
          newUrl = `${window.location.pathname}?${legacyQuery}`;
        }
        window.history.replaceState(null, '', newUrl);
      }
    });
  }, [widgets, inputs, asciiBase, entropyMode, entropyWindow, icMode, asciiRange]);

  return {
    inputs,
    setInputs,
    setInputsForUrlSync,
    addInput,
    removeInput,
    updateInputText,
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
  };
}