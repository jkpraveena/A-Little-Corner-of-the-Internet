type SectionHeadingProps = {
  index: string;
  kicker: string;
  title: string;
  intro?: string;
};

export function SectionHeading({ index, kicker, title, intro }: SectionHeadingProps) {
  return (
    <div className="mb-12 grid gap-5 md:grid-cols-[100px_1fr] md:gap-10">
      <p className="eyebrow pt-2 text-[hsl(var(--primary))]">{index}</p>
      <div>
        <p className="eyebrow mb-4 text-[hsl(var(--muted-foreground))]">{kicker}</p>
        <h2 className="font-display max-w-3xl text-5xl leading-[.98] tracking-[-.03em] text-[hsl(var(--foreground))] sm:text-6xl">
          {title}
        </h2>
        {intro && <p className="mt-5 max-w-xl text-sm leading-7 text-[hsl(var(--muted-foreground))]">{intro}</p>}
      </div>
    </div>
  );
}