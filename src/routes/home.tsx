import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronRight, Eye, FileText, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { greeting } from "@/lib/format";
import { completeness, profileHint } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { Logo } from "@/components/brand";
import { CompanyMark } from "@/components/job-ui";
import { Avatar, Card, PrimaryButton, ProgressRing, SecondaryButton, SectionTitle, StatusBadge, TextLink, useGuard } from "@/components/ui-app";

export const Route = createFileRoute("/home")({
  component: Home,
});

function Home() {
  const app = useGuard();
  const navigate = useNavigate();
  const user = app.user;
  const [prompt, setPrompt] = useState<"biometric" | "notifications" | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    if (!app.biometricAsked) setPrompt("biometric");
    else if (!app.notifAsked) setPrompt("notifications");
  }, [user, app.biometricAsked, app.notifAsked]);

  if (!user) return <div className="min-h-dvh bg-background" />;

  const mine = app.applications.filter((item) => item.userId === user.id);
  const active = mine.filter((item) => !["Rejected", "Withdrawn", "Hired"].includes(item.status));
  const interviews = mine.filter((item) => item.status === "Interview");
  const score = completeness(user);
  const unread = app.notifications.filter((item) => !item.read).length;
  const companies = [...new Map(app.jobs.filter((job) => job.featured).map((job) => [job.company, job])).values()];
  const recommended = app.jobs
    .filter((job) => !app.dismissedIds.includes(job.id))
    .sort((a, b) => b.match - a.match)
    .slice(0, 6);

  const stats = [
    { label: "Active Applications", value: active.length, className: "bg-[#E7F8FE] text-[#075F7A] dark:bg-[#0FAEE5]/15 dark:text-[#8FDBF5]" },
    { label: "Saved Jobs", value: app.savedIds.length, className: "bg-[#F3E8FF] text-[#6B21A8] dark:bg-[#7A22C8]/20 dark:text-[#E9D5FF]" },
    { label: "Interviews", value: interviews.length, className: "bg-[#FFF6DC] text-[#92400E] dark:bg-[#F5B301]/15 dark:text-[#F5D98A]" },
    { label: "Profile Views", value: user.profileViews, className: "bg-[#DCFCE7] text-[#166534] dark:bg-[#16A34A]/15 dark:text-[#86EFAC]" },
  ];

  return (
    <div className="bg-[#E4E8F2] pb-28 dark:bg-background">
      <header className="relative overflow-hidden bg-gradient-to-br from-[#0678A8] via-[#0FAEE5] to-[#5B4DDB] px-4 pb-12 pt-[max(0.65rem,env(safe-area-inset-top))] text-white">
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <Logo variant="white" height={40} />
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => navigate({ to: "/notifications" })}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/20"
          >
            <Bell size={20} strokeWidth={1.75} />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F5B301] px-1 text-[10px] font-bold text-[#2B1F6E]">
                {unread}
              </span>
            )}
          </button>
        </div>
        <div className="relative mt-3 flex items-center gap-3">
          <Avatar src={user.photo} name={`${user.firstName} ${user.lastName}`} className="h-11 w-11 ring-2 ring-white/40" />
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-white">{greeting()}</p>
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-semibold leading-7">Hi, {user.firstName}</h1>
              <span className="rounded-full bg-white/25 px-2 py-0.5 text-[11px] font-semibold text-white">Candidate</span>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 -mt-6 px-4">
        <form
          className="flex items-center gap-2 rounded-2xl border border-white bg-white p-1.5 shadow-[0_10px_28px_rgba(27,27,47,0.14)] dark:border-white/10 dark:bg-card"
          onSubmit={(event) => {
            event.preventDefault();
            if (query.trim()) app.addRecentSearch(query);
            navigate({ to: "/jobs", search: { q: query, filters: query ? false : true } });
          }}
        >
          <Search size={18} className="ml-2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => navigate({ to: "/search" })}
            placeholder="Search jobs, companies, skills"
            className="h-11 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />
          <button type="button" aria-label="Filters" onClick={() => navigate({ to: "/jobs", search: { q: "", filters: true } })} className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E7F8FE] text-[#077A9E] dark:bg-[#0FAEE5]/15 dark:text-[#8FDBF5]">
            <SlidersHorizontal size={18} />
          </button>
        </form>
      </div>

      <div className="mt-4 space-y-5 px-4">
        <Card className="border border-white shadow-[0_8px_24px_rgba(27,27,47,0.08)]">
          <div className="flex items-center gap-3">
            <ProgressRing value={score} />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-heading">Profile completeness</p>
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{profileHint(user)}</p>
            </div>
          </div>
          <PrimaryButton className="mt-4 w-full" onClick={() => navigate({ to: "/profile" })}>
            Complete Profile
          </PrimaryButton>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((item) => (
            <div key={item.label} className={`rounded-2xl p-3.5 ${item.className}`}>
              <p className="text-[26px] font-bold leading-8">{item.value}</p>
              <p className="mt-0.5 text-[13px] font-medium leading-4">{item.label}</p>
            </div>
          ))}
        </div>

        <Card className="border border-white shadow-[0_8px_24px_rgba(27,27,47,0.08)]">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3E8FF] text-[#7A22C8] dark:bg-[#7A22C8]/20">
              <FileText size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold">{user.resumeName || "No resume yet"}</p>
              <p className="text-xs text-muted-foreground">{user.resumeUpdated ? `Updated ${user.resumeUpdated}` : "Upload a resume to apply faster"}</p>
              <button type="button" onClick={() => navigate({ to: "/profile/resume" })} className="mt-1 text-sm font-semibold text-blue">
                Update
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Eye size={16} /> Visible to employers
            </span>
            <button
              type="button"
              aria-label="Toggle resume visibility"
              onClick={() => updateVisibility(app.updateUser, user.resumeVisible)}
              className={user.resumeVisible ? "h-7 w-12 rounded-full bg-gradient-to-r from-[#7A22C8] to-[#0FAEE5]" : "h-7 w-12 rounded-full bg-[#E5E7EB] dark:bg-white/15"}
            >
              <span className={user.resumeVisible ? "ml-5 block h-6 w-6 rounded-full bg-white" : "ml-0.5 block h-6 w-6 rounded-full bg-white"} />
            </button>
          </div>
        </Card>

        <section>
          <SectionTitle action={<TextLink to="/applications">View all</TextLink>}>Application status</SectionTitle>
          <div className="space-y-2">
            {mine.slice(0, 3).map((item) => {
              const job = app.jobs.find((entry) => entry.id === item.jobId);
              if (!job) return null;
              return (
                <button key={item.id} type="button" onClick={() => navigate({ to: "/applications/$appId", params: { appId: item.id } })} className="flex w-full items-center gap-3 rounded-2xl border border-white bg-white p-3 text-left shadow-[0_6px_18px_rgba(27,27,47,0.06)] dark:border-white/10 dark:bg-card">
                  <CompanyMark initials={job.initials} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{job.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{job.company}</span>
                  </span>
                  <StatusBadge status={item.status} />
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              );
            })}
            {mine.length === 0 && <p className="text-sm text-muted-foreground">You haven’t applied yet.</p>}
          </div>
        </section>

        <section>
          <SectionTitle action={<TextLink to="/recommended">See all</TextLink>}>Recommended jobs</SectionTitle>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
            {recommended.map((job) => (
              <button key={job.id} type="button" onClick={() => navigate({ to: "/jobs/$jobId", params: { jobId: job.id } })} className="w-[260px] shrink-0 rounded-2xl border border-white bg-white p-4 text-left shadow-[0_8px_20px_rgba(27,27,47,0.08)] dark:border-white/10 dark:bg-card">
                <CompanyMark initials={job.initials} />
                <p className="mt-3 text-[15px] font-semibold leading-5">{job.title}</p>
                <p className="text-[13px] text-muted-foreground">{job.company}</p>
                <p className="mt-2 text-xs font-semibold text-[#077A9E]">{job.match}% match</p>
              </button>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle action={<TextLink to="/saved">See all</TextLink>}>Saved jobs</SectionTitle>
          <CompactJobs ids={app.savedIds.slice(0, 3)} />
        </section>
        <section>
          <SectionTitle action={<TextLink to="/recent">See all</TextLink>}>Recently viewed</SectionTitle>
          <CompactJobs ids={app.recent.slice(0, 3).map((item) => item.jobId)} />
        </section>

        <section>
          <SectionTitle>Featured employers</SectionTitle>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {companies.map((job) => (
              <button key={job.company} type="button" onClick={() => navigate({ to: "/jobs", search: { q: job.company, filters: false } })} className="w-28 shrink-0 rounded-2xl border border-white bg-white p-3 text-center shadow-[0_6px_16px_rgba(27,27,47,0.06)] dark:border-white/10 dark:bg-card">
                <CompanyMark initials={job.initials} className="mx-auto" />
                <p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-4">{job.company}</p>
              </button>
            ))}
          </div>
        </section>
      </div>

      {prompt && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center">
          <div className="absolute inset-0 bg-[#1B1B2F]/50" />
          <div className="relative m-4 w-full max-w-[358px] rounded-3xl bg-card p-5">
            <h2 className="text-lg font-semibold text-heading">
              {prompt === "biometric" ? "Sign in faster next time?" : "Stay in the loop?"}
            </h2>
            <p className="mt-2 text-[15px] leading-6 text-muted-foreground">
              {prompt === "biometric"
                ? "Use Face ID or fingerprint to open Bonanza Jobs on this phone."
                : "Allow notifications for interviews, offers, and new roles that match you."}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <SecondaryButton
                onClick={() => {
                  if (prompt === "biometric") app.setBiometricAsked();
                  else app.setNotifAsked();
                  setPrompt(null);
                }}
              >
                Not now
              </SecondaryButton>
              <PrimaryButton
                onClick={() => {
                  if (prompt === "biometric") {
                    app.setBiometricAsked();
                    app.pushToast("Biometric sign-in enabled");
                  } else {
                    app.setNotifAsked();
                    app.pushToast("Notifications enabled");
                  }
                  setPrompt(null);
                }}
              >
                {prompt === "biometric" ? "Enable" : "Allow"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function updateVisibility(updateUser: (patch: { resumeVisible: boolean }) => void, current: boolean) {
  updateUser({ resumeVisible: !current });
}

function CompactJobs({ ids }: { ids: string[] }) {
  const app = useApp();
  const navigate = useNavigate();
  if (!ids.length) return <p className="text-sm text-muted-foreground">Nothing here yet.</p>;
  return (
    <div className="space-y-2">
      {ids.map((id) => {
        const job = app.jobs.find((item) => item.id === id);
        if (!job) return null;
        return (
          <button key={id} type="button" onClick={() => navigate({ to: "/jobs/$jobId", params: { jobId: id } })} className="flex w-full items-center gap-3 rounded-2xl border border-white bg-white p-3 text-left shadow-[0_6px_16px_rgba(27,27,47,0.05)] dark:border-white/10 dark:bg-card">
            <CompanyMark initials={job.initials} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{job.title}</span>
              <span className="block text-xs text-muted-foreground">{job.company} · {job.locationLabel}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
