import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clock, Search, Star } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { PageHeader } from "@/components/ui-app";

export const Route = createFileRoute("/search")({
  component: SearchScreen,
});

function SearchScreen() {
  const app = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const go = (value: string) => {
    const clean = value.trim();
    if (clean) app.addRecentSearch(clean);
    navigate({ to: "/jobs", search: { q: clean, filters: false } });
  };

  return (
    <div className="min-h-dvh">
      <PageHeader title="Search" fallback="/home" />
      <form
        className="px-4"
        onSubmit={(event) => {
          event.preventDefault();
          go(query);
        }}
      >
        <label className="flex h-[52px] items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:border-[#7A22C8] focus-within:ring-4 focus-within:ring-[#7A22C8]/15">
          <Search size={18} className="text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Jobs, companies, skills"
            className="h-full min-w-0 flex-1 bg-transparent outline-none"
          />
        </label>
      </form>
      <div className="mt-6 px-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-heading">Recent searches</h2>
        </div>
        <div className="space-y-1">
          {app.recentSearches.map((item) => (
            <button key={item} type="button" onClick={() => go(item)} className="flex h-12 w-full items-center gap-3 text-left text-[15px]">
              <Clock size={16} className="text-muted-foreground" />
              {item}
            </button>
          ))}
        </div>
        <h2 className="mb-2 mt-6 text-lg font-semibold text-heading">Saved searches</h2>
        <div className="space-y-1">
          {app.savedSearches.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <button type="button" onClick={() => go(item.query)} className="flex h-12 min-w-0 flex-1 items-center gap-3 text-left text-[15px]">
                <Star size={16} className="fill-[#F5B301] text-[#F5B301]" />
                <span className="truncate">{item.label}</span>
              </button>
            </div>
          ))}
        </div>
        {query.trim() && (
          <button type="button" onClick={() => app.toggleSavedSearch(query)} className="mt-4 text-sm font-semibold text-blue">
            Save “{query.trim()}”
          </button>
        )}
      </div>
    </div>
  );
}
