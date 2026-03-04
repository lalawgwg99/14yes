import React, { useState, useEffect } from 'react';
import { AGENTS } from './lib/constants';
import { useCouncil } from './hooks/useCouncil';
import { playClick } from './hooks/useSound';
import { getHistory, HistoryEntry } from './hooks/useHistory';

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

const App: React.FC = () => {
  const {
    state, dispatch,
    selectedCategory, setSelectedCategory,
    viewingAgent, setViewingAgent,
    errorState, setErrorState,
    handleStart, handleReset, toggleDarkMode,
  } = useCouncil();

  const row1 = AGENTS.slice(0, 7);
  const row2 = AGENTS.slice(7, 14);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (state.step === 'confessional') setHistory(getHistory());
  }, [state.step]);

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

      {/* Main */}
      <main className="pt-36 pb-24 px-4 md:px-0 max-w-4xl mx-auto flex-grow w-full">
        {state.loading ? (
          <WritingLoader lang={state.language} />
        ) : (
          <>
            {/* --- Confessional --- */}
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

                <InputForm
                  lang={state.language}
                  userTier={state.userTier}
                  input={state.input}
                  context={state.context}
                  selectedCategory={selectedCategory}
                  isDarkMode={state.isDarkMode}
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

            {/* --- Debate --- */}
            {state.step === 'debate' && (
              <DebateView
                messages={state.messages}
                currentSpeakerIndex={state.currentSpeakerIndex}
                lang={state.language}
                onProceedToVerdict={() => dispatch({ type: 'GO_TO_VERDICT' })}
                onSkipAll={() => dispatch({ type: 'SKIP_DEBATE' })}
              />
            )}

            {/* --- Verdict --- */}
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
        )}
      </main>

      <Footer lang={state.language} />
    </div>
  );
};

export default App;
