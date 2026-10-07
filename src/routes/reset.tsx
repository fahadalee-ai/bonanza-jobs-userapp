import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { PageHeader, PasswordChecklist, PasswordField, PrimaryButton, SuccessMark, strengthOk } from "@/components/ui-app";

export const Route = createFileRoute("/reset")({
  component: Reset,
});

function Reset() {
  const { resetPassword, resetEmail } = useApp();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!strengthOk(password)) {
      setError("Choose a stronger password.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!resetPassword(password)) {
      setError("Start from Forgot password so we know which account to update.");
      return;
    }
    setDone(true);
  };

  return (
    <div className="min-h-dvh pb-28">
      <PageHeader title="New password" subtitle={resetEmail || "Choose a new password"} fallback="/login" />
      <div className="px-4">
        {done ? (
          <div className="pt-10 text-center">
            <SuccessMark />
            <h2 className="mt-5 text-2xl font-semibold text-heading">Password updated</h2>
            <p className="mt-2 text-[15px] text-muted-foreground">You can sign in with your new password.</p>
            <PrimaryButton className="mt-6 w-full" onClick={() => navigate({ to: "/login" })}>
              Back to Login
            </PrimaryButton>
          </div>
        ) : (
          <>
            <PasswordField label="New password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <PasswordChecklist password={password} />
            <PasswordField label="Confirm password" value={confirm} onChange={(event) => setConfirm(event.target.value)} error={error} />
          </>
        )}
      </div>
      {!done && (
        <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[390px] -translate-x-1/2 border-t border-border bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <PrimaryButton className="w-full" onClick={submit}>
            Update password
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
