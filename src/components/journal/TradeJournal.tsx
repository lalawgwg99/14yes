import React, { useState, useEffect } from 'react';
import { Language } from '../../lib/types';
import { UI_STRINGS } from '../../lib/constants';

interface TradeEntry {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  shares: number;
  price: number;
  notes: string;
  date: string;
}

const STORAGE_KEY = 'nexus-trade-journal';

function loadJournal(): TradeEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveJournal(entries: TradeEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

interface Props {
  lang: Language;
}

export const TradeJournal: React.FC<Props> = ({ lang }) => {
  const t = UI_STRINGS[lang];
  const [entries, setEntries] = useState<TradeEntry[]>(loadJournal);
  const [showForm, setShowForm] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
  const [shares, setShares] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => { saveJournal(entries); }, [entries]);

  const addEntry = () => {
    if (!symbol || !shares || !price) return;
    const entry: TradeEntry = {
      id: Date.now().toString(36),
      symbol: symbol.toUpperCase(),
      action,
      shares: parseFloat(shares),
      price: parseFloat(price),
      notes,
      date: new Date().toISOString().split('T')[0],
    };
    setEntries(prev => [entry, ...prev]);
    setSymbol(''); setShares(''); setPrice(''); setNotes('');
    setShowForm(false);
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  // Win rate calculation
  const trades = entries.reduce((acc, e) => {
    if (!acc[e.symbol]) acc[e.symbol] = [];
    acc[e.symbol].push(e);
    return acc;
  }, {} as Record<string, TradeEntry[]>);

  let wins = 0, losses = 0;
  Object.values(trades).forEach(symbolTrades => {
    const buys = symbolTrades.filter(t => t.action === 'BUY');
    const sells = symbolTrades.filter(t => t.action === 'SELL');
    if (buys.length > 0 && sells.length > 0) {
      const avgBuy = buys.reduce((s, b) => s + b.price, 0) / buys.length;
      const avgSell = sells.reduce((s, b) => s + b.price, 0) / sells.length;
      if (avgSell > avgBuy) wins++; else losses++;
    }
  });
  const winRate = wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(0) : '-';

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">
          {lang === 'zh-TW' ? '交易日誌' : 'Trade Journal'}
        </h2>
        <div className="flex gap-4 items-center">
          <span className="text-xs text-gray-400">
            {lang === 'zh-TW' ? `勝率 ${winRate}%` : `Win Rate ${winRate}%`} | {entries.length} {lang === 'zh-TW' ? '筆交易' : 'trades'}
          </span>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs font-bold uppercase tracking-widest text-ink hover:text-bronze transition-colors"
          >
            + {lang === 'zh-TW' ? '新增交易' : 'New Trade'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="magazine-card p-6 space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <input value={symbol} onChange={e => setSymbol(e.target.value)} placeholder={t.symbol} className="border border-gray-200 px-3 py-2 text-sm" />
            <select value={action} onChange={e => setAction(e.target.value as 'BUY' | 'SELL')} className="border border-gray-200 px-3 py-2 text-sm">
              <option value="BUY">{lang === 'zh-TW' ? '買入' : 'BUY'}</option>
              <option value="SELL">{lang === 'zh-TW' ? '賣出' : 'SELL'}</option>
            </select>
            <input value={shares} onChange={e => setShares(e.target.value)} placeholder={t.shares} type="number" className="border border-gray-200 px-3 py-2 text-sm" />
            <input value={price} onChange={e => setPrice(e.target.value)} placeholder={t.price} type="number" className="border border-gray-200 px-3 py-2 text-sm" />
            <button onClick={addEntry} className="editorial-btn text-xs font-bold tracking-widest">
              {lang === 'zh-TW' ? '確認' : 'Add'}
            </button>
          </div>
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder={lang === 'zh-TW' ? '備註...' : 'Notes...'} className="w-full border border-gray-200 px-3 py-2 text-sm" />
        </div>
      )}

      <div className="magazine-card p-6">
        {entries.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">
            {lang === 'zh-TW' ? '尚無交易紀錄' : 'No trades yet'}
          </p>
        ) : (
          <div className="space-y-2">
            {entries.map(entry => (
              <div key={entry.id} className="flex items-center gap-4 py-3 border-b border-gray-50 hover:bg-gray-50 px-2 transition-colors">
                <span className="text-xs text-gray-400 w-20">{entry.date}</span>
                <span className={`text-xs font-bold w-10 ${entry.action === 'BUY' ? 'text-red-600' : 'text-green-600'}`}>
                  {entry.action}
                </span>
                <span className="font-bold text-sm w-24">{entry.symbol}</span>
                <span className="text-sm text-gray-600">{entry.shares} @ {entry.price}</span>
                <span className="text-xs text-gray-400 flex-grow">{entry.notes}</span>
                <button onClick={() => removeEntry(entry.id)} className="text-gray-300 hover:text-red-500 text-xs">x</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
