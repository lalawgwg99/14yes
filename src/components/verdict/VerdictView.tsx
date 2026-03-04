import React, { useState } from 'react';
import { Verdict, Language, UserTier } from '../../lib/types';
import { UI_STRINGS } from '../../lib/constants';
import { StrategicTable } from './StrategicTable';
import { PathSelector } from './PathSelector';
import { PathDetail } from './PathDetail';
import { shareVerdict } from '../../hooks/useHistory';

interface Props {
  verdict: Verdict;
  lang: Language;
  userTier: UserTier;
  selectedPathId: string | null;
  onSelectPath: (id: string) => void;
  onClearPath: () => void;
  onReset: () => void;
  onShowPaywall: () => void;
}

export const VerdictView: React.FC<Props> = ({
  verdict, lang, userTier, selectedPathId,
  onSelectPath, onClearPath, onReset, onShowPaywall,
}) => {
  const t = UI_STRINGS[lang];
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = shareVerdict(verdict, lang);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (selectedPathId) {
    const path = verdict.paths.find(p => p.id === selectedPathId);
    if (!path) return null;
    return (
      <PathDetail
        path={path}
        lang={lang}
        userTier={userTier}
        onBack={onClearPath}
        onReset={onReset}
        onShowPaywall={onShowPaywall}
      />
    );
  }

  return (
    <div className="fade-in-up space-y-24">
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        <div className="inline-block border-b-2 border-bronze pb-2 mb-4 px-6">
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-bronze sans-tc">
            {verdict.isDarkVerdict ? t.shadowLabel : t.verdictTitle}
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl serif-tc font-medium text-ink leading-tight drop-shadow-sm">
          {verdict.diagnosis}
        </h2>
        <div className="max-w-2xl mx-auto">
          <p className="text-xl serif-tc italic text-gray-700 leading-loose border-l-4 border-gray-200 pl-6 text-left">
            {verdict.conflictResolution}
          </p>
        </div>
        <button
          onClick={handleShare}
          className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-gray-500 hover:text-bronze transition-colors sans-tc border border-gray-300 hover:border-bronze px-4 py-2"
        >
          {copied
            ? (lang === 'zh-TW' ? '✓ 已複製' : '✓ Copied')
            : (lang === 'zh-TW' ? '↗ 分享戰略報告' : '↗ Share Report')}
        </button>
      </div>

      {verdict.matrix && verdict.matrix.length > 0 && (
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-gray-500 sans-tc mb-2">
              {lang === 'zh-TW' ? '戰略衝突矩陣' : 'Strategic Conflict Matrix'}
            </h3>
            <div className="w-8 h-[1px] bg-bronze mx-auto" />
          </div>
          <StrategicTable matrix={verdict.matrix} lang={lang} />
        </div>
      )}

      <PathSelector
        paths={verdict.paths}
        lang={lang}
        userTier={userTier}
        onSelectPath={onSelectPath}
        onReset={onReset}
      />
    </div>
  );
};
