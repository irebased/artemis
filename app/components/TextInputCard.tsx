import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';
import { BaseType } from '@/types/bases';
import { Ciphertext } from '@/types/ciphertext';
import { useTheme } from 'next-themes';

interface TextInputCardProps {
  inputs: Ciphertext[];
  setInputs: (inputs: Ciphertext[]) => void;
  INPUT_COLORS: string[];
  BASE_OPTIONS: readonly BaseType[];
}

export default function TextInputCard({
  inputs,
  setInputs,
  INPUT_COLORS,
  BASE_OPTIONS,
}: TextInputCardProps) {
  const [activeTab, setActiveTab] = useState(0);
  const mounted = useRef(false);
  const prevInputsLen = useRef(inputs.length);
  const { theme } = useTheme();

  // Ensure we always have at least one input
  useEffect(() => {
    if (inputs.length === 0) {
      setInputs([{
        id: Date.now(),
        text: '',
        encoding: 'ascii',
        ignorePunctuation: false,
        ignoreWhitespace: false,
        ignoreCasing: false,
        color: INPUT_COLORS[0],
      }]);
    }
  }, [inputs.length, setInputs, INPUT_COLORS]);

  // Sync activeTab if inputs change length
  useEffect(() => {
    if (!mounted.current || prevInputsLen.current !== inputs.length) {
      if (activeTab >= inputs.length) setActiveTab(Math.max(0, inputs.length - 1));
      prevInputsLen.current = inputs.length;
      mounted.current = true;
    }
  }, [inputs.length, activeTab]);

  // Handlers
  const handleTabChange = (idx: number) => setActiveTab(idx);

  const handleInputChange = (field: keyof Ciphertext, value: any) => {
    const updatedInputs = inputs.map((input, idx) =>
      idx === activeTab ? { ...input, [field]: value } : input
    );
    setInputs(updatedInputs);
  };

  const handleAddInput = () => {
    if (inputs.length >= 5) return;
    const nextColor = INPUT_COLORS[inputs.length % INPUT_COLORS.length];
    setInputs([
      ...inputs,
      {
        id: Date.now(),
        text: '',
        encoding: 'ascii',
        ignorePunctuation: false,
        ignoreWhitespace: false,
        ignoreCasing: false,
        color: nextColor,
      },
    ]);
    setActiveTab(inputs.length); // focus new tab
  };

  const handleRemoveInput = (idx: number) => {
    if (inputs.length === 1) return;
    const newInputs = inputs.filter((_, i) => i !== idx).map((input, i) => ({ ...input, color: INPUT_COLORS[i] }));
    setInputs(newInputs);
    setActiveTab(idx === 0 ? 0 : idx - 1);
  };

  // Safety check for activeInput
  if (inputs.length === 0 || activeTab >= inputs.length) {
    return null;
  }

  const activeInput = inputs[activeTab];

  const lightModeTabActiveStyle = 'bg-gray-100 text-black';
  const darkModeTabActiveStyle = 'bg-gray-800 text-white';
  const lightModeTabStyle = 'bg-blue-200 text-gray-800 hover:bg-gray-100 hover:text-black';
  const darkModeTabStyle = 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white';

  const lightModeHeaderStyle = 'border-gray-100 bg-blue-100';
  const darkModeHeaderStyle = 'border-b border-gray-800 bg-gray-900';

  return (
    <div>
      {/* Tabs Bar - now above the card, styled for dark theme */}
      <div className={`flex items-center gap-2 mb-0 ${theme === 'dark' ? darkModeHeaderStyle : lightModeHeaderStyle} rounded-t-lg px-4 pt-2 pb-1`}>
        {inputs.map((input, idx) => (
          <div
            key={input.id}
            className={`flex items-center px-3 py-1 cursor-pointer rounded-t transition-colors duration-100
              ${activeTab === idx
                ? theme === 'dark' ? darkModeTabActiveStyle : lightModeTabActiveStyle
                : theme === 'dark' ? darkModeTabStyle : lightModeTabStyle}`}
            style={{ borderBottom: activeTab === idx ? '2px solid #3b82f6' : '2px solid transparent' }}
            onClick={() => handleTabChange(idx)}
          >
            <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: input.color, display: 'inline-block' }} />
            <span className="font-mono text-xs">{input.text.slice(0, 5) + (input.text.length > 5 ? '…' : '')}</span>
            <button
              className={`ml-2 text-gray-400 hover:text-blue-400 focus:outline-none ${input.hidden ? 'opacity-60' : ''}`}
              onClick={e => { e.stopPropagation(); setInputs(inputs.map((inp, i) => i === idx ? { ...inp, hidden: !inp.hidden } : inp)); }}
              aria-label={input.hidden ? 'Show input' : 'Hide input'}
              title={input.hidden ? 'Show input in widgets' : 'Hide input from widgets'}
            >
              {input.hidden ? (
                // Eye-off icon
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M6.22 6.22A7.963 7.963 0 004 9c0 4.418 3.582 8 8 8 1.657 0 3.22-.403 4.575-1.125M17.78 17.78A7.963 7.963 0 0020 15c0-4.418-3.582-8-8-8-1.657 0-3.22.403-4.575 1.125M3 3l18 18" />
                </svg>
              ) : (
                // Eye icon
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
            {inputs.length > 1 && (
              <button
                className="ml-2 text-gray-400 hover:text-red-500 focus:outline-none"
                onClick={e => { e.stopPropagation(); handleRemoveInput(idx); }}
                aria-label="Remove input"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {inputs.length < 5 && (
          <button
            className="ml-2 px-2 py-1 text-lg text-gray-400 hover:text-blue-400 focus:outline-none"
            onClick={handleAddInput}
            aria-label="Add input"
          >
            +
          </button>
        )}
      </div>
      <Card className="mb-6 rounded-t-none">
        <CardHeader>
          <h2 className="text-xl font-semibold">Input Text</h2>
        </CardHeader>
        <CardBody>
          {/* Active input editor */}
          <textarea
            className="w-full h-40 p-2 border rounded"
            value={activeInput.text}
            onChange={e => handleInputChange('text', e.target.value)}
            placeholder={`Enter text here...`}
          />
          {/* Per-input options for the active input */}
          <div className="mt-4 flex flex-wrap gap-4 items-center">
            <label className="font-medium mr-2">Encoding:</label>
            <select
              value={activeInput.encoding}
              onChange={e => handleInputChange('encoding', e.target.value)}
              className="p-2 border rounded"
            >
              {BASE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.toUpperCase()}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={activeInput.ignorePunctuation} onChange={e => handleInputChange('ignorePunctuation', e.target.checked)} />
              <span>Ignore punctuation</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={activeInput.ignoreWhitespace} onChange={e => handleInputChange('ignoreWhitespace', e.target.checked)} />
              <span>Ignore whitespace</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={activeInput.ignoreCasing} onChange={e => handleInputChange('ignoreCasing', e.target.checked)} />
              <span>Ignore casing</span>
            </label>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}