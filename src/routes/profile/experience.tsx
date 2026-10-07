import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { Experience } from "@/lib/mock-data";
import { haptic } from "@/lib/format";
import { useApp } from "@/lib/store";
import { ConfirmDialog, PageHeader, PrimaryButton, SecondaryButton, Sheet, TextArea, TextField, Toggle, useGuard } from "@/components/ui-app";

export const Route = createFileRoute("/profile/experience")({
  component: ExperiencePage,
});

const blank = (): Experience => ({
  id: `ex-${Date.now()}`,
  title: "",
  company: "",
  location: "",
  start: "",
  end: "",
  current: false,
  description: "",
});

function ExperiencePage() {
  const app = useGuard();
  const user = app.user;
  const [draft, setDraft] = useState<Experience | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  if (!user) return null;

  const save = () => {
    if (!draft || !draft.title.trim() || !draft.company.trim()) return;
    const exists = user.experience.some((item) => item.id === draft.id);
    app.updateUser({
      experience: exists ? user.experience.map((item) => (item.id === draft.id ? draft : item)) : [draft, ...user.experience],
    });
    haptic();
    setDraft(null);
  };

  return (
    <div className="min-h-dvh pb-28">
      <PageHeader title="Experience" fallback="/profile" />
      <div className="space-y-3 px-4">
        {user.experience.map((item) => (
          <button key={item.id} type="button" onClick={() => setDraft(item)} className="w-full rounded-2xl bg-card p-4 text-left dark:border dark:border-white/10">
            <p className="font-semibold">{item.title}</p>
            <p className="text-sm text-muted-foreground">{item.company} · {item.location}</p>
            <p className="text-xs text-muted-foreground">{item.start} – {item.current ? "Present" : item.end}</p>
          </button>
        ))}
        {user.experience.length === 0 && <p className="text-sm text-muted-foreground">Add the roles you want employers to see.</p>}
      </div>
      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[390px] -translate-x-1/2 border-t border-border bg-card px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <PrimaryButton className="w-full" onClick={() => setDraft(blank())}>
          Add experience
        </PrimaryButton>
      </div>
      <Sheet
        open={Boolean(draft)}
        title={draft && user.experience.some((item) => item.id === draft.id) ? "Edit experience" : "Add experience"}
        onClose={() => setDraft(null)}
        footer={
          <div className="grid grid-cols-2 gap-3">
            {draft && user.experience.some((item) => item.id === draft.id) ? (
              <SecondaryButton onClick={() => draft && setRemoveId(draft.id)}>Delete</SecondaryButton>
            ) : (
              <SecondaryButton onClick={() => setDraft(null)}>Cancel</SecondaryButton>
            )}
            <PrimaryButton onClick={save}>Save</PrimaryButton>
          </div>
        }
      >
        {draft && (
          <>
            <TextField label="Job title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
            <TextField label="Company" value={draft.company} onChange={(event) => setDraft({ ...draft, company: event.target.value })} />
            <TextField label="Location" value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} />
            <TextField label="Start" value={draft.start} onChange={(event) => setDraft({ ...draft, start: event.target.value })} placeholder="Mar 2022" />
            <Toggle checked={draft.current} onChange={(current) => setDraft({ ...draft, current, end: current ? "" : draft.end })} label="Currently working here" />
            {!draft.current && <TextField label="End" value={draft.end} onChange={(event) => setDraft({ ...draft, end: event.target.value })} placeholder="Jan 2024" />}
            <TextArea label="Description" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
          </>
        )}
      </Sheet>
      <ConfirmDialog
        open={Boolean(removeId)}
        title="Delete this role?"
        body="It will be removed from your profile."
        confirmLabel="Delete"
        danger
        onClose={() => setRemoveId(null)}
        onConfirm={() => {
          app.updateUser({ experience: user.experience.filter((item) => item.id !== removeId) });
          setRemoveId(null);
          setDraft(null);
        }}
      />
    </div>
  );
}
