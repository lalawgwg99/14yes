import React, { useState, useEffect } from 'react';
import { Language, StockQuote } from '../../lib/types';
import { UI_STRINGS } from '../../lib/constants';

interface Props {
  lang: Language;
  onAnalyze: (symbol: string) => void;
}

const INDICES = [
  { symbol: '^TWII', name: '加權指數', nameEn: 'TAIEX' },
  { symbol: '^GSPC', name: 'S&P 500', nameEn: 'S&P 500' },
  { symbol: '^DJI', name: '道瓊指數', nameEn: 'Dow Jones' },
  { symbol: '^IXIC', name: '那斯達克', nameEn: 'NASDAQ' },
  { symbol: '^SOX', name: '費城半導體', nameEn: 'SOX' },
];

export const MarketOverview: React.FC<Props> = ({ lang, onAnalyze }) => {
  const t = UI_STRINGS[lang];
  const [indices, setIndices] = useState<Record<string, StockQuote>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIndices = async () => {
      setLoading(true);
      const results: Record<string, StockQuote> = {};
      await Promise.all(
        INDICES.map(async (idx) => {
          try {
            const res = await fetch(`/api/stock/quote?symbol=${encodeURIComponent(idx.symbol)}`);
            if (res.ok) results[idx.symbol] = await res.json();
          } catch {}
        })
      );
      setIndices(results);
      setLoading(false);
    };
    fetchIndices();
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">
        {lang === 'zh-TW' ? '大盤指數' : 'Market Indices'}
      </h3>

      {loading ? (
        <div className="text-center text-gray-400 animate-pulse py-4">{t.loading}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {INDICES.map(idx => {
            const q = indices[idx.symbol];
            return (
              <div key={idx.symbol} className="magazine-card p-4 text-center cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onAnalyze(idx.symbol)}>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">
                  {lang === 'zh-TW' ? idx.name : idx.nameEn}
                </p>
                {q ? (
                  <>
                    <p className="text-lg font-bold">{q.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p className={`text-sm font-bold ${q.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {q.changePercent >= 0 ? '+' : ''}{q.changePercent.toFixed(2)}%
                    </p>
                  </>
                ) : (
                  <p className="text-gray-300 text-sm">-</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
