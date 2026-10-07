import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { haptic } from "@/lib/format";
import { useApp } from "@/lib/store";
import { JobCard } from "@/components/job-ui";
import { PageHeader, useGuard } from "@/components/ui-app";

export const Route = createFileRoute("/recommended")({
  component: Recommended,
});

function Recommended() {
  const app = useGuard();
  const navigate = useNavigate();
  const [drag, setDrag] = useState<{ id: string; x: number } | null>(null);
  const jobs = app.jobs.filter((job) => !app.dismissedIds.includes(job.id)).sort((a, b) => b.match - a.match);

  return (
    <div className="min-h-dvh pb-8">
      <PageHeader title="Recommended" subtitle="Based on your profile and preferences" />
      <div className="space-y-3 px-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="relative"
            onTouchStart={(event) => setDrag({ id: job.id, x: event.touches[0]?.clientX ?? 0 })}
            onTouchEnd={(event) => {
              if (!drag || drag.id !== job.id) return;
              const dx = (event.changedTouches[0]?.clientX ?? 0) - drag.x;
              if (dx < -80) {
                app.dismissJob(job.id);
                haptic();
                app.pushToast("We’ll show fewer roles like this");
              }
              setDrag(null);
            }}
          >
            <JobCard
              job={job}
              saved={app.savedIds.includes(job.id)}
              onSave={() => app.toggleSave(job.id)}
              onOpen={() => {
                app.viewJob(job.id);
                navigate({ to: "/jobs/$jobId", params: { jobId: job.id } });
              }}
            />
            <button
              type="button"
              className="mt-1 text-xs font-semibold text-muted-foreground"
              onClick={() => {
                app.dismissJob(job.id);
                app.pushToast("Not interested");
              }}
            >
              Not interested
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
