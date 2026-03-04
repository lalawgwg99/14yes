import React from 'react';
import { Language } from '../../lib/types';
import { UI_STRINGS } from '../../lib/constants';

interface Props {
  lang: Language;
}

export const Footer: React.FC<Props> = ({ lang }) => {
  const t = UI_STRINGS[lang];
  return (
    <footer className="bg-paper border-t border-border py-12 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div className="w-8 h-8 bg-ink text-white flex items-center justify-center brand-font font-bold text-sm mx-auto mb-4">N</div>
        <p className="text-xs text-gray-600 uppercase tracking-widest sans-tc max-w-xl mx-auto leading-relaxed font-medium">
          {t.disclaimer}
        </p>
        <p className="text-[10px] text-gray-400 serif-tc italic">
          {t.copyright}
        </p>
      </div>
    </footer>
  );
};
