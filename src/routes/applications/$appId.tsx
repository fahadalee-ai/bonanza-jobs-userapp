import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarPlus, MapPin, Video } from "lucide-react";
import { useState } from "react";
import { haptic } from "@/lib/format";
import { useApp } from "@/lib/store";
import { CompanyMark } from "@/components/job-ui";
import { ConfirmDialog, DangerButton, PageHeader, PrimaryButton, SecondaryButton, Sheet, StatusBadge, useGuard } from "@/components/ui-app";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/applications/$appId")({
  component: Tracking,
});

function Tracking() {
  const { appId } = Route.useParams();
  const app = useGuard();
  const navigate = useNavigate();
  const item = app.applications.find((entry) => entry.id === appId);
  const job = app.jobs.find((entry) => entry.id === item?.jobId);
  const [withdraw, setWithdraw] = useState(false);
  const [decline, setDecline] = useState(false);
  const [reschedule, setReschedule] = useState(false);
  const [date, setDate] = useState("Friday, October 23, 2026");
  const [time, setTime] = useState("2:00 PM CT");

  if (!item || !job) {
    return (
      <div className="min-h-dvh">
        <PageHeader title="Application" />
        <p className="px-4 text-muted-foreground">This application is no longer available.</p>
      </div>
    );
  }

  const addToCalendar = () => {
    if (!item.interview) return;
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `SUMMARY:${job.title} interview`,
      `DESCRIPTION:${item.interview.type} with ${job.company}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "interview.ics";
    link.click();
    app.pushToast("Calendar file downloaded");
  };

  return (
    <div className="min-h-dvh pb-10">
      <PageHeader title="Tracking" subtitle={job.company} fallback="/applications" />
      <div className="space-y-4 px-4">
        <div className="flex items-center gap-3 rounded-2xl bg-card p-4 dark:border dark:border-white/10">
          <CompanyMark initials={job.initials} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{job.title}</p>
            <p className="text-sm text-muted-foreground">{job.locationLabel}</p>
          </div>
          <StatusBadge status={item.status} />
        </div>
        {item.referredBy && (
          <p className="rounded-2xl bg-[#F3E8FF] px-4 py-3 text-sm font-medium text-[#6B21A8] dark:bg-[#7A22C8]/20 dark:text-[#E9D5FF]">
            Referred by {item.referredBy}
          </p>
        )}
        <ol className="rounded-2xl bg-card p-4 dark:border dark:border-white/10">
          {item.timeline.map((step, index) => (
            <li key={step.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "mt-0.5 h-4 w-4 rounded-full",
                    step.state === "future" && "border-2 border-border bg-muted",
                    step.state === "done" && "bg-gradient-to-br from-[#7A22C8] to-[#0FAEE5]",
                    step.state === "current" && "bg-gradient-to-br from-[#7A22C8] to-[#0FAEE5] animate-[step-pulse_1.6s_ease-in-out_infinite]",
                  )}
                />
                {index < item.timeline.length - 1 && <span className={cn("w-px flex-1", step.state === "future" ? "bg-border" : "bg-[#0FAEE5]")} />}
              </div>
              <div className="pb-5">
                <p className={cn("text-sm font-semibold", step.state === "future" && "text-muted-foreground")}>{step.label}</p>
                {step.date && <p className="text-xs text-muted-foreground">{step.date}</p>}
              </div>
            </li>
          ))}
          {item.status === "Rejected" && <p className="text-sm text-danger">This application was not moved forward.</p>}
        </ol>

        {item.interview && item.status === "Interview" && (
          <div className="rounded-2xl bg-card p-4 dark:border dark:border-white/10">
            <p className="text-sm font-semibold text-[#6B21A8]">Interview</p>
            <p className="mt-2 font-semibold">{item.interview.date}</p>
            <p className="text-sm text-muted-foreground">{item.interview.time}</p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm">
              {item.interview.type === "Video" ? <Video size={16} /> : <MapPin size={16} />}
              {item.interview.type} · {item.interview.detail}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <SecondaryButton onClick={addToCalendar}>
                <CalendarPlus size={16} /> Add to Calendar
              </SecondaryButton>
              <PrimaryButton
                onClick={() => {
                  app.confirmInterview(item.id);
                  haptic();
                  app.pushToast("Interview confirmed");
                }}
              >
                {item.interview.confirmed ? "Confirmed" : "Confirm"}
              </PrimaryButton>
            </div>
            <button type="button" onClick={() => setReschedule(true)} className="mt-3 text-sm font-semibold text-blue">
              Request reschedule
            </button>
          </div>
        )}

        {item.offer && item.status === "Offer" && (
          <div className="rounded-2xl border border-[#F5B301] bg-[#FFF8E6] p-4 dark:bg-[#F5B301]/10">
            <p className="text-sm font-semibold text-[#92400E] dark:text-[#FCD34D]">Offer</p>
            <p className="mt-2 text-lg font-bold text-heading">{item.offer.salary}</p>
            <p className="text-sm">{item.offer.bonus}</p>
            <p className="text-sm text-muted-foreground">{item.offer.schedule}</p>
            <p className="text-sm text-muted-foreground">Start {item.offer.start}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <SecondaryButton onClick={() => setDecline(true)}>Decline</SecondaryButton>
              <PrimaryButton
                onClick={() => {
                  app.decideOffer(item.id, "accept");
                  haptic();
                  app.pushToast("Offer accepted", "Welcome aboard.");
                }}
              >
                Accept
              </PrimaryButton>
            </div>
          </div>
        )}

        {item.notes && (
          <div className="rounded-2xl bg-card p-4 dark:border dark:border-white/10">
            <p className="text-sm font-semibold">Employer notes</p>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">{item.notes}</p>
          </div>
        )}

        {item.status !== "Withdrawn" && item.status !== "Hired" && item.status !== "Rejected" && (
          <DangerButton className="w-full" onClick={() => setWithdraw(true)}>
            Withdraw Application
          </DangerButton>
        )}
      </div>

      <ConfirmDialog
        open={withdraw}
        title="Withdraw this application?"
        body="The employer will be notified. You can apply again later if the role is still open."
        confirmLabel="Withdraw"
        danger
        onClose={() => setWithdraw(false)}
        onConfirm={() => {
          app.withdraw(item.id);
          haptic();
          app.pushToast("Application withdrawn");
          setWithdraw(false);
          navigate({ to: "/applications" });
        }}
      />
      <ConfirmDialog
        open={decline}
        title="Decline this offer?"
        body="We’ll let the employer know you won’t be moving forward."
        confirmLabel="Decline offer"
        danger
        onClose={() => setDecline(false)}
        onConfirm={() => {
          app.decideOffer(item.id, "decline");
          haptic();
          app.pushToast("Offer declined");
          setDecline(false);
        }}
      />
      <Sheet
        open={reschedule}
        title="Request a new time"
        onClose={() => setReschedule(false)}
        footer={
          <PrimaryButton
            className="w-full"
            onClick={() => {
              app.rescheduleInterview(item.id, date, time);
              app.pushToast("Reschedule requested");
              setReschedule(false);
            }}
          >
            Send request
          </PrimaryButton>
        }
      >
        <label className="mb-3 block text-sm font-medium">
          Date
          <input value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 h-[52px] w-full rounded-xl border border-border bg-background px-3" />
        </label>
        <label className="block text-sm font-medium">
          Time
          <input value={time} onChange={(event) => setTime(event.target.value)} className="mt-1 h-[52px] w-full rounded-xl border border-border bg-background px-3" />
        </label>
      </Sheet>
    </div>
  );
}
