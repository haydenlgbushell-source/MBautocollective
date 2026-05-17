import { Redis } from '@upstash/redis';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type Session = {
  messages: ChatMessage[];
  contactId?: string;
  dealId?: string;
  name?: string;
};

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const SESSION_TTL_SECONDS = 60 * 60; // 1 hour
const MAX_MESSAGES = 20;

function key(phone: string) {
  return `wa:session:${phone}`;
}

export async function getSession(phone: string): Promise<Session> {
  const data = await redis.get<Session>(key(phone));
  return data ?? { messages: [] };
}

export async function addMessage(
  phone: string,
  role: 'user' | 'assistant',
  content: string,
): Promise<void> {
  const session = await getSession(phone);
  session.messages.push({ role, content });

  // Cap history to avoid ballooning Claude context costs
  if (session.messages.length > MAX_MESSAGES) {
    session.messages = session.messages.slice(-MAX_MESSAGES);
  }

  await redis.set(key(phone), session, { ex: SESSION_TTL_SECONDS });
}

export async function updateSession(
  phone: string,
  updates: Partial<Session>,
): Promise<void> {
  const session = await getSession(phone);
  const updated = { ...session, ...updates };
  await redis.set(key(phone), updated, { ex: SESSION_TTL_SECONDS });
}
