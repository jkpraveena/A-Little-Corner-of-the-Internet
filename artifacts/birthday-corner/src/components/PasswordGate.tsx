import { useEffect, useRef, useState } from 'react';
import { ArrowRight, KeyRound, LockKeyhole, Sparkles } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetSessionQueryKey, useUnlock } from '@workspace/api-client-react';

export function PasswordGate() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const unlock = useUnlock();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password.trim()) {
      setError('A little secret is needed to come in.');
      return;
    }
    setError('');
    unlock.mutate({ data: { password } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSessionQueryKey() });
      },
      onError: () => setError('That key did not open this corner. Try again.'),
    });
  };

  return (
    <main className="page-shell min-h-[100dvh] grid place-items-center px-5 py-10">
      <div aria-hidden className="pointer-events-none absolute left-[8%] top-[11%] h-32 w-32 rounded-full bg-cyan-200/40 blur-3xl pulse-soft" />
      <div aria-hidden className="pointer-events-none absolute bottom-[8%] right-[7%] h-48 w-48 rounded-full bg-blue-200/40 blur-3xl drift" />
      <section className="glass hero-glow reveal relative w-full max-w-[460px] rounded-[32px] px-7 py-9 text-center sm:px-12 sm:py-12">
        <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-lg shadow-blue-900/10">
          <LockKeyhole size={23} strokeWidth={1.8} />
        </div>
        <p className="eyebrow mb-5 text-[hsl(var(--primary))]">a private little place</p>
        <h1 className="font-display text-5xl leading-[.94] tracking-[-.03em] text-[hsl(var(--foreground))] sm:text-6xl">
          Come a little<br /><span className="serif-italic text-[hsl(var(--primary))]">closer.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-[310px] text-sm leading-7 text-[hsl(var(--muted-foreground))]">
          There is a corner of the internet waiting with a few things I hope you keep.
        </p>
        <form onSubmit={submit} className="mt-9 text-left">
          <input type="text" name="username" autoComplete="username" tabIndex={-1} aria-hidden="true" className="sr-only" />
          <label htmlFor="capsule-password" className="mb-2 block text-xs font-semibold text-[hsl(var(--foreground))]">
            The password
          </label>
          <div className="relative">
            <KeyRound aria-hidden size={17} className="absolute left-3 top-3.5 text-[hsl(var(--muted-foreground))]" />
            <input
              ref={inputRef}
              id="capsule-password"
              data-testid="input-capsule-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="Something only you would know"
              className="focus-ring h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-white/50 pl-10 pr-4 text-sm outline-none transition focus:border-[hsl(var(--primary))]"
            />
          </div>
          {error && <p data-testid="status-unlock-error" role="alert" className="mt-3 text-xs text-rose-700">{error}</p>}
          <button
            type="submit"
            data-testid="button-unlock"
            disabled={unlock.isPending}
            className="focus-ring mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-lg shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-[hsl(205_78%_37%)] disabled:cursor-wait disabled:opacity-60"
          >
            {unlock.isPending ? 'Opening your corner…' : 'Open the door'}
            {!unlock.isPending && <ArrowRight size={17} />}
          </button>
        </form>
        <div className="mt-9 flex items-center justify-center gap-2 text-[11px] text-[hsl(var(--muted-foreground))]">
          <Sparkles size={13} className="text-[hsl(var(--primary))]" />
          made for one person
        </div>
      </section>
    </main>
  );
}