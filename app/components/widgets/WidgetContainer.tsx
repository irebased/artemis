import React from 'react';
import useResizeObserver from 'use-resize-observer';

export default function WidgetContainer({ children }: { children: React.ReactNode | ((size: { width?: number; height?: number }) => React.ReactNode) }) {
  const { ref, width, height } = useResizeObserver();

  return (
    <div
      ref={ref}
      className="w-full h-full p-2"
      style={{ width: '100%', height: '100%' }}
    >
      {typeof children === 'function' ? children({ width, height }) : children}
    </div>
  );
}