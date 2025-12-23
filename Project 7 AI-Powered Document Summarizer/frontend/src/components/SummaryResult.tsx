import { useState } from 'react';
import type { SummaryData, Priority } from '../types';

interface SummaryResultProps {
  data: SummaryData;
}

const priorityStyles: Record<Priority, string> = {
  high: 'border-seal text-seal',
  medium: 'border-ink-600 text-ink-600',
  low: 'border-ink-900/30 text-ink-900/60',
};

export default function SummaryResult({ data }: SummaryResultProps) {
  const [copied, setCopied] = useState(false);

  const copySummary = async () => {
    const text = [
      data.title,
      '',
      data.summary,
      '',
      'Key points:',
      ...data.key_points.map((p) => `- ${p}`),
      '',
      'Action items:',
      ...data.action_items.map(
        (a) => `- [${a.priority}] ${a.item}${a.owner_hint ? ` (${a.owner_hint})` : ''}`
      ),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable (e.g. insecure context) — fail quietly
    }
  };

  return (
    <article className='border border-ink-900/15 bg-white'>
      {/* Dossier header */}
      <header className='border-b border-ink-900/15 bg-ink-950 p-6 text-white'>
        <div className='mb-3 flex flex-wrap items-center gap-3 font-mono text-xs'>
          <span className='border border-ink-400/50 px-2 py-0.5 uppercase tracking-wider text-ink-400'>
            {data.document_type}
          </span>
          <span className='text-white/50'>
            {data.page_count} pages · {data.word_count.toLocaleString()} words
            {data.chunked && ' · multi-pass analysis'}
          </span>
        </div>
        <h2 className='font-display text-xl font-bold leading-snug'>{data.title}</h2>
      </header>

      <div className='space-y-8 p-6'>
        <section>
          <h3 className='mb-2 font-mono text-xs uppercase tracking-wider text-ink-900/60'>
            Executive summary
          </h3>
          <p className='font-body leading-relaxed text-ink-950'>{data.summary}</p>
        </section>

        <section>
          <h3 className='mb-3 font-mono text-xs uppercase tracking-wider text-ink-900/60'>
            Key points
          </h3>
          <ul className='space-y-2'>
            {data.key_points.map((point, index) => (
              <li key={index} className='flex gap-3 font-body text-ink-950'>
                <span className='mt-1.5 h-1.5 w-1.5 shrink-0 bg-ink-600' aria-hidden />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        {data.action_items.length > 0 && (
          <section>
            <h3 className='mb-3 font-mono text-xs uppercase tracking-wider text-ink-900/60'>
              Action items
            </h3>
            <ul className='space-y-3'>
              {data.action_items.map((action, index) => (
                <li key={index} className='flex flex-wrap items-start gap-3'>
                  <span
                    className={`shrink-0 border px-2 py-0.5 font-mono text-[11px] uppercase ${priorityStyles[action.priority] ?? priorityStyles.low}`}
                  >
                    {action.priority}
                  </span>
                  <span className='flex-1 font-body text-ink-950'>
                    {action.item}
                    {action.owner_hint && (
                      <span className='ml-2 font-mono text-xs text-ink-900/50'>
                        → {action.owner_hint}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.compliance_flags.length > 0 && (
          <section className='border-l-2 border-seal bg-seal/5 p-4'>
            <h3 className='mb-2 font-mono text-xs uppercase tracking-wider text-seal'>
              Compliance flags
            </h3>
            <ul className='space-y-1.5'>
              {data.compliance_flags.map((flag, index) => (
                <li key={index} className='font-body text-sm text-ink-950'>
                  {flag}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <footer className='border-t border-ink-900/15 p-4 text-right'>
        <button
          type='button'
          onClick={copySummary}
          className='border border-ink-900/20 px-4 py-2 font-mono text-xs uppercase tracking-wider text-ink-900 transition-colors hover:bg-ink-900 hover:text-white'
        >
          {copied ? 'Copied' : 'Copy summary'}
        </button>
      </footer>
    </article>
  );
}
