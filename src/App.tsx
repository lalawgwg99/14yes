import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AGENTS } from './lib/constants';
import { useCouncil } from './hooks/useCouncil';
import { useStock } from './hooks/useStock';
import { usePortfolio } from './hooks/usePortfolio';
import { playClick } from './hooks/useSound';
import { getHistory, HistoryEntry } from './hooks/useHistory';
import { UI_STRINGS } from './lib/constants';

import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { WritingLoader } from './components/ui/WritingLoader';

import { HeroSection } from './components/confessional/HeroSection';
import { AgentGrid } from './components/confessional/AgentGrid';
import { AgentMarquee } from './components/confessional/AgentMarquee';
import { InputForm } from './components/confessional/InputForm';

import { DebateView } from './components/debate/DebateView';
import { VerdictView } from './components/verdict/VerdictView';
import { HistoryPanel } from './components/confessional/HistoryPanel';

import { ErrorModal } from './components/modals/ErrorModal';
import { SubscriptionModal } from './components/modals/SubscriptionModal';
import { AgentDetailModal } from './components/agents/AgentDetailModal';

import { DashboardView } from './components/dashboard/DashboardView';
import { StockChart } from './components/charts/StockChart';
import { ScreenerView } from './components/screener/ScreenerView';
import { TradeJournal } from './components/journal/TradeJournal';
import { MarketOverview } from './components/market/MarketOverview';

