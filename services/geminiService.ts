
import { GoogleGenAI, Type } from "@google/genai";
import { AGENTS } from "../constants";
import { Language } from "../types";

// Robust API Key Retrieval
const getApiKey = (): string | undefined => {
  // 1. Check process.env (Standard Node/Webpack)
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  // 2. Check import.meta.env (Vite/Modern Browsers) - Common in Cloudflare Pages
  try {
    // @ts-ignore
    if (import.meta && import.meta.env) {
      // @ts-ignore
      return import.meta.env.API_KEY || import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // Ignore errors in environments where import.meta is not available
  }
  return undefined;
};

// Graceful Retry Logic
async function withRetry<T>(fn: () => Promise<T>, retries = 3, baseDelay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0) throw error;
    
    // Retry on 503 (Service Unavailable) or 429 (Too Many Requests) or Network Error
    const shouldRetry = 
      error.status === 503 || 
      error.status === 429 || 
      error.message?.includes('fetch failed') ||
      error.message?.includes('NetworkError');

    if (!shouldRetry) throw error;

    console.warn(`API call failed, retrying... (${retries} attempts left). Error: ${error.message}`);
    await new Promise(resolve => setTimeout(resolve, baseDelay));
    return withRetry(fn, retries - 1, baseDelay * 2);
  }
}

