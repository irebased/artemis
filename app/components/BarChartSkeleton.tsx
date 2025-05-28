import { Skeleton } from '@heroui/react';

export default function BarChartSkeleton({ bars = 12 }) {
  const barHeights = Array.from({ length: bars }, () => {
    const isFullHeight = Math.random() > 0.9;
    if (isFullHeight) return '100%';
    return `${50 + Math.random() * 40}%`;
  });

  return (
    <div className="flex items-end justify-between w-full h-full gap-1 p-4 bg-gray-50 dark:bg-gray-900 rounded">
      {barHeights.map((height, idx) => (
        <Skeleton
          key={idx}
          className="flex-1 rounded"
          style={{ height }}
        />
      ))}
    </div>
  );
}