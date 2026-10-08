import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Heart, Share2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { postedLabel, salaryLabel, haptic } from "@/lib/format";
import { useApp } from "@/lib/store";
import { CompanyMark, JobCard } from "@/components/job-ui";
import { BackButton, PrimaryButton, useGuard } from "@/components/ui-app";

export const Route = createFileRoute("/jobs/$jobId/")({
  component: JobDetails,
});

function JobDetails() {
  const { jobId } = Route.useParams();
  const app = useGuard();
  const navigate = useNavigate();
  const job = app.jobs.find((item) => item.id === jobId);
  const user = app.user;
  const existing = app.applications.find(
    (item) => item.userId === user?.id && item.jobId === jobId && item.status !== "Withdrawn" && item.status !== "Rejected",
  );

  if (!job || !user) {
    return (
      <div className="min-h-dvh px-4 pt-6">
        <BackButton fallback="/jobs" />
        <p className="mt-6 text-muted-foreground">This job is no longer available.</p>
      </div>
    );
  }

  const similar = app.jobs.filter((item) => item.id !== job.id && (item.industry === job.industry || item.company === job.company)).slice(0, 4);
  const matched = job.skills.filter((skill) => user.skills.some((item) => item.name === skill));

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: job.title, text: `${job.title} at ${job.company}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      app.pushToast("Link copied");
    } catch {
      app.pushToast("Link ready to copy", url);
    }
  };

  return (
    <div className="min-h-dvh pb-28">
      <div className="sticky top-0 z-30 flex items-center justify-between bg-background/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
        <BackButton fallback="/jobs" />
        <div className="flex gap-2">
          <button type="button" aria-label="Save job" onClick={() => { app.toggleSave(job.id); haptic(); }} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card">
            <Heart size={18} className={app.savedIds.includes(job.id) ? "fill-[#7A22C8] text-[#7A22C8]" : ""} />
          </button>
          <button type="button" aria-label="Share job" onClick={() => void share()} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card">
            <Share2 size={18} />
          </button>
        </div>
      </div>
      <div className="px-4">
        <div className="flex gap-3">
          <CompanyMark initials={job.initials} className="h-14 w-14 text-base" />
          <div>
            <h1 className="text-2xl font-semibold leading-7 text-heading">{job.title}</h1>
            <p className="mt-1 text-[15px] text-muted-foreground">{job.company}</p>
            <p className="text-sm text-muted-foreground">{job.locationLabel}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[job.jobType, job.workMode, salaryLabel(job.salaryMin, job.salaryMax, job.salaryUnit), job.experience, postedLabel(job.postedDays)].map((chip) => (
            <span key={chip} className="rounded-full bg-muted px-2.5 py-1 text-[12px] font-semibold">{chip}</span>
          ))}
        </div>
        <section className="mt-5 rounded-2xl bg-[#E7F8FE] p-4 dark:bg-[#0FAEE5]/10">
          <p className="text-sm font-semibold text-[#075F7A] dark:text-[#8FDBF5]">Your match · {job.match}%</p>
          <p className="mt-1 text-[13px] leading-5 text-foreground">
            {matched.length ? `You already list ${matched.join(", ")}.` : "Add the skills on this role to raise your match."}
          </p>
        </section>
        <div className="mt-4 space-y-2">
          <Fold title="Overview" defaultOpen>
            <p className="text-[15px] leading-6 text-muted-foreground">{job.overview}</p>
          </Fold>
          <Fold title="Responsibilities">
            <List items={job.responsibilities} />
          </Fold>
          <Fold title="Requirements">
            <List items={job.requirements} />
          </Fold>
          <Fold title="Benefits">
            <List items={job.benefits} />
          </Fold>
          <Fold title="About the company">
            <p className="text-[15px] leading-6 text-muted-foreground">{job.about}</p>
          </Fold>
        </div>
        <h2 className="mb-2 mt-6 text-lg font-semibold text-heading">Skills required</h2>
        <div className="flex flex-wrap gap-2">
          {job.skills.map((skill) => (
            <span key={skill} className="rounded-full border border-border px-3 py-1 text-[13px] font-medium">{skill}</span>
          ))}
        </div>
        {similar.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 text-lg font-semibold text-heading">Similar jobs</h2>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 no-scrollbar">
              {similar.map((item) => (
                <div key={item.id} className="w-[280px] shrink-0">
                  <JobCard
                    job={item}
                    compact
                    saved={app.savedIds.includes(item.id)}
                    onSave={() => app.toggleSave(item.id)}
                    onOpen={() => {
                      app.viewJob(item.id);
                      navigate({ to: "/jobs/$jobId", params: { jobId: item.id } });
                    }}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-[390px] -translate-x-1/2 gap-3 border-t border-border bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button type="button" aria-label="Save" onClick={() => app.toggleSave(job.id)} className="flex h-[52px] w-[52px] items-center justify-center rounded-lg border border-border">
          <Heart size={20} className={app.savedIds.includes(job.id) ? "fill-[#7A22C8] text-[#7A22C8]" : ""} />
        </button>
        {existing ? (
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <p className="text-sm font-semibold">Applied</p>
            <button type="button" className="text-left text-sm font-semibold text-blue" onClick={() => navigate({ to: "/applications/$appId", params: { appId: existing.id } })}>
              Track Application
            </button>
          </div>
        ) : (
          <PrimaryButton className="flex-1" onClick={() => navigate({ to: "/jobs/$jobId/apply", params: { jobId: job.id } })}>
            Apply Now
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}

function Fold({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl bg-card dark:border dark:border-white/10">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex h-14 w-full items-center justify-between px-4 text-left font-semibold">
        {title}
        <ChevronDown size={18} className={open ? "rotate-180 transition" : "transition"} />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-[15px] leading-6 text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0FAEE5]" />
          {item}
        </li>
      ))}
    </ul>
  );
}
