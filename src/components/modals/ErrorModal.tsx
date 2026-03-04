import React from 'react';
import { Language } from '../../lib/types';
import { UI_STRINGS } from '../../lib/constants';

interface Props {
  error: string;
  onClose: () => void;
  lang: Language;
}

export const ErrorModal: React.FC<Props> = ({ error, onClose, lang }) => {
  const t = UI_STRINGS[lang];
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm fade-in-up">
      <div className="bg-white max-w-sm w-full p-6 border-l-4 border-red-600 shadow-2xl relative torn-paper">
        <h3 className="text-xl serif-tc font-bold text-red-800 mb-2">
          {t.errorTitle}
        </h3>
        <p className="text-base text-gray-800 serif-tc mb-4 break-words leading-relaxed">{error}</p>
        <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-600 mb-4 overflow-x-auto">
          {t.errorSuggest}
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 bg-ink text-white text-sm font-bold uppercase tracking-widest hover:bg-red-800 transition-colors"
        >
          {t.errorReconnect}
        </button>
      </div>
    </div>
  );
};
