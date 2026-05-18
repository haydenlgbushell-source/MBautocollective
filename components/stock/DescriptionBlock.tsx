interface Props {
  description: string;
}

interface Parsed {
  intro: string;
  features: string[];
  bodyPara1: string;
  bodyPara2: string;
  dealerItems: string[];
}

function extractBullets(text: string): string[] {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  // Multi-line "- item\n- item" format
  if (/\n/.test(normalized)) {
    return normalized
      .split('\n')
      .map((l) => l.replace(/^[-•]\s*/, '').trim())
      .filter(Boolean);
  }

  // Inline " - " separated format: "item1 - item2 - item3"
  return normalized
    .split(/\s+-\s+/)
    .map((s) => s.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean);
}

function splitAtMidpoint(text: string): [string, string] {
  if (!text) return ['', ''];
  const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g) ?? [];
  if (sentences.length <= 1) return [text.trim(), ''];
  const mid = Math.ceil(sentences.length / 2);
  return [
    sentences.slice(0, mid).join('').trim(),
    sentences.slice(mid).join('').trim(),
  ];
}

function parse(raw: string): Parsed {
  const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 1. Intro — everything up to and including "including:"
  const incMatch = /including:/i.exec(text);
  let intro = '';
  let after = text.trim();
  if (incMatch) {
    intro = text.slice(0, incMatch.index + incMatch[0].length).trim();
    after = text.slice(incMatch.index + incMatch[0].length).trim();
  }

  // 2. Dealership Offers — detected at "Dealership offers:"
  const dealerMatch = /dealership offers?:/i.exec(after);
  let dealerItems: string[] = [];
  let mid = after;
  if (dealerMatch) {
    mid = after.slice(0, dealerMatch.index).trim();
    const dealerRaw = after.slice(dealerMatch.index + dealerMatch[0].length).trim();
    dealerItems = extractBullets(dealerRaw);
  }

  // 3. Feature bullets vs body paragraphs
  // Attempt newline-aware line-by-line pass first
  const lines = mid.split('\n').map((l) => l.trim()).filter(Boolean);
  const features: string[] = [];
  const bodyLines: string[] = [];
  let inBody = false;

  for (const line of lines) {
    if (inBody) {
      bodyLines.push(line);
      continue;
    }
    // Dash/bullet prefixed line → feature
    if (/^[-•]/.test(line)) {
      features.push(line.replace(/^[-•]\s*/, ''));
      continue;
    }
    // Inline " - " list with all short tokens and no sentence endings → features
    const tokens = line.split(/\s+-\s+/);
    const allShort =
      tokens.length > 1 && tokens.every((t) => t.replace(/^[-•]\s*/, '').length < 70 && !/[.!?]\s*$/.test(t));
    if (allShort) {
      features.push(...tokens.map((t) => t.replace(/^[-•]\s*/, '').trim()).filter(Boolean));
      continue;
    }
    // Otherwise this is body text
    inBody = true;
    bodyLines.push(line);
  }

  // Fallback: single-block text with no newlines — try inline token split
  if (features.length === 0 && bodyLines.length === 0 && mid) {
    const tokens = mid.split(/\s+-\s+/);
    for (const t of tokens) {
      const clean = t.replace(/^[-•]\s*/, '').trim();
      if (!inBody && clean.length < 70 && !/[.!?]\s+[A-Z]/.test(clean)) {
        features.push(clean);
      } else {
        inBody = true;
        bodyLines.push(clean);
      }
    }
  }

  const bodyFull = bodyLines.join(' ').trim();
  const [bodyPara1, bodyPara2] = splitAtMidpoint(bodyFull);

  return { intro, features, bodyPara1, bodyPara2, dealerItems };
}

function GoldDot() {
  return <span className="w-[5px] h-[5px] rounded-full bg-gold flex-shrink-0 mt-[5px]" />;
}

function BulletGrid({ items }: { items: string[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 py-[10px] border-b border-border">
          <GoldDot />
          <span className="text-[13px] text-text-2">{item}</span>
        </div>
      ))}
    </div>
  );
}

export default function DescriptionBlock({ description }: Props) {
  const { intro, features, bodyPara1, bodyPara2, dealerItems } = parse(description);

  // If no structure was detected, render plain
  if (!intro && features.length === 0 && !bodyPara1 && dealerItems.length === 0) {
    return <p className="text-[14px] text-text-2 leading-[1.92]">{description}</p>;
  }

  return (
    <div className="space-y-7">
      {intro && <p className="text-[14px] text-text-2 leading-[1.92]">{intro}</p>}

      {features.length > 0 && <BulletGrid items={features} />}

      {bodyPara1 && <p className="text-[14px] text-text-2 leading-[1.92]">{bodyPara1}</p>}
      {bodyPara2 && <p className="text-[14px] text-text-2 leading-[1.92]">{bodyPara2}</p>}

      {dealerItems.length > 0 && (
        <div>
          <div className="flex items-center gap-5 mb-4">
            <span className="font-mono-custom text-[9px] tracking-[0.3em] uppercase text-gold whitespace-nowrap">
              Dealership Offers
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <BulletGrid items={dealerItems} />
        </div>
      )}
    </div>
  );
}
