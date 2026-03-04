import React from 'react';
import { Agent, Language, UserTier } from '../../lib/types';
import { UI_STRINGS } from '../../lib/constants';
import { SketchAvatar } from './SketchAvatar';

interface Props {
  agent: Agent;
  onClose: () => void;
  lang: Language;
  userTier: UserTier;
}

const OceanBar = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center gap-2 mb-1.5">
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 w-8">{label}</span>
    <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full bg-ink" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  </div>
);

export const AgentDetailModal: React.FC<Props> = ({ agent, onClose, lang, userTier }) => {
  const t = UI_STRINGS[lang];
  const isLocked = agent.isPremium && userTier === 'OBSERVER';
  const displayName = lang === 'zh-TW' ? agent.nameZh : agent.name;
  const experience = lang === 'zh-TW' ? agent.experience : agent.experienceEn;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm fade-in-up" onClick={onClose} onKeyDown={e => { if (e.key === 'Escape') onClose(); }} role="dialog" aria-labelledby="agent-modal-title">
      <div className="bg-paper max-w-sm w-full p-8 border border-ink shadow-2xl relative torn-paper" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black serif-tc text-2xl" aria-label="Close">✕</button>

        <div className="flex flex-col items-center text-center space-y-4">
          <SketchAvatar src={agent.avatar} alt={displayName} isActive={true} isPremium={agent.isPremium} isLocked={false} size="w-24 h-24" />

          <div>
            <h2 id="agent-modal-title" className="text-3xl serif-tc font-bold text-ink">{displayName}</h2>
            <p className="text-xs uppercase tracking-[0.2em] text-bronze mt-2 font-bold">{experience}</p>
          </div>

          <div className="w-8 h-[1px] bg-gray-300" />

          <div className="space-y-6 py-2 w-full text-left">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold">
                {t.bioSourceLabel}
              </p>
              <p className="serif-tc text-sm text-gray-800 italic border-l-2 border-bronze pl-3 leading-snug">
                {agent.profile.bioSource}
              </p>
            </div>

            <div className="bg-white/50 p-4 rounded border border-gray-100">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3 font-bold text-center border-b border-gray-200 pb-2">
                {t.oceanModelLabel}
              </p>
              <OceanBar label="O" value={agent.profile.ocean.openness} />
              <OceanBar label="C" value={agent.profile.ocean.conscientiousness} />
              <OceanBar label="E" value={agent.profile.ocean.extraversion} />
              <OceanBar label="A" value={agent.profile.ocean.agreeableness} />
              <OceanBar label="N" value={agent.profile.ocean.neuroticism} />
            </div>

            <div>
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-1.5">
                <span>{t.system1Label}</span>
                <span>{t.system2Label}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full relative">
                <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-bronze rounded-full border-2 border-white shadow-sm" style={{ left: `calc(${Math.min(100, Math.max(0, agent.profile.system1Ranking))}% - 8px)` }} />
              </div>
            </div>
          </div>

          {isLocked && (
            <div className="bg-gray-100 px-4 py-3 rounded-sm border border-gray-200 mt-4 w-full text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-600 flex items-center justify-center gap-2">
                <span>🔒</span> {t.lockedFeature}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
