import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { formatPhone, haptic } from "@/lib/format";
import { useApp } from "@/lib/store";
import { BackButton, ConfirmDialog, PrimaryButton, TextArea, TextField, useGuard } from "@/components/ui-app";

export const Route = createFileRoute("/profile/edit")({
  component: EditProfile,
});

function EditProfile() {
  const app = useGuard();
  const navigate = useNavigate();
  const user = app.user;
  const [draft, setDraft] = useState(() =>
    user
      ? {
          firstName: user.firstName,
          lastName: user.lastName,
          headline: user.headline,
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          state: user.state,
          zip: user.zip,
          linkedin: user.linkedin,
          portfolio: user.portfolio,
          summary: user.summary,
        }
      : null,
  );
  const [warn, setWarn] = useState(false);
  if (!user || !draft) return null;

  const dirty = JSON.stringify(draft) !== JSON.stringify({
    firstName: user.firstName,
    lastName: user.lastName,
    headline: user.headline,
    email: user.email,
    phone: user.phone,
    address: user.address,
    city: user.city,
    state: user.state,
    zip: user.zip,
    linkedin: user.linkedin,
    portfolio: user.portfolio,
    summary: user.summary,
  });

  const save = () => {
    app.updateUser(draft);
    haptic();
    app.pushToast("Profile saved");
    navigate({ to: "/profile" });
  };

  const set = (key: keyof typeof draft, value: string) => setDraft({ ...draft, [key]: value });

  return (
    <div className="min-h-dvh pb-28">
      <header className="sticky top-0 z-30 flex items-center gap-3 bg-background/95 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
        <span className={dirty ? "hidden" : ""}>
          <BackButton fallback="/profile" />
        </span>
        {dirty && (
          <button type="button" aria-label="Go back" onClick={() => setWarn(true)} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card">
            <span className="text-lg">←</span>
          </button>
        )}
        <h1 className="text-2xl font-semibold text-heading">Edit profile</h1>
      </header>
      <div className="px-4">
        <h2 className="mb-3 text-lg font-semibold text-heading">Personal</h2>
        <TextField label="First name" value={draft.firstName} onChange={(event) => set("firstName", event.target.value)} />
        <TextField label="Last name" value={draft.lastName} onChange={(event) => set("lastName", event.target.value)} />
        <TextField label="Headline" value={draft.headline} onChange={(event) => set("headline", event.target.value)} placeholder="Product Designer" />
        <h2 className="mb-3 mt-2 text-lg font-semibold text-heading">Contact</h2>
        <TextField label="Email" type="email" value={draft.email} onChange={(event) => set("email", event.target.value)} />
        <TextField label="Phone" value={draft.phone} onChange={(event) => set("phone", formatPhone(event.target.value))} />
        <TextField label="Address" value={draft.address} onChange={(event) => set("address", event.target.value)} />
        <div className="grid grid-cols-3 gap-2">
          <TextField label="City" value={draft.city} onChange={(event) => set("city", event.target.value)} />
          <TextField label="State" value={draft.state} onChange={(event) => set("state", event.target.value.toUpperCase().slice(0, 2))} />
          <TextField label="ZIP" value={draft.zip} onChange={(event) => set("zip", event.target.value.replace(/\D/g, "").slice(0, 5))} />
        </div>
        <TextField label="LinkedIn" value={draft.linkedin} onChange={(event) => set("linkedin", event.target.value)} placeholder="linkedin.com/in/…" />
        <TextField label="Portfolio" value={draft.portfolio} onChange={(event) => set("portfolio", event.target.value)} placeholder="https://" />
        <h2 className="mb-3 text-lg font-semibold text-heading">Professional summary</h2>
        <TextArea label="Summary" maxLength={500} value={draft.summary} onChange={(event) => set("summary", event.target.value.slice(0, 500))} />
        <p className="text-right text-xs text-muted-foreground">{draft.summary.length}/500</p>
      </div>
      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[390px] -translate-x-1/2 border-t border-border bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <PrimaryButton className="w-full" onClick={save}>
          Save Profile
        </PrimaryButton>
      </div>
      <ConfirmDialog
        open={warn}
        title="Discard changes?"
        body="You have edits that haven’t been saved."
        confirmLabel="Discard"
        danger
        onClose={() => setWarn(false)}
        onConfirm={() => navigate({ to: "/profile" })}
      />
      {dirty && (
        <button type="button" className="sr-only" onClick={() => setWarn(true)}>
          Unsaved
        </button>
      )}
    </div>
  );
}
