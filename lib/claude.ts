import Anthropic from '@anthropic-ai/sdk';
import type { ChatMessage } from './session';

const client = new Anthropic();

// Update MODEL_ID if you upgrade to a newer Claude release
const MODEL_ID = 'claude-sonnet-4-5';

const SYSTEM_PROMPT = `You are a friendly, professional assistant for MB Auto Collective, \
a prestige pre-owned car dealership located in Waterloo, Sydney NSW.

Your role is to help customers with:
1. BUYING A CAR — Ask for their budget, preferred body type (SUV, sedan, ute, hatchback, etc.), \
and whether they want new or used. Collect one piece of info at a time.
2. SELLING OR TRADING IN — Ask for make, model, year, kilometres, and condition. \
Collect naturally across the conversation.
3. BOOKING A VIEWING — Collect their name, phone number, and preferred day/time.
4. SPECIFIC CAR ENQUIRIES — Answer general questions about vehicles. \
Offer to book a viewing or connect them with the team for specifics.
5. ANYTHING ELSE — Respond politely and let them know someone will be in touch.

Rules you must always follow:
- Never make up stock, prices, or availability. Say you'll check or get the team to confirm.
- Always refer to the business as "MB Auto Collective" — never anything else.
- Keep replies concise: 2–4 sentences unless more detail is clearly needed.
- If the customer explicitly asks to speak to a human, OR if you are not confident in your \
answer, respond with this exact phrase: \
"Let me get someone from our team to give you a call. I'll pass on your details now."
- On your very first message in a conversation (no prior assistant turns), open with: \
"Hi, I'm the MB Auto Collective assistant. How can I help you today?"

Location: Waterloo, Sydney NSW.`;

export async function getAIResponse(
  history: ChatMessage[],
  userMessage: string,
): Promise<{ reply: string; needsHuman: boolean }> {
  const messages = [
    ...history,
    { role: 'user' as const, content: userMessage },
  ];

  const response = await client.messages.create({
    model: MODEL_ID,
    max_tokens: 512,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        // Cache the system prompt — saves cost on every multi-turn message
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages,
  });

  const reply =
    response.content[0].type === 'text' ? response.content[0].text.trim() : '';

  const needsHuman = reply.includes(
    "Let me get someone from our team to give you a call",
  );

  return { reply, needsHuman };
}
