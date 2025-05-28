// @ts-nocheck
import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Ciphertext } from '@/types/ciphertext';
import { useFrequencyAnalysis } from './useFrequencyAnalysis';
import { useFrequencyAnalysisChart } from './useFrequencyAnalysisChart';
import WidgetWithSettings from '../WidgetWithSettings';
import FrequencyAnalysisSettingsForm from './FrequencyAnalysisSettingsForm';
import FrequencyAnalysisInformation from './FrequencyAnalysisInformation';
import { useChartResize } from '@/hooks/useChartResize';
import BarChartSkeleton from '@/components/BarChartSkeleton';

interface FrequencyAnalysisWidgetProps {
  inputs: Ciphertext[];
  gridH?: number;
  frequencyAnalysisSettings: { ngramSize: number; ngramMode: 'sliding' | 'block' };
  setFrequencyAnalysisSettings: (settings: { ngramSize: number; ngramMode: 'sliding' | 'block' }) => void;
  setAnyModalOpen?: (open: boolean) => void;
}

export default function FrequencyAnalysisWidget({
  inputs,
  gridH,
  frequencyAnalysisSettings,
  setFrequencyAnalysisSettings,
  setAnyModalOpen,
}: FrequencyAnalysisWidgetProps) {
  const { ngramSize, ngramMode } = frequencyAnalysisSettings;
  const results = useFrequencyAnalysis(inputs, ngramSize, ngramMode);
  const { data: barData, options: barOptions } = useFrequencyAnalysisChart(results, ngramSize);
  const { chartRef, containerRef, isResizing } = useChartResize();

  return (
    <WidgetWithSettings
      title="Frequency Analysis"
      infoContent={
        <FrequencyAnalysisInformation />
      }
      settingsComponent={
        <FrequencyAnalysisSettingsForm
          settings={frequencyAnalysisSettings}
          setSettings={setFrequencyAnalysisSettings}
        />
      }
      setAnyModalOpen={setAnyModalOpen}
    >
      <div ref={containerRef} className="flex-1 w-full h-full relative">
        {isResizing ? (
          <BarChartSkeleton />
        ) : barData ? (
          <Bar
            ref={chartRef}
            data={barData}
            options={barOptions}
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <p>No data to display.</p>
        )}
      </div>
    </WidgetWithSettings>
  );
}

