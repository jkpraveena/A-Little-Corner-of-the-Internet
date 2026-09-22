import { useState } from 'react';
import { ChevronDown, MailOpen } from 'lucide-react';
import type { OpenWhenLetter } from '@workspace/api-client-react';

export function LetterCard({ letter, index }: { letter: OpenWhenLetter; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <article className={`rounded-[22px] border border-white/70 bg-white/45 transition ${open ? 'bg-white/72 shadow-[var(--shadow-soft)]' : ''}`}>
      <button
        type="button"
        data-testid={`button-open-letter-${letter.id}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="focus-ring flex w-full items-center gap-4 p-5 text-left sm:p-6"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><MailOpen size={18} /></span>
        <span className="min-w-0 flex-1">
          <span className="eyebrow block mb-2 text-[hsl(var(--muted-foreground))]">open when · 0{index + 1}</span>
          <span data-testid={`text-open-letter-title-${letter.id}`} className="block font-display text-2xl">{letter.title}</span>
        </span>
        <ChevronDown size={19} className={`shrink-0 text-[hsl(var(--muted-foreground))] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <p data-testid={`text-open-letter-message-${letter.id}`} className="border-t border-[hsl(var(--border)/.65)] px-5 pb-6 pt-5 text-sm leading-7 text-[hsl(var(--muted-foreground))] sm:px-6">{letter.message}</p>
        </div>
      </div>
    </article>
  );
}