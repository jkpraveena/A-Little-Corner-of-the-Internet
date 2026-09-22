import { useEffect, useState } from 'react';
import { Check, Lock, PenLine } from 'lucide-react';
import type { FutureLetter } from '@workspace/api-client-react';
import { useSaveFutureLetter } from '@workspace/api-client-react';
import { SectionHeading } from './SectionHeading';

export function FutureLetterSection({ letter, targetDate, onSaved }: { letter?: FutureLetter; targetDate: string; onSaved: (letter: FutureLetter) => void }) {
  const [draft, setDraft] = useState('');
  const saveLetter = useSaveFutureLetter();
  const isLocked = Boolean(letter?.isFinal);

  useEffect(() => {
    if (letter?.letter) setDraft(letter.letter);
  }, [letter]);

  const save = () => {
    if (!draft.trim() || isLocked) return;
    saveLetter.mutate({ data: { letter: draft.trim() } }, { onSuccess: onSaved });
  };

  return (
    <section id="future-letter" className="section-wrap scroll-mt-12 py-28 sm:py-40">
      <SectionHeading index="02" kicker="the future letter" title="A little time travel, in your own handwriting." intro={`Write to the you who opens this on ${targetDate || 'a day that matters'}.`} />
      <div className="relative overflow-hidden rounded-[30px] bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-lift)] sm:p-11">
        <div aria-hidden className="absolute -right-12 -top-16 h-56 w-56 rounded-full border border-white/15" />
        <div aria-hidden className="absolute -right-1 top-0 h-40 w-40 rounded-full border border-white/10" />
        <div className="relative max-w-3xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <p className="eyebrow text-white/65">to be opened later</p>
            {isLocked && <span className="flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs"><Lock size={13} /> sealed</span>}
          </div>
          <textarea
            data-testid="textarea-future-letter"
            disabled={isLocked}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Dear future me…"
            className="min-h-[270px] w-full resize-y border-0 border-b border-white/30 bg-transparent px-0 py-2 font-display text-3xl leading-[1.18] text-white outline-none placeholder:text-white/45 sm:text-5xl disabled:cursor-not-allowed disabled:opacity-90"
          />
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-white/65">{letter?.targetDate ? `Sealed for ${letter.targetDate}` : 'This can only be saved once.'}</p>
            {!isLocked && (
              <button type="button" data-testid="button-save-future-letter" onClick={save} disabled={saveLetter.isPending || !draft.trim()} className="focus-ring inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-[hsl(var(--primary))] transition hover:-translate-y-0.5 disabled:opacity-50">
                {saveLetter.isPending ? 'Sealing…' : <><PenLine size={15} /> Seal this letter</>}
              </button>
            )}
            {isLocked && <span className="flex items-center gap-2 text-xs text-white/70"><Check size={14} /> It is safe here.</span>}
          </div>
        </div>
      </div>
    </section>
  );
}