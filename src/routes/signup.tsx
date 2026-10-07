import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { formatPhone } from "@/lib/format";
import { useApp } from "@/lib/store";
import { PageHeader, PasswordChecklist, PasswordField, PrimaryButton, TextField, strengthOk } from "@/components/ui-app";

export const Route = createFileRoute("/signup")({
  component: SignUp,
});

function SignUp() {
  const { beginSignup } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email.";
    if (phone.replace(/\D/g, "").length !== 10) next.phone = "Use a 10-digit US number.";
    if (!strengthOk(password)) next.password = "Choose a stronger password.";
    if (password !== confirm) next.confirm = "Passwords do not match.";
    if (!agree) next.agree = "Agree to the Terms and Privacy Policy to continue.";
    setErrors(next);
    if (Object.keys(next).length) return;
    const result = beginSignup({ name, email, phone, password });
    if (!result.ok) {
      setErrors({ email: "An account with this email already exists." });
      return;
    }
    navigate({ to: "/verify" });
  };

  return (
    <div className="min-h-dvh pb-28">
      <PageHeader title="Create account" subtitle="It’s free for candidates" fallback="/welcome" />
      <form
        className="px-4"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <TextField label="Full name" value={name} onChange={(event) => setName(event.target.value)} error={errors.name} autoComplete="name" />
        <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} error={errors.email} autoComplete="email" />
        <TextField
          label="Mobile"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          placeholder="(512) 555-0148"
          onChange={(event) => setPhone(formatPhone(event.target.value))}
          error={errors.phone}
          hint="US +1"
        />
        <PasswordField label="Password" value={password} onChange={(event) => setPassword(event.target.value)} error={errors.password} autoComplete="new-password" />
        <PasswordChecklist password={password} />
        <PasswordField label="Confirm password" value={confirm} onChange={(event) => setConfirm(event.target.value)} error={errors.confirm} autoComplete="new-password" />
        <label className="mb-3 flex items-start gap-3 text-sm leading-5">
          <input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} className="mt-1 h-5 w-5 accent-[#7A22C8]" />
          <span>
            I agree to the <Link to="/terms" className="font-semibold text-blue">Terms of Service</Link> and{" "}
            <Link to="/privacy" className="font-semibold text-blue">Privacy Policy</Link>.
          </span>
        </label>
        {errors.agree && <p className="mb-3 text-xs font-medium text-danger">{errors.agree}</p>}
      </form>
      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[390px] -translate-x-1/2 border-t border-border bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <PrimaryButton className="w-full" onClick={submit}>
          Create Account
        </PrimaryButton>
      </div>
    </div>
  );
}
