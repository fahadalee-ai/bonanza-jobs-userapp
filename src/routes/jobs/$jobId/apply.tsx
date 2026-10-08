import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { QUESTIONS } from "@/lib/mock-data";
import { haptic } from "@/lib/format";
import { useApp } from "@/lib/store";
import { PageHeader, PrimaryButton, SecondaryButton, TextArea, TextField, useGuard } from "@/components/ui-app";

export const Route = createFileRoute("/jobs/$jobId/apply")({
  component: Apply,
});

const STEPS = ["Contact", "Resume", "Cover letter", "Questions", "Review"];

function Apply() {
  const { jobId } = Route.useParams();
  const app = useGuard();
  const navigate = useNavigate();
  const job = app.jobs.find((item) => item.id === jobId);
  const user = app.user;
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [location, setLocation] = useState(user ? `${user.city}, ${user.state}` : "");
  const [resumeName, setResumeName] = useState(user?.resumeName ?? "");
  const [cover, setCover] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (!job || !user) return null;

  const next = () => {
    if (step < 4) {
      setStep((value) => value + 1);
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      app.applyToJob({ jobId, phone, location, resumeName, coverLetter: cover });
      setBusy(false);
      haptic();
      navigate({ to: "/jobs/$jobId/success", params: { jobId }, replace: true });
    }, 600);
  };

  return (
    <div className="min-h-dvh pb-28">
      <PageHeader
        title="Apply"
        subtitle={job.title}
        fallback={`/jobs/${jobId}`}
      />
      <div className="px-4">
        <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-gradient-to-r from-[#7A22C8] to-[#0FAEE5]" style={{ width: `${((step + 1) / 5) * 100}%` }} />
        </div>
        <p className="mb-4 text-xs font-semibold text-muted-foreground">
          Step {step + 1} of 5 · {STEPS[step]}
        </p>
        {step === 0 && (
          <>
            <TextField label="Full name" value={`${user.firstName} ${user.lastName}`} readOnly />
            <TextField label="Email" value={user.email} readOnly />
            <TextField label="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
            <TextField label="Location" value={location} onChange={(event) => setLocation(event.target.value)} />
          </>
        )}
        {step === 1 && (
          <>
            {user.resumeName && (
              <button type="button" onClick={() => setResumeName(user.resumeName)} className={resumeName === user.resumeName ? "mb-3 w-full rounded-2xl border border-[#0FAEE5] bg-[#E7F8FE] p-4 text-left dark:bg-[#0FAEE5]/10" : "mb-3 w-full rounded-2xl border border-border bg-card p-4 text-left"}>
                <p className="font-semibold">{user.resumeName}</p>
                <p className="text-xs text-muted-foreground">{user.resumeSize} · Saved resume</p>
              </button>
            )}
            <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#7A22C8] bg-card px-4 text-center">
              <span className="text-sm font-semibold text-[#7A22C8]">Upload a new resume</span>
              <span className="mt-1 text-xs text-muted-foreground">PDF, DOC, DOCX · 5 MB max</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setResumeName(file.name);
                }}
              />
            </label>
            {resumeName && <p className="mt-3 text-sm font-medium">Selected: {resumeName}</p>}
          </>
        )}
        {step === 2 && (
          <>
            <TextArea label="Cover letter" value={cover} onChange={(event) => setCover(event.target.value)} placeholder="Optional. A few sentences on why this role fits." />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{cover.length}/800</p>
              <button type="button" className="text-sm font-semibold text-blue" onClick={() => setStep(3)}>
                Skip
              </button>
            </div>
          </>
        )}
        {step === 3 && (
          <div className="space-y-4">
            {QUESTIONS.map((question) => (
              <div key={question.id}>
                <p className="mb-2 text-[15px] font-medium">{question.prompt}</p>
                {question.type === "yesno" && (
                  <div className="flex gap-2">
                    {["Yes", "No"].map((choice) => (
                      <button key={choice} type="button" onClick={() => setAnswers({ ...answers, [question.id]: choice })} className={answers[question.id] === choice ? "h-11 flex-1 rounded-xl bg-gradient-to-r from-[#7A22C8] to-[#0FAEE5] font-semibold text-white" : "h-11 flex-1 rounded-xl border border-border bg-card font-semibold"}>
                        {choice}
                      </button>
                    ))}
                  </div>
                )}
                {question.type === "choice" && (
                  <div className="flex flex-wrap gap-2">
                    {question.options?.map((choice) => (
                      <button key={choice} type="button" onClick={() => setAnswers({ ...answers, [question.id]: choice })} className={answers[question.id] === choice ? "h-10 rounded-full bg-[#0FAEE5] px-3 text-sm font-semibold text-white" : "h-10 rounded-full border border-border px-3 text-sm font-semibold"}>
                        {choice}
                      </button>
                    ))}
                  </div>
                )}
                {question.type === "text" && (
                  <input value={answers[question.id] ?? ""} onChange={(event) => setAnswers({ ...answers, [question.id]: event.target.value })} className="h-[52px] w-full rounded-xl border border-border bg-card px-3 outline-none focus:border-[#7A22C8]" />
                )}
              </div>
            ))}
          </div>
        )}
        {step === 4 && (
          <div className="space-y-3">
            <Review title="Contact" body={`${user.firstName} ${user.lastName}\n${user.email}\n${phone}\n${location}`} onEdit={() => setStep(0)} />
            <Review title="Resume" body={resumeName} onEdit={() => setStep(1)} />
            <Review title="Cover letter" body={cover || "Skipped"} onEdit={() => setStep(2)} />
            <Review title="Screening" body={QUESTIONS.map((question) => `${question.prompt}\n${answers[question.id] || "—"}`).join("\n\n")} onEdit={() => setStep(3)} />
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-1/2 z-40 grid w-full max-w-[390px] -translate-x-1/2 grid-cols-2 gap-3 border-t border-border bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <SecondaryButton
          onClick={() => {
            if (step === 0) navigate({ to: "/jobs/$jobId", params: { jobId } });
            else setStep((value) => value - 1);
          }}
        >
          Back
        </SecondaryButton>
        <PrimaryButton disabled={busy} onClick={next}>
          {busy ? "Submitting…" : step === 4 ? "Submit Application" : "Next"}
        </PrimaryButton>
      </div>
    </div>
  );
}

function Review({ title, body, onEdit }: { title: string; body: string; onEdit: () => void }) {
  return (
    <div className="rounded-2xl bg-card p-4 dark:border dark:border-white/10">
      <div className="mb-1 flex items-center justify-between">
        <p className="font-semibold">{title}</p>
        <button type="button" onClick={onEdit} className="text-sm font-semibold text-blue">
          Edit
        </button>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-5 text-muted-foreground">{body}</p>
    </div>
  );
}
