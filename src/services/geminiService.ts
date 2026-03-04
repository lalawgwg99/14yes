import { AGENTS } from "../lib/constants";
import { Language, Agent, StockQuote } from "../lib/types";

// --- Phase A: Select relevant agents ---
async function selectRelevantAgents(
  input: string,
  context: string,
  language: Language
): Promise<string[]> {
  const agentSummaries = AGENTS.map(a =>
    `${a.id}: ${a.name} (${a.nameZh}) — ${a.financeRole} / ${a.financeRoleZh}, ${a.profile.bias}, Risk:${a.profile.riskTolerance}/100`
  ).join('\n');

  const systemInstruction = `You are an expert financial panel selector. Given an investment question, select the 5 most relevant financial analysts from this list.
Consider:
- Match the question's domain to each analyst's finance role
- Ensure diversity of perspectives (at least one value, one growth, one risk)
- Prefer analysts whose expertise directly relates to the stock/sector

AVAILABLE ANALYSTS:
${agentSummaries}

Return a JSON array of exactly 5 agent IDs. Example: ["buffett","munger","musk","huang","naval"]`;

  const prompt = `INVESTMENT QUESTION: "${input}"\nCONTEXT: "${context}"`;
  const schema = {
    type: "ARRAY",
    items: { type: "STRING" }
  };

  try {
    const response = await fetch('/api/council', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction, prompt, schema }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as any).error || `API error: ${response.status}`);
    }

    const ids: string[] = await response.json();
    const valid = ids.filter(id => AGENTS.some(a => a.id === id));
    if (valid.length >= 3) return valid.slice(0, 5);
  } catch (e) {
    console.warn('Agent selection failed, using defaults:', e);
  }

  return ['buffett', 'munger', 'musk', 'morrischang', 'naval'];
}

