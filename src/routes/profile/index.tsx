import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, ChevronRight, Pencil } from "lucide-react";
import { useRef } from "react";
import { completeness } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { Avatar, useGuard } from "@/components/ui-app";

export const Route = createFileRoute("/profile/")({
  component: Profile,
});

const LINKS = [
  ["Personal Info", "/profile/edit", "Name, headline, and photo"],
  ["Contact", "/profile/edit", "Email, phone, and links"],
  ["Professional Summary", "/profile/edit", "A short introduction"],
  ["Resume", "/profile/resume", "File, preview, and visibility"],
  ["Skills", "/profile/skills", "What you want to be found for"],
  ["Experience", "/profile/experience", "Roles you’ve held"],
  ["Education", "/profile/education", "Schools and degrees"],
  ["Certifications", "/profile/certifications", "Licenses and credentials"],
  ["Job Preferences", "/profile/preferences", "Role, pay, and work mode"],
] as const;

function Profile() {
  const app = useGuard();
  const navigate = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const user = app.user;
  if (!user) return null;
  const score = completeness(user);

  return (
    <div className="min-h-dvh pb-28">
      <header className="bg-gradient-to-br from-[#0678A8] via-[#0FAEE5] to-[#5B4DDB] px-4 pb-6 pt-[max(1rem,env(safe-area-inset-top))] text-white">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold">Candidate</span>
          <button type="button" aria-label="Settings" onClick={() => navigate({ to: "/settings" })} className="text-sm font-semibold">
            Settings
          </button>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <button type="button" onClick={() => input.current?.click()} className="relative" aria-label="Edit photo">
            <Avatar src={user.photo} name={`${user.firstName} ${user.lastName}`} className="h-16 w-16 text-lg" />
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#0FAEE5]">
              <Camera size={14} />
            </span>
          </button>
          <input
            ref={input}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === "string") app.updateUser({ photo: reader.result });
              };
              reader.readAsDataURL(file);
            }}
          />
          <div>
            <h1 className="text-2xl font-semibold leading-7">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-white/85">{user.headline || "Add a headline"}</p>
            <p className="text-sm text-white/75">{[user.city, user.state].filter(Boolean).join(", ") || "Add your location"}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs font-semibold">
            <span>Profile {score}% complete</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white" style={{ width: `${score}%` }} />
          </div>
        </div>
      </header>
      <div className="space-y-2 px-4 py-4">
        {LINKS.map(([title, to, preview]) => (
          <button
            key={title}
            type="button"
            onClick={() => navigate({ to: to as "/" })}
            className="flex w-full items-center gap-3 rounded-2xl bg-card px-4 py-4 text-left dark:border dark:border-white/10"
          >
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 font-semibold">
                {title}
                <Pencil size={14} className="text-muted-foreground" />
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">{previewFor(title, preview, user)}</span>
            </span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}

function previewFor(
  title: string,
  fallback: string,
  user: NonNullable<ReturnType<typeof useGuard>["user"]>,
) {
  if (title === "Personal Info") return `${user.firstName} ${user.lastName}`;
  if (title === "Contact") return user.email;
  if (title === "Professional Summary") return user.summary.slice(0, 72) || fallback;
  if (title === "Resume") return user.resumeName || "No resume uploaded";
  if (title === "Skills") return user.skills.map((skill) => skill.name).slice(0, 3).join(", ") || fallback;
  if (title === "Experience") return user.experience[0] ? `${user.experience[0].title} · ${user.experience[0].company}` : fallback;
  if (title === "Education") return user.education[0]?.school || fallback;
  if (title === "Certifications") return user.certifications[0]?.name || "None yet";
  if (title === "Job Preferences") return user.preferences.roles.join(", ") || fallback;
  return fallback;
}
