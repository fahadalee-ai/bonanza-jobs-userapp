import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { Education } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { ConfirmDialog, PageHeader, PrimaryButton, SecondaryButton, Sheet, TextField, useGuard } from "@/components/ui-app";

export const Route = createFileRoute("/profile/education")({
  component: EducationPage,
});

function EducationPage() {
  const app = useGuard();
  const user = app.user;
  const [draft, setDraft] = useState<Education | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  if (!user) return null;

  const save = () => {
    if (!draft?.school || !draft.degree) return;
    const exists = user.education.some((item) => item.id === draft.id);
    app.updateUser({
      education: exists ? user.education.map((item) => (item.id === draft.id ? draft : item)) : [draft, ...user.education],
    });
    setDraft(null);
  };

  return (
    <div className="min-h-dvh pb-28">
      <PageHeader title="Education" fallback="/profile" />
      <div className="space-y-3 px-4">
        {user.education.map((item) => (
          <button key={item.id} type="button" onClick={() => setDraft(item)} className="w-full rounded-2xl bg-card p-4 text-left dark:border dark:border-white/10">
            <p className="font-semibold">{item.school}</p>
            <p className="text-sm text-muted-foreground">{item.degree} · {item.field}</p>
            <p className="text-xs text-muted-foreground">{item.start} – {item.end}{item.gpa ? ` · GPA ${item.gpa}` : ""}</p>
          </button>
        ))}
      </div>
      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[390px] -translate-x-1/2 border-t border-border bg-card px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <PrimaryButton
          className="w-full"
          onClick={() => setDraft({ id: `ed-${Date.now()}`, school: "", degree: "", field: "", start: "", end: "", gpa: "" })}
        >
          Add education
        </PrimaryButton>
      </div>
      <Sheet
        open={Boolean(draft)}
        title="Education"
        onClose={() => setDraft(null)}
        footer={
          <div className="grid grid-cols-2 gap-3">
            <SecondaryButton onClick={() => draft && user.education.some((item) => item.id === draft.id) ? setRemoveId(draft.id) : setDraft(null)}>
              {draft && user.education.some((item) => item.id === draft.id) ? "Delete" : "Cancel"}
            </SecondaryButton>
            <PrimaryButton onClick={save}>Save</PrimaryButton>
          </div>
        }
      >
        {draft && (
          <>
            <TextField label="School" value={draft.school} onChange={(event) => setDraft({ ...draft, school: event.target.value })} />
            <TextField label="Degree" value={draft.degree} onChange={(event) => setDraft({ ...draft, degree: event.target.value })} />
            <TextField label="Field of study" value={draft.field} onChange={(event) => setDraft({ ...draft, field: event.target.value })} />
            <TextField label="Start year" value={draft.start} onChange={(event) => setDraft({ ...draft, start: event.target.value })} />
            <TextField label="End year" value={draft.end} onChange={(event) => setDraft({ ...draft, end: event.target.value })} />
            <TextField label="GPA (optional)" value={draft.gpa ?? ""} onChange={(event) => setDraft({ ...draft, gpa: event.target.value })} />
          </>
        )}
      </Sheet>
      <ConfirmDialog
        open={Boolean(removeId)}
        title="Delete this school?"
        body="It will be removed from your profile."
        confirmLabel="Delete"
        danger
        onClose={() => setRemoveId(null)}
        onConfirm={() => {
          app.updateUser({ education: user.education.filter((item) => item.id !== removeId) });
          setRemoveId(null);
          setDraft(null);
        }}
      />
    </div>
  );
}
