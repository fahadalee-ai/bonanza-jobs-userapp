import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal, ArrowUpDown, Briefcase } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EMPTY_FILTERS, filterJobs, filtersActive, sortJobs, type JobFilters } from "@/lib/jobs";
import { haptic } from "@/lib/format";
import { useApp } from "@/lib/store";
import { Logo } from "@/components/brand";
import { FilterSheet, JobCard, SortSheet } from "@/components/job-ui";
import { Chip, EmptyState, PrimaryButton, Skeleton, useGuard } from "@/components/ui-app";

export const Route = createFileRoute("/jobs/")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
    filters: search.filters === true || search.filters === "1" || search.filters === "true",
  }),
  component: JobsPage,
});

function JobsPage() {
  const app = useGuard();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<JobFilters>({ ...EMPTY_FILTERS, q: search.q });
  const [sort, setSort] = useState<"relevant" | "newest" | "salary" | "match">("relevant");
  const [filterOpen, setFilterOpen] = useState(search.filters);
  const [sortOpen, setSortOpen] = useState(false);
  const [visible, setVisible] = useState(6);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pull, setPull] = useState(0);

  useEffect(() => {
    setFilters((current) => ({ ...current, q: search.q }));
  }, [search.q]);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  const results = useMemo(() => sortJobs(filterJobs(app.jobs, filters), sort), [app.jobs, filters, sort]);

  const toggleQuick = (label: string) => {
    if (label === "Near Me" && app.user?.city) {
      const near = `${app.user.city}, ${app.user.state}`;
      setFilters((current) => ({
        ...current,
        location: current.location === near ? "" : near,
        radius: 25,
      }));
      return;
    }
    if (label === "Remote" || label === "Hybrid") {
      setFilters((current) => ({
        ...current,
        workModes: current.workModes.includes(label) ? current.workModes.filter((item) => item !== label) : [...current.workModes, label],
      }));
      return;
    }
    setFilters((current) => ({
      ...current,
      jobTypes: current.jobTypes.includes(label) ? current.jobTypes.filter((item) => item !== label) : [...current.jobTypes, label],
    }));
  };

  return (
    <div
      className="min-h-dvh bg-[#E4E8F2] pb-28 dark:bg-background"
      onTouchStart={(event) => {
        if (window.scrollY <= 0) setPull(event.touches[0]?.clientY ?? 0);
      }}
      onTouchEnd={(event) => {
        const end = event.changedTouches[0]?.clientY ?? 0;
        if (pull && end - pull > 70) {
          setRefreshing(true);
          window.setTimeout(() => {
            setRefreshing(false);
            haptic();
          }, 700);
        }
        setPull(0);
      }}
    >
      <div className="sticky top-0 z-30 bg-[#E4E8F2]/95 px-4 pb-3 pt-[max(0.65rem,env(safe-area-inset-top))] backdrop-blur dark:bg-background/95">
        <div className="mb-2.5 flex items-center justify-between">
          <Logo height={40} />
          <span className="rounded-full bg-[#E0F4FC] px-2.5 py-1 text-[11px] font-semibold text-[#075F7A] dark:bg-[#0FAEE5]/15 dark:text-[#8FDBF5]">
            Candidate
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-xl border border-white bg-white px-3 shadow-[0_6px_16px_rgba(27,27,47,0.06)] dark:border-white/10 dark:bg-card">
            <Search size={18} className="text-muted-foreground" />
            <input
              value={filters.q}
              onChange={(event) => setFilters({ ...filters, q: event.target.value })}
              placeholder="Search jobs, companies, skills"
              className="h-full min-w-0 flex-1 bg-transparent outline-none"
            />
          </label>
          <button type="button" aria-label="Filters" onClick={() => setFilterOpen(true)} className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-white bg-white shadow-[0_6px_16px_rgba(27,27,47,0.06)] dark:border-white/10 dark:bg-card">
            <SlidersHorizontal size={18} />
            {filtersActive(filters) && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#0FAEE5]" />}
          </button>
          <button type="button" aria-label="Sort" onClick={() => setSortOpen(true)} className="flex h-12 w-12 items-center justify-center rounded-xl border border-white bg-white shadow-[0_6px_16px_rgba(27,27,47,0.06)] dark:border-white/10 dark:bg-card">
            <ArrowUpDown size={18} />
          </button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {["Remote", "Full-time", "Part-time", "Contract", "Hybrid", "Near Me"].map((chip) => {
            const active =
              chip === "Near Me"
                ? Boolean(filters.location)
                : chip === "Remote" || chip === "Hybrid"
                  ? filters.workModes.includes(chip)
                  : filters.jobTypes.includes(chip);
            return (
              <Chip key={chip} active={active} onClick={() => toggleQuick(chip)}>
                {chip}
              </Chip>
            );
          })}
        </div>
      </div>

      <div className="px-4">
        {refreshing && <p className="py-2 text-center text-xs font-semibold text-blue">Refreshing…</p>}
        <p className="py-3 text-sm font-semibold text-heading">{results.length.toLocaleString("en-US")} jobs</p>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-36 w-full" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={<Briefcase size={28} />}
            title="No jobs found"
            body="Try a different keyword or clear your filters to see more roles."
            action={
              <PrimaryButton
                onClick={() => {
                  setFilters(EMPTY_FILTERS);
                  navigate({ to: "/jobs", search: { q: "", filters: false } });
                }}
              >
                Clear filters
              </PrimaryButton>
            }
          />
        ) : (
          <div className="space-y-3">
            {results.slice(0, visible).map((job) => (
              <JobCard
                key={job.id}
                job={job}
                saved={app.savedIds.includes(job.id)}
                onSave={() => {
                  app.toggleSave(job.id);
                  haptic();
                }}
                onOpen={() => {
                  app.viewJob(job.id);
                  navigate({ to: "/jobs/$jobId", params: { jobId: job.id } });
                }}
              />
            ))}
            {visible < results.length && (
              <div className="py-2">
                <button type="button" className="w-full text-sm font-semibold text-blue" onClick={() => setVisible((count) => count + 4)}>
                  Load more
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <FilterSheet
        open={filterOpen}
        initial={filters}
        countFor={(draft) => filterJobs(app.jobs, draft).length}
        onClose={() => setFilterOpen(false)}
        onApply={(next) => {
          setFilters(next);
          if (next.q.trim()) app.addRecentSearch(next.q);
        }}
      />
      <SortSheet open={sortOpen} value={sort} onClose={() => setSortOpen(false)} onChange={setSort} />
    </div>
  );
}
