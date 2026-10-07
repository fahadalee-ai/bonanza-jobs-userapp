import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Bonanza Jobs" }],
  }),
  component: Splash,
});

function Splash() {
  const { hydrated, user, onboarded } = useApp();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!hydrated || leaving) return;
    const timer = window.setTimeout(() => {
      setLeaving(true);
      if (user) navigate({ to: "/home", replace: true });
      else if (!onboarded) navigate({ to: "/onboarding", replace: true });
      else navigate({ to: "/welcome", replace: true });
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [hydrated, user, onboarded, navigate, leaving]);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-white to-[#F1E8FB] px-6">
      <div className="animate-[splash-pop_0.7s_ease] text-center">
        <div className="relative mx-auto w-fit overflow-hidden rounded-2xl">
          <Logo layout="stacked" mark={72} />
          <span className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-[splash-shimmer_1.4s_ease_0.2s_1]" />
        </div>
        <p className="mt-6 text-sm text-muted-foreground">Where Talent Meets Opportunity</p>
      </div>
      <div className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] left-10 right-10 h-1 overflow-hidden rounded-full bg-[#E5E7EB]">
        <div className="h-full w-full origin-left bg-gradient-to-r from-[#7A22C8] to-[#0FAEE5] animate-[bar-fill_2s_linear_forwards]" />
      </div>
    </div>
  );
}
