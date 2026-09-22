import { useMemo } from 'react';
import { ArrowDown, ArrowUpRight, Cloud, LogOut, Sparkles } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { FutureLetter, SiteContent, Snapshot } from '@workspace/api-client-react';
import {
  getGetFutureLetterQueryKey,
  getGetSessionQueryKey,
  getGetSiteContentQueryKey,
  getGetSnapshotQueryKey,
  useGetFutureLetter,
  useGetSession,
  useGetSiteContent,
  useGetSnapshot,
  useLogout,
} from '@workspace/api-client-react';
import { PasswordGate } from '@/components/PasswordGate';
import { SectionHeading } from '@/components/SectionHeading';
import { MemoryCard } from '@/components/MemoryCard';
import { LetterCard } from '@/components/LetterCard';
import { SnapshotSection } from '@/components/SnapshotSection';
import { FutureLetterSection } from '@/components/FutureLetterSection';

function LoadingShell() {
  return (
    <main className="page-shell min-h-[100dvh] px-5 py-8">
      <div className="section-wrap">
        <div className="h-9 w-36 animate-pulse rounded-full bg-[hsl(var(--muted))]" />
        <div className="mt-28 max-w-3xl space-y-5">
          <div className="h-4 w-28 animate-pulse rounded bg-[hsl(var(--muted))]" />
          <div className="h-24 w-full max-w-2xl animate-pulse rounded-2xl bg-[hsl(var(--muted))]" />
          <div className="h-5 w-2/3 animate-pulse rounded bg-[hsl(var(--muted))]" />
        </div>
      </div>
    </main>
  );
}

function ContentError({ retry }: { retry: () => void }) {
  return (
    <main className="page-shell min-h-[100dvh] grid place-items-center px-5">
      <section className="glass max-w-md rounded-[28px] p-8 text-center">
        <Cloud size={30} className="mx-auto text-[hsl(var(--primary))]" />
        <h1 className="font-display mt-5 text-4xl">The corner is still waking up.</h1>
        <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Something got in the way of loading this little archive.</p>
        <button type="button" data-testid="button-retry-content" onClick={retry} className="focus-ring mt-6 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]">Try again</button>
      </section>
    </main>
  );
}

