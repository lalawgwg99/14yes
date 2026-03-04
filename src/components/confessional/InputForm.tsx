import React from 'react';
import { Language, UserTier } from '../../lib/types';
import { UI_STRINGS, CATEGORIES } from '../../lib/constants';
import { playClick } from '../../hooks/useSound';

interface Props {
  lang: Language;
  userTier: UserTier;
  input: string;
  selectedCategory: string;
  isDarkMode: boolean;
  onInputChange: (value: string) => void;
  onCategoryChange: (cat: string) => void;
  onToggleDarkMode: () => void;
  onSubmit: () => void;
}

export const InputForm: React.FC<Props> = ({
  lang, userTier, input, selectedCategory, isDarkMode,
  onInputChange, onCategoryChange, onToggleDarkMode, onSubmit,
}) => {
  const t = UI_STRINGS[lang];

  return (
    <div className="magazine-card p-10 md:p-16 relative max-w-3xl mx-auto torn-paper">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-paper px-6 text-xs serif-tc italic text-gray-500 border border-border py-1 font-medium">
        {t.inputLabel}
      </div>

      <div className="space-y-12">
        <div>
          <label className="block text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-5 sans-tc">{t.categoryLabel}</label>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES[lang].map(cat => (
              <button
                key={cat}
                onClick={() => { playClick(); onCategoryChange(cat); }}
                className={`px-5 py-2.5 text-sm serif-tc transition-all border ${selectedCategory === cat ? 'border-ink bg-ink text-white shadow-md' : 'border-[#E0E0E0] text-gray-700 hover:border-[#B0B0B0] bg-white/50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-5 sans-tc">{t.inputLabel}</label>
          <textarea
            value={input}
            onChange={e => onInputChange(e.target.value)}
            placeholder={t.confessionalPrompt}
            className="w-full h-40 bg-transparent border-0 border-b-2 border-gray-200 resize-none serif-tc text-xl leading-relaxed focus:ring-0 focus:border-bronze placeholder-gray-400 p-2 transition-colors text-gray-800"
          />
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <button
            onClick={onToggleDarkMode}
            className={`flex items-center gap-3 text-xs font-bold uppercase tracking-widest transition-colors sans-tc ${isDarkMode ? 'text-[#8C7000]' : 'text-gray-500 hover:text-black'}`}
          >
            <span className={`w-3 h-3 rounded-full border ${isDarkMode ? 'bg-[#8C7000] border-[#8C7000]' : 'border-gray-500'}`} />
            {t.darkMode}
            {userTier === 'OBSERVER' && <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-1">LOCKED</span>}
          </button>

          <button
            onClick={onSubmit}
            disabled={!input && !selectedCategory}
            className="editorial-btn px-10 py-3.5 text-xs font-bold tracking-[0.25em] disabled:opacity-50"
          >
            {t.startDebate}
          </button>
        </div>
      </div>
    </div>
  );
};
