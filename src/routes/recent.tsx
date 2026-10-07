import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { CompanyMark } from "@/components/job-ui";
import { PageHeader, useGuard } from "@/components/ui-app";

export const Route = createFileRoute("/recent")({
  component: Recent,
});

function Recent() {
  const app = useGuard();
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh">
      <PageHeader
        title="Recently viewed"
        right={
          <button
            type="button"
            className="text-sm font-semibold text-blue"
            onClick={() => {
              app.clearRecent();
              app.pushToast("History cleared");
            }}
          >
            Clear history
          </button>
        }
      />
      <div className="space-y-2 px-4">
        {app.recent.length === 0 && <p className="text-sm text-muted-foreground">Jobs you open will show up here.</p>}
        {app.recent.map((item) => {
          const job = app.jobs.find((entry) => entry.id === item.jobId);
          if (!job || app.dismissedIds.includes(job.id)) return null;
          return (
            <button
              key={item.jobId}
              type="button"
              onClick={() => navigate({ to: "/jobs/$jobId", params: { jobId: job.id } })}
              className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left dark:border dark:border-white/10"
            >
              <CompanyMark initials={job.initials} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{job.title}</span>
                <span className="block text-xs text-muted-foreground">{job.company}</span>
              </span>
              <span className="text-xs text-muted-foreground">{item.at}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
