import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';
import { BaseType } from '@/types/bases';
import { Ciphertext } from '@/types/ciphertext';

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

  return (
    <div>
      {/* Tabs Bar - now above the card, styled for dark theme */}
      <div className="flex items-center gap-2 mb-0 border-b border-gray-800 bg-gray-900 rounded-t-lg px-4 pt-2 pb-1">
        {inputs.map((input, idx) => (
          <div
            key={input.id}
            className={`flex items-center px-3 py-1 cursor-pointer rounded-t transition-colors duration-100
              ${activeTab === idx ? 'bg-gray-800 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            style={{ borderBottom: activeTab === idx ? '2px solid #3b82f6' : '2px solid transparent' }}
            onClick={() => handleTabChange(idx)}
          >
            <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: input.color, display: 'inline-block' }} />
            <span className="font-mono text-xs">{input.text.slice(0, 5) + (input.text.length > 5 ? '…' : '')}</span>
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
          <h2 className="text-xl font-semibold">Input Texts</h2>
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