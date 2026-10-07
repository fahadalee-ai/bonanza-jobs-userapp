import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PrimaryButton } from "@/components/ui-app";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/session-expired")({
  component: SessionExpired,
});

function SessionExpired() {
  const { logout } = useApp();
  const navigate = useNavigate();
  return (
    <div className="flex min-h-dvh flex-col justify-center px-6 pb-10 pt-[max(2rem,env(safe-area-inset-top))] text-center">
      <h1 className="text-2xl font-semibold text-heading">Session expired</h1>
      <p className="mt-2 text-[15px] leading-6 text-muted-foreground">
        For your security, please sign in again to view applications and your profile.
      </p>
      <PrimaryButton
        className="mt-6 w-full"
        onClick={() => {
          logout();
          navigate({ to: "/login", replace: true });
        }}
      >
        Sign in
      </PrimaryButton>
    </div>
  );
}
