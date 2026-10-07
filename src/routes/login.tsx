import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/mock-data";
import { haptic } from "@/lib/format";
import { useApp } from "@/lib/store";
import { PageHeader, PasswordField, PrimaryButton, TextField, Toggle } from "@/components/ui-app";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    provider: search.provider === "apple" || search.provider === "google" ? search.provider : "",
  }),
  component: Login,
});

function Login() {
  const { provider } = Route.useSearch();
  const { login, pushToast } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState(provider ? DEMO_EMAIL : "");
  const [password, setPassword] = useState(provider ? DEMO_PASSWORD : "");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = () => {
    setError("");
    setBusy(true);
    window.setTimeout(() => {
      const result = login(email, password, remember);
      setBusy(false);
      if (!result.ok && result.reason === "locked") {
        setLocked(true);
        return;
      }
      if (!result.ok) {
        setError("Those credentials don’t match our records.");
        return;
      }
      if (!remember) pushToast("Signed in for this visit");
      haptic();
      navigate({ to: "/home" });
    }, 500);
  };

  return (
    <div className="min-h-dvh pb-28">
      <PageHeader title="Log in" subtitle={provider === "apple" ? "Continue with Apple" : provider === "google" ? "Continue with Google" : "Use your candidate email"} fallback="/welcome" />
      <form
        className="px-4"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        {provider && (
          <p className="mb-4 rounded-2xl bg-[#E0F4FC] px-4 py-3 text-sm text-[#075F7A] dark:bg-[#0FAEE5]/15 dark:text-[#8FDBF5]">
            Confirm the email on your {provider === "apple" ? "Apple" : "Google"} account to finish signing in.
          </p>
        )}
        <TextField label="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" />
        <PasswordField label="Password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} error={error} />
        <div className="mb-4 flex items-center justify-between">
          <Toggle checked={remember} onChange={setRemember} label="Remember me" />
        </div>
        <Link to="/forgot" className="mb-4 inline-block text-sm font-semibold text-blue">
          Forgot password?
        </Link>
        {locked && (
          <p className="mb-4 rounded-2xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#991B1B]">
            This account is locked after several attempts. Try again in a couple of minutes.
          </p>
        )}
        <p className="text-xs leading-5 text-muted-foreground">
          Demo account: {DEMO_EMAIL} · {DEMO_PASSWORD}
        </p>
      </form>
      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[390px] -translate-x-1/2 border-t border-border bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <PrimaryButton className="w-full" disabled={busy || !email || !password} onClick={submit}>
          {busy ? "Signing in…" : "Log In"}
        </PrimaryButton>
        <button type="button" onClick={() => navigate({ to: "/signup" })} className="mt-3 w-full text-center text-sm font-semibold text-blue">
          Create an account
        </button>
      </div>
    </div>
  );
}
