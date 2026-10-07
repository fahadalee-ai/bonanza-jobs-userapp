import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useState } from "react";
import { SKILL_SUGGESTIONS } from "@/lib/mock-data";
import { haptic } from "@/lib/format";
import { useApp } from "@/lib/store";
import { PageHeader, PrimaryButton, Sheet, useGuard } from "@/components/ui-app";

export const Route = createFileRoute("/profile/skills")({
  component: Skills,
});

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

function Skills() {
  const app = useGuard();
  const user = app.user;
  const [query, setQuery] = useState("");
  const [levelFor, setLevelFor] = useState<string | null>(null);
  if (!user) return null;
  const suggestions = SKILL_SUGGESTIONS.filter(
    (skill) => skill.toLowerCase().includes(query.toLowerCase()) && !user.skills.some((item) => item.name === skill),
  );

  const add = (name: string, level?: string) => {
    const clean = name.trim();
    if (!clean || user.skills.some((item) => item.name.toLowerCase() === clean.toLowerCase())) return;
    app.updateUser({ skills: [...user.skills, { name: clean, level }] });
    setQuery("");
    haptic();
  };

  return (
    <div className="min-h-dvh pb-8">
      <PageHeader title="Skills" fallback="/profile" />
      <div className="px-4">
        <form
          className="mb-4 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            add(query);
          }}
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search or add a skill"
            className="h-[52px] min-w-0 flex-1 rounded-xl border border-border bg-card px-3 outline-none focus:border-[#7A22C8]"
          />
          <PrimaryButton type="submit" className="px-4">
            Add
          </PrimaryButton>
        </form>
        <div className="mb-4 flex flex-wrap gap-2">
          {suggestions.slice(0, 6).map((skill) => (
            <button key={skill} type="button" onClick={() => add(skill)} className="rounded-full border border-dashed border-[#7A22C8] px-3 py-1 text-sm text-[#7A22C8]">
              + {skill}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {user.skills.map((skill) => (
            <button key={skill.name} type="button" onClick={() => setLevelFor(skill.name)} className="inline-flex items-center gap-2 rounded-full bg-[#E7F8FE] py-1 pl-3 pr-1 text-sm font-semibold text-[#075F7A] dark:bg-[#0FAEE5]/15 dark:text-[#8FDBF5]">
              {skill.name}
              {skill.level ? ` · ${skill.level}` : ""}
              <span
                role="button"
                aria-label={`Remove ${skill.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  app.updateUser({ skills: user.skills.filter((item) => item.name !== skill.name) });
                }}
                className="flex h-8 w-8 items-center justify-center"
              >
                <X size={14} />
              </span>
            </button>
          ))}
        </div>
      </div>
      <Sheet open={Boolean(levelFor)} title="Proficiency" onClose={() => setLevelFor(null)}>
        <div className="space-y-2 pb-4">
          {LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              className="flex h-[52px] w-full items-center rounded-xl border border-border px-4 text-left font-medium"
              onClick={() => {
                app.updateUser({
                  skills: user.skills.map((item) => (item.name === levelFor ? { ...item, level } : item)),
                });
                setLevelFor(null);
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
