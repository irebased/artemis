import { useEffect, useState, useCallback } from 'react';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { BASE_OPTIONS, BaseType } from '@/types/bases';

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
        if (typeof decoded.ignorePunctuation === 'boolean') setIgnorePunctuation(decoded.ignorePunctuation);
        if (typeof decoded.ignoreWhitespace === 'boolean') setIgnoreWhitespace(decoded.ignoreWhitespace);
        if (typeof decoded.ignoreCasing === 'boolean') setIgnoreCasing(decoded.ignoreCasing);
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
    const ignorePunctParam = query.get('ignorePunctuation');
    const ignoreWSParam = query.get('ignoreWhitespace');
    const ignoreCaseParam = query.get('ignoreCasing');

    if (widgetParam) {
      const widgetList = widgetParam
        .split(',')
        .filter((w) => w in WIDGET_DEFAULTS) as string[];
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
    if (ignorePunctParam !== null) setIgnorePunctuation(ignorePunctParam === 'true');
    if (ignoreWSParam !== null) setIgnoreWhitespace(ignoreWSParam === 'true');
    if (ignoreCaseParam !== null) setIgnoreCasing(ignoreCaseParam === 'true');
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
    };
    const compressed = compressToEncodedURIComponent(JSON.stringify(paramsObj));
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
    legacyParams.set('ignorePunctuation', String(ignorePunctuation));
    legacyParams.set('ignoreWhitespace', String(ignoreWhitespace));
    legacyParams.set('ignoreCasing', String(ignoreCasing));
    const legacyQuery = legacyParams.toString();
    let newUrl;
    if (compressed.length + 2 < legacyQuery.length) {
      newUrl = `${window.location.pathname}?z=${compressed}`;
    } else {
      newUrl = `${window.location.pathname}?${legacyQuery}`;
    }
    window.history.replaceState(null, '', newUrl);
  }, [inputText, widgets, asciiBase, entropyMode, entropyWindow, icMode, layouts, ignorePunctuation, ignoreWhitespace, ignoreCasing]);

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
    };
    const compressed = compressToEncodedURIComponent(JSON.stringify(paramsObj));
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
    params.set('ignorePunctuation', String(ignorePunctuation));
    params.set('ignoreWhitespace', String(ignoreWhitespace));
    params.set('ignoreCasing', String(ignoreCasing));
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [widgets, inputText, asciiBase, entropyMode, entropyWindow, icMode, ignorePunctuation, ignoreWhitespace, ignoreCasing]);

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
  };
}