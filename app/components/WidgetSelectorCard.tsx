import { Card, CardHeader, CardBody } from '@heroui/react';

interface WidgetSelectorCardProps {
  widgets: string[];
  setWidgets: (updater: (prev: string[]) => string[]) => void;
  AVAILABLE_WIDGETS: Record<string, string>;
}

export default function WidgetSelectorCard({ widgets, setWidgets, AVAILABLE_WIDGETS }: WidgetSelectorCardProps) {
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
                  : 'bg-gray-700 hover:bg-gray-800'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}