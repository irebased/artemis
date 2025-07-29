import React from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Ciphertext } from '@/types/ciphertext';
import { ExpectedBinOccupancySettings } from '@/types/dashboard/dashboardTypes';
import { useExpectedBinOccupancy } from './useExpectedBinOccupancy';
import { ExpectedBinOccupancyChart } from './ExpectedBinOccupancyChart';
import { ExpectedBinOccupancyInformation } from './ExpectedBinOccupancyInformation';
import WidgetWithSettings from '../WidgetWithSettings';
import { ExpectedBinOccupancySettingsForm } from './ExpectedBinOccupancySettingsForm';
import { useChartResize } from '@/hooks/useChartResize';
import BarChartSkeleton from '@/components/BarChartSkeleton';

interface ExpectedBinOccupancyWidgetProps {
  inputs: Ciphertext[];
  settings: ExpectedBinOccupancySettings;
  onSettingsChange: (settings: ExpectedBinOccupancySettings) => void;
}

export function ExpectedBinOccupancyWidget({
  inputs,
  settings,
  onSettingsChange,
}: ExpectedBinOccupancyWidgetProps) {
  const { results, expected, lower, upper, nBins, nBalls, loading } = useExpectedBinOccupancy(inputs, settings);
  const { chartRef, containerRef, isResizing } = useChartResize<'line'>();

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-md">Expected Bin Occupancy</p>
            <p className="text-small text-default-500">Analyzing frequency distributions...</p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <WidgetWithSettings
      title="Expected Bin Occupancy"
      settingsComponent={
        <ExpectedBinOccupancySettingsForm
          settings={settings}
          onSettingsChange={onSettingsChange}
        />
      }
      infoContent={<ExpectedBinOccupancyInformation />}
    >
      <div ref={containerRef} className="flex-1 w-full h-full relative">
        {isResizing ? (
          <BarChartSkeleton />
        ) : results.length > 0 ? (
          <ExpectedBinOccupancyChart
            ref={chartRef}
            results={results}
            expected={expected}
            lower={lower}
            upper={upper}
            nBins={nBins}
            nBalls={nBalls}
            settings={settings}
          />
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No data to display
          </div>
        )}
      </div>
    </WidgetWithSettings>
  );
}