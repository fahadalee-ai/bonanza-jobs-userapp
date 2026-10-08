import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Camera, Check, MapPin, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { CITIES, SKILL_SUGGESTIONS, type WorkMode } from "@/lib/mock-data";
import { haptic } from "@/lib/format";
import { useApp } from "@/lib/store";
import { PrimaryButton } from "@/components/ui-app";

export const Route = createFileRoute("/setup")({
  component: Setup,
});

const STEPS = 5;
const MODES: { id: WorkMode; title: string; body: string }[] = [
  { id: "On-site", title: "On-site", body: "Work from the office" },
  { id: "Hybrid", title: "Hybrid", body: "Split time at home and the office" },
  { id: "Remote", title: "Remote", body: "Work from anywhere in the US" },
];

function Setup() {
  const { user, updateUser } = useApp();
  const navigate = useNavigate();
  const photoInput = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [photo, setPhoto] = useState(user?.photo ?? "");
  const [location, setLocation] = useState(user?.city && user?.state ? `${user.city}, ${user.state}` : "");
  const [jobTitle, setJobTitle] = useState(user?.experience[0]?.title ?? "");
  const [company, setCompany] = useState(user?.experience[0]?.company ?? "");
  const [currentRole, setCurrentRole] = useState(user?.experience[0]?.current ?? true);
  const [student, setStudent] = useState(false);
  const [desired, setDesired] = useState(user?.desiredTitle ?? "");
  const [modes, setModes] = useState<WorkMode[]>(user?.preferences.workModes ?? []);
  const [skills, setSkills] = useState<string[]>(user?.skills.map((item) => item.name) ?? []);

  const suggestions = CITIES.filter((city) => city.label.toLowerCase().includes(location.trim().toLowerCase())).slice(0, 5);

  const toggleSkill = (name: string) => {
    setSkills((current) => (current.includes(name) ? current.filter((item) => item !== name) : [...current, name]));
  };

  const finish = () => {
    if (user) {
      const [city, state] = location.split(",").map((part) => part.trim());
      const experience =
        !student && (jobTitle || company)
          ? [
              {
                id: user.experience[0]?.id ?? `exp-${Date.now()}`,
                title: jobTitle || "Role",
                company: company || "Company",
                location,
                start: "2024",
                end: currentRole ? "" : "2026",
                current: currentRole,
                description: "",
              },
              ...user.experience.slice(1),
            ]
          : user.experience;
      updateUser({
        photo: photo || user.photo,
        city: city || user.city,
        state: state || user.state,
        desiredTitle: desired || jobTitle || user.desiredTitle,
        headline: desired || jobTitle || user.headline,
        experience,
        skills: skills.map((name) => ({ name })),
        preferences: {
          ...user.preferences,
          roles: desired ? [desired] : user.preferences.roles,
          locations: location ? [location] : user.preferences.locations,
          workModes: modes,
        },
      });
    }
    haptic();
    navigate({ to: "/home", replace: true });
  };

  const next = () => {
    if (step === STEPS - 1) finish();
    else setStep((value) => value + 1);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white dark:bg-background">
      <header className="px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex h-12 items-center justify-between">
          {step > 0 ? (
            <button type="button" aria-label="Back" onClick={() => setStep((value) => value - 1)} className="flex h-10 w-10 items-center justify-center text-heading">
              <ArrowLeft size={22} strokeWidth={1.75} />
            </button>
          ) : (
            <span className="w-10" />
          )}
          <p className="text-sm font-semibold text-muted-foreground">
            {step + 1} of {STEPS}
          </p>
          <button type="button" onClick={next} className="text-sm font-semibold text-[#0FAEE5]">
            Skip
          </button>
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-[#E8EAF2]">
          <div className="h-full bg-gradient-to-r from-[#7A22C8] to-[#0FAEE5]" style={{ width: `${((step + 1) / STEPS) * 100}%` }} />
        </div>
      </header>

      <div className="flex-1 px-5 pb-32 pt-6">
        {step === 0 && (
          <div className="text-center">
            <h1 className="text-[28px] font-semibold leading-8 text-heading">Add a photo</h1>
            <p className="mx-auto mt-2 max-w-[280px] text-[15px] leading-6 text-muted-foreground">
              Profiles with a photo get more views from employers.
            </p>
            <button type="button" onClick={() => photoInput.current?.click()} className="relative mx-auto mt-8 block" aria-label="Add photo">
              {photo ? (
                <img src={photo} alt="" className="h-36 w-36 rounded-full object-cover" />
              ) : (
                <span className="flex h-36 w-36 items-center justify-center rounded-full bg-[#F3F4F8] text-[#0FAEE5]">
                  <Camera size={36} strokeWidth={1.75} />
                </span>
              )}
              <span className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7A22C8] to-[#0FAEE5] text-white">
                <Plus size={18} />
              </span>
            </button>
            <input
              ref={photoInput}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setPhoto(String(reader.result || ""));
                reader.readAsDataURL(file);
              }}
            />
            <p className="mt-4 text-sm font-semibold text-[#0FAEE5]">Add photo</p>
          </div>
        )}

        {step === 1 && (
          <>
            <h1 className="text-[28px] font-semibold leading-8 text-heading">Where are you located?</h1>
            <p className="mt-2 text-[15px] leading-6 text-muted-foreground">This helps us show jobs near you.</p>
            <label className="mt-6 flex h-[52px] items-center gap-2 rounded-lg border border-border bg-[#F6F7FB] px-3 dark:bg-card">
              <MapPin size={18} className="text-muted-foreground" />
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City, State"
                className="h-full min-w-0 flex-1 bg-transparent outline-none"
              />
            </label>
            <div className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
              {(location.trim() ? suggestions : CITIES.slice(0, 5)).map((city) => (
                <button
                  key={city.label}
                  type="button"
                  onClick={() => setLocation(city.label)}
                  className="flex h-12 w-full items-center gap-3 px-3 text-left text-[15px]"
                >
                  <MapPin size={16} className="text-[#0FAEE5]" />
                  <span className="flex-1">{city.label}</span>
                  {location === city.label && <Check size={16} className="text-[#0FAEE5]" />}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-[28px] font-semibold leading-8 text-heading">What’s your most recent job?</h1>
            <p className="mt-2 text-[15px] leading-6 text-muted-foreground">Employers use this to understand your background.</p>
            <label className="mt-4 flex items-center gap-3 text-sm font-medium">
              <input type="checkbox" checked={student} onChange={(event) => setStudent(event.target.checked)} className="h-5 w-5 accent-[#7A22C8]" />
              I’m a student
            </label>
            {!student && (
              <div className="mt-4 space-y-3">
                <Field label="Job title" value={jobTitle} onChange={setJobTitle} placeholder="Product Designer" />
                <Field label="Company" value={company} onChange={setCompany} placeholder="Northstar Health" />
                <label className="flex items-center gap-3 text-sm font-medium">
                  <input type="checkbox" checked={currentRole} onChange={(event) => setCurrentRole(event.target.checked)} className="h-5 w-5 accent-[#7A22C8]" />
                  I currently work here
                </label>
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-[28px] font-semibold leading-8 text-heading">Add skills</h1>
            <p className="mt-2 text-[15px] leading-6 text-muted-foreground">Tap the skills you want employers to see.</p>
            {skills.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {skills.map((name) => (
                  <button key={name} type="button" onClick={() => toggleSkill(name)} className="inline-flex h-9 items-center gap-1 rounded-full bg-[#E7F8FE] px-3 text-sm font-semibold text-[#075F7A]">
                    {name}
                    <X size={14} />
                  </button>
                ))}
              </div>
            )}
            <p className="mb-2 mt-5 text-sm font-semibold text-heading">Suggested</p>
            <div className="flex flex-wrap gap-2">
              {SKILL_SUGGESTIONS.filter((name) => !skills.includes(name)).map((name) => (
                <button key={name} type="button" onClick={() => toggleSkill(name)} className="inline-flex h-9 items-center gap-1 rounded-full border border-border px-3 text-sm font-semibold text-foreground">
                  <Plus size={14} />
                  {name}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="text-[28px] font-semibold leading-8 text-heading">What are you open to?</h1>
            <p className="mt-2 text-[15px] leading-6 text-muted-foreground">We’ll use this to recommend roles.</p>
            <Field label="Desired job title" value={desired} onChange={setDesired} placeholder="Product Designer" />
            <div className="mt-2 space-y-2">
              {MODES.map((mode) => {
                const active = modes.includes(mode.id);
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() =>
                      setModes((current) => (current.includes(mode.id) ? current.filter((item) => item !== mode.id) : [...current, mode.id]))
                    }
                    className={active ? "flex w-full items-center gap-3 rounded-lg border-2 border-[#0FAEE5] bg-[#F3FBFE] px-4 py-3 text-left" : "flex w-full items-center gap-3 rounded-lg border border-border px-4 py-3 text-left"}
                  >
                    <span className={active ? "flex h-5 w-5 items-center justify-center rounded-full bg-[#0FAEE5] text-white" : "h-5 w-5 rounded-full border border-border"}>
                      {active && <Check size={12} />}
                    </span>
                    <span>
                      <span className="block text-[15px] font-semibold text-heading">{mode.title}</span>
                      <span className="block text-sm text-muted-foreground">{mode.body}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[390px] -translate-x-1/2 bg-white px-5 pt-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] dark:bg-background">
        <PrimaryButton className="w-full" onClick={next}>
          {step === STEPS - 1 ? "Finish" : "Continue"}
        </PrimaryButton>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="mt-4 block">
      <span className="mb-1.5 block text-[13px] font-semibold text-heading">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-[52px] w-full rounded-lg border border-border bg-[#F6F7FB] px-3.5 outline-none focus:border-[#0FAEE5] focus:ring-4 focus:ring-[#0FAEE5]/15 dark:bg-card"
      />
    </label>
  );
}
