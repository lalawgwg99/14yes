import React from 'react';
import { StrategicPath, Language, UserTier } from '../../lib/types';
import { AGENTS, UI_STRINGS } from '../../lib/constants';
import { SketchAvatar } from '../agents/SketchAvatar';
import { playClick } from '../../hooks/useSound';

interface Props {
  paths: StrategicPath[];
  lang: Language;
  userTier: UserTier;
  onSelectPath: (id: string) => void;
  onReset: () => void;
}

const PATH_BORDER_CLASSES: Record<string, string> = {
  aggressive: 'path-card-aggressive',
  conservative: 'path-card-conservative',
  lateral: 'path-card-lateral',
};

export const PathSelector: React.FC<Props> = ({ paths, lang, onSelectPath, onReset }) => {
  const t = UI_STRINGS[lang];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200 border-t border-b border-gray-200 py-16">
        {paths.map((path) => {
          const leadAgent = AGENTS.find(a => a.id === path.leadAgentId);
          const displayName = lang === 'zh-TW' ? leadAgent?.nameZh : leadAgent?.name;
          return (
            <div
              key={path.id}
              className={`px-8 py-8 md:py-0 text-center space-y-8 group cursor-pointer hover:bg-white/50 transition-all border-2 border-transparent ${PATH_BORDER_CLASSES[path.id] || ''}`}
              onClick={() => { playClick(); onSelectPath(path.id); window.scrollTo(0, 0); }}
            >
              <div className="h-0.5 w-16 bg-gray-200 mx-auto group-hover:bg-bronze transition-colors" />
              <div>
                <h3 className="serif-tc text-3xl font-bold text-ink mb-3 group-hover:text-bronze transition-colors">{path.title}</h3>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 sans-tc font-bold">
                  {t.ledBy}{displayName}
                </p>
              </div>
              <div className="flex justify-center transform group-hover:scale-105 transition-transform duration-500">
                <SketchAvatar src={leadAgent?.avatar || ''} alt="" isActive={false} size="w-24 h-24" />
              </div>
              <p className="serif-tc text-gray-700 leading-relaxed text-base px-2">{path.description}</p>
              <div className="pt-6">
                <span className="inline-block px-6 py-3 bg-ink text-white text-xs font-bold uppercase tracking-widest hover:bg-bronze transition-colors shadow-sm">
                  {t.readFullStrategy}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center mt-16 pt-8 border-t border-gray-100">
        <button onClick={onReset} className="flex flex-col items-center gap-3 group">
          <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 group-hover:border-bronze group-hover:text-bronze transition-colors bg-white">
            <span className="text-xl">↺</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-bronze transition-colors sans-tc">{t.reset}</span>
        </button>
      </div>
    </>
  );
};
