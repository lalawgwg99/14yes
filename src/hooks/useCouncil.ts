import { useReducer, useEffect, useState } from 'react';
import { AppState, Language, Agent, UserTier } from '../lib/types';
import { generateCouncilResponse } from '../services/geminiService';
import { playClick } from './useSound';
import { saveToHistory } from './useHistory';

// --- Actions ---
type Action =
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'SET_CONTEXT'; payload: string }
  | { type: 'SET_FOLLOW_UP'; payload: string }
  | { type: 'TOGGLE_LANG' }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RESULT'; payload: { messages: any[]; verdict: any } }
  | { type: 'ADVANCE_SPEAKER' }
  | { type: 'INIT_SPEAKER' }
  | { type: 'GO_TO_VERDICT' }
  | { type: 'SELECT_PATH'; payload: string }
  | { type: 'CLEAR_PATH' }
  | { type: 'SHOW_PAYWALL'; payload: boolean }
  | { type: 'SET_TIER'; payload: UserTier }
  | { type: 'RESET' };

const initialState: AppState = {
  step: 'confessional',
  input: '',
  context: '',
  language: 'zh-TW',
  isDarkMode: false,
  messages: [],
  finalVerdict: null,
  loading: false,
  currentSpeakerIndex: -1,
  followUpInput: '',
  completedSteps: [],
  selectedPathId: null,
  userTier: 'COMMANDER',
  showPaywall: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_INPUT':
      return { ...state, input: action.payload };
    case 'SET_CONTEXT':
      return { ...state, context: action.payload };
    case 'SET_FOLLOW_UP':
      return { ...state, followUpInput: action.payload };
    case 'TOGGLE_LANG':
      return { ...state, language: state.language === 'zh-TW' ? 'en' : 'zh-TW' };
    case 'TOGGLE_DARK_MODE':
      return { ...state, isDarkMode: !state.isDarkMode };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_RESULT':
      return {
        ...state,
        messages: action.payload.messages,
        finalVerdict: action.payload.verdict,
        step: 'debate',
        loading: false,
        currentSpeakerIndex: -1,
        followUpInput: '',
        completedSteps: [],
        selectedPathId: null,
      };
    case 'ADVANCE_SPEAKER':
      return { ...state, currentSpeakerIndex: state.currentSpeakerIndex + 1 };
    case 'INIT_SPEAKER':
      return { ...state, currentSpeakerIndex: 0 };
    case 'GO_TO_VERDICT':
      return { ...state, step: 'verdict' };
    case 'SELECT_PATH':
      return { ...state, selectedPathId: action.payload, completedSteps: [] };
    case 'CLEAR_PATH':
      return { ...state, selectedPathId: null };
    case 'SHOW_PAYWALL':
      return { ...state, showPaywall: action.payload };
    case 'SET_TIER':
      return { ...state, userTier: action.payload, showPaywall: false };
    case 'RESET':
      return {
        ...state,
        step: 'confessional',
        input: '',
        messages: [],
        finalVerdict: null,
        loading: false,
        currentSpeakerIndex: -1,
        selectedPathId: null,
      };
    default:
      return state;
  }
}

export function useCouncil() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewingAgent, setViewingAgent] = useState<Agent | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Dark mode body class
  useEffect(() => {
    document.body.classList.toggle('dark-mode', state.isDarkMode);
  }, [state.isDarkMode]);

  // Auto-advance debate speakers
  useEffect(() => {
    if (state.step === 'debate' && state.messages.length > 0) {
      if (state.currentSpeakerIndex === -1) {
        dispatch({ type: 'INIT_SPEAKER' });
      } else if (state.currentSpeakerIndex < state.messages.length - 1) {
        const currentMsg = state.messages[state.currentSpeakerIndex];
        const readingTime = Math.max(1500, 1000 + (currentMsg.content.length * 20));
        const timer = setTimeout(() => dispatch({ type: 'ADVANCE_SPEAKER' }), readingTime);
        return () => clearTimeout(timer);
      }
    }
  }, [state.step, state.messages, state.currentSpeakerIndex]);

  const handleStart = async (isFollowUp = false) => {
    playClick();
    const query = isFollowUp ? state.followUpInput : (state.input || selectedCategory);
    if (!query) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    setErrorState(null);

    try {
      const result = await generateCouncilResponse(
        query,
        state.context,
        state.isDarkMode,
        state.language,
        isFollowUp ? state.finalVerdict : undefined
      );
      dispatch({ type: 'SET_RESULT', payload: { messages: result.debate, verdict: result.verdict } });
      // Save to history
      saveToHistory(query, result.verdict, state.language);
    } catch (err: any) {
      console.error(err);
      dispatch({ type: 'SET_LOADING', payload: false });
      setErrorState(err.message || "Unknown error occurred.");
    }
  };

  const handleReset = () => {
    playClick();
    if (window.confirm(state.language === 'zh-TW' ? '確定要重新開始嗎？' : 'Are you sure you want to restart?')) {
      dispatch({ type: 'RESET' });
      setSelectedCategory('');
      setErrorState(null);
      window.scrollTo(0, 0);
    }
  };

  const toggleDarkMode = () => {
    playClick();
    if (state.userTier === 'OBSERVER') {
      dispatch({ type: 'SHOW_PAYWALL', payload: true });
    } else {
      dispatch({ type: 'TOGGLE_DARK_MODE' });
    }
  };

  return {
    state,
    dispatch,
    selectedCategory,
    setSelectedCategory,
    viewingAgent,
    setViewingAgent,
    errorState,
    setErrorState,
    handleStart,
    handleReset,
    toggleDarkMode,
  };
}
