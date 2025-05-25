import { Responsive, WidthProvider } from 'react-grid-layout';
import WidgetContainer from '../components/widgets/WidgetContainer';
import FrequencyAnalysisWidget from '../components/widgets/FrequencyAnalysisWidget/FrequencyAnalysisWidget';
import AsciiDistributionWidget from '../components/widgets/AsciiDistributionWidget/AsciiDistributionWidget';
import FrequencyStdDevWidget from '../components/widgets/FrequencyStdDevWidget/FrequencyStdDev';
import IndexOfCoincidenceWidget from '../components/widgets/IndexOfCoincidenceWidget/IndexOfCoincidenceWidget';
import ShannonEntropyWidget from '../components/widgets/ShannonEntropyWidget/ShannonEntropyWidget';
import { AsciiRange } from '@/app/useDashboardParams';
import { BaseType } from '@/types/bases';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface WidgetGridProps {
  widgets: string[];
  layouts: any;
  handleLayoutChange: (layout: any, layouts: any) => void;
  COLS: Record<string, number>;
  BREAKPOINTS: Record<string, number>;
  adjustedTexts: any;
  asciiBase: BaseType;
  asciiRange: AsciiRange;
  setAsciiRange: (range: AsciiRange) => void;
  icMode: any;
  setIcMode: (mode: any) => void;
  entropyMode: any;
  setEntropyMode: (mode: any) => void;
  entropyWindow: number;
  setEntropyWindow: (n: number) => void;
  layoutLocked: boolean;
  ngramSize: number;
  setNgramSize: (n: number) => void;
  ngramMode: 'sliding' | 'block';
  setNgramMode: (mode: 'sliding' | 'block') => void;
}

export default function WidgetGrid({
  widgets,
  layouts,
  handleLayoutChange,
  COLS,
  BREAKPOINTS,
  adjustedTexts,
  asciiBase,
  asciiRange,
  setAsciiRange,
  icMode,
  setIcMode,
  entropyMode,
  setEntropyMode,
  entropyWindow,
  setEntropyWindow,
  layoutLocked,
  ngramSize,
  setNgramSize,
  ngramMode,
  setNgramMode,
}: WidgetGridProps) {
  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={BREAKPOINTS}
      cols={COLS}
      rowHeight={200}
      isResizable={!layoutLocked}
      isDraggable={!layoutLocked}
      onLayoutChange={handleLayoutChange}
      measureBeforeMount={false}
      useCSSTransforms={true}
      compactType="vertical"
    >
      {widgets.map((widget) => {
        let WidgetComponent = null;
        const layoutItem = layouts.lg.find((l: any) => l.i === widget) || { w: 1, h: 1 };
        if (widget === 'frequency') {
          WidgetComponent = <FrequencyAnalysisWidget inputs={adjustedTexts} gridH={layoutItem.h} ngramSize={ngramSize} setNgramSize={setNgramSize} ngramMode={ngramMode} setNgramMode={setNgramMode} />;
        } else if (widget === 'ascii') {
          WidgetComponent = (
            <AsciiDistributionWidget
              inputs={adjustedTexts}
              gridW={layoutItem.w}
              asciiRange={asciiRange}
              setAsciiRange={setAsciiRange}
            />
          );
        } else if (widget === 'freqstddev') {
          WidgetComponent = <FrequencyStdDevWidget inputs={adjustedTexts} gridH={layoutItem.h} />;
        } else if (widget === 'coincidence') {
          WidgetComponent = (
            <IndexOfCoincidenceWidget
            inputs={adjustedTexts}
              base={asciiBase}
              view={icMode}
              onViewChange={setIcMode}
            />
          );
        } else if (widget === 'entropy') {
          WidgetComponent = (
            <ShannonEntropyWidget
              inputs={adjustedTexts}
              base={asciiBase}
              mode={entropyMode}
              windowSize={entropyWindow}
              onModeChange={setEntropyMode}
              onWindowSizeChange={setEntropyWindow}
            />
          );
        }
        return (
          <div key={widget} data-grid={layouts.lg.find((l: any) => l.i === widget)}>
            <WidgetContainer>
              {WidgetComponent}
            </WidgetContainer>
          </div>
        );
      })}
    </ResponsiveGridLayout>
  );
}