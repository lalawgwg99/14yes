import React from 'react';
import { Language } from '../../lib/types';
import { UI_STRINGS } from '../../lib/constants';
import { playClick } from '../../hooks/useSound';

interface Props {
  onClose: () => void;
  onPurchase: () => void;
  lang: Language;
}

export const SubscriptionModal: React.FC<Props> = ({ onClose, onPurchase, lang }) => {
  const t = UI_STRINGS[lang];
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-white/95 backdrop-blur-md fade-in-up">
      <div className="bg-white max-w-md w-full p-10 border border-ink shadow-2xl relative torn-paper">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black serif-tc text-2xl">✕</button>

        <div className="text-center mb-8">
          <div className="w-16 h-1 bg-ink mx-auto mb-6" />
          <h2 className="text-3xl serif-tc font-bold text-ink mb-3 tracking-wide">{t.paywallTitle}</h2>
          <p className="text-gray-700 serif-tc italic">{t.paywallDesc}</p>
        </div>

        <div className="space-y-4 mb-10 border-t border-b border-gray-100 py-6">
          {t.paywallBenefits.map((benefit, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-bronze serif-tc font-bold mt-1">✦</span>
              <span className="text-base text-gray-800 tracking-wide serif-tc">{benefit}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => { playClick(); onPurchase(); }}
          className="w-full py-4 bg-ink text-white text-sm font-bold uppercase tracking-[0.2em] hover:bg-bronze transition-colors shadow-lg"
        >
          {t.buyButton}
        </button>
        <button onClick={onPurchase} className="w-full mt-4 text-xs text-gray-500 uppercase tracking-widest hover:text-black">
          {t.restoreButton}
        </button>
      </div>
    </div>
  );
};
