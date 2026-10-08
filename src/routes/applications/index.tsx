import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Search, ClipboardList } from "lucide-react";
import { useState } from "react";
import type { AppStatus } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { CompanyMark } from "@/components/job-ui";
import { Logo } from "@/components/brand";
import { Chip, EmptyState, PrimaryLink, StatusBadge, useGuard } from "@/components/ui-app";

export const Route = createFileRoute("/applications/")({
  component: Applications,
});

const FILTERS = ["All", "Under Review", "Interview", "Offer", "Rejected", "Hired"] as const;

function Applications() {
  const app = useGuard();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [query, setQuery] = useState("");
  const user = app.user;
  if (!user) return null;

  const mine = app.applications.filter((item) => {
    if (item.userId !== user.id) return false;
    if (filter !== "All" && item.status !== (filter as AppStatus)) return false;
    const job = app.jobs.find((entry) => entry.id === item.jobId);
    if (!job) return false;
    const hay = `${job.title} ${job.company}`.toLowerCase();
    return hay.includes(query.trim().toLowerCase());
  });

  return (
    <div className="min-h-dvh pb-28">
      <header className="bg-gradient-to-br from-[#0678A8] to-[#0FAEE5] px-4 pb-5 pt-[max(1rem,env(safe-area-inset-top))] text-white">
        <Logo variant="white" height={56} />
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-white/80">Candidate</p>
        <h1 className="mt-1 text-2xl font-semibold">Applications</h1>
      </header>
      <div className="px-4 pt-4">
        <label className="flex h-12 items-center gap-2 rounded-xl border border-border bg-card px-3">
          <Search size={18} className="text-muted-foreground" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search applications" className="h-full min-w-0 flex-1 bg-transparent outline-none" />
        </label>
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((item) => (
            <Chip key={item} active={filter === item} onClick={() => setFilter(item)}>
              {item}
            </Chip>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {mine.length === 0 ? (
            <EmptyState
              icon={<ClipboardList size={28} />}
              title="No applications yet"
              body={filter === "All" ? "When you apply, every status update will live here." : `Nothing in ${filter} right now.`}
              action={<PrimaryLink to="/jobs">Browse Jobs</PrimaryLink>}
            />
          ) : (
            mine.map((item) => {
              const job = app.jobs.find((entry) => entry.id === item.jobId);
              if (!job) return null;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate({ to: "/applications/$appId", params: { appId: item.id } })}
                  className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-[0_4px_16px_rgba(27,27,47,0.06)] dark:border dark:border-white/10 dark:shadow-none"
                >
                  <CompanyMark initials={job.initials} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{job.title}</span>
                    <span className="block text-xs text-muted-foreground">Applied {item.appliedLabel}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">Updated {item.updatedLabel}</span>
                  </span>
                  <span className="flex flex-col items-end gap-2">
                    <StatusBadge status={item.status} />
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
