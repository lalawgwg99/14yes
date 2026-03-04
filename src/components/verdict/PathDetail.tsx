import React from 'react';
import { StrategicPath, Language, UserTier } from '../../lib/types';
import { AGENTS, UI_STRINGS } from '../../lib/constants';
import { SketchAvatar } from '../agents/SketchAvatar';
import { TechnicalRadar } from './TechnicalRadar';
import { playClick } from '../../hooks/useSound';

interface Props {
  path: StrategicPath;
  lang: Language;
  userTier: UserTier;
  followUpInput: string;
  onFollowUpChange: (value: string) => void;
  onFollowUpSubmit: () => void;
  onBack: () => void;
  onReset: () => void;
  onShowPaywall: () => void;
}

const PATH_COLORS: Record<string, string> = {
  aggressive: '#8B0000',
  conservative: '#003366',
  lateral: '#8C7853',
};

export const PathDetail: React.FC<Props> = ({ path, lang, userTier, followUpInput, onFollowUpChange, onFollowUpSubmit, onBack, onReset, onShowPaywall }) => {
  const t = UI_STRINGS[lang];
  const leadAgent = AGENTS.find(a => a.id === path.leadAgentId);
  const displayName = lang === 'zh-TW' ? leadAgent?.nameZh : leadAgent?.name;
  const color = PATH_COLORS[path.id] || '#8C7853';

  return (
    <div className="max-w-4xl mx-auto space-y-16 fade-in-up">
      <div className="text-center border-b border-gray-100 pb-16">
        <div className="mb-8 flex justify-center">
          <SketchAvatar src={leadAgent?.avatar || ''} alt={displayName || ''} isActive={true} size="w-32 h-32" />
        </div>
        <h2 className="text-4xl md:text-5xl serif-tc font-bold text-ink mb-6">{path.title}</h2>
        <p className="text-xl text-gray-700 serif-tc italic max-w-2xl mx-auto leading-relaxed">{path.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
        <div className="md:col-span-7 space-y-12">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-8 border-b border-gray-200 pb-3 sans-tc">{t.strategy}</h4>
            <div className="space-y-10">
              {path.steps.map((s, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <span className="flex-shrink-0 serif-tc text-4xl font-bold text-[#E0E0E0] -mt-2">{i + 1}</span>
                  <p className="serif-tc text-lg text-ink leading-loose drop-cap border-b border-gray-50 pb-6">{s}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-paper p-10 border border-border torn-paper relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 border border-border">
              <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 sans-tc">
                {lang === 'zh-TW' ? '思維模型演算法' : 'Algorithm'}
              </h4>
            </div>
            <p className="font-mono text-xs leading-relaxed text-gray-700 whitespace-pre-wrap">{path.code.text}</p>
          </div>
        </div>

        <div className="md:col-span-5 space-y-12">
          <div onClick={() => { if (userTier === 'OBSERVER') onShowPaywall(); }} className="cursor-pointer group">
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-8 border-b border-gray-200 pb-3 sans-tc">
              {lang === 'zh-TW' ? '戰術雷達分析' : 'Tactical Analysis'}
            </h4>
            <div className="bg-white border border-gray-100 p-8 flex justify-center group-hover:shadow-lg transition-all duration-500">
              <TechnicalRadar metrics={path.metrics} color={color} userTier={userTier} lang={lang} />
            </div>
          </div>
          <div className="space-y-4 text-center md:text-left">
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-3 sans-tc">{t.upside}</h4>
            <p className="serif-tc text-2xl italic text-ink leading-relaxed">{path.upside}</p>
          </div>
          <div className="pt-8 border-t border-gray-100 space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-3 sans-tc">
                {lang === 'zh-TW' ? `追問 ${displayName}` : `Ask ${displayName}`}
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={followUpInput}
                  onChange={e => onFollowUpChange(e.target.value)}
                  placeholder={lang === 'zh-TW' ? '針對此路徑提出追問...' : 'Ask a follow-up about this path...'}
                  className="flex-grow bg-transparent border-b border-gray-200 focus:border-bronze serif-tc text-base p-2 transition-colors outline-none"
                  onKeyDown={e => { if (e.key === 'Enter' && followUpInput.trim()) { playClick(); onFollowUpSubmit(); } }}
                />
                <button
                  onClick={() => { if (followUpInput.trim()) { playClick(); onFollowUpSubmit(); } }}
                  disabled={!followUpInput.trim()}
                  className="editorial-btn px-6 py-2 text-xs font-bold tracking-widest disabled:opacity-50"
                >
                  {lang === 'zh-TW' ? '追問' : 'Ask'}
                </button>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start justify-center md:justify-start">
              <button onClick={() => { playClick(); onBack(); }} className="text-xs uppercase tracking-widest font-bold text-gray-500 hover:text-black sans-tc transition-colors border-b border-transparent hover:border-black pb-1">
                ← {t.backToMatrix}
              </button>
              <button onClick={onReset} className="text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-red-800 sans-tc transition-colors border-b border-transparent hover:border-red-800 pb-1">
                ↺ {t.reset}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
