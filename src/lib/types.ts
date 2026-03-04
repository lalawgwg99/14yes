
export type Cluster = 'A' | 'B' | 'C' | 'D' | 'E';

export interface OceanProfile {
  openness: number;          // O: Imagination, feelings, actions, ideas (0-100)
  conscientiousness: number; // C: Competence, self-discipline, thoughtfulness (0-100)
  extraversion: number;      // E: Sociability, assertiveness, emotional expression (0-100)
  agreeableness: number;     // A: Cooperative, trustworthy, good-natured (0-100)
  neuroticism: number;       // N: Tendency toward unstable emotions (0-100)
}

export interface CognitiveProfile {
  riskTolerance: number; // 0-100 (Conservative -> Reckless)
  timeHorizon: number;   // Years
  decisionSpeed: number; // 0-100 (Deliberate -> Instant)
  bias: string;          // Primary Cognitive Bias
  ocean: OceanProfile;   // NEW: Michal Kosinski's Big 5 Model
  system1Ranking: number; // NEW: Daniel Kahneman's Scale (0 = Pure Intuition/Sys1, 100 = Pure Logic/Sys2)
  bioSource: string;     // NEW: Authoritative Biography Source (e.g., Walter Isaacson)
}

export interface Agent {
  id: string;
  name: string;
  nameZh: string;
  title: string;
  cluster: Cluster;
  logic: string;
  logicEn: string;
  experience: string;
  experienceEn: string;
  avatar: string;
  color: string;
  characterPrompt: string; 
  isPremium: boolean; 
  profile: CognitiveProfile; // Simulation Engine Data
}

export interface DebateMessage {
  agentId: string;
  content: string;
}

export interface StrategicMetrics {
  innovation: number; 
  risk: number;      
  speed: number;     
  capital: number;   
  resilience: number;
}

export interface StrategicPath {
  id: 'aggressive' | 'conservative' | 'lateral';
  title: string; 
  leadAgentId: string; 
  description: string; 
  riskLevel: 'EXTREME' | 'MODERATE' | 'LOW';
  upside: string; 
  metrics: StrategicMetrics; 
  steps: string[]; 
  code: {
    author: string;
    text: string;
  };
}

// NEW: Structured Comparison Data
export interface ConflictDimension {
  dimension: string; // e.g., "Risk Attitude", "Time Horizon", "Core Asset"
  aggressive: string;
  conservative: string;
  lateral: string;
}

export interface Verdict {
  diagnosis: string;
  conflictResolution: string; 
  paths: StrategicPath[]; 
  matrix: ConflictDimension[]; // NEW: The comparison table data
  isDarkVerdict: boolean;
}

export type Language = 'zh-TW' | 'en';

export type UserTier = 'OBSERVER' | 'COMMANDER';

export interface AppState {
  step: 'confessional' | 'debate' | 'verdict';
  input: string;
  context: string; 
  language: Language;
  isDarkMode: boolean; 
  messages: DebateMessage[];
  finalVerdict: Verdict | null;
  loading: boolean;
  currentSpeakerIndex: number; 
  followUpInput: string;
  completedSteps: number[]; 
  selectedPathId: string | null; 
  userTier: UserTier; 
  showPaywall: boolean; 
}
