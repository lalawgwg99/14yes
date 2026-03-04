import React, { useState, useEffect } from 'react';
import { Language } from '../../lib/types';
import { UI_STRINGS } from '../../lib/constants';

interface ScreenerResult {
  symbol: string;
  name?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  marketCap?: number;
  pe?: number;
  dividendYield?: number;
}

interface Props {
  lang: Language;
  onAnalyze: (symbol: string) => void;
}

export const ScreenerView: React.FC<Props> = ({ lang, onAnalyze }) => {
  const t = UI_STRINGS[lang];
  const [results, setResults] = useState<ScreenerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState<'tw' | 'us'>('tw');
  const [minPe, setMinPe] = useState(0);
  const [maxPe, setMaxPe] = useState(50);
  const [minDividend, setMinDividend] = useState(0);

  const fetchScreener = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        region,
        minPe: String(minPe),
        maxPe: String(maxPe),
        minDividend: String(minDividend),
      });
      const res = await fetch(`/api/stock/screener?${params}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreener();
  }, [region]);

  return (
    <div className="space-y-8 fade-in-up">
      <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">{t.screenerTitle}</h2>

      {/* Filters */}
      <div className="magazine-card p-6 space-y-4">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex gap-1">
            <button
              onClick={() => setRegion('tw')}
              className={`px-3 py-1.5 text-xs font-bold rounded ${region === 'tw' ? 'bg-ink text-white' : 'bg-gray-100 text-gray-500'}`}
            >{t.twStocks}</button>
            <button
              onClick={() => setRegion('us')}
              className={`px-3 py-1.5 text-xs font-bold rounded ${region === 'us' ? 'bg-ink text-white' : 'bg-gray-100 text-gray-500'}`}
            >{t.usStocks}</button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-bold">{t.peRange}:</span>
            <input type="number" value={minPe} onChange={e => setMinPe(+e.target.value)} className="w-16 border border-gray-200 px-2 py-1 text-sm text-center" />
            <span className="text-gray-400">-</span>
            <input type="number" value={maxPe} onChange={e => setMaxPe(+e.target.value)} className="w-16 border border-gray-200 px-2 py-1 text-sm text-center" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-bold">{t.dividendYield} &gt;</span>
            <input type="number" value={minDividend} onChange={e => setMinDividend(+e.target.value)} step="0.5" className="w-16 border border-gray-200 px-2 py-1 text-sm text-center" />%
          </div>

          <button
            onClick={fetchScreener}
            className="editorial-btn px-4 py-1.5 text-xs font-bold tracking-widest"
          >
            {lang === 'zh-TW' ? '搜尋' : 'Search'}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="magazine-card p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-400 animate-pulse">{t.loading}</div>
        ) : results.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            {lang === 'zh-TW' ? '無結果' : 'No results'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-bold uppercase tracking-widest text-gray-400">
                  <th className="text-left py-3">{t.symbol}</th>
                  <th className="text-right">{t.price}</th>
                  <th className="text-right">{t.change}</th>
                  <th className="text-right">{t.volume}</th>
                  <th className="text-right">P/E</th>
                  <th className="text-right">{t.dividendYield}</th>
                  <th className="text-right"></th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.symbol} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3">
                      <span className="font-bold">{r.symbol}</span>
                      {r.name && <span className="text-gray-400 text-xs ml-1">{r.name}</span>}
                    </td>
                    <td className="text-right font-mono">{r.price?.toFixed(2) || '-'}</td>
                    <td className={`text-right font-mono ${(r.changePercent || 0) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {r.changePercent ? `${r.changePercent >= 0 ? '+' : ''}${r.changePercent.toFixed(2)}%` : '-'}
                    </td>
                    <td className="text-right font-mono text-gray-500">{r.volume?.toLocaleString() || '-'}</td>
                    <td className="text-right font-mono">{r.pe?.toFixed(1) || '-'}</td>
                    <td className="text-right font-mono">{r.dividendYield ? `${r.dividendYield.toFixed(2)}%` : '-'}</td>
                    <td className="text-right">
                      <button
                        onClick={() => onAnalyze(r.symbol)}
                        className="text-xs font-bold text-ink hover:text-bronze transition-colors uppercase tracking-widest"
                      >
                        {t.analyzeStock}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
