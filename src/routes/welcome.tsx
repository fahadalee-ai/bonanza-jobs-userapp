import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/brand";
import { PrimaryButton, SecondaryButton } from "@/components/ui-app";

export const Route = createFileRoute("/welcome")({
  component: Welcome,
});

function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-dvh flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))]">
      <Logo mark={48} />
      <h1 className="mt-8 text-2xl font-semibold leading-8 text-heading">Welcome to Bonanza Jobs</h1>
      <p className="mt-2 text-[15px] leading-6 text-muted-foreground">Sign in or create your candidate account.</p>
      <div className="mt-8 space-y-3">
        <SecondaryButton className="w-full" onClick={() => navigate({ to: "/login", search: { provider: "apple" } })}>
          <AppleMark /> Continue with Apple
        </SecondaryButton>
        <SecondaryButton className="w-full" onClick={() => navigate({ to: "/login", search: { provider: "google" } })}>
          <GoogleMark /> Continue with Google
        </SecondaryButton>
        <PrimaryButton className="w-full" onClick={() => navigate({ to: "/login" })}>
          Continue with Email
        </PrimaryButton>
      </div>
      <button type="button" onClick={() => navigate({ to: "/role" })} className="mt-6 text-sm font-semibold text-blue">
        Are you an Employer or Recruiter?
      </button>
      <p className="mt-auto pt-8 text-center text-xs leading-5 text-muted-foreground">
        By continuing you agree to our <Link to="/terms" className="font-semibold text-foreground">Terms of Service</Link> and{" "}
        <Link to="/privacy" className="font-semibold text-foreground">Privacy Policy</Link>.
      </p>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.97 10.97 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.09A6.59 6.59 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A10.97 10.97 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 17" fill="currentColor" aria-hidden>
      <path d="M11.46 8.84c.02 2.2 1.93 2.93 1.95 2.94-.02.05-.3 1.05-1 2.06-.6.87-1.23 1.73-2.21 1.75-.96.02-1.27-.57-2.37-.57-1.1 0-1.44.55-2.35.59-.94.04-1.66-.94-2.27-1.8C1.92 12.02.7 8.9 2.02 6.78c.65-1.05 1.82-1.72 3.09-1.74.96-.02 1.87.65 2.37.65.5 0 1.61-.8 2.72-.68.46.02 1.76.19 2.59 1.41-.07.04-1.55.9-1.33 2.42ZM9.7 2.7c.52-.63.87-1.5.77-2.37-.75.03-1.65.5-2.19 1.13-.48.55-.9 1.44-.79 2.28.83.06 1.69-.42 2.21-1.04Z" />
    </svg>
  );
}