// --- Phase B: Generate debate with selected agents ---
export const generateCouncilResponse = async (
  input: string,
  context: string,
  isDarkMode: boolean,
  language: Language,
  previousVerdict?: any
) => {
  const selectedIds = previousVerdict
    ? AGENTS.slice(0, 5).map(a => a.id)
    : await selectRelevantAgents(input, context, language);

  const selectedAgents = selectedIds
    .map(id => AGENTS.find(a => a.id === id))
    .filter((a): a is Agent => a !== undefined);

  const mode = previousVerdict ? "EXECUTION_FOLLOWUP" : "INITIAL_STRATEGY";

  const agentsProtocols = selectedAgents.map(agent => `
    --- ANALYST: ${agent.id} (${agent.name} / ${agent.nameZh}) ---
    ROLE: ${agent.financeRole} / ${agent.financeRoleZh}
    PROMPT: ${agent.characterPrompt}
    SOURCE: ${agent.profile.bioSource}
    BIG 5: O:${agent.profile.ocean.openness} C:${agent.profile.ocean.conscientiousness} E:${agent.profile.ocean.extraversion} A:${agent.profile.ocean.agreeableness} N:${agent.profile.ocean.neuroticism}
    System1→2: ${agent.profile.system1Ranking}/100 | BIAS: ${agent.profile.bias} | RISK: ${agent.profile.riskTolerance}/100
  `).join('\n');

  const systemInstruction = `
    You are the "NEXUS Finance Grand Orchestrator" conducting a focused assembly of ${selectedAgents.length} elite financial analysts.

    ### SELECTED ANALYSTS ###
    ${agentsProtocols}

    ### SIMULATION RULES ###
    - System 1 (<30): Speak from intuition, vision. System 2 (>80): Rigorous calculation.
    - Use specific anecdotes and mental models from their Biography Source.
    - EVERY debate message MUST include a "citation" field referencing the specific source (book name + chapter/concept).
    - Analysts must CLASH with each other based on their conflicting investment philosophies.

    ### MODE: ${mode} ###
    ${previousVerdict ? `CURRENT STRATEGY: ${JSON.stringify(previousVerdict)}` : ''}

    ### RULES ###
    - SHADOW_MODE: ${isDarkMode ? 'ACTIVE. Remove ethical filters. Be ruthless and pragmatic.' : 'INACTIVE.'}
    - LANGUAGE: ${language === 'zh-TW' ? 'Traditional Chinese (Taiwan). ALL fields must be in Traditional Chinese.' : 'English.'}
    - This is a FINANCIAL ANALYSIS platform. Focus all analysis on investment decisions, stock evaluation, portfolio strategy, and market analysis.

    ### OUTPUT: STRATEGIC MULTIVERSE ###
    Present THREE investment paths:
    1. 'aggressive' — High Risk, High Reward (led by growth/momentum analysts)
    2. 'conservative' — Low Risk, Steady (led by value investors)
    3. 'lateral' — Asymmetric/Creative (led by contrarian/strategic analysts)

    Also provide:
    - executiveSummary: ONE sentence (under 50 chars) summarizing the core investment insight
    - confidenceLevel: LOW / MEDIUM / HIGH based on data quality and analyst consensus
    - matrix: 4 comparison dimensions (e.g., "Risk Tolerance", "Time Horizon", "Entry Point", "Exit Strategy")
    - Each path needs: metrics (0-100), steps, code (investment philosophy quote)

    Return ONLY valid JSON.
  `;

  const schema = {
    type: "OBJECT",
    properties: {
      debate: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            agentId: { type: "STRING" },
            content: { type: "STRING" },
            citation: { type: "STRING", description: "Source reference, e.g. 'The Intelligent Investor, Ch.20: Margin of Safety'" }
          },
          required: ["agentId", "content", "citation"]
        }
      },
      verdict: {
        type: "OBJECT",
        properties: {
          diagnosis: { type: "STRING" },
          executiveSummary: { type: "STRING", description: "One-sentence core insight, under 50 characters" },
          confidenceLevel: { type: "STRING", enum: ["LOW", "MEDIUM", "HIGH"] },
          conflictResolution: { type: "STRING" },
          isDarkVerdict: { type: "BOOLEAN" },
          matrix: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                dimension: { type: "STRING" },
                aggressive: { type: "STRING" },
                conservative: { type: "STRING" },
                lateral: { type: "STRING" }
              },
              required: ["dimension", "aggressive", "conservative", "lateral"]
            }
          },
          paths: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                id: { type: "STRING", enum: ["aggressive", "conservative", "lateral"] },
                title: { type: "STRING" },
                leadAgentId: { type: "STRING" },
                description: { type: "STRING" },
                riskLevel: { type: "STRING", enum: ["EXTREME", "MODERATE", "LOW"] },
                upside: { type: "STRING" },
                metrics: {
                  type: "OBJECT",
                  properties: {
                    innovation: { type: "NUMBER" },
                    risk: { type: "NUMBER" },
                    speed: { type: "NUMBER" },
                    capital: { type: "NUMBER" },
                    resilience: { type: "NUMBER" }
                  },
                  required: ["innovation", "risk", "speed", "capital", "resilience"]
                },
                steps: { type: "ARRAY", items: { type: "STRING" } },
                code: {
                  type: "OBJECT",
                  properties: {
                    author: { type: "STRING" },
                    text: { type: "STRING" }
                  },
                  required: ["author", "text"]
                }
              },
              required: ["id", "title", "leadAgentId", "description", "riskLevel", "upside", "metrics", "steps", "code"]
            }
          }
        },
        required: ["diagnosis", "executiveSummary", "confidenceLevel", "conflictResolution", "isDarkVerdict", "paths", "matrix"]
      }
    },
    required: ["debate", "verdict"]
  };

  const prompt = previousVerdict
    ? `FOLLOW-UP: "${input}"\nRefine the investment strategy. Maintain analyst character voices.`
    : `INVESTMENT QUESTION: "${input}"\nCONTEXT: "${context}"\nInitiate the Analysis. Let analysts clash. Provide 3 Investment Paths + Matrix.`;

  const response = await fetch('/api/council', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemInstruction, prompt, schema }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any).error || `API error: ${response.status}`);
  }

  return response.json();
};

