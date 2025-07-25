import { Responsive, WidthProvider } from 'react-grid-layout';
import WidgetContainer from '../components/widgets/WidgetContainer';
import FrequencyAnalysisWidget from '../components/widgets/FrequencyAnalysisWidget/FrequencyAnalysisWidget';
import AsciiDistributionWidget from '../components/widgets/AsciiDistributionWidget/AsciiDistributionWidget';
import FrequencyStdDevWidget from '../components/widgets/FrequencyStdDevWidget/FrequencyStdDev';
import IndexOfCoincidenceWidget from '../components/widgets/IndexOfCoincidenceWidget/IndexOfCoincidenceWidget';
import ShannonEntropyWidget from '../components/widgets/ShannonEntropyWidget/ShannonEntropyWidget';
import KolmogorovSmirnovWidget from '../components/widgets/KolmogrovSmirnovWidget/KolmogorovSmirnovWidget';
import ChiSquaredWidget from '../components/widgets/ChiSquaredWidget/ChiSquaredWidget';
import { BaseType } from '@/types/bases';
import FrequencyStdDevInformation from './widgets/FrequencyStdDevWidget/FrequencyStdDevInformation';
import KolmogrovSmirnovInformation from './widgets/KolmogrovSmirnovWidget/KolmogrovSmirnovInformation';
import { defaultGridSize as freqDefault } from '@/components/widgets/FrequencyAnalysisWidget/useFrequencyAnalysisChart';
import { defaultGridSize as asciiDefault } from '@/components/widgets/AsciiDistributionWidget/useAsciiDistributionChart';
import { defaultGridSize as stddevDefault } from '@/components/widgets/FrequencyStdDevWidget/useFrequencyStdDevChart';
import { defaultGridSize as icDefault } from '@/components/widgets/IndexOfCoincidenceWidget/useIndexOfCoincidenceChart';
import { defaultGridSize as entropyDefault } from '@/components/widgets/ShannonEntropyWidget/useShannonEntropyChart';
import { defaultGridSize as ksDefault } from '@/components/widgets/KolmogrovSmirnovWidget/useKolmogorovSmirnov';
import { defaultGridSize as chiSquaredDefault } from '@/components/widgets/ChiSquaredWidget/useChiSquaredChart';
import {
  FrequencyAnalysisSettings,
  AsciiDistributionSettings,
  IndexOfCoincidenceSettings,
  ShannonEntropySettings,
  ChiSquaredSettings,
  KolmogorovSmirnovSettings,
} from '@/types/widgets/widgetSettingsTypes';

const WIDGET_DEFAULTS = {
  frequency: freqDefault,
  ascii: asciiDefault,
  freqstddev: stddevDefault,
  coincidence: icDefault,
  entropy: entropyDefault,
  ks: ksDefault,
  chisquared: chiSquaredDefault,
};

const ResponsiveGridLayout = WidthProvider(Responsive);

interface WidgetGridProps {
  widgets: string[];
  layouts: any;
  handleLayoutChange: (layout: any, layouts: any) => void;
  COLS: Record<string, number>;
  BREAKPOINTS: Record<string, number>;
  adjustedTexts: any;
  asciiBase: BaseType;
  entropyMode: any;
  setEntropyMode: (mode: any) => void;
  entropyWindow: number;
  setEntropyWindow: (n: number) => void;
  layoutLocked: boolean;
  frequencyAnalysisSettings: FrequencyAnalysisSettings;
  setFrequencyAnalysisSettings: (settings: FrequencyAnalysisSettings) => void;
  shannonEntropySettings: ShannonEntropySettings;
  setShannonEntropySettings: (settings: ShannonEntropySettings) => void;
  anyModalOpen: boolean;
  setAnyModalOpen: (open: boolean) => void;
  asciiDistributionSettings: AsciiDistributionSettings;
  setAsciiDistributionSettings: (settings: AsciiDistributionSettings) => void;
  indexOfCoincidenceSettings: IndexOfCoincidenceSettings;
  setIndexOfCoincidenceSettings: (settings: IndexOfCoincidenceSettings) => void;
  kolmogorovSmirnovSettings: KolmogorovSmirnovSettings;
  setKolmogorovSmirnovSettings: (settings: KolmogorovSmirnovSettings) => void;
  chiSquaredSettings: ChiSquaredSettings;
  setChiSquaredSettings: (settings: ChiSquaredSettings) => void;
}

