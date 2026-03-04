import React, { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, LineSeries, HistogramSeries, IChartApi, CandlestickData, HistogramData, Time } from 'lightweight-charts';
import { StockHistory, Language } from '../../lib/types';
import { UI_STRINGS } from '../../lib/constants';

interface Props {
  history: StockHistory | null;
  loading: boolean;
  lang: Language;
  onRangeChange: (range: string) => void;
  currentRange: string;
}

const RANGES = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '5y'];

function computeMA(data: CandlestickData<Time>[], period: number): { time: Time; value: number }[] {
  const result: { time: Time; value: number }[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close as number;
    }
    result.push({ time: data[i].time, value: sum / period });
  }
  return result;
}

export const StockChart: React.FC<Props> = ({ history, loading, lang, onRangeChange, currentRange }) => {
  const t = UI_STRINGS[lang];
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartRef.current || !history || history.candles.length === 0) return;

    if (chartInstance.current) {
      chartInstance.current.remove();
      chartInstance.current = null;
    }

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#FAFAF8' },
        textColor: '#333',
        fontFamily: "'Noto Serif TC', Georgia, serif",
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      crosshair: { mode: 0 },
      timeScale: {
        borderColor: '#ddd',
        timeVisible: currentRange === '1d' || currentRange === '5d',
      },
      rightPriceScale: { borderColor: '#ddd' },
    });

    chartInstance.current = chart;

    // Deduplicate and sort by time
    const seen = new Set<number>();
    const candleData: CandlestickData<Time>[] = history.candles
      .filter(c => {
        if (seen.has(c.time)) return false;
        seen.add(c.time);
        return true;
      })
      .sort((a, b) => a.time - b.time)
      .map(c => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

    // Candlestick series (v5 API: addSeries)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#ef4444',
      downColor: '#22c55e',
      borderDownColor: '#22c55e',
      borderUpColor: '#ef4444',
      wickDownColor: '#22c55e',
      wickUpColor: '#ef4444',
    });
    candleSeries.setData(candleData);

    // Volume
    const sortedCandles = history.candles
      .filter((c, i, arr) => i === 0 || c.time !== arr[i - 1].time)
      .sort((a, b) => a.time - b.time);
    const volumeData: HistogramData<Time>[] = sortedCandles.map(c => ({
      time: c.time as Time,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)',
    }));

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeries.setData(volumeData);

    // Moving Averages
    if (candleData.length >= 5) {
      const ma5 = computeMA(candleData, 5);
      const ma5Series = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
      ma5Series.setData(ma5);
    }
    if (candleData.length >= 20) {
      const ma20 = computeMA(candleData, 20);
      const ma20Series = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
      ma20Series.setData(ma20);
    }
    if (candleData.length >= 60) {
      const ma60 = computeMA(candleData, 60);
      const ma60Series = chart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
      ma60Series.setData(ma60);
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartRef.current) {
        chart.applyOptions({ width: chartRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartInstance.current = null;
    };
  }, [history, currentRange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{t.timeRange}</span>
        <div className="flex gap-1">
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${currentRange === r ? 'bg-ink text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex gap-3 ml-auto text-[10px] font-bold">
          <span className="text-amber-500">MA5</span>
          <span className="text-blue-500">MA20</span>
          <span className="text-purple-500">MA60</span>
        </div>
      </div>

      <div className="border border-gray-200 bg-[#FAFAF8] rounded overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <span className="text-gray-400 animate-pulse">{t.loading}</span>
          </div>
        )}
        <div ref={chartRef} style={{ height: 400 }} />
        {!history && !loading && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            {t.candlestick}
          </div>
        )}
      </div>
    </div>
  );
};
