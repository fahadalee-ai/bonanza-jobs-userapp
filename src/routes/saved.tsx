import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { useApp } from "@/lib/store";
import { JobCard } from "@/components/job-ui";
import { EmptyState, PageHeader, PrimaryLink, useGuard } from "@/components/ui-app";

export const Route = createFileRoute("/saved")({
  component: Saved,
});

function Saved() {
  const app = useGuard();
  const navigate = useNavigate();
  const jobs = app.savedIds.map((id) => app.jobs.find((job) => job.id === id)).filter((job) => job != null);

  return (
    <div className="min-h-dvh pb-8">
      <PageHeader title="Saved jobs" />
      <div className="space-y-3 px-4">
        {jobs.length === 0 ? (
          <EmptyState
            icon={<Bookmark size={28} />}
            title="No saved jobs"
            body="Tap the heart on a role to keep it here."
            action={<PrimaryLink to="/jobs">Browse Jobs</PrimaryLink>}
          />
        ) : (
          jobs.map((job) => (
            <div key={job.id}>
              <JobCard
                job={job}
                saved
                onSave={() => app.toggleSave(job.id)}
                onOpen={() => navigate({ to: "/jobs/$jobId", params: { jobId: job.id } })}
              />
              <button
                type="button"
                className="mt-2 text-sm font-semibold text-blue"
                onClick={() => navigate({ to: "/jobs/$jobId/apply", params: { jobId: job.id } })}
              >
                Apply
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
