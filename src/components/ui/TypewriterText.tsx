import React, { useState, useEffect } from 'react';
import { playClick, playScratch } from '../../hooks/useSound';

interface Props {
  content: string;
  speed?: number;
  onComplete?: () => void;
  onSkip?: () => void;
}

export const TypewriterText: React.FC<Props> = ({ content, speed = 30, onComplete, onSkip }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayed('');
    setDone(false);
    const timer = setInterval(() => {
      if (i < content.length) {
        setDisplayed(content.slice(0, i + 1));
        if (Math.random() > 0.8) playClick();
        else playScratch();
        i++;
      } else {
        clearInterval(timer);
        setDone(true);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [content, speed]);

  const handleSkip = () => {
    setDisplayed(content);
    setDone(true);
    onComplete?.();
    onSkip?.();
  };

  return (
    <span className="relative">
      <span className={`leading-relaxed serif-tc ${!done ? 'writing-cursor' : ''}`}>{displayed}</span>
      {!done && (
        <button
          onClick={handleSkip}
          className="absolute -bottom-8 right-0 text-[10px] uppercase tracking-widest text-gray-400 hover:text-bronze transition-colors sans-tc font-bold"
        >
          Skip ▸
        </button>
      )}
    </span>
  );
};
