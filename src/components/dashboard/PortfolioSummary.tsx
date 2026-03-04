import React from 'react';
import { Language } from '../../lib/types';
import { UI_STRINGS } from '../../lib/constants';

interface Props {
  lang: Language;
  totalAssets: number;
  todayPnL: number;
  totalReturn: number;
  currency: string;
}

export const PortfolioSummary: React.FC<Props> = ({ lang, totalAssets, todayPnL, totalReturn, currency }) => {
  const t = UI_STRINGS[lang];
  const fmt = (v: number) => `${currency === 'TWD' ? 'NT$' : '$'}${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="magazine-card p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{t.totalAssets}</p>
        <p className="text-2xl font-bold text-ink serif-tc">{fmt(totalAssets)}</p>
      </div>
      <div className="magazine-card p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{t.todayPnL}</p>
        <p className={`text-2xl font-bold serif-tc ${todayPnL >= 0 ? 'text-red-600' : 'text-green-600'}`}>
          {todayPnL >= 0 ? '+' : ''}{fmt(todayPnL)}
        </p>
      </div>
      <div className="magazine-card p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{t.totalReturn}</p>
        <p className={`text-2xl font-bold serif-tc ${totalReturn >= 0 ? 'text-red-600' : 'text-green-600'}`}>
          {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};
