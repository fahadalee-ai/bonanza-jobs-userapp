import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/ui-app";

export const Route = createFileRoute("/help")({
  component: Help,
});

const FAQS = [
  ["Is Bonanza Jobs free for candidates?", "Yes. Candidates never pay to search or apply. Employers cover placement fees."],
  ["How do referrals work?", "A referral agent can submit your profile to an employer. If you’re hired and stay through the retention window, the agent earns the referral fee. You’ll see a “Referred by” tag on that application."],
  ["How long does review take?", "Most employers review new applications within a few business days. Interview requests show up in Notifications and on the application timeline."],
  ["What if I’m offline?", "You’ll see an offline screen. Saved jobs and your profile stay on this device and sync when you reconnect."],
  ["What if a screen fails to load?", "Use Try again. If your session expired, sign in again from the login screen."],
];

function Help() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="min-h-dvh">
      <PageHeader title="Help Center" fallback="/settings" />
      <div className="space-y-2 px-4">
        {FAQS.map(([question, answer], index) => (
          <button key={question} type="button" onClick={() => setOpen(open === index ? null : index)} className="w-full rounded-2xl bg-card p-4 text-left dark:border dark:border-white/10">
            <p className="font-semibold">{question}</p>
            {open === index && <p className="mt-2 text-sm leading-5 text-muted-foreground">{answer}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}
