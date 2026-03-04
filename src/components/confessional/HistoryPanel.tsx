import React from 'react';
import { Language } from '../../lib/types';
import { HistoryEntry, clearHistory } from '../../hooks/useHistory';

interface Props {
  entries: HistoryEntry[];
  lang: Language;
  onSelect: (entry: HistoryEntry) => void;
  onRefresh: () => void;
}

export const HistoryPanel: React.FC<Props> = ({ entries, lang, onSelect, onRefresh }) => {
  if (entries.length === 0) return null;

  const handleClear = () => {
    if (window.confirm(lang === 'zh-TW' ? '確定要清除所有歷史紀錄？' : 'Clear all history?')) {
      clearHistory();
      onRefresh();
    }
  };

  return (
    <div className="magazine-card p-8 max-w-3xl mx-auto torn-paper">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 sans-tc">
          {lang === 'zh-TW' ? '歷史諮詢紀錄' : 'Consultation History'}
        </h3>
        <button onClick={handleClear} className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors sans-tc font-bold">
          {lang === 'zh-TW' ? '清除' : 'Clear'}
        </button>
      </div>
      <div className="space-y-3">
        {entries.slice(0, 5).map(entry => (
          <div
            key={entry.id}
            onClick={() => onSelect(entry)}
            className="flex items-center justify-between p-4 border border-gray-100 hover:border-bronze/30 cursor-pointer transition-colors group bg-white/50"
          >
            <div className="flex-1 min-w-0">
              <p className="serif-tc text-sm text-ink truncate group-hover:text-bronze transition-colors">{entry.query}</p>
              <p className="text-[10px] text-gray-400 mt-1 sans-tc">
                {new Date(entry.timestamp).toLocaleDateString(lang === 'zh-TW' ? 'zh-TW' : 'en-US')}
              </p>
            </div>
            <span className="text-gray-300 group-hover:text-bronze transition-colors ml-4">→</span>
          </div>
        ))}
      </div>
    </div>
  );
};
