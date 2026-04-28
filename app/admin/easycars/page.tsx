'use client';

import { useState, useRef, useEffect } from 'react';

// Project colour tokens (matches tailwind.config.ts + globals.css)
const GOLD = '#b8963e';
const GOLD_HI = '#d4af6a';
const GOLD_LO = '#7a6428';
const DARK = '#0a0a0a';
const DARK2 = '#111111';
const DARK3 = '#1c1c1e';
const BORDER = 'rgba(184,150,62,0.25)';
const GREEN = '#4CAF50';
const RED = '#EF5350';

// Project fonts (loaded via next/font in layout.tsx)
const FD = 'var(--fd)'; // Cormorant Garamond
const FB = 'var(--fb)'; // Montserrat
const FM = 'var(--fm)'; // DM Mono

const STEPS = [
  { id: 'login', label: 'Log In', icon: '🔐' },
  { id: 'find', label: 'Find Vehicle', icon: '🚘' },
  { id: 'extract', label: 'Extract Data', icon: '📋' },
  { id: 'push', label: 'Push to Systems', icon: '🚀' },
];

function extractJson(text: string, tag: string): Record<string, unknown> | null {
  const start = text.indexOf(tag + '\n');
  const end = text.indexOf('\nEND_' + tag);
  if (start === -1 || end === -1) return null;
  try {
    const raw = text.slice(start + tag.length + 1, end).trim();
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function hasPayloads(text: string) {
  return text.includes('SUPABASE_JSON') && text.includes('HUBSPOT_JSON');
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '12px 16px' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: GOLD,
            animation: `agentPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function StepBar({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER}`, background: DARK2 }}>
      {STEPS.map((s, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <div
            key={s.id}
            style={{
              flex: 1,
              minWidth: 80,
              padding: '10px 8px',
              borderRight: i < STEPS.length - 1 ? `1px solid ${BORDER}` : 'none',
              background: active ? `rgba(184,150,62,0.06)` : 'transparent',
              borderBottom: active ? `2px solid ${GOLD}` : '2px solid transparent',
              transition: 'all 0.3s',
            }}
          >
            <div
              style={{
                fontSize: 15,
                marginBottom: 2,
                filter: done || active ? 'none' : 'grayscale(1) opacity(0.35)',
              }}
            >
              {done ? '✓' : s.icon}
            </div>
            <div
              style={{
                fontSize: 10,
                fontFamily: FM,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: active ? GOLD : done ? '#777' : '#3A3A3A',
                fontWeight: active ? 600 : 400,
              }}
            >
              {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
        if (data.supabase.ok) {
          setSbStatus('ok');
          setSbMsg(data.supabase.message);
        } else {
          setSbStatus('error');
          setSbMsg(data.supabase.message);
        }
      }
      if (!only || only === 'hubspot') {
        if (data.hubspot.ok) {
          setHsStatus('ok');
          setHsMsg(data.hubspot.message);
        } else {
          setHsStatus('error');
          setHsMsg(data.hubspot.message);
        }
      }
    } catch {
      if (!only || only === 'supabase') { setSbStatus('error'); setSbMsg('Network error'); }
      if (!only || only === 'hubspot') { setHsStatus('error'); setHsMsg('Network error'); }
    }
  };

  const allDone = sbStatus === 'ok' && hsStatus === 'ok';
  const sc = (s: string) =>
    s === 'ok' ? GREEN : s === 'error' ? RED : s === 'pushing' ? GOLD : '#555';
  const sl = (s: string) =>
    ({ idle: 'Ready', pushing: 'Pushing…', ok: 'Done ✓', error: 'Failed' })[s] ?? s;

  const dealname = hsPayload?.dealname as string | undefined;

  return (
    <div
      style={{
        background: `rgba(184,150,62,0.05)`,
        border: `1px solid rgba(184,150,62,0.2)`,
        padding: 16,
        margin: '4px 0',
        animation: 'agentFadeUp 0.3s ease',
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: GOLD,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontFamily: FM,
          marginBottom: 12,
        }}
      >
        Ready to Push
      </div>

      {[
        { label: 'Supabase', sub: 'vehicles table', status: sbStatus, msg: sbMsg },
        { label: 'HubSpot', sub: dealname || 'New Deal', status: hsStatus, msg: hsMsg },
      ].map((row) => (
        <div
          key={row.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 0',
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: '#f5f2ed', fontFamily: FB }}>{row.label}</div>
            <div
              style={{
                fontSize: 11,
                color: '#555',
                fontFamily: FB,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 280,
              }}
            >
              {row.msg || row.sub}
            </div>
          </div>
          <div
            style={{
              fontSize: 11,
              color: sc(row.status),
              fontFamily: FM,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              minWidth: 70,
              textAlign: 'right',
            }}
          >
            {row.status === 'pushing' ? (
              <span style={{ animation: 'agentPulse 1s infinite', display: 'inline-block' }}>
                ●
              </span>
            ) : (
              sl(row.status)
            )}
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        {!started && (
          <button
            onClick={() => push()}
            style={{
              flex: 1,
              background: `linear-gradient(135deg,${GOLD} 0%,${GOLD_LO} 100%)`,
              border: 'none',
              color: DARK,
              padding: '12px 0',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: FM,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            🚀 Push to Both Systems
          </button>
        )}
        {started && !allDone && sbStatus !== 'ok' && (
          <button
            onClick={() => push('supabase')}
            style={{
              flex: 1,
              background: 'transparent',
              border: `1px solid ${GOLD}`,
              color: GOLD,
              padding: '10px 0',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: FM,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Retry Supabase
          </button>
        )}
        {started && !allDone && hsStatus !== 'ok' && (
          <button
            onClick={() => push('hubspot')}
            style={{
              flex: 1,
              background: 'transparent',
              border: `1px solid ${GOLD}`,
              color: GOLD,
              padding: '10px 0',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: FM,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Retry HubSpot
          </button>
        )}
        {allDone && (
          <button
            onClick={onReset}
            style={{
              flex: 1,
              background: 'rgba(76,175,80,0.12)',
              border: `1px solid ${GREEN}`,
              color: GREEN,
              padding: '12px 0',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: FM,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            ✓ Add Another Vehicle
          </button>
        )}
      </div>
    </div>
  );
}

interface Message {
  role: 'user' | 'assistant' | 'divider';
  content: string;
}

function ChatMsg({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  if (msg.role === 'divider') {
    return (
      <div
        style={{
          textAlign: 'center',
          color: '#3A3A3A',
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          padding: '6px 0',
          fontFamily: FM,
        }}
      >
        {msg.content}
      </div>
    );
  }

  const display = isUser
    ? msg.content
    : msg.content
        .replace(/SUPABASE_JSON[\s\S]*?END_SUPABASE_JSON/g, '✓ Supabase payload ready')
        .replace(/HUBSPOT_JSON[\s\S]*?END_HUBSPOT_JSON/g, '✓ HubSpot payload ready');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: 10,
        alignItems: 'flex-end',
      }}
    >
      {!isUser && (
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            flexShrink: 0,
            background: `linear-gradient(135deg,${GOLD} 0%,${GOLD_LO} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            color: DARK,
            fontFamily: FD,
          }}
        >
          M
        </div>
      )}
      <div
        style={{
          maxWidth: '76%',
          background: isUser ? `linear-gradient(135deg,${GOLD} 0%,${GOLD_LO} 100%)` : DARK3,
          color: isUser ? DARK : '#f5f2ed',
          padding: '10px 14px',
          lineHeight: 1.6,
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          fontSize: 13.5,
          fontFamily: FB,
          border: isUser ? 'none' : `1px solid ${BORDER}`,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {display}
      </div>
    </div>
  );
}

export default function EasyCarsAgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "G'day. I'm ready to help you add a new vehicle to MB Auto Collective's inventory.\n\nOpen EasyCars at my.easycars.net.au, find the car, then start reading me the details — or just type them here and I'll guide you through what's needed.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [pushText, setPushText] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const convRef = useRef<{ role: string; content: string }[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, pushText]);

  const detectStep = (text: string) => {
    if (hasPayloads(text)) return 3;
    if (/vin|odometer|kilometres|registration|engine|transmission/i.test(text)) return 2;
    if (/stock number|found|looking at|i can see/i.test(text)) return 1;
    return step;
  };

  const send = async (override?: string) => {
    const text = (override || input).trim();
    if (!text || loading) return;
    setInput('');
    setLoading(true);
    convRef.current = [...convRef.current, { role: 'user', content: text }];
    setMessages((p) => [...p, { role: 'user', content: text }]);

    try {
      const res = await fetch('/api/easycars-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: convRef.current }),
      });
      const data = await res.json();
      const reply: string = data.content?.[0]?.text || 'Something went wrong — please try again.';
      convRef.current = [...convRef.current, { role: 'assistant', content: reply }];
      setMessages((p) => [...p, { role: 'assistant', content: reply }]);
      setStep((s) => Math.max(s, detectStep(reply)));
      if (hasPayloads(reply)) setPushText(reply);
    } catch {
      setMessages((p) => [
        ...p,
        { role: 'assistant', content: 'Network error — please try again.' },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  };

  const reset = () => {
    convRef.current = [];
    setPushText(null);
    setStep(0);
    setMessages([
      { role: 'divider', content: '— new vehicle —' },
      {
        role: 'assistant',
        content:
          'Ready for the next one. Find it in EasyCars and start reading me the details.',
      },
    ]);
  };

  const quickPrompts = [
    "I'm logged in and found the car",
    "I'll read the details now",
    "That's all the info I have",
    'Give me the final payloads',
  ];

  return (
    <>
      <style>{`
        @keyframes agentPulse {
          0%, 100% { opacity: .3; transform: scale(.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes agentFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          background: DARK,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: FB,
          maxWidth: 700,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: `1px solid ${BORDER}`,
            background: DARK2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: FD,
                fontSize: 20,
                color: GOLD,
                fontWeight: 600,
                letterSpacing: '0.04em',
              }}
            >
              MB Auto Collective
            </div>
            <div
              style={{
                fontSize: 10,
                color: '#555',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontFamily: FM,
                marginTop: 1,
              }}
            >
              EasyCars Import Agent
            </div>
          </div>
        </div>

        <StepBar step={step} />

        {/* EasyCars link bar */}
        <div
          style={{
            padding: '7px 20px',
            background: `rgba(184,150,62,0.03)`,
            borderBottom: `1px solid ${BORDER}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 11, color: '#444', fontFamily: FM }}>EasyCars DMS</span>
          <a
            href="https://my.easycars.net.au"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: GOLD,
              fontSize: 11,
              textDecoration: 'none',
              fontFamily: FM,
              letterSpacing: '0.08em',
            }}
          >
            Open my.easycars.net.au ↗
          </a>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '18px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            minHeight: 280,
          }}
        >
          {messages.map((m, i) => (
            <div key={i} style={{ animation: 'agentFadeUp 0.25s ease' }}>
              <ChatMsg msg={m} />
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: `linear-gradient(135deg,${GOLD} 0%,${GOLD_LO} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: DARK,
                  fontFamily: FD,
                }}
              >
                M
              </div>
              <div
                style={{
                  background: DARK3,
                  border: `1px solid ${BORDER}`,
                  borderRadius: '16px 16px 16px 4px',
                }}
              >
                <TypingDots />
              </div>
            </div>
          )}

          {pushText && !loading && <PushPanel text={pushText} onReset={reset} />}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        <div
          style={{
            padding: '8px 16px',
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            borderTop: `1px solid ${BORDER}`,
            flexShrink: 0,
          }}
        >
          {quickPrompts.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              disabled={loading}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.borderColor = GOLD;
                (e.target as HTMLButtonElement).style.color = GOLD;
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.borderColor = BORDER;
                (e.target as HTMLButtonElement).style.color = '#555';
              }}
              style={{
                background: 'transparent',
                border: `1px solid ${BORDER}`,
                color: '#555',
                padding: '5px 10px',
                borderRadius: 20,
                fontSize: 11,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontFamily: FB,
                transition: 'all 0.2s',
                flexShrink: 0,
                opacity: loading ? 0.4 : 1,
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: `1px solid ${BORDER}`,
            background: DARK2,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-end',
              background: DARK3,
              border: `1px solid ${BORDER}`,
              padding: '4px 4px 4px 14px',
              transition: 'border-color 0.2s',
            }}
            onFocusCapture={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = GOLD;
            }}
            onBlurCapture={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = BORDER;
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              rows={1}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = 'auto';
                t.style.height = Math.min(t.scrollHeight, 120) + 'px';
              }}
              placeholder="Type vehicle details or a question…"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#f5f2ed',
                fontSize: 14,
                fontFamily: FB,
                resize: 'none',
                lineHeight: 1.5,
                padding: '8px 0',
                maxHeight: 120,
                overflowY: 'auto',
                outline: 'none',
              }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{
                background:
                  loading || !input.trim()
                    ? '#222'
                    : `linear-gradient(135deg,${GOLD} 0%,${GOLD_LO} 100%)`,
                border: 'none',
                color: loading || !input.trim() ? '#444' : DARK,
                width: 38,
                height: 38,
                fontSize: 16,
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s',
              }}
            >
              ↑
            </button>
          </div>
          <div
            style={{
              fontSize: 10,
              color: '#3A3A3A',
              marginTop: 5,
              textAlign: 'center',
              fontFamily: FM,
              letterSpacing: '0.08em',
            }}
          >
            ENTER TO SEND · SHIFT+ENTER FOR NEW LINE
          </div>
        </div>
      </div>
    </>
  );
}
