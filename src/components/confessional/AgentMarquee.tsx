import React from 'react';
import { Agent, Language, UserTier } from '../../lib/types';
import { SketchAvatar } from '../agents/SketchAvatar';

interface Props {
  agents: Agent[];
  direction: 'left' | 'right';
  onClick: (agent: Agent) => void;
  userTier: UserTier;
  lang: Language;
}

export const AgentMarquee: React.FC<Props> = ({ agents, direction, onClick, userTier, lang }) => {
  const displayAgents = [...agents, ...agents, ...agents];

  return (
    <div className="overflow-hidden relative w-full pause-hover">
      <div className={`flex w-max ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}`}>
        {displayAgents.map((agent, i) => {
          const displayName = lang === 'zh-TW' ? agent.nameZh : agent.name;
          return (
            <div
              key={`${agent.id}-${i}`}
              className="w-24 mx-4 flex flex-col items-center cursor-pointer shrink-0 py-2"
              onClick={() => onClick(agent)}
            >
              <SketchAvatar
                src={agent.avatar}
                alt={displayName}
                isActive={false}
                isPremium={agent.isPremium}
                isLocked={agent.isPremium && userTier === 'OBSERVER'}
                size="w-16 h-16"
              />
              <div className="mt-3 text-center">
                <h4 className="serif-tc font-bold text-sm text-ink truncate w-24">{displayName}</h4>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1 sans-tc truncate w-24 font-bold">{agent.title}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-paper to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-paper to-transparent z-10 pointer-events-none" />
    </div>
  );
};
