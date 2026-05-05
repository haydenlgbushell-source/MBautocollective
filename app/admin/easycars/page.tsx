'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

const GOLD   = '#b8963e';
const GOLD_LO = '#7a6428';
const DARK   = '#0a0a0a';
const DARK2  = '#111111';
const DARK3  = '#1c1c1e';
const BORDER = 'rgba(184,150,62,0.25)';
const GREEN  = '#4CAF50';
const RED    = '#EF5350';
const FD = 'var(--fd)';
const FB = 'var(--fb)';
const FM = 'var(--fm)';

// ── Types ─────────────────────────────────────────────────────────────────────

type ImageContent = { type: 'image'; source: { type: 'base64'; media_type: 'image/jpeg' | 'image/png'; data: string } };
type TextContent  = { type: 'text'; text: string };
type ApiMessage   = { role: 'user' | 'assistant'; content: string | (TextContent | ImageContent)[] };

interface ChatMessage {
  role: 'user' | 'assistant' | 'divider';
  content: string;
  thumbs?: string[];
}

interface UploadedFile {
  name: string;
  base64: string;
  mediaType: 'image/jpeg' | 'image/png';
  preview: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractJson(text: string, tag: string): Record<string, unknown> | null {
  const start = text.indexOf(tag + '\n');
  const end   = text.indexOf('\nEND_' + tag);
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(text.slice(start + tag.length + 1, end).trim()); }
  catch { return null; }
}

function hasPayloads(text: string) {
  return text.includes('SUPABASE_JSON') && text.includes('HUBSPOT_JSON');
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '12px 16px' }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: GOLD,
          animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ── Screenshot uploader ───────────────────────────────────────────────────────

interface UploaderProps {
  onProcess: (files: UploadedFile[]) => void;
  loading: boolean;
}

