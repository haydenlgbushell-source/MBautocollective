interface ParsedDescription {
  intro: string;
  features: string[];
  body: string;
  dealershipOffers: string[];
}

function parseDescription(text: string): ParsedDescription {
  const result: ParsedDescription = { intro: '', features: [], body: '', dealershipOffers: [] };

  const lowerText = text.toLowerCase();
  const includingIdx = lowerText.indexOf('including:');

  const extractOffers = (remaining: string) => {
    const offersIdx = remaining.toLowerCase().indexOf('dealership offers:');
    if (offersIdx !== -1) {
      result.body = remaining.slice(0, offersIdx).trim();
      const raw = remaining.slice(offersIdx + 'dealership offers:'.length).trim();
      result.dealershipOffers = raw.split(/(?<=[a-z])\s+(?=[A-Z])/).filter(Boolean);
    } else {
      result.body = remaining;
    }
  };

  if (includingIdx !== -1) {
    result.intro = text.slice(0, includingIdx + 'including:'.length);
    const afterIncluding = text.slice(includingIdx + 'including:'.length).trim();
    const parts = afterIncluding.split(/\s*-\s*/);
    const features: string[] = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;

      const isMuchMore = /^and much more/i.test(part);
      const isFeature = !isMuchMore && part.length < 60 && !part.includes('. ');

      if (isFeature) {
        features.push(part);
      } else {
        result.features = features;
        const trailingText = isMuchMore
          ? [part.replace(/^and much more\s*/i, ''), ...parts.slice(i + 1)].join(' - ').trim()
          : parts.slice(i).join(' - ').trim();
        extractOffers(trailingText);
        break;
      }
    }

    if (result.features.length === 0 && features.length > 0) {
      result.features = features;
    }
  } else {
    extractOffers(text);
  }

  return result;
}

function splitIntoParagraphs(text: string): string[] {
  const sentences = text.split(/(?<=\.)\s+/).filter(Boolean);
  if (sentences.length <= 3) return [text];
  const mid = Math.ceil(sentences.length / 2);
  return [sentences.slice(0, mid).join(' '), sentences.slice(mid).join(' ')];
}

export default function DescriptionBlock({ text }: { text: string }) {
  const { intro, features, body, dealershipOffers } = parseDescription(text);
  const paragraphs = body ? splitIntoParagraphs(body) : [];

  return (
    <div className="mb-10 max-w-[680px] space-y-5 text-[14px] text-text-2 leading-[1.92]">
      {intro && <p>{intro}</p>}

      {features.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-[6px] pl-0 list-none">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-[6px] h-[5px] w-[5px] flex-shrink-0 bg-gold" aria-hidden="true" />
              {f}
            </li>
          ))}
        </ul>
      )}

      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}

      {dealershipOffers.length > 0 && (
        <div className="pt-1">
          <p className="font-mono-custom text-[9px] tracking-[0.28em] uppercase text-gold mb-3">
            Dealership Offers
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-[6px] pl-0 list-none">
            {dealershipOffers.map((o, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-[6px] h-[5px] w-[5px] flex-shrink-0 bg-gold" aria-hidden="true" />
                {o.trim()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
