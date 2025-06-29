import { Responsive, WidthProvider } from 'react-grid-layout';
import WidgetContainer from '../components/widgets/WidgetContainer';
import FrequencyAnalysisWidget from '../components/widgets/FrequencyAnalysisWidget/FrequencyAnalysisWidget';
import AsciiDistributionWidget from '../components/widgets/AsciiDistributionWidget/AsciiDistributionWidget';
import FrequencyStdDevWidget from '../components/widgets/FrequencyStdDevWidget/FrequencyStdDev';
import IndexOfCoincidenceWidget from '../components/widgets/IndexOfCoincidenceWidget/IndexOfCoincidenceWidget';
import ShannonEntropyWidget from '../components/widgets/ShannonEntropyWidget/ShannonEntropyWidget';
import KolmogorovSmirnovWidget from '../components/widgets/KolmogrovSmirnovWidget/KolmogorovSmirnovWidget';
import { BaseType } from '@/types/bases';
import FrequencyStdDevInformation from './widgets/FrequencyStdDevWidget/FrequencyStdDevInformation';
import KolmogrovSmirnovInformation from './widgets/KolmogrovSmirnovWidget/KolmogrovSmirnovInformation';

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
  frequencyAnalysisSettings: { ngramSize: number; ngramMode: 'sliding' | 'block' };
  setFrequencyAnalysisSettings: (settings: { ngramSize: number; ngramMode: 'sliding' | 'block' }) => void;
  shannonEntropySettings: { mode: 'raw' | 'sliding'; windowSize: 16 | 32 | 64 | 128 | 256 };
  setShannonEntropySettings: (settings: { mode: 'raw' | 'sliding'; windowSize: 16 | 32 | 64 | 128 | 256 }) => void;
  anyModalOpen: boolean;
  setAnyModalOpen: (open: boolean) => void;
  asciiDistributionSettings: { range: 'extended' | 'ascii' | 'input' };
  setAsciiDistributionSettings: (settings: { range: 'extended' | 'ascii' | 'input' }) => void;
  indexOfCoincidenceSettings: { mode: 'summary' | 'period' };
  setIndexOfCoincidenceSettings: (settings: { mode: 'summary' | 'period' }) => void;
  kolmogorovSmirnovSettings: { ngramSize: number; ngramMode: 'sliding' | 'block' };
  setKolmogorovSmirnovSettings: (settings: { ngramSize: number; ngramMode: 'sliding' | 'block' }) => void;
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
        const layoutItem = layouts.lg.find((l: any) => l.i === widget) || { w: 1, h: 1 };
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
        }
        return (
          <div key={widget} data-grid={layouts.lg.find((l: any) => l.i === widget)}>
            <WidgetContainer infoContent={WidgetInfo} title={WidgetTitle}>
              {WidgetComponent}
            </WidgetContainer>
          </div>
        );
      })}
    </ResponsiveGridLayout>
  );
}