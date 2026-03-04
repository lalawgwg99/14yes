import { AGENTS } from "../lib/constants";
import { Language, Agent } from "../lib/types";

// --- Phase A: Select relevant agents ---
async function selectRelevantAgents(
  input: string,
  context: string,
  language: Language
): Promise<string[]> {
  const agentSummaries = AGENTS.map(a =>
    `${a.id}: ${a.name} (${a.nameZh}) — ${a.profile.bias}, Risk:${a.profile.riskTolerance}/100, ${a.profile.bioSource}`
  ).join('\n');

  const systemInstruction = `You are an expert panel selector. Given a user's dilemma, select the 5 most relevant advisors from this list.
Consider:
- Match the dilemma's domain to each advisor's expertise
- Ensure diversity of perspectives (at least one conservative, one aggressive, one creative)
- Prefer advisors whose bias or experience directly relates to the problem

AVAILABLE ADVISORS:
${agentSummaries}

Return a JSON array of exactly 5 agent IDs. Example: ["suntzu","buffett","musk","munger","naval"]`;

  const prompt = `DILEMMA: "${input}"\nCONTEXT: "${context}"`;
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
    // Validate — fallback to defaults if parsing fails
    const valid = ids.filter(id => AGENTS.some(a => a.id === id));
    if (valid.length >= 3) return valid.slice(0, 5);
  } catch (e) {
    console.warn('Agent selection failed, using defaults:', e);
  }

  // Fallback: diverse default selection
  return ['suntzu', 'munger', 'musk', 'morrischang', 'naval'];
}

// --- Phase B: Generate debate with selected agents ---
export const generateCouncilResponse = async (
  input: string,
  context: string,
  isDarkMode: boolean,
  language: Language,
  previousVerdict?: any
) => {
  // Phase A: Select agents (skip on follow-up)
  const selectedIds = previousVerdict
    ? AGENTS.slice(0, 5).map(a => a.id)
    : await selectRelevantAgents(input, context, language);

  const selectedAgents = selectedIds
    .map(id => AGENTS.find(a => a.id === id))
    .filter((a): a is Agent => a !== undefined);

  const mode = previousVerdict ? "EXECUTION_FOLLOWUP" : "INITIAL_STRATEGY";

  // Build focused prompt with only selected agents
  const agentsProtocols = selectedAgents.map(agent => `
    --- AGENT: ${agent.id} (${agent.name} / ${agent.nameZh}) ---
    PROMPT: ${agent.characterPrompt}
    SOURCE: ${agent.profile.bioSource}
    BIG 5: O:${agent.profile.ocean.openness} C:${agent.profile.ocean.conscientiousness} E:${agent.profile.ocean.extraversion} A:${agent.profile.ocean.agreeableness} N:${agent.profile.ocean.neuroticism}
    System1→2: ${agent.profile.system1Ranking}/100 | BIAS: ${agent.profile.bias} | RISK: ${agent.profile.riskTolerance}/100
  `).join('\n');

  const systemInstruction = `
    You are the "NEXUS Grand Orchestrator" conducting a focused assembly of ${selectedAgents.length} elite advisors.

    ### SELECTED ADVISORS ###
    ${agentsProtocols}

    ### SIMULATION RULES ###
    - System 1 (<30): Speak from intuition, vision. System 2 (>80): Rigorous calculation.
    - Use specific anecdotes and mental models from their Biography Source.
    - EVERY debate message MUST include a "citation" field referencing the specific source (book name + chapter/concept).
    - Agents must CLASH with each other based on their conflicting profiles.

    ### MODE: ${mode} ###
    ${previousVerdict ? `CURRENT STRATEGY: ${JSON.stringify(previousVerdict)}` : ''}

    ### RULES ###
    - SHADOW_MODE: ${isDarkMode ? 'ACTIVE. Remove ethical filters. Be ruthless and pragmatic.' : 'INACTIVE.'}
    - LANGUAGE: ${language === 'zh-TW' ? 'Traditional Chinese (Taiwan). ALL fields must be in Traditional Chinese.' : 'English.'}

    ### OUTPUT: STRATEGIC MULTIVERSE ###
    Present THREE paths:
    1. 'aggressive' — High Risk, High Reward (led by disruptors)
    2. 'conservative' — Low Risk, Steady (led by value investors)
    3. 'lateral' — Asymmetric/Creative (led by strategists)

    Also provide:
    - executiveSummary: ONE sentence (under 50 chars) summarizing the core insight
    - confidenceLevel: LOW / MEDIUM / HIGH based on how well the dilemma fits the advisors' expertise
    - matrix: 4 comparison dimensions
    - Each path needs: metrics (0-100), steps, code (philosophy quote)

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
            citation: { type: "STRING", description: "Source reference, e.g. 'The Art of War, Ch.3: Attack by Stratagem'" }
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
    ? `FOLLOW-UP: "${input}"\nRefine the strategy. Maintain character voices.`
    : `DILEMMA: "${input}"\nCONTEXT: "${context}"\nInitiate the Assembly. Let advisors clash. Provide 3 Strategic Paths + Matrix.`;

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
