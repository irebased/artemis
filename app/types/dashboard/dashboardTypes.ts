export type AsciiRange = 'extended' | 'ascii' | 'input';

export const INPUT_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#a855f7'];

export type FrequencyAnalysisSettings = {
  ngramSize: number;
  ngramMode: 'sliding' | 'block';
  showTableView?: boolean;
  sortByInput?: number;
  sortDirection?: 'asc' | 'desc';
};

export type ShannonEntropySettings = {
  mode: 'raw' | 'sliding';
  windowSize: 16 | 32 | 64 | 128 | 256;
};

export type AsciiDistributionSettings = {
  range: 'extended' | 'ascii' | 'input';
};

export type IndexOfCoincidenceSettings = {
  mode: 'summary' | 'period';
  ngramSize?: number;
  ngramMode?: 'sliding' | 'block';
  showAverageLines?: boolean;
};

export type KolmogorovSmirnovSettings = {
  ngramSize: number;
  ngramMode: 'sliding' | 'block';
};

export type ChiSquaredSettings = {
  selectedTextIndex: number;
  baseDataIndex: number | 'sample';
};