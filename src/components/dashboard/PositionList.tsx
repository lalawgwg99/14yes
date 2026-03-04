import React, { useState } from 'react';
import { Position, StockQuote, Language } from '../../lib/types';
import { UI_STRINGS } from '../../lib/constants';

interface Props {
  lang: Language;
  positions: Position[];
  quotes: Record<string, StockQuote>;
  totalMarketValue: number;
  onAnalyze: (symbol: string) => void;
  onRemove: (symbol: string) => void;
  onAdd: (position: Position) => void;
}

export const PositionList: React.FC<Props> = ({ lang, positions, quotes, totalMarketValue, onAnalyze, onRemove, onAdd }) => {
  const t = UI_STRINGS[lang];
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  const [newShares, setNewShares] = useState('');
  const [newCost, setNewCost] = useState('');

  const handleAdd = () => {
    if (newSymbol && newShares && newCost) {
      onAdd({
        symbol: newSymbol.toUpperCase(),
        name: newName || newSymbol.toUpperCase(),
        shares: parseFloat(newShares),
        avgCost: parseFloat(newCost),
      });
      setNewSymbol('');
      setNewName('');
      setNewShares('');
      setNewCost('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="magazine-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">{t.positions}</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs font-bold uppercase tracking-widest text-ink hover:text-bronze transition-colors"
        >
          + {t.addPosition}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 mb-4 border border-gray-200 space-y-3">
          <div className="grid grid-cols-4 gap-2">
            <input
              value={newSymbol}
              onChange={e => setNewSymbol(e.target.value)}
              placeholder={t.symbol}
              className="border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Name"
              className="border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              value={newShares}
              onChange={e => setNewShares(e.target.value)}
              placeholder={t.shares}
              type="number"
              className="border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              value={newCost}
              onChange={e => setNewCost(e.target.value)}
              placeholder={t.avgCost}
              type="number"
              className="border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <button onClick={handleAdd} className="editorial-btn px-4 py-2 text-xs font-bold tracking-widest">
            {t.addPosition}
          </button>
        </div>
      )}

      {/* Position Table */}
      {positions.length === 0 ? (
        <p className="text-center text-gray-400 py-8 text-sm">{t.noPositions}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold uppercase tracking-widest text-gray-400">
                <th className="text-left py-3">{t.symbol}</th>
                <th className="text-right">{t.shares}</th>
                <th className="text-right">{t.avgCost}</th>
                <th className="text-right">{t.currentPrice}</th>
                <th className="text-right">{t.pnl}</th>
                <th className="text-right">{t.pnlPercent}</th>
                <th className="text-right">{t.weight}</th>
                <th className="text-right"></th>
              </tr>
            </thead>
            <tbody>
              {positions.map(pos => {
                const q = quotes[pos.symbol];
                const currentPrice = q?.price || pos.avgCost;
                const pnl = (currentPrice - pos.avgCost) * pos.shares;
                const pnlPct = ((currentPrice - pos.avgCost) / pos.avgCost) * 100;
                const marketVal = currentPrice * pos.shares;
                const weight = totalMarketValue > 0 ? (marketVal / totalMarketValue) * 100 : 0;

                return (
                  <tr key={pos.symbol} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3">
                      <button onClick={() => onAnalyze(pos.symbol)} className="hover:text-bronze transition-colors">
                        <span className="font-bold">{pos.symbol}</span>
                        <span className="text-gray-400 text-xs ml-1">{pos.name}</span>
                      </button>
                    </td>
                    <td className="text-right font-mono">{pos.shares.toLocaleString()}</td>
                    <td className="text-right font-mono">{pos.avgCost.toFixed(2)}</td>
                    <td className="text-right font-mono">
                      {currentPrice.toFixed(2)}
                      {q && (
                        <span className={`text-xs ml-1 ${q.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {q.changePercent >= 0 ? '+' : ''}{q.changePercent.toFixed(1)}%
                        </span>
                      )}
                    </td>
                    <td className={`text-right font-mono font-bold ${pnl >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {pnl >= 0 ? '+' : ''}{pnl.toFixed(0)}
                    </td>
                    <td className={`text-right font-mono ${pnlPct >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%
                    </td>
                    <td className="text-right font-mono text-gray-400">{weight.toFixed(1)}%</td>
                    <td className="text-right">
                      <button onClick={() => onRemove(pos.symbol)} className="text-gray-300 hover:text-red-500 transition-colors text-xs">x</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
