declare const __ANTHROPIC_KEY__: string;

const callClaude = async (prompt: string, system: string): Promise<string> => {
  const apiKey = __ANTHROPIC_KEY__;
  if (!apiKey) return '⚠️ AI features require API configuration.';
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 1000,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || '';
};

export const analyzeMood = (entry: string) => callClaude(
  `Analyze the mood in this journal entry, give 2-3 warm sentences:\n\n"${entry}"`,
  'You are a compassionate journal companion. Be concise and supportive.'
);

export const getWritingSuggestion = (entry: string) => callClaude(
  `Suggest 2-3 thoughtful prompts to explore these thoughts deeper:\n\n"${entry}"`,
  'You are a thoughtful journal coach. Be concise and encouraging.'
);

export const generateInsight = (entries: string[]) => callClaude(
  `Give a brief weekly insight about patterns in these journal entries:\n\n${entries.slice(0,5).join('\n---\n')}`,
  'You are a wise journal analyst. Be warm and encouraging. Max 3 sentences.'
);

export const continueWriting = (entry: string) => callClaude(
  `Continue this journal entry naturally (2-3 sentences only):\n\n"${entry}"`,
  'Continue journal entries naturally matching the writer\'s voice.'
);
