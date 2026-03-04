import React, { useState, useEffect } from 'react';
import { Language } from '../../lib/types';

interface Props {
  lang: Language;
  stage?: 'selecting' | 'debating' | 'rendering';
}

const STAGES = {
  'zh-TW': {
    selecting: '正在挑選最適合的顧問團...',
    debating: '顧問們激烈辯論中...',
    rendering: '生成策略報告...',
  },
  'en': {
    selecting: 'Selecting the best advisors...',
    debating: 'Advisors are debating...',
    rendering: 'Generating strategic report...',
  },
};

const FLAVOR = {
  'zh-TW': [
    '正在翻閱孫子兵法...',
    '分析歷史市場數據...',
    '解構巴菲特投資模型...',
    '計算黑天鵝風險係數...',
    '模擬賈伯斯思維路徑...',
    '墨水未乾，請稍候...'
  ],
  'en': [
    "Consulting Sun Tzu's Art of War...",
    'Analyzing historical market data...',
    'Deconstructing Buffett models...',
    'Calculating Black Swan risks...',
    "Simulating Jobs' design thinking...",
    'The ink is still wet...'
  ]
};

export const WritingLoader: React.FC<Props> = ({ lang, stage = 'selecting' }) => {
  const [flavorIndex, setFlavorIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const flavors = FLAVOR[lang];

  useEffect(() => {
    const interval = setInterval(() => {
      setFlavorIndex(prev => (prev + 1) % flavors.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [lang]);

  useEffect(() => {
    const interval = setInterval(() => setElapsed(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const stageLabel = STAGES[lang][stage];
  const steps = ['selecting', 'debating', 'rendering'] as const;
  const currentStep = steps.indexOf(stage);

  return (
    <div className="flex flex-col items-center justify-center h-80 fade-in-up">
      <div className="quantum-loader mb-10">
        <div className="quantum-orbit" />
        <div className="quantum-orbit" />
        <div className="quantum-orbit" />
        <div className="quantum-core" />
      </div>

      {/* Stage indicator */}
      <div className="flex items-center gap-3 mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
              i <= currentStep ? 'bg-bronze scale-125' : 'bg-gray-300'
            }`} />
            {i < steps.length - 1 && (
              <div className={`w-8 h-[1px] transition-all duration-500 ${
                i < currentStep ? 'bg-bronze' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.2em] text-bronze sans-tc mb-2">
        {stageLabel}
      </p>

      <div className="h-8 flex items-center justify-center">
        <p key={flavorIndex} className="text-sm serif-tc text-gray-700 tracking-widest animate-fade-in-up font-medium">
          {flavors[flavorIndex]}
        </p>
      </div>

      <div className="text-[10px] text-gray-400 mt-4 sans-tc">
        {elapsed}s
      </div>
    </div>
  );
};
