import React from 'react';
import useResizeObserver from 'use-resize-observer';
import { Card } from '@heroui/react';

export default function WidgetContainer({ children }: { children: React.ReactNode | ((size: { width?: number; height?: number }) => React.ReactNode) }) {
  const { ref, width, height } = useResizeObserver();

  return (
    <Card ref={ref} className="h-full min-h-0 relative p-4">
      {typeof children === 'function' ? children({ width, height }) : children}
      <div className="absolute bottom-1 right-1 pointer-events-none opacity-60 text-gray-500 dark:text-gray-400">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path d="M4 16L16 4M8 16H16V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    </Card>
  );
}