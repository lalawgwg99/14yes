import React, { useRef, useEffect } from 'react';
import { Language, DebateMessage } from '../../lib/types';
import { AGENTS, UI_STRINGS } from '../../lib/constants';
import { playClick } from '../../hooks/useSound';
import { MessageBubble } from './MessageBubble';

interface Props {
  messages: DebateMessage[];
  currentSpeakerIndex: number;
  lang: Language;
  onProceedToVerdict: () => void;
  onSkipAll: () => void;
}

export const DebateView: React.FC<Props> = ({ messages, currentSpeakerIndex, lang, onProceedToVerdict, onSkipAll }) => {
  const endRef = useRef<HTMLDivElement>(null);
  const t = UI_STRINGS[lang];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSpeakerIndex]);

  const allDone = currentSpeakerIndex >= messages.length - 1;

  return (
    <div className="fade-in-up max-w-3xl mx-auto space-y-16">
      <div className="text-center border-b border-double border-gray-200 pb-8 mb-12">
        <h3 className="serif-tc text-2xl italic text-gray-800 tracking-wide">{t.debateTitle}</h3>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 sans-tc font-bold">{new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-10 md:space-y-14">
        {messages.slice(0, currentSpeakerIndex + 1).map((msg, idx) => {
          const agent = AGENTS.find(a => a.id === msg.agentId);
          return (
            <MessageBubble
              key={idx}
              msg={msg}
              agent={agent}
              index={idx}
              isNew={idx === currentSpeakerIndex}
              lang={lang}
            />
          );
        })}
        <div ref={endRef} className="h-12" />
      </div>

      {!allDone && (
        <div className="flex justify-center pt-6">
          <button
            onClick={() => { playClick(); onSkipAll(); }}
            className="text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-bronze sans-tc transition-colors border border-gray-200 hover:border-bronze px-6 py-2"
          >
            {lang === 'zh-TW' ? '⏭ 跳過辯論' : '⏭ Skip Debate'}
          </button>
        </div>
      )}

      {allDone && (
        <div className="flex justify-center pt-12 border-t border-gray-100">
          <button
            onClick={() => { playClick(); onProceedToVerdict(); }}
            className="editorial-btn px-12 py-4 text-sm font-bold tracking-[0.25em] shadow-lg"
          >
            {t.proceedVerdict}
          </button>
        </div>
      )}
    </div>
  );
};
