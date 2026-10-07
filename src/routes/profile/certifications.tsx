import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { Certification } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { ConfirmDialog, PageHeader, PrimaryButton, SecondaryButton, Sheet, TextField, useGuard } from "@/components/ui-app";

export const Route = createFileRoute("/profile/certifications")({
  component: Certifications,
});

function Certifications() {
  const app = useGuard();
  const user = app.user;
  const [draft, setDraft] = useState<Certification | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  if (!user) return null;
  const save = () => {
    if (!draft?.name) return;
    const exists = user.certifications.some((item) => item.id === draft.id);
    app.updateUser({
      certifications: exists
        ? user.certifications.map((item) => (item.id === draft.id ? draft : item))
        : [draft, ...user.certifications],
    });
    setDraft(null);
  };
  return (
    <div className="min-h-dvh pb-28">
      <PageHeader title="Certifications" fallback="/profile" />
      <div className="space-y-3 px-4">
        {user.certifications.length === 0 && <p className="text-sm text-muted-foreground">Add a license or credential when you have one.</p>}
        {user.certifications.map((item) => (
          <button key={item.id} type="button" onClick={() => setDraft(item)} className="w-full rounded-2xl bg-card p-4 text-left dark:border dark:border-white/10">
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-muted-foreground">{item.org}</p>
          </button>
        ))}
      </div>
      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[390px] -translate-x-1/2 border-t border-border bg-card px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <PrimaryButton
          className="w-full"
          onClick={() => setDraft({ id: `c-${Date.now()}`, name: "", org: "", issued: "", expires: "", credential: "" })}
        >
          Add certification
        </PrimaryButton>
      </div>
      <Sheet
        open={Boolean(draft)}
        title="Certification"
        onClose={() => setDraft(null)}
        footer={
          <div className="grid grid-cols-2 gap-3">
            <SecondaryButton onClick={() => (draft && user.certifications.some((item) => item.id === draft.id) ? setRemoveId(draft.id) : setDraft(null))}>
              {draft && user.certifications.some((item) => item.id === draft.id) ? "Delete" : "Cancel"}
            </SecondaryButton>
            <PrimaryButton onClick={save}>Save</PrimaryButton>
          </div>
        }
      >
        {draft && (
          <>
            <TextField label="Name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
            <TextField label="Issuing organization" value={draft.org} onChange={(event) => setDraft({ ...draft, org: event.target.value })} />
            <TextField label="Issue date" value={draft.issued} onChange={(event) => setDraft({ ...draft, issued: event.target.value })} placeholder="May 2024" />
            <TextField label="Expiry date" value={draft.expires} onChange={(event) => setDraft({ ...draft, expires: event.target.value })} placeholder="May 2027" />
            <TextField label="Credential URL or ID" value={draft.credential} onChange={(event) => setDraft({ ...draft, credential: event.target.value })} />
          </>
        )}
      </Sheet>
      <ConfirmDialog
        open={Boolean(removeId)}
        title="Delete this certification?"
        body="It will be removed from your profile."
        confirmLabel="Delete"
        danger
        onClose={() => setRemoveId(null)}
        onConfirm={() => {
          app.updateUser({ certifications: user.certifications.filter((item) => item.id !== removeId) });
          setRemoveId(null);
          setDraft(null);
        }}
      />
    </div>
  );
}
