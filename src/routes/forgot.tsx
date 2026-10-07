import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { PageHeader, PrimaryButton, SecondaryButton, SuccessMark, TextField } from "@/components/ui-app";

export const Route = createFileRoute("/forgot")({
  component: Forgot,
});

function Forgot() {
  const { requestReset } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="min-h-dvh pb-28">
      <PageHeader title="Forgot password" fallback="/login" />
      <div className="px-4">
        {sent ? (
          <div className="pt-10 text-center">
            <SuccessMark />
            <h2 className="mt-5 text-2xl font-semibold text-heading">Check your inbox</h2>
            <p className="mt-2 text-[15px] leading-6 text-muted-foreground">
              If an account exists for {email}, we sent a reset link. This preview can continue to the new-password screen.
            </p>
            <SecondaryButton className="mt-6 w-full" onClick={() => navigate({ to: "/reset" })}>
              Enter a new password
            </SecondaryButton>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!/^\S+@\S+\.\S+$/.test(email)) {
                setError("Enter a valid email.");
                return;
              }
              requestReset(email);
              setSent(true);
            }}
          >
            <p className="mb-4 text-[15px] leading-6 text-muted-foreground">We’ll email you a link to choose a new password.</p>
            <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} error={error} />
          </form>
        )}
      </div>
      {!sent && (
        <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[390px] -translate-x-1/2 border-t border-border bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <PrimaryButton
            className="w-full"
            onClick={() => {
              if (!/^\S+@\S+\.\S+$/.test(email)) {
                setError("Enter a valid email.");
                return;
              }
              requestReset(email);
              setSent(true);
            }}
          >
            Send reset link
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
