import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, Sparkles, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { PageHeader, PrimaryButton } from "@/components/ui-app";

export const Route = createFileRoute("/role")({
  component: RoleSwitch,
});

function RoleSwitch() {
  const navigate = useNavigate();
  return (
    <div className="min-h-dvh pb-28">
      <PageHeader title="Switch role" subtitle="This app is the candidate experience" fallback="/welcome" />
      <div className="space-y-3 px-4">
        <RoleCard icon={<UserRound size={20} />} title="Candidate" body="Search jobs, apply, and track your status." active />
        <RoleCard icon={<Building2 size={20} />} title="Employer" body="Post roles and review candidates in the employer portal." />
        <RoleCard icon={<Sparkles size={20} />} title="Referral Agent" body="Refer talent and track fees in the agent portal." />
        <p className="pt-2 text-sm leading-5 text-muted-foreground">
          Employer and referral agent tools live in their own portals. Continue here to look for work.
        </p>
      </div>
      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[390px] -translate-x-1/2 border-t border-border bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <PrimaryButton className="w-full" onClick={() => navigate({ to: "/welcome" })}>
          Continue as Candidate
        </PrimaryButton>
      </div>
    </div>
  );
}

function RoleCard({ icon, title, body, active }: { icon: ReactNode; title: string; body: string; active?: boolean }) {
  return (
    <div className={active ? "rounded-2xl border border-[#0FAEE5] bg-[#E7F8FE] p-4 dark:bg-[#0FAEE5]/10" : "rounded-2xl border border-border bg-card p-4"}>
      <div className="flex items-center gap-2 font-semibold text-heading">
        {icon}
        {title}
        {active && <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] text-[#075F7A]">This app</span>}
      </div>
      <p className="mt-1 text-sm leading-5 text-muted-foreground">{body}</p>
    </div>
  );
}
