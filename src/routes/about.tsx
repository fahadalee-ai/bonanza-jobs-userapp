import { createFileRoute } from "@tanstack/react-router";
import { Logo } from "@/components/brand";
import { PageHeader, SecondaryButton } from "@/components/ui-app";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  const { resetDemo } = useApp();
  return (
    <div className="min-h-dvh">
      <PageHeader title="About" fallback="/settings" />
      <div className="px-4">
        <Logo />
        <p className="mt-4 text-[15px] leading-6 text-muted-foreground">
          Bonanza Jobs connects candidates, employers, and referral partners. This candidate app is adapted from the Bonanza Jobs portal: search verified US roles, apply in a few steps, and follow each application from submitted to hired.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">Version 1.0 · Candidate</p>
        <SecondaryButton className="mt-6 w-full" onClick={() => resetDemo()}>
          Reset sample data
        </SecondaryButton>
      </div>
    </div>
  );
}
