'use client';

import { useState, useRef, useEffect } from 'react';

// Project colour tokens
const GOLD = '#b8963e';
const GOLD_LO = '#7a6428';
const DARK = '#0a0a0a';
const DARK2 = '#111111';
const DARK3 = '#1c1c1e';
const BORDER = 'rgba(184,150,62,0.25)';
const GREEN = '#4CAF50';
const RED = '#EF5350';

// Project fonts (loaded via next/font in root layout)
const FD = 'var(--fd)';
const FB = 'var(--fb)';
const FM = 'var(--fm)';

const STEPS = [
  { id: 'login',   label: 'Log In',         icon: '🔐' },
  { id: 'find',    label: 'Find Vehicle',    icon: '🚘' },
  { id: 'extract', label: 'Extract Data',    icon: '📋' },
  { id: 'push',    label: 'Push to Systems', icon: '🚀' },
];

// ── Types ────────────────────────────────────────────────────────────────────

type TextContent = { type: 'text'; text: string };
type ImageContent = { type: 'image'; source: { type: 'base64'; media_type: 'image/jpeg'; data: string } };
type ContentBlock = TextContent | ImageContent;
type ApiMessage = { role: 'user' | 'assistant'; content: string | ContentBlock[] };

interface ChatMessage {
  role: 'user' | 'assistant' | 'divider';
  content: string;
  /** Thumbnail to show inline when the message came from a screenshot */
  thumb?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractJson(text: string, tag: string): Record<string, unknown> | null {
  const start = text.indexOf(tag + '\n');
  const end   = text.indexOf('\nEND_' + tag);
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(text.slice(start + tag.length + 1, end).trim());
  } catch { return null; }
}

