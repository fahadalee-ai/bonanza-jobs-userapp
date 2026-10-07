import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import type { JobType, WorkMode } from "@/lib/mock-data";
import { haptic } from "@/lib/format";
import { useApp } from "@/lib/store";
import { Chip, PageHeader, PrimaryButton, TextField, Toggle, useGuard } from "@/components/ui-app";

export const Route = createFileRoute("/profile/preferences")({
  component: PreferencesPage,
});

function PreferencesPage() {
  const app = useGuard();
  const navigate = useNavigate();
  const user = app.user;
  const [roles, setRoles] = useState(user?.preferences.roles.join(", ") ?? "");
  const [locations, setLocations] = useState(user?.preferences.locations.join(", ") ?? "");
  const [modes, setModes] = useState<WorkMode[]>(user?.preferences.workModes ?? []);
  const [types, setTypes] = useState<JobType[]>(user?.preferences.jobTypes ?? []);
  const [salaryMin, setSalaryMin] = useState(String(user?.preferences.salaryMin ?? ""));
  const [salaryMax, setSalaryMax] = useState(String(user?.preferences.salaryMax ?? ""));
  const [unit, setUnit] = useState<"yr" | "hr">(user?.preferences.salaryUnit ?? "yr");
  const [availability, setAvailability] = useState(user?.preferences.availability ?? "Immediately");
  const [authorization, setAuthorization] = useState(user?.preferences.authorization ?? "US Citizen");
  const [relocate, setRelocate] = useState(user?.preferences.relocate ?? false);
  const [alerts, setAlerts] = useState(user?.preferences.alerts ?? true);
  if (!user) return null;

  const toggle = <T extends string>(list: T[], value: T, set: (next: T[]) => void) => {
    set(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  return (
    <div className="min-h-dvh pb-28">
      <PageHeader title="Job preferences" fallback="/profile" />
      <div className="px-4">
        <TextField label="Desired roles" value={roles} onChange={(event) => setRoles(event.target.value)} hint="Separate with commas" />
        <TextField label="Preferred locations" value={locations} onChange={(event) => setLocations(event.target.value)} hint="Austin, TX, Remote, USA" />
        <p className="mb-2 text-[13px] font-medium">Work mode</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {(["On-site", "Remote", "Hybrid"] as WorkMode[]).map((item) => (
            <Chip key={item} active={modes.includes(item)} onClick={() => toggle(modes, item, setModes)}>{item}</Chip>
          ))}
        </div>
        <p className="mb-2 text-[13px] font-medium">Job type</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {(["Full-time", "Part-time", "Contract"] as JobType[]).map((item) => (
            <Chip key={item} active={types.includes(item)} onClick={() => toggle(types, item, setTypes)}>{item}</Chip>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <TextField label="Minimum pay" inputMode="numeric" value={salaryMin} onChange={(event) => setSalaryMin(event.target.value.replace(/\D/g, ""))} />
          <TextField label="Maximum pay" inputMode="numeric" value={salaryMax} onChange={(event) => setSalaryMax(event.target.value.replace(/\D/g, ""))} />
        </div>
        <div className="mb-4 flex gap-2">
          <Chip active={unit === "yr"} onClick={() => setUnit("yr")}>Yearly</Chip>
          <Chip active={unit === "hr"} onClick={() => setUnit("hr")}>Hourly</Chip>
        </div>
        <label className="mb-4 block text-[13px] font-medium">
          Availability
          <select value={availability} onChange={(event) => setAvailability(event.target.value)} className="mt-1.5 h-[52px] w-full rounded-xl border border-border bg-card px-3">
            {["Immediately", "2 weeks", "1 month", "Custom date"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="mb-2 block text-[13px] font-medium">
          Work authorization
          <select value={authorization} onChange={(event) => setAuthorization(event.target.value)} className="mt-1.5 h-[52px] w-full rounded-xl border border-border bg-card px-3">
            {["US Citizen", "Green Card", "Visa", "Sponsorship needed"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <Toggle checked={relocate} onChange={setRelocate} label="Willing to relocate" />
        <Toggle checked={alerts} onChange={setAlerts} label="Job alerts" hint="Email me when a role matches these preferences" />
      </div>
      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[390px] -translate-x-1/2 border-t border-border bg-card px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <PrimaryButton
          className="w-full"
          onClick={() => {
            app.updateUser({
              preferences: {
                roles: roles.split(",").map((item) => item.trim()).filter(Boolean),
                locations: locations.split(",").map((item) => item.trim()).filter(Boolean),
                workModes: modes,
                jobTypes: types,
                salaryMin: Number(salaryMin) || 0,
                salaryMax: Number(salaryMax) || 0,
                salaryUnit: unit,
                availability,
                authorization,
                relocate,
                alerts,
              },
            });
            haptic();
            app.pushToast("Preferences saved");
            navigate({ to: "/profile" });
          }}
        >
          Save Preferences
        </PrimaryButton>
      </div>
    </div>
  );
}
