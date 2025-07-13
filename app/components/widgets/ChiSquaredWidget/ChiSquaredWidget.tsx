'use client';

import React from 'react';
import { Ciphertext } from '@/types/ciphertext';
import { useChiSquared } from './useChiSquared';
import WidgetWithSettings from '../WidgetWithSettings';
import ChiSquaredSettingsForm, { ChiSquaredSettings } from './ChiSquaredSettingsForm';
import ChiSquaredInformation from './ChiSquaredInformation';

interface ChiSquaredWidgetProps {
  inputs: Ciphertext[];
  chiSquaredSettings: ChiSquaredSettings;
  setChiSquaredSettings: (settings: ChiSquaredSettings) => void;
  setAnyModalOpen?: (open: boolean) => void;
}

export default function ChiSquaredWidget({
  inputs,
  chiSquaredSettings,
  setChiSquaredSettings,
  setAnyModalOpen,
}: ChiSquaredWidgetProps) {
  const { selectedTextIndex, baseDataIndex } = chiSquaredSettings;
  const result = useChiSquared(inputs, selectedTextIndex, baseDataIndex);

  const formatNumber = (num: number | null) => {
    if (num === null) return 'N/A';
    if (num < 0.0001) {
      // For very small numbers, show as 0.000... with appropriate precision
      if (num === 0) return '0.0000';
      const decimalPlaces = Math.ceil(-Math.log10(num));
      const precision = Math.min(decimalPlaces, 10); // Cap at 10 decimal places
      return num.toFixed(precision);
    }
    return num.toFixed(4);
  };

  const getSignificanceColor = (pValue: number | null) => {
    if (pValue === null) return 'text-gray-500';
    if (pValue < 0.001) return 'text-red-600';
    if (pValue < 0.01) return 'text-orange-600';
    if (pValue < 0.05) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getSignificanceText = (pValue: number | null) => {
    if (pValue === null) return 'N/A';
    if (pValue < 0.001) return 'Highly Significant';
    if (pValue < 0.01) return 'Very Significant';
    if (pValue < 0.05) return 'Significant';
    return 'Not Significant';
  };

  return (
    <WidgetWithSettings
      title="Chi-Squared Test"
      settingsComponent={
        <ChiSquaredSettingsForm
          settings={chiSquaredSettings}
          setSettings={setChiSquaredSettings}
          inputs={inputs}
        />
      }
      setAnyModalOpen={setAnyModalOpen}
      infoContent={<ChiSquaredInformation />}
    >
      <div className="flex-1 w-full h-full p-4">
        {result.chiSquared !== null ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400">Chi-Squared Value</div>
                <div className="text-2xl font-bold">{formatNumber(result.chiSquared)}</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400">P-Value</div>
                <div className={`text-2xl font-bold ${getSignificanceColor(result.pValue)}`}>
                  {formatNumber(result.pValue)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400">Degrees of Freedom</div>
                <div className="text-xl font-semibold">{result.degreesOfFreedom}</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400">Significance</div>
                <div className={`text-xl font-semibold ${getSignificanceColor(result.pValue)}`}>
                  {getSignificanceText(result.pValue)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Evaluating text</div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: inputs[selectedTextIndex]?.color || '#666', display: 'inline-block' }} />
                  <span style={{ color: inputs[selectedTextIndex]?.color || '#666' }}>
                    {inputs[selectedTextIndex]?.text.slice(0, 7)}{inputs[selectedTextIndex]?.text.length > 7 ? '...' : ''}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{result.selectedTextLength} characters</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Against baseline text</div>
                {baseDataIndex === 'sample' ? (
                  <div className="text-gray-600 dark:text-gray-400">Sample text</div>
                ) : (
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: inputs[baseDataIndex]?.color || '#666', display: 'inline-block' }} />
                    <span style={{ color: inputs[baseDataIndex]?.color || '#666' }}>
                      {inputs[baseDataIndex]?.text.slice(0, 7)}{inputs[baseDataIndex]?.text.length > 7 ? '...' : ''}
                    </span>
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">{result.baseTextLength} characters</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No data available for chi-squared test.</p>
          </div>
        )}
      </div>
    </WidgetWithSettings>
  );
}