import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { CompanyMark } from "@/components/job-ui";
import { PrimaryButton, SecondaryButton, SuccessMark, useGuard } from "@/components/ui-app";

export const Route = createFileRoute("/jobs/$jobId/success")({
  component: Success,
});

function Success() {
  const { jobId } = Route.useParams();
  const app = useGuard();
  const navigate = useNavigate();
  const job = app.jobs.find((item) => item.id === jobId);
  const application = app.applications.find((item) => item.jobId === jobId && item.userId === app.user?.id);

  return (
    <div className="flex min-h-dvh flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top))]">
      <SuccessMark />
      <h1 className="mt-5 text-center text-2xl font-semibold text-heading">Application Submitted</h1>
      <p className="mt-2 text-center text-[15px] leading-6 text-muted-foreground">
        {job ? `${job.company} typically reviews new applications within a few days.` : "Employers typically review new applications within a few days."}
      </p>
      {job && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-card p-4 dark:border dark:border-white/10">
          <CompanyMark initials={job.initials} />
          <div>
            <p className="font-semibold">{job.title}</p>
            <p className="text-sm text-muted-foreground">{job.company} · {job.locationLabel}</p>
          </div>
        </div>
      )}
      <div className="mt-auto space-y-3 pt-8">
        <PrimaryButton
          className="w-full"
          onClick={() => application && navigate({ to: "/applications/$appId", params: { appId: application.id } })}
        >
          Track Application
        </PrimaryButton>
        <SecondaryButton className="w-full" onClick={() => navigate({ to: "/jobs", search: { q: "", filters: false } })}>
          Browse More Jobs
        </SecondaryButton>
      </div>
    </div>
  );
}
