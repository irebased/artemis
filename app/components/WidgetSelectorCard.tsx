import { Card, CardHeader, CardBody } from '@heroui/react';
import { useTheme } from 'next-themes';

interface WidgetSelectorCardProps {
  widgets: string[];
  setWidgets: (updater: (prev: string[]) => string[]) => void;
  AVAILABLE_WIDGETS: Record<string, string>;
  layoutLocked: boolean;
}

export default function WidgetSelectorCard({ widgets, setWidgets, AVAILABLE_WIDGETS, layoutLocked }: WidgetSelectorCardProps) {
  const { theme } = useTheme();

  const lightModeButtonStyle = 'bg-gray-100 hover:bg-gray-200 text-gray-800'
  const darkModeButtonStyle = 'bg-gray-700 hover:bg-gray-800';

  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="text-xl font-semibold">Available Widgets</h2>
      </CardHeader>
      <CardBody>
        <div className="flex flex-wrap gap-2">
          {Object.entries(AVAILABLE_WIDGETS).map(([key, name]) => (
            <button
              key={key}
              onClick={() => setWidgets((prev) =>
                prev.includes(key) ? prev.filter((w) => w !== key) : [...prev, key]
              )}
              className={`px-3 py-1 rounded ${
                widgets.includes(key)
                  ? 'bg-blue-500 text-white'
                  : theme === 'light' ? lightModeButtonStyle : darkModeButtonStyle
              }`}
              disabled={layoutLocked}
              title={layoutLocked ? 'Unlock layout to add/remove widgets' : ''}
            >
              {name}
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}