function ScreenshotUploader({ onProcess, loading }: UploaderProps) {
  const [files, setFiles]   = useState<UploadedFile[]>([]);
  const [dragging, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(async (raw: FileList | File[]) => {
    const accepted = Array.from(raw).filter((f) =>
      f.type === 'image/jpeg' || f.type === 'image/png' || f.type === 'image/webp'
    );
    const converted = await Promise.all(accepted.map(async (f) => ({
      name:      f.name,
      base64:    await fileToBase64(f),
      mediaType: (f.type === 'image/png' ? 'image/png' : 'image/jpeg') as 'image/jpeg' | 'image/png',
      preview:   URL.createObjectURL(f),
    })));
    setFiles((p) => [...p, ...converted].slice(0, 8));
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, background: DARK2 }}>
      <div style={{ fontSize: 9, fontFamily: FM, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>
        Upload EasyCars Screenshots
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? GOLD : BORDER}`,
          padding: '18px 12px', textAlign: 'center', cursor: 'pointer',
          background: dragging ? 'rgba(184,150,62,0.05)' : 'transparent',
          transition: 'all 0.2s', marginBottom: 10,
        }}
      >
        <div style={{ fontSize: 22, marginBottom: 4 }}>📸</div>
        <div style={{ fontSize: 12, color: '#666', fontFamily: FB }}>
          Drag & drop screenshots here, or <span style={{ color: GOLD }}>click to browse</span>
        </div>
        <div style={{ fontSize: 10, color: '#3A3A3A', fontFamily: FM, marginTop: 4 }}>
          Take screenshots of the EasyCars listing — up to 8 images
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {/* Thumbnails */}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {files.map((f, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <img src={f.preview} alt={f.name} style={{ width: 72, height: 54, objectFit: 'cover', border: `1px solid ${BORDER}` }} />
              <button
                onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                style={{
                  position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)',
                  border: 'none', color: '#fff', width: 16, height: 16, fontSize: 9,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2,
                }}
              >✕</button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => files.length && onProcess(files)}
        disabled={files.length === 0 || loading}
        style={{
          width: '100%',
          background: files.length === 0 || loading
            ? '#1a1a1a'
            : `linear-gradient(135deg,${GOLD} 0%,${GOLD_LO} 100%)`,
          border: `1px solid ${files.length === 0 || loading ? '#333' : GOLD}`,
          color:  files.length === 0 || loading ? '#444' : DARK,
          padding: '11px 0', fontSize: 12, fontWeight: 700,
          cursor: files.length === 0 || loading ? 'not-allowed' : 'pointer',
          fontFamily: FM, letterSpacing: '0.1em', textTransform: 'uppercase',
          transition: 'all 0.2s',
        }}
      >
        {loading ? '⟳ Extracting…' : files.length === 0 ? 'Add screenshots above to continue' : `✦ Extract Vehicle Details (${files.length} image${files.length > 1 ? 's' : ''})`}
      </button>
    </div>
  );
}

// ── Push panel ────────────────────────────────────────────────────────────────

interface PushPanelProps { text: string; onReset: () => void; }

function PushPanel({ text, onReset }: PushPanelProps) {
  const [sbStatus, setSbStatus] = useState<'idle'|'pushing'|'ok'|'error'>('idle');
  const [hsStatus, setHsStatus] = useState<'idle'|'pushing'|'ok'|'error'>('idle');
  const [sbMsg, setSbMsg] = useState('');
  const [hsMsg, setHsMsg] = useState('');
  const [started, setStarted] = useState(false);

  const sbPayload = extractJson(text, 'SUPABASE_JSON');
  const hsPayload = extractJson(text, 'HUBSPOT_JSON');
  const dealname  = hsPayload?.dealname as string | undefined;

  const push = async (only?: 'supabase' | 'hubspot') => {
    if (!only) setStarted(true);
    if (!only || only === 'supabase') setSbStatus('pushing');
    if (!only || only === 'hubspot')  setHsStatus('pushing');
    try {
      const res  = await fetch('/api/easycars-agent/push', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supabase: sbPayload, hubspot: hsPayload, only }),
      });
      const data = await res.json();
      if (!only || only === 'supabase') { setSbStatus(data.supabase.ok ? 'ok' : 'error'); setSbMsg(data.supabase.message); }
      if (!only || only === 'hubspot')  { setHsStatus(data.hubspot.ok  ? 'ok' : 'error'); setHsMsg(data.hubspot.message); }
    } catch {
      if (!only || only === 'supabase') { setSbStatus('error'); setSbMsg('Network error'); }
      if (!only || only === 'hubspot')  { setHsStatus('error'); setHsMsg('Network error'); }
    }
  };

  const allDone = sbStatus === 'ok' && hsStatus === 'ok';
  const sc = (s: string) => s === 'ok' ? GREEN : s === 'error' ? RED : s === 'pushing' ? GOLD : '#555';
  const sl = (s: string) => ({ idle: 'Ready', pushing: 'Pushing…', ok: 'Done ✓', error: 'Failed' })[s] ?? s;

  return (
    <div style={{ background: 'rgba(184,150,62,0.05)', border: `1px solid rgba(184,150,62,0.2)`, padding: 16, margin: '4px 0', animation: 'fadeUp 0.3s ease' }}>
      <div style={{ fontSize: 12, color: GOLD, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: FM, marginBottom: 12 }}>
        Ready to Push
      </div>
      {[
        { label: 'Supabase', sub: 'vehicles table',   status: sbStatus, msg: sbMsg },
        { label: 'HubSpot',  sub: dealname || 'Deal', status: hsStatus, msg: hsMsg },
      ].map((row) => (
        <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: '#f5f2ed', fontFamily: FB }}>{row.label}</div>
            <div style={{ fontSize: 11, color: '#555', fontFamily: FB, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>{row.msg || row.sub}</div>
          </div>
          <div style={{ fontSize: 11, color: sc(row.status), fontFamily: FM, letterSpacing: '0.08em', textTransform: 'uppercase', minWidth: 70, textAlign: 'right' }}>
            {row.status === 'pushing' ? <span style={{ animation: 'pulse 1s infinite', display: 'inline-block' }}>●</span> : sl(row.status)}
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        {!started && (
          <button onClick={() => push()} style={{ flex: 1, background: `linear-gradient(135deg,${GOLD} 0%,${GOLD_LO} 100%)`, border: 'none', color: DARK, padding: '12px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FM, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            🚀 Push to Both Systems
          </button>
        )}
        {started && !allDone && sbStatus !== 'ok' && (
          <button onClick={() => push('supabase')} style={{ flex: 1, background: 'transparent', border: `1px solid ${GOLD}`, color: GOLD, padding: '10px 0', fontSize: 12, cursor: 'pointer', fontFamily: FM, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Retry Supabase</button>
        )}
        {started && !allDone && hsStatus !== 'ok' && (
          <button onClick={() => push('hubspot')} style={{ flex: 1, background: 'transparent', border: `1px solid ${GOLD}`, color: GOLD, padding: '10px 0', fontSize: 12, cursor: 'pointer', fontFamily: FM, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Retry HubSpot</button>
        )}
        {allDone && (
          <button onClick={onReset} style={{ flex: 1, background: 'rgba(76,175,80,0.12)', border: `1px solid ${GREEN}`, color: GREEN, padding: '12px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FM, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            ✓ Add Another Vehicle
          </button>
        )}
      </div>
    </div>
  );
}

// ── Chat message ──────────────────────────────────────────────────────────────

function ChatMsg({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  if (msg.role === 'divider') {
    return <div style={{ textAlign: 'center', color: '#3A3A3A', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '6px 0', fontFamily: FM }}>{msg.content}</div>;
  }

  const display = isUser
    ? msg.content
    : msg.content
        .replace(/SUPABASE_JSON[\s\S]*?END_SUPABASE_JSON/g, '✓ Supabase payload ready')
        .replace(/HUBSPOT_JSON[\s\S]*?END_HUBSPOT_JSON/g,   '✓ HubSpot payload ready');

  return (
    <div style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap: 10, alignItems: 'flex-end' }}>
      {!isUser && (
        <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg,${GOLD} 0%,${GOLD_LO} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: DARK, fontFamily: FD }}>M</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: 4, maxWidth: '76%' }}>
        {msg.thumbs && msg.thumbs.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {msg.thumbs.map((src, i) => (
              <img key={i} src={src} alt="" style={{ height: 60, maxWidth: 100, objectFit: 'cover', border: `1px solid ${BORDER}`, opacity: 0.85 }} />
            ))}
          </div>
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
  const [messages,  setMessages]  = useState<ChatMessage[]>([{
    role: 'assistant',
    content: "G'day. Take screenshots of the EasyCars vehicle listing and upload them above — I'll extract all the details, look up the Australian spec features, and get everything ready to push to your website and CRM.",
  }]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [pushText,  setPushText]  = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const convRef   = useRef<ApiMessage[]>([]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading, pushText]);

  // ── Process uploaded screenshots ─────────────────────────────────────────

  const processScreenshots = async (files: UploadedFile[]) => {
    setLoading(true);

    const previews = files.map((f) => f.preview);
    setMessages((p) => [...p, {
      role: 'user',
      content: `${files.length} screenshot${files.length > 1 ? 's' : ''} uploaded — extracting vehicle details…`,
      thumbs: previews,
    }]);

    const imageBlocks: ImageContent[] = files.map((f) => ({
      type: 'image',
      source: { type: 'base64', media_type: f.mediaType, data: f.base64 },
    }));

    const msg: ApiMessage = {
      role: 'user',
      content: [
        ...imageBlocks,
        { type: 'text', text: 'Please read all vehicle details from these EasyCars screenshots. Extract everything visible, look up the standard Australian-spec features for this vehicle, and produce the complete SUPABASE_JSON and HUBSPOT_JSON payloads.' },
      ],
    };

    convRef.current = [...convRef.current, msg];
    await callClaude();
  };

  // ── Text chat ────────────────────────────────────────────────────────────

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setLoading(true);
    const userMsg: ApiMessage = { role: 'user', content: text };
    convRef.current = [...convRef.current, userMsg];
    setMessages((p) => [...p, { role: 'user', content: text }]);
    await callClaude();
  };

  // ── Shared Claude call ───────────────────────────────────────────────────

  const callClaude = async () => {
    try {
      const res  = await fetch('/api/easycars-agent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: convRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || data.error || 'Claude API error');
      const reply: string = data.content?.[0]?.text || 'Something went wrong — please try again.';
      convRef.current = [...convRef.current, { role: 'assistant', content: reply }];
      setMessages((p) => [...p, { role: 'assistant', content: reply }]);
      if (hasPayloads(reply)) setPushText(reply);
    } catch (err: unknown) {
      setMessages((p) => [...p, { role: 'assistant', content: `Error: ${(err as Error).message}` }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  };

  const reset = () => {
    convRef.current = [];
    setPushText(null);
    setMessages([
      { role: 'divider', content: '— new vehicle —' },
      { role: 'assistant', content: 'Ready for the next one. Upload screenshots above.' },
    ]);
  };

  return (
    <>
      <style>{`
        @keyframes pulse   { 0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ background: DARK, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: FB, maxWidth: 700 }}>

        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${BORDER}`, background: DARK2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: FD, fontSize: 20, color: GOLD, fontWeight: 600, letterSpacing: '0.04em' }}>MB Auto Collective</div>
            <div style={{ fontSize: 10, color: '#555', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: FM, marginTop: 1 }}>Vehicle Import — EasyCars</div>
          </div>
          <a href="https://my.easycars.net.au" target="_blank" rel="noopener noreferrer"
            style={{ color: GOLD, fontSize: 11, textDecoration: 'none', fontFamily: FM, letterSpacing: '0.08em' }}>
            Open EasyCars ↗
          </a>
        </div>

        {/* Screenshot uploader */}
        <ScreenshotUploader onProcess={processScreenshots} loading={loading} />

        {/* Chat */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 280 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ animation: 'fadeUp 0.25s ease' }}>
              <ChatMsg msg={m} />
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg,${GOLD} 0%,${GOLD_LO} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: DARK, fontFamily: FD }}>M</div>
              <div style={{ background: DARK3, border: `1px solid ${BORDER}`, borderRadius: '16px 16px 16px 4px' }}>
                <TypingDots />
              </div>
            </div>
          )}

          {pushText && !loading && <PushPanel text={pushText} onReset={reset} />}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        <div style={{ padding: '8px 16px', display: 'flex', gap: 6, overflowX: 'auto', borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
          {["That's all the info", 'Give me the final payloads', 'Update the price to'].map((p) => (
            <button key={p} onClick={() => { setInput(p); inputRef.current?.focus(); }}
              style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: '#555', padding: '5px 10px', borderRadius: 20, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: FB, flexShrink: 0 }}>
              {p}
            </button>
          ))}
        </div>

        {/* Text input */}
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${BORDER}`, background: DARK2, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: DARK3, border: `1px solid ${BORDER}`, padding: '4px 4px 4px 14px' }}>
            <textarea
              ref={inputRef}
              value={input}
              rows={1}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 120) + 'px'; }}
              placeholder="Add notes, correct a field, or ask a question…"
              disabled={loading}
              style={{ flex: 1, background: 'transparent', border: 'none', color: '#f5f2ed', fontSize: 14, fontFamily: FB, resize: 'none', lineHeight: 1.5, padding: '8px 0', maxHeight: 120, overflowY: 'auto', outline: 'none', opacity: loading ? 0.5 : 1 }}
            />
            <button onClick={send} disabled={loading || !input.trim()}
              style={{ background: loading || !input.trim() ? '#222' : `linear-gradient(135deg,${GOLD} 0%,${GOLD_LO} 100%)`, border: 'none', color: loading || !input.trim() ? '#444' : DARK, width: 38, height: 38, fontSize: 16, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>↑</button>
          </div>
          <div style={{ fontSize: 10, color: '#3A3A3A', marginTop: 5, textAlign: 'center', fontFamily: FM, letterSpacing: '0.08em' }}>ENTER TO SEND · SHIFT+ENTER FOR NEW LINE</div>
        </div>
      </div>
    </>
  );
}