const AppInner: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    state, dispatch,
    selectedCategory, setSelectedCategory,
    viewingAgent, setViewingAgent,
    errorState, setErrorState,
    handleStart, handleReset, toggleDarkMode,
  } = useCouncil();

  const stock = useStock();
  const portfolio = usePortfolio();

  const t = UI_STRINGS[state.language];
  const row1 = AGENTS.slice(0, 7);
  const row2 = AGENTS.slice(7, 14);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [chartRange, setChartRange] = useState('6mo');

  useEffect(() => {
    if (state.step === 'confessional') setHistory(getHistory());
  }, [state.step]);

  // Global Escape key to close modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewingAgent) setViewingAgent(null);
        else if (state.showPaywall) dispatch({ type: 'SHOW_PAYWALL', payload: false });
        else if (errorState) setErrorState(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [viewingAgent, state.showPaywall, errorState]);

  // Handle stock selection -> fetch quote + history
  const handleSelectStock = async (symbol: string) => {
    dispatch({ type: 'SET_SELECTED_SYMBOL', payload: symbol });
    const q = await stock.getQuote(symbol);
    if (q) dispatch({ type: 'SET_STOCK_QUOTE', payload: q });
    stock.getHistory(symbol, chartRange);
  };

  const handleChartRangeChange = (range: string) => {
    setChartRange(range);
    if (state.selectedSymbol) {
      stock.getHistory(state.selectedSymbol, range);
    }
  };

  // Navigate to analysis with a specific stock
  const handleAnalyzeFromDashboard = (symbol: string) => {
    navigate('/analysis');
    dispatch({ type: 'SET_ANALYSIS_MODE', payload: 'stock' });
    handleSelectStock(symbol);
  };

  const currentTab = location.pathname === '/dashboard' ? 'dashboard'
    : location.pathname === '/screener' ? 'screener'
    : location.pathname === '/journal' ? 'journal'
    : 'analysis';

  return (
    <div className="min-h-screen w-full selection:bg-[#F2E8DA] selection:text-black flex flex-col">
      {/* Modals */}
      {errorState && <ErrorModal error={errorState} onClose={() => setErrorState(null)} lang={state.language} />}
      {state.showPaywall && (
        <SubscriptionModal
          onClose={() => dispatch({ type: 'SHOW_PAYWALL', payload: false })}
          onPurchase={() => dispatch({ type: 'SET_TIER', payload: 'COMMANDER' })}
          lang={state.language}
        />
      )}
      {viewingAgent && (
        <AgentDetailModal agent={viewingAgent} onClose={() => setViewingAgent(null)} lang={state.language} userTier={state.userTier} />
      )}

      {/* Header */}
      <Header
        lang={state.language}
        userTier={state.userTier}
        onReset={handleReset}
        onToggleLang={() => dispatch({ type: 'TOGGLE_LANG' })}
        onShowPaywall={() => dispatch({ type: 'SHOW_PAYWALL', payload: true })}
      />

      {/* Tab Navigation */}
      <nav className="fixed top-[73px] w-full z-40 bg-paper/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto flex">
          {[
            { key: 'dashboard', path: '/dashboard', label: t.navDashboard },
            { key: 'analysis', path: '/analysis', label: t.navAnalysis },
            { key: 'screener', path: '/screener', label: t.navScreener },
            { key: 'journal', path: '/journal', label: t.navJournal },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { playClick(); navigate(tab.path); }}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${
                currentTab === tab.key
                  ? 'border-ink text-ink'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main className="pt-[140px] pb-24 px-4 md:px-0 max-w-4xl mx-auto flex-grow w-full">
        {state.loading ? (
          <WritingLoader lang={state.language} />
        ) : (
          <Routes>
            {/* Dashboard */}
            <Route path="/dashboard" element={
              <div className="space-y-12">
              <MarketOverview lang={state.language} onAnalyze={handleAnalyzeFromDashboard} />
              <DashboardView
                lang={state.language}
                positions={portfolio.portfolio.positions}
                quotes={portfolio.quotes}
                cash={portfolio.portfolio.cash}
                currency={portfolio.portfolio.currency}
                totalAssets={portfolio.totalAssets}
                todayPnL={portfolio.todayPnL}
                totalReturn={portfolio.totalReturn}
                totalMarketValue={portfolio.totalMarketValue}
                loading={portfolio.loading}
                onRefreshQuotes={portfolio.refreshQuotes}
                onAnalyze={handleAnalyzeFromDashboard}
                onAddPosition={portfolio.addPosition}
                onRemovePosition={portfolio.removePosition}
              />
              </div>
            } />

            {/* Analysis (main page) */}
            <Route path="/analysis" element={
              <>
                {state.step === 'confessional' && (
                  <div className="space-y-20 fade-in-up">
                    <HeroSection lang={state.language} />

                    <div className="mb-16 border-b border-gray-200 pb-12">
                      <AgentGrid
                        agents={AGENTS}
                        lang={state.language}
                        userTier={state.userTier}
                        onSelectAgent={(a) => { playClick(); setViewingAgent(a); }}
                      />
                      <div className="md:hidden space-y-6">
                        <AgentMarquee agents={row1} direction="left" onClick={(a) => { playClick(); setViewingAgent(a); }} userTier={state.userTier} lang={state.language} />
                        <AgentMarquee agents={row2} direction="right" onClick={(a) => { playClick(); setViewingAgent(a); }} userTier={state.userTier} lang={state.language} />
                      </div>
                    </div>

                    {/* Stock Chart (show when stock selected) */}
                    {state.selectedSymbol && state.analysisMode === 'stock' && (
                      <div className="max-w-3xl mx-auto">
                        <StockChart
                          history={stock.history}
                          loading={stock.historyLoading}
                          lang={state.language}
                          onRangeChange={handleChartRangeChange}
                          currentRange={chartRange}
                        />
                      </div>
                    )}

                    <InputForm
                      lang={state.language}
                      userTier={state.userTier}
                      input={state.input}
                      context={state.context}
                      selectedCategory={selectedCategory}
                      isDarkMode={state.isDarkMode}
                      analysisMode={state.analysisMode}
                      searchResults={stock.searchResults}
                      searching={stock.searching}
                      selectedQuote={state.stockQuote}
                      quoteLoading={stock.quoteLoading}
                      onSearchStock={stock.searchStocks}
                      onSelectStock={handleSelectStock}
                      onAnalysisModeChange={(mode) => dispatch({ type: 'SET_ANALYSIS_MODE', payload: mode })}
                      onInputChange={(v) => dispatch({ type: 'SET_INPUT', payload: v })}
                      onContextChange={(v) => dispatch({ type: 'SET_CONTEXT', payload: v })}
                      onCategoryChange={setSelectedCategory}
                      onToggleDarkMode={toggleDarkMode}
                      onSubmit={() => handleStart(false)}
                    />

                    <HistoryPanel
                      entries={history}
                      lang={state.language}
                      onSelect={(entry) => {
                        dispatch({ type: 'SET_RESULT', payload: { messages: [], verdict: entry.verdict } });
                        dispatch({ type: 'GO_TO_VERDICT' });
                      }}
                      onRefresh={() => setHistory(getHistory())}
                    />
                  </div>
                )}

                {state.step === 'debate' && (
                  <DebateView
                    messages={state.messages}
                    currentSpeakerIndex={state.currentSpeakerIndex}
                    lang={state.language}
                    onProceedToVerdict={() => dispatch({ type: 'GO_TO_VERDICT' })}
                    onSkipAll={() => dispatch({ type: 'SKIP_DEBATE' })}
                  />
                )}

                {state.step === 'verdict' && state.finalVerdict && (
                  <VerdictView
                    verdict={state.finalVerdict}
                    lang={state.language}
                    userTier={state.userTier}
                    selectedPathId={state.selectedPathId}
                    followUpInput={state.followUpInput}
                    onFollowUpChange={(v) => dispatch({ type: 'SET_FOLLOW_UP', payload: v })}
                    onFollowUpSubmit={() => handleStart(true)}
                    onSelectPath={(id) => dispatch({ type: 'SELECT_PATH', payload: id })}
                    onClearPath={() => dispatch({ type: 'CLEAR_PATH' })}
                    onReset={handleReset}
                    onShowPaywall={() => dispatch({ type: 'SHOW_PAYWALL', payload: true })}
                  />
                )}
              </>
            } />

            {/* Screener */}
            <Route path="/screener" element={
              <ScreenerView
                lang={state.language}
                onAnalyze={handleAnalyzeFromDashboard}
              />
            } />

            {/* Journal */}
            <Route path="/journal" element={
              <div className="space-y-12 fade-in-up">
                <TradeJournal lang={state.language} />
                <HistoryPanel
                  entries={history}
                  lang={state.language}
                  onSelect={(entry) => {
                    navigate('/analysis');
                    dispatch({ type: 'SET_RESULT', payload: { messages: [], verdict: entry.verdict } });
                    dispatch({ type: 'GO_TO_VERDICT' });
                  }}
                  onRefresh={() => setHistory(getHistory())}
                />
              </div>
            } />

            {/* Default redirect */}
            <Route path="*" element={
              <div className="space-y-20 fade-in-up">
                <HeroSection lang={state.language} />
                <div className="text-center">
                  <button
                    onClick={() => navigate('/analysis')}
                    className="editorial-btn px-10 py-3.5 text-xs font-bold tracking-[0.25em]"
                  >
                    {t.startDebate}
                  </button>
                </div>
              </div>
            } />
          </Routes>
        )}
      </main>

      <Footer lang={state.language} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
};

export default App;