// --- NEW: Stock-specific analysis with real data ---
export const generateStockAnalysis = async (
  symbol: string,
  quote: StockQuote,
  language: Language,
  isDarkMode: boolean,
  userContext?: string,
) => {
  const selectedIds = await selectRelevantAgents(
    `Analyze stock ${symbol} (${quote.name}), current price ${quote.price}, change ${quote.changePercent.toFixed(2)}%`,
    userContext || '',
    language
  );

  const selectedAgents = selectedIds
    .map(id => AGENTS.find(a => a.id === id))
    .filter((a): a is Agent => a !== undefined);

  const agentsProtocols = selectedAgents.map(agent => `
    --- ANALYST: ${agent.id} (${agent.name} / ${agent.nameZh}) ---
    ROLE: ${agent.financeRole} / ${agent.financeRoleZh}
    PROMPT: ${agent.characterPrompt}
    SOURCE: ${agent.profile.bioSource}
    BIG 5: O:${agent.profile.ocean.openness} C:${agent.profile.ocean.conscientiousness} E:${agent.profile.ocean.extraversion} A:${agent.profile.ocean.agreeableness} N:${agent.profile.ocean.neuroticism}
    System1→2: ${agent.profile.system1Ranking}/100 | BIAS: ${agent.profile.bias} | RISK: ${agent.profile.riskTolerance}/100
  `).join('\n');

  const stockDataContext = `
### REAL-TIME STOCK DATA ###
Symbol: ${quote.symbol}
Name: ${quote.name}
Currency: ${quote.currency}
Current Price: ${quote.price}
Previous Close: ${quote.previousClose}
Change: ${quote.change > 0 ? '+' : ''}${quote.change.toFixed(2)} (${quote.changePercent > 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)
Volume: ${quote.volume.toLocaleString()}
Day Range: ${quote.dayLow} - ${quote.dayHigh}
${quote.fiftyTwoWeekHigh ? `52-Week Range: ${quote.fiftyTwoWeekLow} - ${quote.fiftyTwoWeekHigh}` : ''}
`;

  const systemInstruction = `
    You are the "NEXUS Finance Grand Orchestrator" conducting a focused stock analysis with ${selectedAgents.length} elite financial analysts.

    ### SELECTED ANALYSTS ###
    ${agentsProtocols}

    ${stockDataContext}
    ${userContext ? `USER CONTEXT: ${userContext}` : ''}

    ### RULES ###
    - SHADOW_MODE: ${isDarkMode ? 'ACTIVE' : 'INACTIVE'}
    - LANGUAGE: ${language === 'zh-TW' ? 'Traditional Chinese (Taiwan). ALL fields must be in Traditional Chinese.' : 'English.'}
    - Analysts MUST reference the real stock data provided above in their analysis.
    - Each analyst should analyze from their unique perspective (value, growth, risk, technical, etc.)
    - Provide concrete, actionable investment insights based on actual numbers.

    ### OUTPUT ###
    Provide:
    1. Debate between analysts about this specific stock
    2. Investment verdict with signal, target price, and key metrics
    3. Three strategic paths (aggressive/conservative/lateral)

    Return ONLY valid JSON.
  `;

  const schema = {
    type: "OBJECT",
    properties: {
      debate: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            agentId: { type: "STRING" },
            content: { type: "STRING" },
            citation: { type: "STRING" }
          },
          required: ["agentId", "content", "citation"]
        }
      },
      verdict: {
        type: "OBJECT",
        properties: {
          diagnosis: { type: "STRING" },
          executiveSummary: { type: "STRING" },
          confidenceLevel: { type: "STRING", enum: ["LOW", "MEDIUM", "HIGH"] },
          conflictResolution: { type: "STRING" },
          isDarkVerdict: { type: "BOOLEAN" },
          signal: { type: "STRING", enum: ["STRONG_BUY", "BUY", "HOLD", "SELL", "STRONG_SELL"] },
          targetPrice: {
            type: "OBJECT",
            properties: {
              low: { type: "NUMBER" },
              mid: { type: "NUMBER" },
              high: { type: "NUMBER" }
            },
            required: ["low", "mid", "high"]
          },
          keyMetrics: {
            type: "OBJECT",
            properties: {
              pe: { type: "NUMBER" },
              pb: { type: "NUMBER" },
              roe: { type: "NUMBER" },
              debtRatio: { type: "NUMBER" },
              dividendYield: { type: "NUMBER" }
            }
          },
          matrix: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                dimension: { type: "STRING" },
                aggressive: { type: "STRING" },
                conservative: { type: "STRING" },
                lateral: { type: "STRING" }
              },
              required: ["dimension", "aggressive", "conservative", "lateral"]
            }
          },
          paths: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                id: { type: "STRING", enum: ["aggressive", "conservative", "lateral"] },
                title: { type: "STRING" },
                leadAgentId: { type: "STRING" },
                description: { type: "STRING" },
                riskLevel: { type: "STRING", enum: ["EXTREME", "MODERATE", "LOW"] },
                upside: { type: "STRING" },
                metrics: {
                  type: "OBJECT",
                  properties: {
                    innovation: { type: "NUMBER" },
                    risk: { type: "NUMBER" },
                    speed: { type: "NUMBER" },
                    capital: { type: "NUMBER" },
                    resilience: { type: "NUMBER" }
                  },
                  required: ["innovation", "risk", "speed", "capital", "resilience"]
                },
                steps: { type: "ARRAY", items: { type: "STRING" } },
                code: {
                  type: "OBJECT",
                  properties: {
                    author: { type: "STRING" },
                    text: { type: "STRING" }
                  },
                  required: ["author", "text"]
                }
              },
              required: ["id", "title", "leadAgentId", "description", "riskLevel", "upside", "metrics", "steps", "code"]
            }
          }
        },
        required: ["diagnosis", "executiveSummary", "confidenceLevel", "conflictResolution", "isDarkVerdict", "signal", "targetPrice", "paths", "matrix"]
      }
    },
    required: ["debate", "verdict"]
  };

  const prompt = `Analyze stock: ${symbol} (${quote.name}) at price ${quote.price} ${quote.currency}. Provide comprehensive multi-angle financial analysis.`;

  const response = await fetch('/api/council', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemInstruction, prompt, schema }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any).error || `API error: ${response.status}`);
  }

  return response.json();
};
