export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type Session = {
  messages: ChatMessage[];
  contactId?: string;
  dealId?: string;
  name?: string;
  lastActivity: number;
};

// In-memory store keyed by customer phone number.
// Note: Vercel serverless functions are stateless — sessions persist only
// within the same warm function instance. For production, swap this for
// Redis (Upstash) or Supabase to persist across cold starts.
const sessions = new Map<string, Session>();

const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

export function getSession(phone: string): Session {
  const existing = sessions.get(phone);
  if (existing) {
    existing.lastActivity = Date.now();
    return existing;
  }
  const session: Session = { messages: [], lastActivity: Date.now() };
  sessions.set(phone, session);
  return session;
}

export function addMessage(
  phone: string,
  role: 'user' | 'assistant',
  content: string,
): void {
  const session = getSession(phone);
  session.messages.push({ role, content });
  // Cap history to avoid ballooning Claude context costs
  if (session.messages.length > 20) {
    session.messages = session.messages.slice(-20);
  }
}

export function updateSession(phone: string, updates: Partial<Session>): void {
  const session = getSession(phone);
  Object.assign(session, updates);
}

// Best-effort TTL cleanup on warm instances
setInterval(() => {
  const now = Date.now();
  for (const [phone, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_TTL_MS) {
      sessions.delete(phone);
    }
  }
}, 10 * 60 * 1000);