function hasPayloads(text: string) {
  return text.includes('SUPABASE_JSON') && text.includes('HUBSPOT_JSON');
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '12px 16px' }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: GOLD,
          animation: `agentPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

function StepBar({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER}`, background: DARK2 }}>
      {STEPS.map((s, i) => {
        const done   = i < step;
        const active = i === step;
        return (
          <div key={s.id} style={{
            flex: 1, minWidth: 80, padding: '10px 8px',
            borderRight: i < STEPS.length - 1 ? `1px solid ${BORDER}` : 'none',
            background: active ? 'rgba(184,150,62,0.06)' : 'transparent',
            borderBottom: active ? `2px solid ${GOLD}` : '2px solid transparent',
            transition: 'all 0.3s',
          }}>
            <div style={{ fontSize: 15, marginBottom: 2, filter: done || active ? 'none' : 'grayscale(1) opacity(0.35)' }}>
              {done ? '✓' : s.icon}
            </div>
            <div style={{
              fontSize: 10, fontFamily: FM, letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: active ? GOLD : done ? '#777' : '#3A3A3A',
              fontWeight: active ? 600 : 400,
            }}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Rego search bar ───────────────────────────────────────────────────────────

interface RegoBarProps {
  onSearch: (rego: string) => void;
  scraping: boolean;
  scrapeError: string;
}

function RegoBar({ onSearch, scraping, scrapeError }: RegoBarProps) {
  const [rego, setRego] = useState('');

  const handleSearch = () => {
    const r = rego.trim().toUpperCase();
    if (!r || scraping) return;
    onSearch(r);
    setRego('');
  };

  return (
    <div style={{
      padding: '10px 16px',
      borderBottom: `1px solid ${BORDER}`,
      background: DARK2,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}>
      <div style={{ fontSize: 9, fontFamily: FM, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555' }}>
        Auto-import from EasyCars
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={rego}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRego(e.target.value.toUpperCase())}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleSearch(); }}
          placeholder="Registration plate (e.g. ABC123)"
          disabled={scraping}
          style={{
            flex: 1, background: DARK3, border: `1px solid ${BORDER}`,
            color: '#f5f2ed', padding: '8px 12px', fontSize: 13,
            fontFamily: FM, letterSpacing: '0.06em', textTransform: 'uppercase',
            outline: 'none', opacity: scraping ? 0.5 : 1,
          }}
        />
        <button
          onClick={handleSearch}
          disabled={!rego.trim() || scraping}
          style={{
            background: !rego.trim() || scraping ? '#222' : `linear-gradient(135deg,${GOLD} 0%,${GOLD_LO} 100%)`,
            border: 'none',
            color: !rego.trim() || scraping ? '#444' : DARK,
            padding: '8px 16px', fontSize: 11, fontWeight: 600,
            cursor: !rego.trim() || scraping ? 'not-allowed' : 'pointer',
            fontFamily: FM, letterSpacing: '0.1em', textTransform: 'uppercase',
            transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}
        >
          {scraping ? '⟳ Searching…' : '🔍 Search EasyCars'}
        </button>
      </div>
      {scrapeError && (
        <div style={{
          fontSize: 11, color: RED, fontFamily: FB,
          padding: '6px 10px', background: 'rgba(239,83,80,0.08)',
          border: `1px solid rgba(239,83,80,0.2)`,
        }}>
          ⚠ {scrapeError}
        </div>
      )}
      <div style={{ fontSize: 9, color: '#3A3A3A', fontFamily: FM, letterSpacing: '0.1em' }}>
        OR type vehicle details manually in the chat below
      </div>
    </div>
  );
}

// ── Push panel ────────────────────────────────────────────────────────────────

interface PushPanelProps {
  text: string;
  onReset: () => void;
}

function PushPanel({ text, onReset }: PushPanelProps) {
  const [sbStatus, setSbStatus] = useState<'idle' | 'pushing' | 'ok' | 'error'>('idle');
  const [hsStatus, setHsStatus] = useState<'idle' | 'pushing' | 'ok' | 'error'>('idle');
  const [sbMsg, setSbMsg] = useState('');
  const [hsMsg, setHsMsg] = useState('');
  const [started, setStarted] = useState(false);

  const sbPayload = extractJson(text, 'SUPABASE_JSON');
  const hsPayload = extractJson(text, 'HUBSPOT_JSON');

  const push = async (only?: 'supabase' | 'hubspot') => {
    if (!only) setStarted(true);
    if (!only || only === 'supabase') setSbStatus('pushing');
    if (!only || only === 'hubspot') setHsStatus('pushing');

    try {
      const res = await fetch('/api/easycars-agent/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supabase: sbPayload, hubspot: hsPayload, only }),
      });
      const data = await res.json();

      if (!only || only === 'supabase') {
        setSbStatus(data.supabase.ok ? 'ok' : 'error');
        setSbMsg(data.supabase.message);
      }
      if (!only || only === 'hubspot') {
        setHsStatus(data.hubspot.ok ? 'ok' : 'error');
        setHsMsg(data.hubspot.message);
      }
    } catch {
      if (!only || only === 'supabase') { setSbStatus('error'); setSbMsg('Network error'); }
      if (!only || only === 'hubspot') { setHsStatus('error'); setHsMsg('Network error'); }
    }
  };

  const allDone = sbStatus === 'ok' && hsStatus === 'ok';
  const sc = (s: string) => s === 'ok' ? GREEN : s === 'error' ? RED : s === 'pushing' ? GOLD : '#555';
  const sl = (s: string) => ({ idle: 'Ready', pushing: 'Pushing…', ok: 'Done ✓', error: 'Failed' })[s] ?? s;
  const dealname = hsPayload?.dealname as string | undefined;

  return (
    <div style={{
      background: 'rgba(184,150,62,0.05)',
      border: `1px solid rgba(184,150,62,0.2)`,
      padding: 16, margin: '4px 0',
      animation: 'agentFadeUp 0.3s ease',
    }}>
      <div style={{ fontSize: 12, color: GOLD, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: FM, marginBottom: 12 }}>
        Ready to Push
      </div>

      {[
        { label: 'Supabase', sub: 'vehicles table', status: sbStatus, msg: sbMsg },
        { label: 'HubSpot',  sub: dealname || 'New Deal', status: hsStatus, msg: hsMsg },
      ].map((row) => (
        <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: '#f5f2ed', fontFamily: FB }}>{row.label}</div>
            <div style={{ fontSize: 11, color: '#555', fontFamily: FB, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>
              {row.msg || row.sub}
            </div>
          </div>
          <div style={{ fontSize: 11, color: sc(row.status), fontFamily: FM, letterSpacing: '0.08em', textTransform: 'uppercase', minWidth: 70, textAlign: 'right' }}>
            {row.status === 'pushing'
              ? <span style={{ animation: 'agentPulse 1s infinite', display: 'inline-block' }}>●</span>
              : sl(row.status)}
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        {!started && (
          <button onClick={() => push()} style={{
            flex: 1,
            background: `linear-gradient(135deg,${GOLD} 0%,${GOLD_LO} 100%)`,
            border: 'none', color: DARK, padding: '12px 0',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: FM, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>🚀 Push to Both Systems</button>
        )}
        {started && !allDone && sbStatus !== 'ok' && (
          <button onClick={() => push('supabase')} style={{
            flex: 1, background: 'transparent', border: `1px solid ${GOLD}`, color: GOLD,
            padding: '10px 0', fontSize: 12, cursor: 'pointer',
            fontFamily: FM, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>Retry Supabase</button>
        )}
        {started && !allDone && hsStatus !== 'ok' && (
          <button onClick={() => push('hubspot')} style={{
            flex: 1, background: 'transparent', border: `1px solid ${GOLD}`, color: GOLD,
            padding: '10px 0', fontSize: 12, cursor: 'pointer',
            fontFamily: FM, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>Retry HubSpot</button>
        )}
        {allDone && (
          <button onClick={onReset} style={{
            flex: 1, background: 'rgba(76,175,80,0.12)', border: `1px solid ${GREEN}`, color: GREEN,
            padding: '12px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: FM, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>✓ Add Another Vehicle</button>
        )}
      </div>
    </div>
  );
}

// ── Chat message ──────────────────────────────────────────────────────────────

function ChatMsg({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  if (msg.role === 'divider') {
    return (
      <div style={{ textAlign: 'center', color: '#3A3A3A', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '6px 0', fontFamily: FM }}>
        {msg.content}
      </div>
    );
  }

  const display = isUser
    ? msg.content
    : msg.content
        .replace(/SUPABASE_JSON[\s\S]*?END_SUPABASE_JSON/g, '✓ Supabase payload ready')
        .replace(/HUBSPOT_JSON[\s\S]*?END_HUBSPOT_JSON/g,   '✓ HubSpot payload ready');

  return (
    <div style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap: 10, alignItems: 'flex-end' }}>
      {!isUser && (
        <div style={{
          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg,${GOLD} 0%,${GOLD_LO} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: DARK, fontFamily: FD,
        }}>M</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: 4, maxWidth: '76%' }}>
        {/* Screenshot thumbnail shown above user's bubble when triggered via rego search */}
        {msg.thumb && (
          <img
            src={`data:image/jpeg;base64,${msg.thumb}`}
            alt="EasyCars screenshot"
            style={{ width: '100%', maxWidth: 320, border: `1px solid ${BORDER}`, opacity: 0.85 }}
          />
        )}
        <div style={{
          background: isUser ? `linear-gradient(135deg,${GOLD} 0%,${GOLD_LO} 100%)` : DARK3,
          color: isUser ? DARK : '#f5f2ed',
          padding: '10px 14px', lineHeight: 1.6,
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          fontSize: 13.5, fontFamily: FB,
          border: isUser ? 'none' : `1px solid ${BORDER}`,
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>{display}</div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function EasyCarsAgentPage() {
  const [messages,   setMessages]   = useState<ChatMessage[]>([{
    role: 'assistant',
    content: "G'day. Enter a registration plate above to auto-import from EasyCars, or type vehicle details here and I'll guide you through what's needed.",
  }]);
  const [input,      setInput]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [scraping,   setScraping]   = useState(false);
  const [scrapeError,setScrapeError] = useState('');
  const [step,       setStep]       = useState(0);
  const [pushText,   setPushText]   = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const convRef   = useRef<ApiMessage[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, pushText]);

  const detectStep = (text: string) => {
    if (hasPayloads(text)) return 3;
    if (/vin|odometer|kilometres|registration|engine|transmission/i.test(text)) return 2;
    if (/stock number|found|looking at|i can see|screenshot/i.test(text)) return 1;
    return step;
  };

  // ── Text-only chat send ──────────────────────────────────────────────────

  const send = async (override?: string) => {
    const text = (override || input).trim();
    if (!text || loading || scraping) return;
    setInput('');
    setLoading(true);

    const userApiMsg: ApiMessage = { role: 'user', content: text };
    convRef.current = [...convRef.current, userApiMsg];
    setMessages((p) => [...p, { role: 'user', content: text }]);

    await callClaude();
  };

  // ── Rego auto-import via Puppeteer ───────────────────────────────────────

  const searchRego = async (rego: string) => {
    setScraping(true);
    setScrapeError('');
    setStep((s) => Math.max(s, 1));
    setMessages((p) => [...p, { role: 'user', content: `Search EasyCars for registration: ${rego}` }]);

    try {
      const res = await fetch('/api/easycars-agent/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration: rego }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Scrape failed');
      }

      const screenshots: string[] = data.screenshots ?? [];
      if (screenshots.length === 0) throw new Error('No screenshots returned from EasyCars');

      // Show first screenshot as thumbnail in the chat
      setMessages((p) => [...p, {
        role: 'user',
        content: `EasyCars listing captured for ${rego} — extracting all vehicle details…`,
        thumb: screenshots[0],
      }]);

      // Build a multi-modal message for Claude
      const imageBlocks: ImageContent[] = screenshots.map((s) => ({
        type: 'image',
        source: { type: 'base64', media_type: 'image/jpeg', data: s },
      }));

      const extractionMsg: ApiMessage = {
        role: 'user',
        content: [
          ...imageBlocks,
          {
            type: 'text',
            text: `I have captured the EasyCars listing for registration plate ${rego}. Please read all vehicle details from these screenshots and produce the complete SUPABASE_JSON and HUBSPOT_JSON payloads.`,
          },
        ],
      };

      convRef.current = [...convRef.current, extractionMsg];
      setLoading(true);
      await callClaude();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown scrape error';
      setScrapeError(msg);
      setMessages((p) => [...p, { role: 'assistant', content: `Could not fetch EasyCars listing: ${msg}\n\nYou can still enter vehicle details manually below.` }]);
    } finally {
      setScraping(false);
    }
  };

  // ── Shared Claude call ───────────────────────────────────────────────────

  const callClaude = async () => {
    try {
      const res   = await fetch('/api/easycars-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: convRef.current }),
      });
      const data  = await res.json();
      if (!res.ok) {
        const errMsg = data.error?.message || data.error || 'Claude API error';
        throw new Error(String(errMsg));
      }
      const reply: string = data.content?.[0]?.text || 'Something went wrong — please try again.';

      const assistantMsg: ApiMessage = { role: 'assistant', content: reply };
      convRef.current = [...convRef.current, assistantMsg];
      setMessages((p) => [...p, { role: 'assistant', content: reply }]);
      setStep((s) => Math.max(s, detectStep(reply)));
      if (hasPayloads(reply)) setPushText(reply);
    } catch {
      setMessages((p) => [...p, { role: 'assistant', content: 'Network error — please try again.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  };

  const reset = () => {
    convRef.current = [];
    setPushText(null);
    setStep(0);
    setScrapeError('');
    setMessages([
      { role: 'divider', content: '— new vehicle —' },
      { role: 'assistant', content: 'Ready for the next one. Enter a rego above or type details below.' },
    ]);
  };

  const quickPrompts = [
    "I'll read the details now",
    "That's all the info I have",
    'Give me the final payloads',
  ];

  return (
    <>
      <style>{`
        @keyframes agentPulse {
          0%, 100% { opacity: .3; transform: scale(.8); }
          50%       { opacity: 1;  transform: scale(1);  }
        }
        @keyframes agentFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>

      <div style={{
        background: DARK, minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        fontFamily: FB, maxWidth: 700,
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: '14px 20px', borderBottom: `1px solid ${BORDER}`,
          background: DARK2, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div>
            <div style={{ fontFamily: FD, fontSize: 20, color: GOLD, fontWeight: 600, letterSpacing: '0.04em' }}>
              MB Auto Collective
            </div>
            <div style={{ fontSize: 10, color: '#555', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: FM, marginTop: 1 }}>
              EasyCars Import Agent
            </div>
          </div>
          <a
            href="https://my.easycars.net.au"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: GOLD, fontSize: 11, textDecoration: 'none', fontFamily: FM, letterSpacing: '0.08em' }}
          >
            Open EasyCars ↗
          </a>
        </div>

        <StepBar step={step} />

        {/* ── Rego search bar ── */}
        <RegoBar onSearch={searchRego} scraping={scraping} scrapeError={scrapeError} />

        {/* ── Messages ── */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '18px 16px',
          display: 'flex', flexDirection: 'column', gap: 12, minHeight: 280,
        }}>
          {messages.map((m, i) => (
            <div key={i} style={{ animation: 'agentFadeUp 0.25s ease' }}>
              <ChatMsg msg={m} />
            </div>
          ))}

          {(loading || scraping) && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg,${GOLD} 0%,${GOLD_LO} 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: DARK, fontFamily: FD,
              }}>M</div>
              <div style={{ background: DARK3, border: `1px solid ${BORDER}`, borderRadius: '16px 16px 16px 4px' }}>
                <TypingDots />
              </div>
              {scraping && (
                <span style={{ fontSize: 11, color: '#555', fontFamily: FM, alignSelf: 'center' }}>
                  Launching browser & searching EasyCars…
                </span>
              )}
            </div>
          )}

          {pushText && !loading && !scraping && (
            <PushPanel text={pushText} onReset={reset} />
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Quick prompts ── */}
        <div style={{ padding: '8px 16px', display: 'flex', gap: 6, overflowX: 'auto', borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
          {quickPrompts.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              disabled={loading || scraping}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                (e.target as HTMLButtonElement).style.borderColor = GOLD;
                (e.target as HTMLButtonElement).style.color = GOLD;
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                (e.target as HTMLButtonElement).style.borderColor = BORDER;
                (e.target as HTMLButtonElement).style.color = '#555';
              }}
              style={{
                background: 'transparent', border: `1px solid ${BORDER}`, color: '#555',
                padding: '5px 10px', borderRadius: 20, fontSize: 11,
                cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: FB,
                transition: 'all 0.2s', flexShrink: 0,
                opacity: loading || scraping ? 0.4 : 1,
              }}
            >{p}</button>
          ))}
        </div>

        {/* ── Text input ── */}
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${BORDER}`, background: DARK2, flexShrink: 0 }}>
          <div
            style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: DARK3, border: `1px solid ${BORDER}`, padding: '4px 4px 4px 14px', transition: 'border-color 0.2s' }}
            onFocusCapture={(e: React.FocusEvent<HTMLDivElement>) => { (e.currentTarget as HTMLDivElement).style.borderColor = GOLD; }}
            onBlurCapture={(e: React.FocusEvent<HTMLDivElement>) => { (e.currentTarget as HTMLDivElement).style.borderColor = BORDER; }}
          >
            <textarea
              ref={inputRef}
              value={input}
              rows={1}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = 'auto';
                t.style.height = Math.min(t.scrollHeight, 120) + 'px';
              }}
              placeholder="Or type vehicle details / a question…"
              disabled={loading || scraping}
              style={{
                flex: 1, background: 'transparent', border: 'none', color: '#f5f2ed',
                fontSize: 14, fontFamily: FB, resize: 'none', lineHeight: 1.5,
                padding: '8px 0', maxHeight: 120, overflowY: 'auto', outline: 'none',
                opacity: loading || scraping ? 0.5 : 1,
              }}
            />
            <button
              onClick={() => send()}
              disabled={loading || scraping || !input.trim()}
              style={{
                background: loading || scraping || !input.trim() ? '#222' : `linear-gradient(135deg,${GOLD} 0%,${GOLD_LO} 100%)`,
                border: 'none',
                color: loading || scraping || !input.trim() ? '#444' : DARK,
                width: 38, height: 38, fontSize: 16,
                cursor: loading || scraping || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s',
              }}
            >↑</button>
          </div>
          <div style={{ fontSize: 10, color: '#3A3A3A', marginTop: 5, textAlign: 'center', fontFamily: FM, letterSpacing: '0.08em' }}>
            ENTER TO SEND · SHIFT+ENTER FOR NEW LINE
          </div>
        </div>

      </div>
    </>
  );
}