function HomeContent({ content, snapshot, futureLetter, onSnapshotSaved, onFutureLetterSaved, onLogout }: {
  content: SiteContent;
  snapshot?: Snapshot;
  futureLetter?: FutureLetter;
  onSnapshotSaved: (value: Snapshot) => void;
  onFutureLetterSaved: (value: FutureLetter) => void;
  onLogout: () => void;
}) {
  const memories = useMemo(() => [...content.memories].sort((a, b) => a.displayOrder - b.displayOrder), [content.memories]);
  const openWhen = useMemo(() => [...content.openWhen].sort((a, b) => a.displayOrder - b.displayOrder), [content.openWhen]);
  const configDate = content.config.birthdayDate;
  const readableDate = configDate ? new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(configDate)) : '';

  return (
    <div className="page-shell min-h-[100dvh]">
      <header className="fixed inset-x-0 top-0 z-20 px-4 py-4 sm:px-7">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between rounded-full border border-white/70 bg-white/55 px-4 py-2.5 shadow-[0_10px_40px_hsl(205_42%_40%/.08)] backdrop-blur-xl sm:px-5">
          <a href="#top" data-testid="link-home-top" className="focus-ring flex items-center gap-2 text-xs font-bold tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[hsl(var(--primary))] text-white"><Sparkles size={13} /></span>
            a little corner
          </a>
          <nav aria-label="Capsule sections" className="hidden items-center gap-5 md:flex">
            <a data-testid="link-nav-snapshot" href="#snapshot" className="focus-ring text-[11px] font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">snapshot</a>
            <a data-testid="link-nav-memories" href="#memories" className="focus-ring text-[11px] font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">memories</a>
            <a data-testid="link-nav-letters" href="#letters" className="focus-ring text-[11px] font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">letters</a>
          </nav>
          <button type="button" data-testid="button-logout" onClick={onLogout} className="focus-ring flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-bold text-[hsl(var(--muted-foreground))] hover:bg-white/60 hover:text-[hsl(var(--foreground))]">
            <LogOut size={14} /> <span className="hidden sm:inline">leave quietly</span>
          </button>
        </div>
      </header>

      <main id="top">
        <section className="section-wrap relative flex min-h-[100dvh] items-center pb-20 pt-32 sm:pt-36">
          <div aria-hidden className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-cyan-200/35 blur-3xl drift" />
          <div aria-hidden className="absolute left-[-7rem] top-[35%] h-64 w-64 rounded-full bg-blue-200/35 blur-3xl pulse-soft" />
          <div className="relative grid w-full items-end gap-14 lg:grid-cols-[1.15fr_.85fr]">
            <div className="reveal">
              <p className="eyebrow mb-7 text-[hsl(var(--primary))]">a private birthday time capsule</p>
              <h1 data-testid="text-hero-title" className="font-display max-w-4xl text-[clamp(4.4rem,11vw,9.7rem)] leading-[.78] tracking-[-.055em] text-[hsl(var(--foreground))]">
                Hi,<br /><span className="serif-italic text-[hsl(var(--primary))]">{content.config.personName}.</span>
              </h1>
              <p data-testid="text-hero-intro" className="mt-9 max-w-lg text-base leading-8 text-[hsl(var(--muted-foreground))] sm:text-lg">{content.config.introText}</p>
              <a data-testid="link-begin-capsule" href="#snapshot" className="focus-ring mt-9 inline-flex items-center gap-3 rounded-full bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-lift)] transition hover:-translate-y-1">
                Begin at the beginning <ArrowDown size={16} />
              </a>
            </div>
            <div className="reveal reveal-delay-2 relative hidden justify-self-end lg:flex">
              <div className="glass relative aspect-[.78/1] w-[280px] rotate-[4deg] rounded-[34px] p-4">
                <div className="h-full rounded-[25px] border border-white/70 bg-gradient-to-b from-cyan-100/70 via-blue-50/50 to-white/40 p-6">
                  <div className="flex items-center justify-between text-[hsl(var(--primary))]"><Sparkles size={19} /><span className="font-mono-ui text-[10px]">01 — 04</span></div>
                  <div className="mt-24">
                    <p className="eyebrow text-[hsl(var(--muted-foreground))]">for the archives</p>
                    <p className="font-display mt-4 text-5xl leading-[.9]">a soft<br /><span className="serif-italic text-[hsl(var(--primary))]">place</span><br />to land.</p>
                  </div>
                  <div className="absolute bottom-9 left-6 right-6 flex items-center justify-between border-t border-[hsl(var(--border))] pt-3 text-[10px] text-[hsl(var(--muted-foreground))]"><span>{readableDate}</span><span>kept safe</span></div>
                </div>
              </div>
            </div>
          </div>
          <p className="absolute bottom-7 left-0 hidden font-mono-ui text-[10px] text-[hsl(var(--muted-foreground))] sm:block">scroll slowly / take your time</p>
        </section>

        <SnapshotSection snapshot={snapshot} onSaved={onSnapshotSaved} />

        <section id="memories" className="scroll-mt-12 bg-[hsl(var(--secondary)/.48)] py-28 sm:py-40">
          <div className="section-wrap">
            <SectionHeading index="03" kicker="three little memories" title="Proof that the ordinary was never ordinary." intro="A few scenes I would press between the pages if this were a real book." />
            {memories.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-3 md:items-start">
                {memories.slice(0, 3).map((memory, index) => <MemoryCard key={memory.id} memory={memory} index={index} />)}
              </div>
            ) : (
              <div data-testid="empty-memories" className="rounded-[24px] border border-dashed border-[hsl(var(--border))] p-10 text-center text-sm text-[hsl(var(--muted-foreground))]">The memory shelves are waiting to be filled.</div>
            )}
          </div>
        </section>

        <FutureLetterSection letter={futureLetter} targetDate={readableDate} onSaved={onFutureLetterSaved} />

        <section id="letters" className="section-wrap scroll-mt-12 py-28 sm:py-40">
          <SectionHeading index="04" kicker="open-when letters" title="For the days that need a little extra." intro="Not advice. Just a hand on your shoulder from a day when everything felt possible." />
          {openWhen.length > 0 ? (
            <div className="mx-auto grid max-w-3xl gap-3">
              {openWhen.map((letter, index) => <LetterCard key={letter.id} letter={letter} index={index} />)}
            </div>
          ) : (
            <div data-testid="empty-open-when" className="rounded-[24px] border border-dashed border-[hsl(var(--border))] p-10 text-center text-sm text-[hsl(var(--muted-foreground))]">The sealed envelopes are still being arranged.</div>
          )}
        </section>

        <section className="relative overflow-hidden bg-[hsl(var(--primary))] py-28 text-[hsl(var(--primary-foreground))] sm:py-40">
          <div aria-hidden className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
          <div aria-hidden className="absolute left-1/2 top-1/2 h-[23rem] w-[23rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
          <div className="section-wrap relative text-center">
            <p className="eyebrow text-white/60">05 · the final letter</p>
            <p data-testid="text-final-letter" className="mx-auto mt-10 max-w-3xl whitespace-pre-line font-display text-4xl leading-[1.08] sm:text-6xl">{content.finalLetter}</p>
            <div className="mx-auto mt-10 h-px w-14 bg-white/40" />
            <p className="mt-5 text-xs text-white/60">with love, from the version of us who made this</p>
          </div>
        </section>

        <section className="section-wrap py-32 text-center sm:py-48">
          <p className="eyebrow text-[hsl(var(--primary))]">06 · the birthday message</p>
          <h2 className="font-display mx-auto mt-7 max-w-4xl text-6xl leading-[.87] tracking-[-.04em] sm:text-8xl">
            Keep being<br /><span className="serif-italic text-[hsl(var(--primary))]">exactly you.</span>
          </h2>
          <p data-testid="text-birthday-message" className="mx-auto mt-10 max-w-2xl whitespace-pre-line text-base leading-8 text-[hsl(var(--muted-foreground))]">{content.birthdayMessage}</p>
          <a data-testid="link-back-to-top" href="#top" className="focus-ring mt-12 inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--primary))] hover:underline">back to the beginning <ArrowUpRight size={15} /></a>
        </section>
      </main>

      <footer className="section-wrap flex flex-col gap-3 border-t border-[hsl(var(--border)/.65)] py-8 text-[10px] text-[hsl(var(--muted-foreground))] sm:flex-row sm:items-center sm:justify-between">
        <span className="font-mono-ui">a little corner of the internet</span>
        <span>made to be revisited</span>
      </footer>
    </div>
  );
}

