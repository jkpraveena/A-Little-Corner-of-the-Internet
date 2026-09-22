import { useEffect, useMemo, useState } from 'react';
import { Check, ImagePlus, LoaderCircle, Lock, UploadCloud } from 'lucide-react';
import type { Snapshot, SnapshotAnswerInput, MediaInput } from '@workspace/api-client-react';
import { useRequestUploadUrl, useSaveSnapshot } from '@workspace/api-client-react';
import { SectionHeading } from './SectionHeading';

const QUESTIONS = [
  { key: 'where_you_are', label: 'Where are you in the world right now?', hint: 'A city, a room, a season.' },
  { key: 'what_is_alive', label: 'What is taking up a good kind of space in your life?', hint: 'A person, a project, a tiny ritual.' },
  { key: 'what_you_are_learning', label: 'What are you learning to believe about yourself?', hint: 'Let this one be honest.' },
  { key: 'small_delight', label: 'What is a small delight you do not want to forget?', hint: 'The more specific, the better.' },
];

type SnapshotSectionProps = { snapshot?: Snapshot; onSaved: (snapshot: Snapshot) => void };

export function SnapshotSection({ snapshot, onSaved }: SnapshotSectionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [media, setMedia] = useState<Record<string, MediaInput | undefined>>({});
  const [uploadingKey, setUploadingKey] = useState('');
  const saveSnapshot = useSaveSnapshot();
  const requestUpload = useRequestUploadUrl();

  useEffect(() => {
    if (!snapshot?.answers) return;
    setAnswers(Object.fromEntries(snapshot.answers.map((item) => [item.questionKey, item.answer])));
  }, [snapshot]);

  const completedCount = useMemo(() => QUESTIONS.filter((question) => answers[question.key]?.trim()).length, [answers]);
  const isLocked = Boolean(snapshot?.isFinal);

  const upload = async (questionKey: string, file: File) => {
    setUploadingKey(questionKey);
    try {
      const response = await requestUpload.mutateAsync({ data: { name: file.name, size: file.size, contentType: file.type } });
      await fetch(response.uploadURL, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      setMedia((current) => ({ ...current, [questionKey]: { originalFilename: file.name, mimeType: file.type, size: file.size, objectPath: response.objectPath, section: 'snapshot' } }));
    } finally {
      setUploadingKey('');
    }
  };

  const save = () => {
    if (isLocked || completedCount === 0) return;
    const payload: SnapshotAnswerInput[] = QUESTIONS.map((question) => ({
      questionKey: question.key,
      questionText: question.label,
      answer: answers[question.key]?.trim() || '',
      ...(media[question.key] ? { media: [media[question.key] as MediaInput] } : {}),
    }));
    saveSnapshot.mutate({ data: { answers: payload } }, { onSuccess: onSaved });
  };

  return (
    <section id="snapshot" className="section-wrap scroll-mt-12 py-28 sm:py-40">
      <SectionHeading index="01" kicker="the current snapshot" title="A note from exactly here." intro="Before the years get busy, leave a few coordinates for the person you are becoming." />
      <div className="glass rounded-[30px] p-6 sm:p-10">
        {isLocked && (
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900">
            <Lock size={16} /> This snapshot is tucked away. You can come back and read it, but not rewrite the moment.
          </div>
        )}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[hsl(var(--border)/.7)] pb-6">
          <div>
            <p className="eyebrow text-[hsl(var(--muted-foreground))]">a few prompts for you</p>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Nothing needs to sound perfect.</p>
          </div>
          <span data-testid="status-snapshot-progress" className="font-mono-ui text-xs text-[hsl(var(--primary))]">{completedCount} / {QUESTIONS.length} answered</span>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {QUESTIONS.map((question, index) => (
            <div key={question.key} className="relative">
              <label htmlFor={`snapshot-${question.key}`} className="mb-2 block text-sm font-semibold">
                <span className="mr-2 font-mono-ui text-[10px] text-[hsl(var(--primary))]">0{index + 1}</span>{question.label}
              </label>
              <p className="mb-2 text-xs text-[hsl(var(--muted-foreground))]">{question.hint}</p>
              <textarea
                id={`snapshot-${question.key}`}
                data-testid={`textarea-snapshot-${question.key}`}
                disabled={isLocked}
                value={answers[question.key] || ''}
                onChange={(event) => setAnswers((current) => ({ ...current, [question.key]: event.target.value }))}
                className="journal-textarea min-h-[138px] disabled:cursor-not-allowed disabled:opacity-65"
              />
              {!isLocked && (
                <label className="focus-ring mt-3 inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-[hsl(var(--primary))]">
                  {uploadingKey === question.key ? <LoaderCircle size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                  {media[question.key] ? media[question.key]?.originalFilename : 'add a photo'}
                  <input data-testid={`input-snapshot-file-${question.key}`} type="file" accept="image/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(question.key, file); }} />
                </label>
              )}
            </div>
          ))}
        </div>
        {!isLocked && (
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[hsl(var(--border)/.7)] pt-6">
            <p className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]"><UploadCloud size={14} /> Once saved, this moment stays exactly as it is.</p>
            <button
              type="button"
              data-testid="button-save-snapshot"
              onClick={save}
              disabled={saveSnapshot.isPending || completedCount === 0}
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saveSnapshot.isPending ? 'Saving this moment…' : <><Check size={16} /> Save my snapshot</>}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}