import React, { useState, useEffect, useCallback } from 'react';
import useResizeObserver from 'use-resize-observer';
import { Card } from '@heroui/react';
import InformationModal from '@/components/InformationModal';

function useDebouncedResize(delay: number = 100) {
  const [size, setSize] = useState<{ width?: number; height?: number }>({});
  const [debouncedSize, setDebouncedSize] = useState<{ width?: number; height?: number }>({});
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const handleResize = useCallback((width?: number, height?: number) => {
    setSize({ width, height });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedSize({ width, height });
    }, delay);
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { size, debouncedSize, handleResize };
}

export default function WidgetContainer({ children, infoContent, title }: { children: React.ReactNode | ((size: { width?: number; height?: number }) => React.ReactNode), infoContent?: React.ReactNode, title?: React.ReactNode }) {
  const { ref, width, height } = useResizeObserver();
  const [showInfo, setShowInfo] = useState(false);
  const { debouncedSize, handleResize } = useDebouncedResize(100);

  useEffect(() => {
    handleResize(width, height);
  }, [width, height, handleResize]);

  const handleInfoOpen = () => setShowInfo(true);
  const handleInfoClose = () => setShowInfo(false);

  return (
    <Card ref={ref} className="h-full min-h-0 relative p-4 bg-gray-50 dark:bg-gray-900/10">
      {(title || infoContent) && (
        <div className="mb-4 flex flex-row items-center gap-2">
          {title && <h3 className="text-lg font-semibold mb-0">{title}</h3>}
          {infoContent && (
            <button
              className="widget-settings-btn widget-info-btn draggableCancel flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none w-8 h-8 min-w-[18px] min-h-[18px] rounded-full border-2 border-gray-500 dark:border-gray-400 bg-transparent text-base font-bold"
              aria-label="Info"
              onClick={handleInfoOpen}
              type="button"
              tabIndex={0}
              style={{ padding: 0, margin: 0, lineHeight: 1, fontSize: '10px', height: '18px', width: '18px', fontWeight: 'bold' }}
            >
              i
            </button>
          )}
        </div>
      )}
      {typeof children === 'function' ? children(debouncedSize) : children}
      {infoContent && (
        <InformationModal
          isOpen={showInfo}
          onClose={handleInfoClose}
          title={title ? `${title} Info` : 'Widget Info'}
        >
          {infoContent}
        </InformationModal>
      )}
      <div className="absolute bottom-1 right-1 pointer-events-none opacity-60 text-gray-500 dark:text-gray-400">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path d="M4 16L16 4M8 16H16V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    </Card>
  );
}