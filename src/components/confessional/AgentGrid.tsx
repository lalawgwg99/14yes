import React from 'react';
import { Agent, Language, UserTier } from '../../lib/types';
import { SketchAvatar } from '../agents/SketchAvatar';
import { playClick } from '../../hooks/useSound';

interface Props {
  agents: Agent[];
  lang: Language;
  userTier: UserTier;
  onSelectAgent: (agent: Agent) => void;
}

export const AgentGrid: React.FC<Props> = ({ agents, lang, userTier, onSelectAgent }) => (
  <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-7 gap-y-10 gap-x-6">
    {agents.map(agent => {
      const displayName = lang === 'zh-TW' ? agent.nameZh : agent.name;
      const isLocked = agent.isPremium && userTier === 'OBSERVER';
      return (
        <div
          key={agent.id}
          className={`flex flex-col items-center text-center group cursor-pointer transition-all duration-300 ${isLocked ? 'opacity-80' : 'opacity-100 hover:-translate-y-1'}`}
          onClick={() => { playClick(); onSelectAgent(agent); }}
        >
          <SketchAvatar
            src={agent.avatar}
            alt={displayName}
            isActive={false}
            isPremium={agent.isPremium}
            isLocked={isLocked}
            size="w-20 h-20"
          />
          <div className="mt-4">
            <h4 className="serif-tc font-bold text-sm text-ink group-hover:text-bronze transition-colors">{displayName}</h4>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1.5 sans-tc font-bold">{agent.title}</p>
          </div>
        </div>
      );
    })}
  </div>
);