export default function Home() {
  const queryClient = useQueryClient();
  const sessionQuery = useGetSession({ query: { queryKey: getGetSessionQueryKey() } });
  const authenticated = Boolean(sessionQuery.data?.authenticated);
  const contentQuery = useGetSiteContent({ query: { enabled: authenticated, queryKey: getGetSiteContentQueryKey() } });
  const snapshotQuery = useGetSnapshot({ query: { enabled: authenticated, queryKey: getGetSnapshotQueryKey() } });
  const futureQuery = useGetFutureLetter({ query: { enabled: authenticated, queryKey: getGetFutureLetterQueryKey() } });
  const logout = useLogout();

  if (sessionQuery.isLoading) return <LoadingShell />;
  if (!authenticated) return <PasswordGate />;
  if (contentQuery.isLoading) return <LoadingShell />;
  if (contentQuery.isError || !contentQuery.data) return <ContentError retry={() => void contentQuery.refetch()} />;

  return (
    <HomeContent
      content={contentQuery.data}
      snapshot={snapshotQuery.data}
      futureLetter={futureQuery.data}
      onSnapshotSaved={(value) => queryClient.setQueryData(getGetSnapshotQueryKey(), value)}
      onFutureLetterSaved={(value) => queryClient.setQueryData(getGetFutureLetterQueryKey(), value)}
      onLogout={() => logout.mutate(undefined, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetSessionQueryKey() }) })}
    />
  );
}