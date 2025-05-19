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
      // Convert string to Uint8Array if needed
      const inputData = typeof input === 'string' ? new TextEncoder().encode(input) : input;
      // Compress with maximum level
      const compressed = pako.deflate(inputData, { level: 9 });
      // Convert to base64 and make URL safe
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
      // Convert URL-safe base64 back to standard base64
      const base64 = makeBase64UrlUnsafe(base64url);
      // Convert base64 to Uint8Array
      const compressed = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      // Decompress
      const decompressed = pako.inflate(compressed);
      // Convert back to string
      const result = new TextDecoder().decode(decompressed);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

export function useDashboardParams(WIDGET_DEFAULTS, COLS, generateLayout, mergeLayoutsWithWidgets) {
  const [inputText, setInputText] = useState('');
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

  useEffect(() => {
    setLayouts(prev => mergeLayoutsWithWidgets(prev, widgets, COLS));
  }, [widgets]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const lzdataParam = query.get('lzdata');
    const zParam = query.get('z');
    const dataParam = query.get('data'); // legacy param

    if (lzdataParam) {
      // Try pako decompression first
      decompressLZMA(lzdataParam).then((json) => {
        try {
          const decoded = JSON.parse(json as string);
          if (decoded.widgets) setWidgets(decoded.widgets);
          if (decoded.data) setInputText(decoded.data);
          if (decoded.base && BASE_OPTIONS.includes(decoded.base as BaseType)) setAsciiBase(decoded.base as BaseType);
          if (decoded.entropyMode === 'sliding' || decoded.entropyMode === 'raw') setEntropyMode(decoded.entropyMode);
          if (decoded.entropyWindow && !isNaN(parseInt(decoded.entropyWindow))) setEntropyWindow(Number(decoded.entropyWindow));
          if (decoded.icMode === 'summary' || decoded.icMode === 'period') setIcMode(decoded.icMode);
          if (decoded.layout) setLayouts(decoded.layout);
          if (typeof decoded.ignorePunctuation === 'boolean') setIgnorePunctuation(decoded.ignorePunctuation);
          if (typeof decoded.ignoreWhitespace === 'boolean') setIgnoreWhitespace(decoded.ignoreWhitespace);
          if (typeof decoded.ignoreCasing === 'boolean') setIgnoreCasing(decoded.ignoreCasing);
          if (decoded.asciiRange === 'extended' || decoded.asciiRange === 'ascii' || decoded.asciiRange === 'input') setAsciiRange(decoded.asciiRange);
        } catch (e) {
          console.error('Failed to parse decompressed data:', e);
        }
      }).catch((e) => {
        console.error('Failed to decompress data:', e);
      });
    } else if (zParam) {
      // Handle legacy z param
      const decoded = decompressFromEncodedURIComponent(zParam);
      if (decoded) setInputText(decoded);
    } else if (dataParam) {
      // Handle legacy data param
      const decoded = decompressFromEncodedURIComponent(dataParam);
      if (decoded) setInputText(decoded);
    }

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
    const lzlayoutParam = query.get('lzdata_layout');
    if (lzlayoutParam) {
      decompressLZMA(lzlayoutParam).then((json) => {
        try {
          const decoded = JSON.parse(json as string);
          setLayouts(decoded);
        } catch (e) {}
      });
    } else if (layoutParam) {
      // legacy: decompress with lz-string
      try {
        const decoded = JSON.parse(decompressFromEncodedURIComponent(layoutParam));
        setLayouts(decoded);
      } catch (e) {}
    }
    if (ignorePunctParam !== null) setIgnorePunctuation(ignorePunctParam === 'true');
    if (ignoreWSParam !== null) setIgnoreWhitespace(ignoreWSParam === 'true');
    if (ignoreCaseParam !== null) setIgnoreCasing(ignoreCaseParam === 'true');
    if (asciiRangeParam === 'extended' || asciiRangeParam === 'ascii' || asciiRangeParam === 'input') setAsciiRange(asciiRangeParam);
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
      ignorePunctuation,
      ignoreWhitespace,
      ignoreCasing,
      asciiRange,
    };

    // Use pako compression for new URLs
    compressLZMA(JSON.stringify(paramsObj)).then((lzdataRaw) => {
      const lzdata = lzdataRaw as string;
      const newUrl = `${window.location.pathname}?lzdata=${lzdata}`;
      window.history.replaceState(null, '', newUrl);
    }).catch((e) => {
      console.error('Failed to compress data:', e);
    });
  }, [inputText, widgets, asciiBase, entropyMode, entropyWindow, icMode, layouts, ignorePunctuation, ignoreWhitespace, ignoreCasing, asciiRange]);

  const handleLayoutChange = useCallback((currentLayout, allLayouts) => {
    setLayouts(allLayouts);
    const paramsObj = {
      widgets,
      data: inputText,
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
      if (inputText) legacyParams.set('data', compressToEncodedURIComponent(inputText));
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
  }, [widgets, inputText, asciiBase, entropyMode, entropyWindow, icMode, ignorePunctuation, ignoreWhitespace, ignoreCasing, asciiRange]);

  return {
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
    asciiRange, setAsciiRange,
  };
}