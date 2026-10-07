import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { INDUSTRIES } from "@/lib/mock-data";
import { haptic } from "@/lib/format";
import { useApp } from "@/lib/store";
import { Chip, PrimaryButton, SecondaryButton, TextField } from "@/components/ui-app";

export const Route = createFileRoute("/setup")({
  component: Setup,
});

function Setup() {
  const { user, updateUser } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(user?.desiredTitle ?? "");
  const [industry, setIndustry] = useState(user?.industry ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [state, setState] = useState(user?.state ?? "");
  const [modes, setModes] = useState<string[]>(user?.preferences.workModes ?? []);
  const [fileName, setFileName] = useState("");

  const finish = (skip: boolean) => {
    if (!skip && user) {
      updateUser({
        desiredTitle: title,
        headline: title || user.headline,
        industry,
        city,
        state,
        resumeName: fileName || user.resumeName,
        resumeUpdated: fileName ? "Today" : user.resumeUpdated,
        resumeSize: fileName ? "240 KB" : user.resumeSize,
        preferences: {
          ...user.preferences,
          roles: title ? [title] : user.preferences.roles,
          workModes: modes as typeof user.preferences.workModes,
          locations: city && state ? [`${city}, ${state}`] : user.preferences.locations,
        },
      });
    }
    haptic();
    navigate({ to: "/home", replace: true });
  };

  return (
    <div className="min-h-dvh px-4 pb-36 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-heading">Profile setup</p>
        <button type="button" onClick={() => finish(true)} className="text-sm font-semibold text-blue">
          Skip for now
        </button>
      </div>
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-gradient-to-r from-[#7A22C8] to-[#0FAEE5]" style={{ width: `${((step + 1) / 3) * 100}%` }} />
      </div>
      {step === 0 && (
        <>
          <h1 className="text-2xl font-semibold text-heading">What kind of role?</h1>
          <p className="mt-2 mb-5 text-[15px] text-muted-foreground">We’ll use this to rank jobs for you.</p>
          <TextField label="Desired job title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Product Designer" />
          <label className="block text-[13px] font-medium">Industry</label>
          <select value={industry} onChange={(event) => setIndustry(event.target.value)} className="mt-1.5 h-[52px] w-full rounded-xl border border-border bg-card px-3">
            <option value="">Select an industry</option>
            {INDUSTRIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </>
      )}
      {step === 1 && (
        <>
          <h1 className="text-2xl font-semibold text-heading">Where do you want to work?</h1>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <TextField label="City" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Austin" />
            <TextField label="State" value={state} onChange={(event) => setState(event.target.value.toUpperCase().slice(0, 2))} placeholder="TX" />
          </div>
          <p className="mb-2 text-[13px] font-medium">Work type</p>
          <div className="flex flex-wrap gap-2">
            {["On-site", "Remote", "Hybrid"].map((mode) => (
              <Chip
                key={mode}
                active={modes.includes(mode)}
                onClick={() => setModes((current) => (current.includes(mode) ? current.filter((item) => item !== mode) : [...current, mode]))}
              >
                {mode}
              </Chip>
            ))}
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <h1 className="text-2xl font-semibold text-heading">Upload a resume</h1>
          <p className="mt-2 text-[15px] leading-6 text-muted-foreground">Optional. PDF, DOC, or DOCX up to 5 MB.</p>
          <label className="mt-5 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#7A22C8] bg-card px-4 text-center">
            <span className="text-sm font-semibold text-[#7A22C8]">{fileName || "Tap to upload"}</span>
            <span className="mt-1 text-xs text-muted-foreground">PDF, DOC, DOCX</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) return;
                setFileName(file.name);
              }}
            />
          </label>
        </>
      )}
      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[390px] -translate-x-1/2 border-t border-border bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-2 gap-3">
          <SecondaryButton disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>
            Back
          </SecondaryButton>
          <PrimaryButton onClick={() => (step === 2 ? finish(false) : setStep((value) => value + 1))}>
            {step === 2 ? "Finish" : "Next"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
