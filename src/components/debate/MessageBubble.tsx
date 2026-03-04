import React from 'react';
import { Agent, Language, DebateMessage } from '../../lib/types';
import { SketchAvatar } from '../agents/SketchAvatar';
import { TypewriterText } from '../ui/TypewriterText';

interface Props {
  msg: DebateMessage;
  agent: Agent | undefined;
  index: number;
  isNew: boolean;
  lang: Language;
}

export const MessageBubble: React.FC<Props> = ({ msg, agent, index, isNew, lang }) => {
  const isLeft = index % 2 === 0;
  const displayName = lang === 'zh-TW' ? agent?.nameZh : agent?.name;

  return (
    <div
      className={`flex w-full gap-4 md:gap-6 ${isLeft ? 'flex-row' : 'flex-row-reverse'} items-start ${isNew ? 'opacity-100 stagger-enter' : 'opacity-90 grayscale-[0.3]'}`}
    >
      <div className="flex-shrink-0 pt-2 flex flex-col items-center gap-2 w-16 md:w-20">
        <SketchAvatar
          src={agent?.avatar || ''}
          alt={displayName || ''}
          isActive={isNew}
          size="w-12 h-12 md:w-16 md:h-16"
        />
        <div className={`text-center ${isNew ? 'opacity-100' : 'opacity-50'}`}>
          <span className="serif-tc font-bold text-[10px] md:text-xs uppercase tracking-wider text-ink block">{displayName}</span>
        </div>
      </div>

      <div className={`flex-grow max-w-[80%] md:max-w-[85%] ${isLeft ? 'text-left' : 'text-right'}`}>
        <div className={`relative p-4 md:p-6 magazine-card ${isNew ? 'border-bronze/30 shadow-md' : 'border-gray-100'}`}>
          <span className={`absolute -top-4 ${isLeft ? 'left-4' : 'right-4'} text-6xl text-[#E5E0D6] serif-tc leading-none z-0`}>"</span>
          <div className="relative z-10 serif-tc text-base md:text-lg text-ink leading-loose">
            {isNew ? <TypewriterText content={msg.content} /> : msg.content}
          </div>
          {msg.citation && (
            <div className={`mt-3 pt-2 border-t border-gray-100 ${isLeft ? 'text-left' : 'text-right'}`}>
              <span className="text-[10px] italic text-bronze/70 sans-tc tracking-wide">
                📖 {msg.citation}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
