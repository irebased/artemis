// @ts-nocheck
'use client';

import { useEffect, useMemo, useState } from 'react';
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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { BaseType } from '@/types/bases';
import { InputData } from '@/app/useDashboardParams';
import { useAsciiDistribution, defaultGridSize } from './useAsciiDistribution';
import { useAsciiDistributionChart } from './useAsciiDistributionChart';
import WidgetWithSettings from '../WidgetWithSettings';
import AsciiDistributionSettingsForm, { AsciiDistributionSettings } from './AsciiDistributionSettingsForm';
import { Ciphertext } from '@/types/ciphertext';
import AsciiDistributionInformation from './AsciiDistributionInformation';

interface AsciiDistributionWidgetProps {
  inputs: Ciphertext[];
  gridW?: number;
  asciiDistributionSettings: AsciiDistributionSettings;
  setAsciiDistributionSettings: (settings: AsciiDistributionSettings) => void;
  setAnyModalOpen?: (open: boolean) => void;
}

export default function AsciiDistributionWidget({
  inputs,
  gridW = 1,
  asciiDistributionSettings,
  setAsciiDistributionSettings,
  setAnyModalOpen,
}: AsciiDistributionWidgetProps) {
  const analysis = useAsciiDistribution(inputs, asciiDistributionSettings.range);
  const { data, options } = useAsciiDistributionChart(analysis);
  const isNarrow = gridW < 2;

  return (
    <WidgetWithSettings
      title="ASCII Distribution"
      settingsComponent={
        <AsciiDistributionSettingsForm
          settings={asciiDistributionSettings}
          setSettings={setAsciiDistributionSettings}
        />
      }
      setAnyModalOpen={setAnyModalOpen}
      infoContent={<AsciiDistributionInformation />}
    >
      <div className="flex-1 w-full h-full relative">
        {data && data.labels.length > 0 ? (
          <Bar data={data} options={options} className="absolute inset-0 w-full h-full" />
        ) : (
          <p>No data to display.</p>
        )}
      </div>
    </WidgetWithSettings>
  );
}
