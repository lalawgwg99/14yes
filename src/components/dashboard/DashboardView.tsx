import React, { useEffect } from 'react';
import { Language, Position, StockQuote } from '../../lib/types';
import { UI_STRINGS } from '../../lib/constants';
import { PortfolioSummary } from './PortfolioSummary';
import { PositionList } from './PositionList';

interface Props {
  lang: Language;
  positions: Position[];
  quotes: Record<string, StockQuote>;
  cash: number;
  currency: 'TWD' | 'USD';
  totalAssets: number;
  todayPnL: number;
  totalReturn: number;
  totalMarketValue: number;
  loading: boolean;
  onRefreshQuotes: () => void;
  onAnalyze: (symbol: string) => void;
  onAddPosition: (position: Position) => void;
  onRemovePosition: (symbol: string) => void;
}

export const DashboardView: React.FC<Props> = ({
  lang, positions, quotes, cash, currency,
  totalAssets, todayPnL, totalReturn, totalMarketValue, loading,
  onRefreshQuotes, onAnalyze, onAddPosition, onRemovePosition,
}) => {
  const t = UI_STRINGS[lang];

  useEffect(() => {
    onRefreshQuotes();
    const interval = setInterval(onRefreshQuotes, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, [positions.length]);

  return (
    <div className="space-y-8 fade-in-up">
      <PortfolioSummary
        lang={lang}
        totalAssets={totalAssets}
        todayPnL={todayPnL}
        totalReturn={totalReturn}
        currency={currency}
      />

      {/* Cash */}
      <div className="magazine-card p-4 flex justify-between items-center">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{t.cashLabel}</span>
        <span className="font-bold serif-tc">{currency === 'TWD' ? 'NT$' : '$'}{cash.toLocaleString()}</span>
      </div>

      {/* Portfolio Distribution Pie (simple CSS version) */}
      {positions.length > 0 && totalMarketValue > 0 && (
        <div className="magazine-card p-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-4">{t.positions} — {lang === 'zh-TW' ? '持倉分布' : 'Distribution'}</h3>
          <div className="flex flex-wrap gap-2">
            {positions.map(pos => {
              const q = quotes[pos.symbol];
              const val = (q?.price || pos.avgCost) * pos.shares;
              const pct = (val / totalMarketValue) * 100;
              return (
                <div
                  key={pos.symbol}
                  className="bg-ink text-white px-3 py-1.5 text-xs font-bold"
                  style={{ flexBasis: `${Math.max(pct, 8)}%`, flexGrow: 0 }}
                >
                  {pos.symbol} {pct.toFixed(0)}%
                </div>
              );
            })}
          </div>
        </div>
      )}

      <PositionList
        lang={lang}
        positions={positions}
        quotes={quotes}
        totalMarketValue={totalMarketValue}
        onAnalyze={onAnalyze}
        onRemove={onRemovePosition}
        onAdd={onAddPosition}
      />

      {loading && (
        <div className="text-center text-gray-400 text-sm animate-pulse py-4">
          {t.loading}
        </div>
      )}
    </div>
  );
};
