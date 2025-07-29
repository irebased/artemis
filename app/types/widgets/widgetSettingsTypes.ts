// This file exports all widget settings types based on widget configurations
// It serves as a central location for all widget settings types

import { FrequencyAnalysisSettings } from '@/types/dashboard/dashboardTypes';
import { AsciiDistributionSettings } from '@/types/dashboard/dashboardTypes';
import { IndexOfCoincidenceSettings } from '@/types/dashboard/dashboardTypes';
import { ShannonEntropySettings } from '@/types/dashboard/dashboardTypes';
import { ChiSquaredSettings } from '@/types/dashboard/dashboardTypes';
import { KolmogorovSmirnovSettings } from '@/types/dashboard/dashboardTypes';
import { ExpectedBinOccupancySettings } from '@/types/dashboard/dashboardTypes';

// Export all widget settings types
export type {
  FrequencyAnalysisSettings,
  AsciiDistributionSettings,
  IndexOfCoincidenceSettings,
  ShannonEntropySettings,
  ChiSquaredSettings,
  KolmogorovSmirnovSettings,
  ExpectedBinOccupancySettings,
};

// Type mapping for widget settings keys to their types
export interface WidgetSettingsTypes {
  frequencyAnalysisSettings: FrequencyAnalysisSettings;
  asciiDistributionSettings: AsciiDistributionSettings;
  indexOfCoincidenceSettings: IndexOfCoincidenceSettings;
  shannonEntropySettings: ShannonEntropySettings;
  chiSquaredSettings: ChiSquaredSettings;
  kolmogorovSmirnovSettings: KolmogorovSmirnovSettings;
  expectedBinOccupancySettings: ExpectedBinOccupancySettings;
}

// Helper type to get settings type by key
export type SettingsTypeForKey<K extends keyof WidgetSettingsTypes> = WidgetSettingsTypes[K];