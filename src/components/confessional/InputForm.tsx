import React, { useState } from 'react';
import { Language, UserTier, AnalysisMode, StockQuote, StockSearchResult } from '../../lib/types';
import { UI_STRINGS, CATEGORIES, HOT_TW_STOCKS, HOT_US_STOCKS } from '../../lib/constants';
import { playClick } from '../../hooks/useSound';
import { detectSensitiveItems } from '../../lib/sanitizer';

interface Props {
  lang: Language;
  userTier: UserTier;
  input: string;
  context: string;
  selectedCategory: string;
  isDarkMode: boolean;
  analysisMode: AnalysisMode;
  // Stock search
  searchResults: StockSearchResult[];
  searching: boolean;
  selectedQuote: StockQuote | null;
  quoteLoading: boolean;
  onSearchStock: (query: string) => void;
  onSelectStock: (symbol: string) => void;
  onAnalysisModeChange: (mode: AnalysisMode) => void;
  // Original
  onInputChange: (value: string) => void;
  onContextChange: (value: string) => void;
  onCategoryChange: (cat: string) => void;
  onToggleDarkMode: () => void;
  onSubmit: () => void;
}

export const InputForm: React.FC<Props> = ({
  lang, userTier, input, context, selectedCategory, isDarkMode,
  analysisMode, searchResults, searching, selectedQuote, quoteLoading,
  onSearchStock, onSelectStock, onAnalysisModeChange,
  onInputChange, onContextChange, onCategoryChange, onToggleDarkMode, onSubmit,
}) => {
  const t = UI_STRINGS[lang];
  const [privacyMode, setPrivacyMode] = useState(false);
  const [stockSearch, setStockSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [hotTab, setHotTab] = useState<'tw' | 'us'>('tw');
  const sensitiveItems = privacyMode ? detectSensitiveItems(input + ' ' + context) : [];

  const handleSearchChange = (val: string) => {
    setStockSearch(val);
    onSearchStock(val);
    setShowDropdown(val.length > 0);
  };

  const handleSelectResult = (symbol: string) => {
    setShowDropdown(false);
    setStockSearch('');
    onSelectStock(symbol);
  };

  return (
    <div className="magazine-card p-10 md:p-16 relative max-w-3xl mx-auto torn-paper">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-paper px-6 text-xs serif-tc italic text-gray-500 border border-border py-1 font-medium">
        {t.inputLabel}
      </div>

      <div className="space-y-12">
        {/* Mode Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => { playClick(); onAnalysisModeChange('stock'); }}
            className={`px-6 py-3 text-sm font-bold tracking-wider transition-all border-b-2 ${analysisMode === 'stock' ? 'border-ink text-ink' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            {t.stockAnalysisTab}
          </button>
          <button
            onClick={() => { playClick(); onAnalysisModeChange('free'); }}
            className={`px-6 py-3 text-sm font-bold tracking-wider transition-all border-b-2 ${analysisMode === 'free' ? 'border-ink text-ink' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            {t.freeQuestionTab}
          </button>
        </div>

        {/* Stock Analysis Mode */}
        {analysisMode === 'stock' && (
          <>
            {/* Search Box */}
            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-5 sans-tc">{t.searchStock}</label>
              <input
                type="text"
                value={stockSearch}
                onChange={e => handleSearchChange(e.target.value)}
                onFocus={() => stockSearch.length > 0 && setShowDropdown(true)}
                placeholder={t.searchStock}
                className="w-full bg-transparent border-0 border-b-2 border-gray-200 serif-tc text-xl leading-relaxed focus:ring-0 focus:border-bronze placeholder-gray-400 p-2 transition-colors text-gray-800"
              />
              {searching && <span className="absolute right-2 top-12 text-gray-400 text-sm animate-pulse">...</span>}

              {/* Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map(r => (
                    <button
                      key={r.symbol}
                      onClick={() => handleSelectResult(r.symbol)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex justify-between items-center border-b border-gray-50"
                    >
                      <div>
                        <span className="font-bold text-sm text-ink">{r.symbol}</span>
                        <span className="text-gray-500 text-sm ml-2">{r.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{r.exchangeDisplay}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hot Stocks */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <label className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 sans-tc">{t.hotStocks}</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setHotTab('tw')}
                    className={`px-2 py-0.5 text-xs rounded ${hotTab === 'tw' ? 'bg-ink text-white' : 'bg-gray-100 text-gray-500'}`}
                  >{t.twStocks}</button>
                  <button
                    onClick={() => setHotTab('us')}
                    className={`px-2 py-0.5 text-xs rounded ${hotTab === 'us' ? 'bg-ink text-white' : 'bg-gray-100 text-gray-500'}`}
                  >{t.usStocks}</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(hotTab === 'tw' ? HOT_TW_STOCKS : HOT_US_STOCKS).map(s => (
                  <button
                    key={s.symbol}
                    onClick={() => { playClick(); onSelectStock(s.symbol); }}
                    className="px-3 py-1.5 text-sm border border-gray-200 hover:border-ink hover:bg-ink hover:text-white transition-all rounded"
                  >
                    <span className="font-bold">{s.symbol}</span>
                    <span className="text-gray-500 ml-1 text-xs">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Quote Card */}
            {quoteLoading && (
              <div className="bg-gray-50 border border-gray-200 p-6 text-center text-gray-400 animate-pulse">
                {t.loading}
              </div>
            )}
            {selectedQuote && !quoteLoading && (
              <div className="bg-gray-50 border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-ink">{selectedQuote.symbol}</h3>
                    <p className="text-gray-500 text-sm">{selectedQuote.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{selectedQuote.price.toFixed(2)}</p>
                    <p className={`text-lg font-bold ${selectedQuote.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedQuote.change >= 0 ? '+' : ''}{selectedQuote.change.toFixed(2)} ({selectedQuote.changePercent >= 0 ? '+' : ''}{selectedQuote.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">{t.volume}</span>
                    <p className="font-bold">{selectedQuote.volume?.toLocaleString()}</p>
                  </div>
                  {selectedQuote.fiftyTwoWeekHigh && (
                    <div>
                      <span className="text-gray-400">{t.high52w}</span>
                      <p className="font-bold">{selectedQuote.fiftyTwoWeekHigh.toFixed(2)}</p>
                    </div>
                  )}
                  {selectedQuote.fiftyTwoWeekLow && (
                    <div>
                      <span className="text-gray-400">{t.low52w}</span>
                      <p className="font-bold">{selectedQuote.fiftyTwoWeekLow.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Context for stock */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-5 sans-tc">
                {t.contextLabel}
              </label>
              <textarea
                value={context}
                onChange={e => onContextChange(e.target.value)}
                placeholder={t.contextPlaceholder}
                className="w-full h-24 bg-transparent border-0 border-b border-gray-200 resize-none serif-tc text-base leading-relaxed focus:ring-0 focus:border-bronze placeholder-gray-400 p-2 transition-colors text-gray-600"
              />
            </div>
          </>
        )}

        {/* Free Question Mode */}
        {analysisMode === 'free' && (
          <>
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-5 sans-tc">{t.categoryLabel}</label>
              <div className="flex flex-wrap gap-3">
                {CATEGORIES[lang].map(cat => (
                  <button
                    key={cat}
                    onClick={() => { playClick(); onCategoryChange(cat); }}
                    className={`px-5 py-2.5 text-sm serif-tc transition-all border ${selectedCategory === cat ? 'border-ink bg-ink text-white shadow-md' : 'border-[#E0E0E0] text-gray-700 hover:border-[#B0B0B0] bg-white/50'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-5 sans-tc">{t.inputLabel}</label>
              <textarea
                value={input}
                onChange={e => onInputChange(e.target.value)}
                placeholder={t.confessionalPrompt}
                className="w-full h-40 bg-transparent border-0 border-b-2 border-gray-200 resize-none serif-tc text-xl leading-relaxed focus:ring-0 focus:border-bronze placeholder-gray-400 p-2 transition-colors text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-5 sans-tc">
                {t.contextLabel}
              </label>
              <textarea
                value={context}
                onChange={e => onContextChange(e.target.value)}
                placeholder={t.contextPlaceholder}
                className="w-full h-24 bg-transparent border-0 border-b border-gray-200 resize-none serif-tc text-base leading-relaxed focus:ring-0 focus:border-bronze placeholder-gray-400 p-2 transition-colors text-gray-600"
              />
            </div>
          </>
        )}

        {/* Privacy + Dark Mode Row */}
        <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-gray-100">
          <button
            onClick={() => { playClick(); setPrivacyMode(!privacyMode); }}
            className={`flex items-center gap-3 text-xs font-bold uppercase tracking-widest transition-colors sans-tc ${privacyMode ? 'text-green-700' : 'text-gray-500 hover:text-black'}`}
          >
            <span className={`w-3 h-3 rounded-full border ${privacyMode ? 'bg-green-600 border-green-600' : 'border-gray-500'}`} />
            {t.privacyMode}
          </button>

          <button
            onClick={onToggleDarkMode}
            className={`flex items-center gap-3 text-xs font-bold uppercase tracking-widest transition-colors sans-tc ${isDarkMode ? 'text-[#8C7000]' : 'text-gray-500 hover:text-black'}`}
          >
            <span className={`w-3 h-3 rounded-full border ${isDarkMode ? 'bg-[#8C7000] border-[#8C7000]' : 'border-gray-500'}`} />
            {t.darkMode}
            {userTier === 'OBSERVER' && <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-1">LOCKED</span>}
          </button>

          <div className="flex-grow" />

          <button
            onClick={onSubmit}
            disabled={analysisMode === 'stock' ? !selectedQuote : (!input && !selectedCategory)}
            className="editorial-btn px-10 py-3.5 text-xs font-bold tracking-[0.25em] disabled:opacity-50"
          >
            {t.startDebate}
          </button>
        </div>

        {/* Privacy warnings */}
        {privacyMode && sensitiveItems.length > 0 && (
          <div className="bg-green-50 border border-green-200 p-4 text-xs sans-tc text-green-800 space-y-2">
            <p className="font-bold">{t.privacyDetected}</p>
            <ul className="list-disc pl-5 space-y-1">
              {sensitiveItems.slice(0, 8).map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        )}

        <p className="text-[10px] text-gray-400 sans-tc text-center">
          {t.privacyDisclaimer}
        </p>
      </div>
    </div>
  );
};
