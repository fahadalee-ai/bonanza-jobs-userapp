import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import type { ThemeMode } from "@/lib/mock-data";
import { haptic } from "@/lib/format";
import { useApp } from "@/lib/store";
import { ConfirmDialog, PageHeader, PasswordChecklist, PasswordField, PrimaryButton, Sheet, Toggle, strengthOk, useGuard } from "@/components/ui-app";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  const app = useGuard();
  const navigate = useNavigate();
  const user = app.user;
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [logout, setLogout] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [types, setTypes] = useState({
    Applications: true,
    Interviews: true,
    Matches: true,
    Messages: true,
    "Profile views": false,
    Referrals: true,
  });
  if (!user) return null;

  return (
    <div className="min-h-dvh pb-10">
      <PageHeader title="Settings" fallback="/profile" />
      <div className="space-y-5 px-4">
        <Group title="Account">
          <Row label="Email" value={user.email} />
          <Row label="Phone" value={user.phone || "Add a phone"} />
          <button type="button" onClick={() => setPasswordOpen(true)} className="flex h-12 w-full items-center text-left text-[15px] font-medium text-blue">
            Change password
          </button>
        </Group>
        <Group title="Notifications">
          <Toggle checked={push} onChange={setPush} label="Push notifications" />
          <Toggle checked={email} onChange={setEmail} label="Email" />
          {Object.entries(types).map(([key, value]) => (
            <Toggle
              key={key}
              checked={value}
              onChange={(next) => setTypes((currentTypes) => ({ ...currentTypes, [key]: next }))}
              label={key}
            />
          ))}
        </Group>
        <Group title="Privacy">
          <Toggle
            checked={user.visibleToEmployers}
            onChange={(visibleToEmployers) => app.updateUser({ visibleToEmployers })}
            label="Profile visibility"
            hint="Employers can find your profile"
          />
        </Group>
        <Group title="Appearance">
          <div className="grid grid-cols-3 gap-2 py-2">
            {(["light", "dark", "system"] as ThemeMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => app.setTheme(mode)}
                className={cn(
                  "h-11 rounded-xl text-sm font-semibold capitalize",
                  app.theme === mode ? "bg-gradient-to-r from-[#7A22C8] to-[#0FAEE5] text-white" : "border border-border",
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </Group>
        <Group title="Support">
          <Row label="Language" value="English (US)" />
          <Link to="/help" className="flex h-12 items-center text-[15px] font-medium">Help Center</Link>
          <Link to="/support" className="flex h-12 items-center text-[15px] font-medium">Contact Support</Link>
          <Link to="/terms" className="flex h-12 items-center text-[15px] font-medium">Terms of Service</Link>
          <Link to="/privacy" className="flex h-12 items-center text-[15px] font-medium">Privacy Policy</Link>
          <Link to="/about" className="flex h-12 items-center text-[15px] font-medium">About</Link>
        </Group>
        <button type="button" onClick={() => setLogout(true)} className="h-12 w-full text-left text-[15px] font-semibold text-danger">
          Log out
        </button>
        <button type="button" onClick={() => setDeleteOpen(true)} className="h-12 w-full text-left text-[15px] font-semibold text-danger">
          Delete account
        </button>
      </div>

      <Sheet
        open={passwordOpen}
        title="Change password"
        onClose={() => setPasswordOpen(false)}
        footer={
          <PrimaryButton
            className="w-full"
            onClick={() => {
              if (current !== user.password) {
                setPasswordError("Current password is incorrect.");
                return;
              }
              if (!strengthOk(nextPassword)) {
                setPasswordError("Choose a stronger password.");
                return;
              }
              if (nextPassword !== confirm) {
                setPasswordError("Passwords do not match.");
                return;
              }
              app.updateUser({ password: nextPassword });
              haptic();
              app.pushToast("Password updated");
              setPasswordOpen(false);
              setCurrent("");
              setNextPassword("");
              setConfirm("");
              setPasswordError("");
            }}
          >
            Update password
          </PrimaryButton>
        }
      >
        <PasswordField label="Current password" value={current} onChange={(event) => setCurrent(event.target.value)} />
        <PasswordField label="New password" value={nextPassword} onChange={(event) => setNextPassword(event.target.value)} />
        <PasswordChecklist password={nextPassword} />
        <PasswordField label="Confirm password" value={confirm} onChange={(event) => setConfirm(event.target.value)} error={passwordError} />
      </Sheet>
      <ConfirmDialog
        open={logout}
        title="Log out?"
        body="You can sign back in with your email anytime."
        confirmLabel="Log out"
        onClose={() => setLogout(false)}
        onConfirm={() => {
          app.logout();
          navigate({ to: "/welcome", replace: true });
        }}
      />
      <Sheet
        open={deleteOpen}
        title="Delete account"
        onClose={() => setDeleteOpen(false)}
        footer={
          <PrimaryButton
            className="w-full bg-danger bg-none"
            disabled={phrase !== "DELETE"}
            onClick={() => {
              app.deleteAccount();
              navigate({ to: "/welcome", replace: true });
            }}
          >
            Delete account
          </PrimaryButton>
        }
      >
        <p className="mb-3 text-sm leading-5 text-muted-foreground">This removes your profile and applications from this device. Type DELETE to confirm.</p>
        <input value={phrase} onChange={(event) => setPhrase(event.target.value)} className="h-[52px] w-full rounded-xl border border-border px-3" />
      </Sheet>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-muted-foreground">{title}</h2>
      <div className="rounded-2xl bg-card px-4 dark:border dark:border-white/10">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-12 items-center justify-between gap-3 border-b border-border last:border-0">
      <span className="text-[15px]">{label}</span>
      <span className="truncate text-sm text-muted-foreground">{value}</span>
    </div>
  );
}
