import React, { useState, useEffect } from 'react';
import { Language } from '../../lib/types';

interface Props {
  lang: Language;
}

const MESSAGES = {
  'zh-TW': [
    '正在翻閱孫子兵法...',
    '分析歷史市場數據...',
    '解構巴菲特投資模型...',
    '計算黑天鵝風險係數...',
    '模擬賈伯斯思維路徑...',
    '正在召集委員會成員...',
    '墨水未乾，請稍候...'
  ],
  'en': [
    "Consulting Sun Tzu's Art of War...",
    'Analyzing historical market data...',
    'Deconstructing Buffett models...',
    'Calculating Black Swan risks...',
    "Simulating Jobs' design thinking...",
    'Summoning the Council...',
    'The ink is still wet...'
  ]
};

export const WritingLoader: React.FC<Props> = ({ lang }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const messages = MESSAGES[lang];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [lang]);

  return (
    <div className="flex flex-col items-center justify-center h-80 fade-in-up">
      <div className="quantum-loader mb-10">
        <div className="quantum-orbit" />
        <div className="quantum-orbit" />
        <div className="quantum-orbit" />
        <div className="quantum-core" />
      </div>
      <div className="h-8 flex items-center justify-center">
        <p key={msgIndex} className="text-sm serif-tc text-gray-700 tracking-widest animate-fade-in-up font-medium">
          {messages[msgIndex]}
        </p>
      </div>
      <div className="w-12 h-[1px] bg-bronze opacity-30 mt-4" />
    </div>
  );
};
