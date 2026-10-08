import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { formatPhone, haptic } from "@/lib/format";
import { useApp } from "@/lib/store";
import { Logo } from "@/components/brand";
import { AuthCanvas, PasswordField, PrimaryButton, TextField } from "@/components/ui-app";

export const Route = createFileRoute("/signup")({
  component: SignUp,
});

function SignUp() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = () => {
    if (busy) return;
    setBusy(true);
    const result = register({ name, email, phone, password: password || confirm });
    haptic();
    navigate({ to: result.firstTime ? "/setup" : "/home", replace: true });
  };

  return (
    <AuthCanvas>
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Back to login"
          onClick={() => navigate({ to: "/login" })}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white"
        >
          <ArrowLeft size={20} strokeWidth={1.75} />
        </button>
        <Logo variant="white" height={48} />
      </div>
      <h1 className="mt-6 text-[28px] font-semibold leading-8 text-white">Create your account</h1>
      <p className="mt-2 text-[15px] leading-6 text-white/85">Join Bonanza Jobs as a candidate. It’s free.</p>
      <form
        className="mt-6 rounded-3xl bg-white p-4 shadow-[0_16px_40px_rgba(15,11,42,0.22)]"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <TextField label="Full name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Jordan Ellis" />
        <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@email.com" />
        <TextField
          label="Mobile"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          placeholder="(512) 555-0148"
          onChange={(event) => setPhone(formatPhone(event.target.value))}
        />
        <PasswordField label="Password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" placeholder="Create a password" />
        <PasswordField label="Confirm password" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" placeholder="Repeat password" />
        <PrimaryButton className="w-full" disabled={busy} onClick={submit}>
          {busy ? "Creating account…" : "Create Account"}
        </PrimaryButton>
        <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
          By creating an account you agree to the <Link to="/terms" className="font-semibold text-[#0FAEE5]">Terms</Link> and{" "}
          <Link to="/privacy" className="font-semibold text-[#0FAEE5]">Privacy Policy</Link>.
        </p>
      </form>
      <button type="button" onClick={() => navigate({ to: "/login" })} className="mt-6 w-full text-center text-sm font-semibold text-white">
        Already have an account? Log in
      </button>
    </AuthCanvas>
  );
}
