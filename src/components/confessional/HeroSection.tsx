import React from 'react';
import { Language } from '../../lib/types';

interface Props {
  lang: Language;
}

export const HeroSection: React.FC<Props> = ({ lang }) => (
  <div className="text-center space-y-5 mb-16">
    <h2 className="text-4xl md:text-6xl serif-tc font-medium text-ink leading-[1.2]">
      {lang === 'zh-TW' ? '在混亂中尋找' : 'Find Clarity in'} <br />
      <span className="italic text-bronze font-serif">{lang === 'zh-TW' ? '永恆的智慧' : 'Eternal Wisdom'}</span>
    </h2>
    <div className="w-16 h-[1px] bg-gray-300 mx-auto my-6" />
    <p className="text-gray-600 serif-tc text-lg italic max-w-lg mx-auto leading-relaxed">
      {lang === 'zh-TW' ? '十四位歷史傳奇人物，為您的人生難題提供戰略諮詢。' : 'Fourteen legendary figures ready to strategize your next move.'}
    </p>
  </div>
);
