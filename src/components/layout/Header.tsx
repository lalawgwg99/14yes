import React from 'react';
import { Language, UserTier } from '../../lib/types';
import { UI_STRINGS } from '../../lib/constants';
import { playClick } from '../../hooks/useSound';

interface Props {
  lang: Language;
  userTier: UserTier;
  onReset: () => void;
  onToggleLang: () => void;
  onShowPaywall: () => void;
}

export const Header: React.FC<Props> = ({ lang, userTier, onReset, onToggleLang, onShowPaywall }) => {
  const t = UI_STRINGS[lang];

  return (
    <header className="fixed top-0 w-full z-50 bg-paper/90 backdrop-blur-md border-b border-border py-5 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
      <div className="flex items-center gap-4 cursor-pointer" onClick={onReset}>
        <div className="w-10 h-10 bg-ink rounded-sm flex items-center justify-center text-white brand-font font-bold text-xl shadow-lg hover:bg-bronze transition-colors">N</div>
        <div className="hidden md:block">
          <h1 className="text-xl serif-tc font-bold tracking-wide text-ink">{t.title}</h1>
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mt-0.5 font-bold">{t.subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 md:gap-6">
        <a href="https://www.buymeacoffee.com/laladoo99" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform hidden md:block">
          <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a pizza&emoji=🍕&slug=laladoo99&button_colour=FFDD00&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=ffffff" alt="Buy me a pizza" className="h-10" />
        </a>
        <button
          onClick={() => {
            playClick();
            if (userTier === 'OBSERVER') onShowPaywall();
          }}
          className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 border transition-colors ${userTier === 'COMMANDER' ? 'border-bronze text-bronze' : 'border-gray-300 text-gray-500 hover:border-black hover:text-black'}`}
        >
          {userTier === 'COMMANDER' ? t.member : t.guest}
        </button>
        <button onClick={onToggleLang} className="text-xs serif-tc italic text-gray-700 hover:text-black underline decoration-1 underline-offset-4">
          {t.switchLanguage}
        </button>
      </div>
    </header>
  );
};
