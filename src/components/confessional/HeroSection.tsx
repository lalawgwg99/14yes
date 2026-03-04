import React from 'react';
import { Language } from '../../lib/types';
import { UI_STRINGS } from '../../lib/constants';

interface Props {
  lang: Language;
}

export const HeroSection: React.FC<Props> = ({ lang }) => {
  const t = UI_STRINGS[lang];
  return (
    <div className="text-center space-y-5 mb-16">
      <h2 className="text-4xl md:text-6xl serif-tc font-medium text-ink leading-[1.2]">
        {t.heroLine1} <br />
        <span className="italic text-bronze font-serif">{t.heroLine2}</span>
      </h2>
      <div className="w-16 h-[1px] bg-gray-300 mx-auto my-6" />
      <p className="text-gray-600 serif-tc text-lg italic max-w-lg mx-auto leading-relaxed">
        {t.heroDesc}
      </p>
    </div>
  );
};
