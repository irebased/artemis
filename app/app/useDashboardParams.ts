import { useEffect, useState, useCallback } from 'react';
import pako from 'pako';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { BASE_OPTIONS, BaseType } from '@/types/bases';

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

export type InputData = {
  id: number;
  text: string;
  color: string;
};

export const INPUT_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#a855f7'];

export function useDashboardParams(WIDGET_DEFAULTS, COLS, generateLayout, mergeLayoutsWithWidgets) {
  const [inputs, setInputs] = useState<InputData[]>([{ id: 1, text: '', color: INPUT_COLORS[0] }]);
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
  const [ignorePunctuation, setIgnorePunctuation] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCasing, setIgnoreCasing] = useState(false);
  const [asciiRange, setAsciiRange] = useState<'extended' | 'ascii' | 'input'>('extended');

  const [inputsForUrlSync, setInputsForUrlSync] = useState<InputData[] | null>(null);

  const addInput = useCallback(() => {
    if (inputs.length < 5) {
      setInputs(prev => [...prev, {
        id: prev.length + 1,
        text: '',
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

    const widgetParam = query.get('widgets');
    const baseParam = query.get('base');
    const modeParam = query.get('entropyMode');
    const windowParam = query.get('entropyWindow');
    const icModeParam = query.get('icMode');
    const layoutParam = query.get('layout');
    const ignorePunctParam = query.get('ignorePunctuation');
    const ignoreWSParam = query.get('ignoreWhitespace');
    const ignoreCaseParam = query.get('ignoreCasing');
    const asciiRangeParam = query.get('asciiRange');

    // Async load inputs
    const decompressPromises: Promise<InputData | null>[] = [];
    for (let i = 1; i <= 5; i++) {
      const lzdataParam = query.get(`lzdata${i}`);
      if (lzdataParam) {
        decompressPromises.push(
          decompressLZMA(lzdataParam)
            .then((json) => {
              try {
                const decoded = JSON.parse(json as string);
                if (decoded.data) {
                  return {
                    id: i,
                    text: decoded.data,
                    color: INPUT_COLORS[i - 1]
                  };
                }
              } catch (e) {
                console.error(`Failed to parse decompressed data for input ${i}:`, e);
              }
              return null;
            })
            .catch((e) => {
              console.error(`Failed to decompress data for input ${i}:`, e);
              return null;
            })
        );
      }
    }
    if (decompressPromises.length > 0) {
      Promise.all(decompressPromises).then((results) => {
        const loadedInputs = results.filter(Boolean) as InputData[];
        if (loadedInputs.length > 0) {
          setInputs(loadedInputs);
        }
      });
    }

    if (widgetParam) {
      const widgetList = widgetParam
        .split(',')
        .filter((w) => w in WIDGET_DEFAULTS) as string[];
      setWidgets(widgetList);
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
    const lzlayoutParam = query.get('lzdata_layout');
    if (lzlayoutParam) {
      decompressLZMA(lzlayoutParam)
        .then((json) => {
          try {
            const decoded = JSON.parse(json as string);
            setLayouts(decoded);
          } catch (e) {
            console.error('Failed to parse decompressed layout:', e);
          }
        })
        .catch((e) => {
          console.error('Failed to decompress layout:', e);
        });
    }
    if (ignorePunctParam !== null) setIgnorePunctuation(ignorePunctParam === 'true');
    if (ignoreWSParam !== null) setIgnoreWhitespace(ignoreWSParam === 'true');
    if (ignoreCaseParam !== null) setIgnoreCasing(ignoreCaseParam === 'true');
    if (asciiRangeParam === 'extended' || asciiRangeParam === 'ascii' || asciiRangeParam === 'input') setAsciiRange(asciiRangeParam);
  }, []);

  useEffect(() => {
    // Use override if provided, else use internal state
    const urlInputs = inputsForUrlSync || inputs;
    const compressPromises = urlInputs.map(input =>
      compressLZMA(JSON.stringify({ data: input.text }))
    );

    Promise.all(compressPromises).then(compressedData => {
      const params = new URLSearchParams();

      if (widgets.length > 0) params.set('widgets', widgets.join(','));
      if (asciiBase) params.set('base', asciiBase);
      if (entropyMode) params.set('entropyMode', entropyMode);
      if (entropyMode === 'sliding') params.set('entropyWindow', entropyWindow.toString());
      if (icMode) params.set('icMode', icMode);
      if (layouts) {
        compressLZMA(JSON.stringify(layouts)).then((lzlayoutRaw) => {
          const lzlayout = lzlayoutRaw as string;
          params.set('lzdata_layout', lzlayout);
          params.set('ignorePunctuation', String(ignorePunctuation));
          params.set('ignoreWhitespace', String(ignoreWhitespace));
          params.set('ignoreCasing', String(ignoreCasing));
          params.set('asciiRange', asciiRange);

          compressedData.forEach((data, index) => {
            params.set(`lzdata${index + 1}`, data as string);
          });

          const newUrl = `${window.location.pathname}?${params.toString()}`;
          window.history.replaceState(null, '', newUrl);
        });
      }
    });
  }, [inputs, inputsForUrlSync, widgets, asciiBase, entropyMode, entropyWindow, icMode, layouts, ignorePunctuation, ignoreWhitespace, ignoreCasing, asciiRange]);

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
      ignorePunctuation,
      ignoreWhitespace,
      ignoreCasing,
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
          legacyParams.set('ignorePunctuation', String(ignorePunctuation));
          legacyParams.set('ignoreWhitespace', String(ignoreWhitespace));
          legacyParams.set('ignoreCasing', String(ignoreCasing));
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
        legacyParams.set('ignorePunctuation', String(ignorePunctuation));
        legacyParams.set('ignoreWhitespace', String(ignoreWhitespace));
        legacyParams.set('ignoreCasing', String(ignoreCasing));
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
  }, [widgets, inputs, asciiBase, entropyMode, entropyWindow, icMode, ignorePunctuation, ignoreWhitespace, ignoreCasing, asciiRange]);

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
    ignorePunctuation,
    setIgnorePunctuation,
    ignoreWhitespace,
    setIgnoreWhitespace,
    ignoreCasing,
    setIgnoreCasing,
    asciiRange,
    setAsciiRange,
  };
}