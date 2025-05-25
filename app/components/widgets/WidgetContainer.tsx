import React, { useState } from 'react';
import useResizeObserver from 'use-resize-observer';
import { Card } from '@heroui/react';
import InformationModal from '@/components/InformationModal';

export default function WidgetContainer({ children, infoContent }: { children: React.ReactNode | ((size: { width?: number; height?: number }) => React.ReactNode), infoContent?: React.ReactNode }) {
  const { ref, width, height } = useResizeObserver();
  const [showInfo, setShowInfo] = useState(false);

  const handleInfoOpen = () => setShowInfo(true);
  const handleInfoClose = () => setShowInfo(false);

  return (
    <Card ref={ref} className="h-full min-h-0 relative p-4">
      {typeof children === 'function' ? children({ width, height }) : children}
      {infoContent && (
        <>
          <button
            className="absolute top-2 right-2 z-10 widget-info-btn px-2 py-1 border rounded-full text-sm flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Info"
            onClick={handleInfoOpen}
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
              <text x="10" y="15" textAnchor="middle" fontSize="12" fill="currentColor" fontFamily="sans-serif">i</text>
            </svg>
          </button>
          <InformationModal
            isOpen={showInfo}
            onClose={handleInfoClose}
            title="Widget Info"
          >
            {infoContent}
          </InformationModal>
        </>
      )}
      <div className="absolute bottom-1 right-1 pointer-events-none opacity-60 text-gray-500 dark:text-gray-400">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path d="M4 16L16 4M8 16H16V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    </Card>
  );
}