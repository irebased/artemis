import { useEffect, useRef, useCallback, useState } from 'react';
import { Chart, ChartTypeRegistry } from 'chart.js';

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function useChartResize<T extends keyof ChartTypeRegistry = 'bar'>() {
  const chartRef = useRef<Chart<T> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();
  const lastResizeTimeRef = useRef<number>(0);

  const updateChartSize = useCallback((width: number, height: number) => {
    if (!chartRef.current) return;

    const chart = chartRef.current;

    const originalAnimation = chart.options.animation;
    chart.options.animation = false;

    chart.resize(width, height);
    chart.update('none'); // Use 'none' mode for faster updates

    chart.options.animation = originalAnimation;
  }, []);

  const debouncedUpdate = useCallback(
    debounce((width: number, height: number) => {
      updateChartSize(width, height);
      const now = Date.now();
      if (now - lastResizeTimeRef.current > 100) {
        setIsResizing(false);
      }
    }, 150),
    [updateChartSize]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width && height) {
          lastResizeTimeRef.current = Date.now();

          setIsResizing(true);

          if (resizeTimeoutRef.current) {
            clearTimeout(resizeTimeoutRef.current);
          }

          debouncedUpdate(width, height);
        }
      }
    });

    const container = containerRef.current;
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [debouncedUpdate]);

  return { chartRef, containerRef, isResizing };
}