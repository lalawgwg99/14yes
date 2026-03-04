import React from 'react';
import { ConflictDimension, Language } from '../../lib/types';
import { UI_STRINGS } from '../../lib/constants';

interface Props {
  matrix: ConflictDimension[];
  lang: Language;
}

export const StrategicTable: React.FC<Props> = ({ matrix, lang }) => {
  const t = UI_STRINGS[lang];
  return (
    <div className="w-full overflow-x-auto pb-4">
      {/* Desktop table */}
      <div className="hidden md:block min-w-[600px] border border-[#E0E0E0] bg-white/60 shadow-sm torn-paper relative">
        <div className="grid grid-cols-4 bg-ink text-white border-b border-ink">
          <div className="p-4 flex items-center justify-center border-r border-gray-700">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] sans-tc">
              {t.dimensionHeader}
            </span>
          </div>
          <div className="p-4 flex items-center justify-center border-r border-gray-700 bg-red-900/30">
            <span className="text-xs font-bold uppercase tracking-widest serif-tc text-red-100">
              {t.pathAggressive}
            </span>
          </div>
          <div className="p-4 flex items-center justify-center border-r border-gray-700 bg-blue-900/30">
            <span className="text-xs font-bold uppercase tracking-widest serif-tc text-blue-100">
              {t.pathConservative}
            </span>
          </div>
          <div className="p-4 flex items-center justify-center bg-bronze/30">
            <span className="text-xs font-bold uppercase tracking-widest serif-tc text-[#E5E0D6]">
              {t.pathLateral}
            </span>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {matrix.map((row, idx) => (
            <div key={idx} className="grid grid-cols-4 group hover:bg-white/80 transition-colors">
              <div className="p-4 flex items-center justify-center border-r border-gray-200 bg-gray-50/50">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 sans-tc text-center">{row.dimension}</span>
              </div>
              <div className="p-4 border-r border-gray-100">
                <p className="text-sm serif-tc text-gray-800 leading-relaxed text-center group-hover:text-red-900 transition-colors">{row.aggressive}</p>
              </div>
              <div className="p-4 border-r border-gray-100">
                <p className="text-sm serif-tc text-gray-800 leading-relaxed text-center group-hover:text-blue-900 transition-colors">{row.conservative}</p>
              </div>
              <div className="p-4">
                <p className="text-sm serif-tc text-gray-800 leading-relaxed text-center group-hover:text-bronze transition-colors">{row.lateral}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {matrix.map((row, idx) => (
          <div key={idx} className="magazine-card p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 sans-tc border-b border-gray-100 pb-2">{row.dimension}</h4>
            <div className="space-y-2">
              <div className="flex gap-2"><span className="text-red-700 text-xs font-bold w-12 shrink-0">{t.pathAggShort}</span><span className="text-sm serif-tc text-gray-800">{row.aggressive}</span></div>
              <div className="flex gap-2"><span className="text-blue-700 text-xs font-bold w-12 shrink-0">{t.pathConShort}</span><span className="text-sm serif-tc text-gray-800">{row.conservative}</span></div>
              <div className="flex gap-2"><span className="text-bronze text-xs font-bold w-12 shrink-0">{t.pathLatShort}</span><span className="text-sm serif-tc text-gray-800">{row.lateral}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