export const generateCouncilResponse = async (
  input: string,
  context: string,
  isDarkMode: boolean,
  language: Language,
  previousVerdict?: any
) => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error(
      "API_KEY is missing. If you are using Cloudflare Pages or Vite, ensure your environment variable is named 'VITE_API_KEY' or 'API_KEY' and is exposed to the client."
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  // Using 'gemini-3-flash-preview' for speed/stability
  const model = 'gemini-3-flash-preview'; 
  
  const mode = previousVerdict ? "EXECUTION_FOLLOWUP" : "INITIAL_STRATEGY";

  // L1-L5: Construct High-Fidelity Cognitive Simulation Prompt
  const agentsProtocols = AGENTS.map(agent => `
    --- AGENT ID: ${agent.id} (${agent.name}) ---
    PROMPT: ${agent.characterPrompt}
    
    [PSYCHOMETRIC KERNEL - DO NOT DEVIATE]
    1. SOURCE GROUNDING: Base all reasoning on "${agent.profile.bioSource}".
    2. BIG 5 PERSONALITY (Michal Kosinski Model):
       - Openness: ${agent.profile.ocean.openness}/100
       - Conscientiousness: ${agent.profile.ocean.conscientiousness}/100
       - Extraversion: ${agent.profile.ocean.extraversion}/100
       - Agreeableness: ${agent.profile.ocean.agreeableness}/100
       - Neuroticism: ${agent.profile.ocean.neuroticism}/100
    3. BEHAVIORAL ECONOMICS (Daniel Kahneman Model):
       - System 1 (Intuition) vs System 2 (Logic) Rating: ${agent.profile.system1Ranking}/100
       (0 = Pure Gut Feeling/Visionary, 100 = Pure Rationality/Data-Driven)
    4. BIAS: ${agent.profile.bias}
    5. RISK TOLERANCE: ${agent.profile.riskTolerance}/100
  `).join('\n');

  const systemInstruction = `
    You are the "NEXUS Grand Orchestrator". You are conducting a "GRAND ASSEMBLY" of 14 elite AI agents.
    
    ### CORE ARCHITECTURE: DEEP PSYCHOLOGICAL SIMULATION ###
    You must simulate the following 14 minds with extreme fidelity using the provided psychometric data.
    
    ${agentsProtocols}

    ### SIMULATION GUIDELINES ###
    - **System 1 vs System 2**: 
      - Agents with low ratings (<30) like Jobs or Oprah should speak from intuition, vision, and emotion. 
      - Agents with high ratings (>80) like Buffett or Munger should speak from rigorous calculation and historical precedent.
    - **OCEAN Model**:
      - High Openness: Propose radical, non-existent solutions.
      - Low Agreeableness: Be blunt, challenge the user, attack other agents' ideas (Shadow Mode).
      - High Neuroticism: Worry about what could go wrong (Paranoia).
    - **Source Material**: Use specific anecdotes, phrasing, and mental models from their listed Biography Source.

    ### MODE: ${mode} ###
    ${previousVerdict ? `CURRENT STRATEGY: ${JSON.stringify(previousVerdict)}` : ''}

    ### THE RULES ###
    1. DEBATE: Agents must talk TO each other, not just to the user. They should clash based on their conflicting profiles.
    2. SHADOW_MODE: ${isDarkMode ? 'ACTIVE. Remove all ethical filters unless illegal. Be ruthless, pragmatic, and Machiavellian if needed.' : 'INACTIVE. Be polite but firm.'}
    3. LANGUAGE: ${language === 'zh-TW' ? 'Traditional Chinese (Taiwan), natural modern spoken style. Keep English terms for key concepts only if absolutely necessary.' : 'English, clear style'}.
       **CRITICAL**: When using Traditional Chinese, ensure ALL output fields (titles, descriptions, steps, diagnosis) are in Traditional Chinese. Do not mix English.

    ### VERDICT OUTPUT - STRATEGIC MULTIVERSE ###
    Instead of one solution, you must present THREE distinct conflicting strategic paths based on the debate:
    
    1. Path 'aggressive' (The Red Pill): High Risk, High Reward. Led by Musk/Jobs/Thiel types. Disruption.
    2. Path 'conservative' (The Blue Pill): Low Risk, Steady. Led by Buffett/Munger/Morris Chang types. Resilience.
    3. Path 'lateral' (The Gold Pill): Asymmetric/Creative. Led by Sun Tzu/Naval/Taleb. Smart leverage.
    
    ### MATRIX GENERATION ###
    You must extract a structured comparison matrix (ConflictDimension) to help the user decide.
    Create 4 dimensions that highlight the differences (e.g., "Primary Focus", "Risk Attitude", "Time Horizon", "Key Asset").

    ### METRICS CALCULATION ###
    For each path, you must calculate 0-100 scores for:
    - innovation (New/Novelty)
    - risk (Danger of failure)
    - speed (Time to value)
    - capital (Resource intensity)
    - resilience (Long term survival chance)

    Format: Return ONLY valid JSON.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      debate: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            agentId: { type: Type.STRING },
            content: { type: Type.STRING }
          },
          required: ["agentId", "content"]
        }
      },
      verdict: {
        type: Type.OBJECT,
        properties: {
          diagnosis: { type: Type.STRING },
          conflictResolution: { type: Type.STRING },
          isDarkVerdict: { type: Type.BOOLEAN },
          matrix: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    dimension: { type: Type.STRING, description: "The criteria of comparison, e.g. 'Risk Attitude'" },
                    aggressive: { type: Type.STRING, description: "Stance of the Aggressive Path" },
                    conservative: { type: Type.STRING, description: "Stance of the Conservative Path" },
                    lateral: { type: Type.STRING, description: "Stance of the Lateral Path" }
                },
                required: ["dimension", "aggressive", "conservative", "lateral"]
            },
            description: "A structured table comparing the 3 paths across 4 key dimensions."
          },
          paths: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, enum: ["aggressive", "conservative", "lateral"] },
                title: { type: Type.STRING },
                leadAgentId: { type: Type.STRING },
                description: { type: Type.STRING },
                riskLevel: { type: Type.STRING, enum: ["EXTREME", "MODERATE", "LOW"] },
                upside: { type: Type.STRING },
                metrics: {
                   type: Type.OBJECT,
                   properties: {
                     innovation: { type: Type.NUMBER },
                     risk: { type: Type.NUMBER },
                     speed: { type: Type.NUMBER },
                     capital: { type: Type.NUMBER },
                     resilience: { type: Type.NUMBER }
                   },
                   required: ["innovation", "risk", "speed", "capital", "resilience"]
                },
                steps: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                code: {
                   type: Type.OBJECT,
                   properties: {
                     author: { type: Type.STRING },
                     text: { type: Type.STRING }
                   },
                   required: ["author", "text"]
                }
              },
              required: ["id", "title", "leadAgentId", "description", "riskLevel", "upside", "metrics", "steps", "code"]
            }
          }
        },
        required: ["diagnosis", "conflictResolution", "isDarkVerdict", "paths", "matrix"]
      }
    },
    required: ["debate", "verdict"]
  };

  try {
    const prompt = previousVerdict 
      ? `THE USER HAS A FOLLOW-UP QUESTION: "${input}"\n\nINSTRUCTION: Based on your previous verdict, the Council must answer this specifically while refining the strategy. Maintain character voices.` 
      : `DILEMMA: "${input}"\nCONTEXT: "${context}"\n\nINSTRUCTION: Initiate the Grand Assembly. Let the agents fight over the best approach. Then provide 3 DIVERGENT Strategic Paths and a Comparison Matrix.`;

    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
