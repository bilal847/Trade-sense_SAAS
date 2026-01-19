import React, { useEffect, useRef } from 'react';
import { OHLCV } from '@/types';
import { createChart, ColorType, IChartApi, CandlestickSeries, Time } from 'lightweight-charts';
import { useTheme } from '@/hooks/useTheme';

interface TVChartContainerProps {
  symbol: string;
  data: OHLCV[];
  timeframe: string;
  isLoading?: boolean;
  isError?: boolean;
}

const TVChartContainer: React.FC<TVChartContainerProps> = ({
  symbol,
  data,
  timeframe,
  isLoading = false,
  isError = false
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);
  const { theme } = useTheme();

  // Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isDark = theme === 'dark';
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#1f2937' : '#ffffff' },
        textColor: isDark ? '#d1d5db' : '#374151',
      },
      grid: {
        vertLines: { color: isDark ? '#374151' : '#f3f4f6' },
        horzLines: { color: isDark ? '#374151' : '#f3f4f6' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: isDark ? '#374151' : '#e5e7eb',
      },
      rightPriceScale: {
        borderColor: isDark ? '#374151' : '#e5e7eb',
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e', // green-500
      downColor: '#ef4444', // red-500
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    seriesRef.current = candlestickSeries;

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!chartRef.current || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      chartRef.current.applyOptions({ width, height });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  // Update Theme
  useEffect(() => {
    if (!chartRef.current) return;
    const isDark = theme === 'dark';
    chartRef.current.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#1f2937' : '#ffffff' },
        textColor: isDark ? '#d1d5db' : '#374151',
      },
      grid: {
        vertLines: { color: isDark ? '#374151' : '#f3f4f6' },
        horzLines: { color: isDark ? '#374151' : '#f3f4f6' },
      },
      timeScale: {
        borderColor: isDark ? '#374151' : '#e5e7eb',
      },
      rightPriceScale: {
        borderColor: isDark ? '#374151' : '#e5e7eb',
      },
    });
  }, [theme]);

  // Optimize data processing with useMemo
  const sortedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data]
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(item => ({
        time: (Math.floor(item.timestamp / 1000)) as Time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));
  }, [data]);

  // Update Data
  useEffect(() => {
    if (!seriesRef.current) return;

    if (sortedData.length > 0) {
      seriesRef.current.setData(sortedData);
      // Only fit content on initial load or if explicitly requested (optional logic)
      if (!isLoading) {
        chartRef.current?.timeScale().fitContent();
      }
    } else {
      seriesRef.current.setData([]);
    }
  }, [sortedData, isLoading]);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-colors duration-200">
      <div ref={chartContainerRef} className="w-full h-full" />

      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 text-blue-500 dark:text-blue-400">
          <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      {isError && !isLoading && (
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 flex flex-col items-center justify-center z-10 text-red-500 dark:text-red-400 p-4 text-center">
          <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Unavailable</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Chart data could not be loaded for {symbol}.</p>
        </div>
      )}

      {!isLoading && !isError && data.length === 0 && (
        <div className="absolute inset-0 bg-transparent flex items-center justify-center pointer-events-none">
          <p className="text-gray-400 dark:text-gray-500">No data available for {symbol}</p>
        </div>
      )}

      <div className="absolute top-2 left-2 z-0 opacity-10 dark:opacity-30 pointer-events-none">
        <span className="text-4xl font-bold tracking-tighter text-gray-400 dark:text-gray-700">TRADESENSE</span>
      </div>
    </div>
  );
};

export default TVChartContainer;
