import { CalendarDays, ImageOff } from 'lucide-react';
import type { Memory } from '@workspace/api-client-react';

export function MemoryCard({ memory, index }: { memory: Memory; index: number }) {
  return (
    <article data-testid={`card-memory-${memory.id}`} className={`memory-card group overflow-hidden rounded-[26px] border border-white/70 bg-white/50 shadow-[var(--shadow-soft)] ${index === 1 ? 'md:mt-16' : index === 2 ? 'md:-mt-5' : ''}`}>
      <div className="relative aspect-[1.08/1] overflow-hidden bg-[hsl(var(--secondary))]">
        {memory.imageUrl ? (
          <img data-testid={`img-memory-${memory.id}`} src={memory.imageUrl} alt={memory.title} className="memory-image h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[hsl(var(--muted-foreground))]"><ImageOff size={25} strokeWidth={1.5} /></div>
        )}
        <span className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/55 px-3 py-1.5 font-mono-ui text-[10px] text-[hsl(var(--foreground))] backdrop-blur-md">
          0{index + 1}
        </span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">
          <CalendarDays size={12} />
          {memory.memoryDate || 'one of those days'}
        </div>
        <h3 data-testid={`text-memory-title-${memory.id}`} className="font-display text-3xl leading-none">{memory.title}</h3>
        <p data-testid={`text-memory-description-${memory.id}`} className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{memory.description}</p>
      </div>
    </article>
  );
}