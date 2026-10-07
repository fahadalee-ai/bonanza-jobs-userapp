import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { PageHeader, PrimaryButton, TextArea, TextField, useGuard } from "@/components/ui-app";

export const Route = createFileRoute("/support")({
  component: Support,
});

function Support() {
  const app = useGuard();
  const user = app.user;
  const [name, setName] = useState(user ? `${user.firstName} ${user.lastName}` : "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-dvh pb-28">
      <PageHeader title="Contact support" subtitle="(833) 454-9111 · support@thehrsquad.com" fallback="/settings" />
      <div className="px-4">
        {sent ? (
          <p className="rounded-2xl bg-[#DCFCE7] px-4 py-3 text-sm text-[#166534]">Message sent. A specialist will reply by email.</p>
        ) : (
          <>
            <TextField label="Name" value={name} onChange={(event) => setName(event.target.value)} />
            <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <TextArea label="How can we help?" value={message} onChange={(event) => setMessage(event.target.value)} />
          </>
        )}
      </div>
      {!sent && (
        <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[390px] -translate-x-1/2 border-t border-border bg-card px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <PrimaryButton
            className="w-full"
            disabled={!name || !email || message.trim().length < 8}
            onClick={() => {
              setSent(true);
              app.pushToast("Message sent");
            }}
          >
            Send message
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