export default function WidgetGrid({
  widgets,
  layouts,
  handleLayoutChange,
  COLS,
  BREAKPOINTS,
  adjustedTexts,
  asciiBase,
  entropyMode,
  setEntropyMode,
  entropyWindow,
  setEntropyWindow,
  layoutLocked,
  frequencyAnalysisSettings,
  setFrequencyAnalysisSettings,
  shannonEntropySettings,
  setShannonEntropySettings,
  anyModalOpen,
  setAnyModalOpen,
  asciiDistributionSettings,
  setAsciiDistributionSettings,
  indexOfCoincidenceSettings,
  setIndexOfCoincidenceSettings,
  kolmogorovSmirnovSettings,
  setKolmogorovSmirnovSettings,
  chiSquaredSettings,
  setChiSquaredSettings,
}: WidgetGridProps) {
  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={BREAKPOINTS}
      cols={COLS}
      rowHeight={100}
      isResizable={!layoutLocked && !anyModalOpen}
      isDraggable={!layoutLocked && !anyModalOpen}
      onLayoutChange={handleLayoutChange}
      measureBeforeMount={false}
      useCSSTransforms={true}
      compactType="vertical"
      draggableCancel=".widget-settings-btn"
    >
      {widgets.map((widget) => {
        let WidgetComponent = null;
        let WidgetInfo = null;
        let WidgetTitle = null;
        const defaultSize = WIDGET_DEFAULTS[widget] || { w: 1, h: 2, minW: 1, minH: 1 };
        const layoutItem = layouts.lg.find((l: any) => l.i === widget) || {
          i: widget,
          x: 0,
          y: 0,
          w: defaultSize.w,
          h: defaultSize.h,
          minW: defaultSize.minW || 1,
          minH: defaultSize.minH || 1,
          static: false,
        };

        if (widget === 'frequency') {
          WidgetComponent = <FrequencyAnalysisWidget inputs={adjustedTexts} gridH={layoutItem.h} frequencyAnalysisSettings={frequencyAnalysisSettings} setFrequencyAnalysisSettings={setFrequencyAnalysisSettings} setAnyModalOpen={setAnyModalOpen} />;
        } else if (widget === 'ascii') {
          WidgetComponent = (
            <AsciiDistributionWidget
              inputs={adjustedTexts}
              gridW={layoutItem.w}
              asciiDistributionSettings={asciiDistributionSettings}
              setAsciiDistributionSettings={setAsciiDistributionSettings}
              setAnyModalOpen={setAnyModalOpen}
            />
          );
        } else if (widget === 'freqstddev') {
          WidgetComponent = <FrequencyStdDevWidget inputs={adjustedTexts} gridH={layoutItem.h} />;
          WidgetInfo = <FrequencyStdDevInformation />;
          WidgetTitle = 'Frequency Standard Deviation';
        } else if (widget === 'coincidence') {
          WidgetComponent = (
            <IndexOfCoincidenceWidget
              inputs={adjustedTexts}
              base={asciiBase}
              indexOfCoincidenceSettings={indexOfCoincidenceSettings}
              setIndexOfCoincidenceSettings={setIndexOfCoincidenceSettings}
              setAnyModalOpen={setAnyModalOpen}
            />
          );
        } else if (widget === 'entropy') {
          WidgetComponent = (
            <ShannonEntropyWidget
              inputs={adjustedTexts}
              base={asciiBase}
              shannonEntropySettings={shannonEntropySettings}
              setShannonEntropySettings={setShannonEntropySettings}
              setAnyModalOpen={setAnyModalOpen}
            />
          );
        } else if (widget === 'ks') {
          WidgetInfo = <KolmogrovSmirnovInformation />;
          WidgetTitle = 'Kolmogorov-Smirnov Test';
          WidgetComponent = (
            <KolmogorovSmirnovWidget
              inputs={adjustedTexts}
              kolmogorovSmirnovSettings={kolmogorovSmirnovSettings}
              setKolmogorovSmirnovSettings={setKolmogorovSmirnovSettings}
            />
          );
        } else if (widget === 'chisquared') {
          WidgetComponent = (
            <ChiSquaredWidget
              inputs={adjustedTexts}
              chiSquaredSettings={chiSquaredSettings}
              setChiSquaredSettings={setChiSquaredSettings}
              setAnyModalOpen={setAnyModalOpen}
            />
          );
        }
        return (
          <div key={widget}>
            <WidgetContainer infoContent={WidgetInfo} title={WidgetTitle}>
              {WidgetComponent}
            </WidgetContainer>
          </div>
        );
      })}
    </ResponsiveGridLayout>
  );
}