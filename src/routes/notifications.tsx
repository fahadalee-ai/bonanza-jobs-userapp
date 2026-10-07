import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, Briefcase, Calendar, Eye, MessageSquare, Sparkles, UserPlus } from "lucide-react";
import { useState } from "react";
import type { Notice } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { EmptyState, PageHeader, useGuard } from "@/components/ui-app";

export const Route = createFileRoute("/notifications")({
  component: Notifications,
});

const ICONS = {
  status: Briefcase,
  interview: Calendar,
  match: Sparkles,
  message: MessageSquare,
  view: Eye,
  referral: UserPlus,
};

function Notifications() {
  useGuard();
  const app = useApp();
  const navigate = useNavigate();
  const groups = ["Today", "Earlier"] as const;

  return (
    <div className="min-h-dvh">
      <PageHeader
        title="Notifications"
        fallback="/home"
        right={
          <button type="button" className="text-sm font-semibold text-blue" onClick={() => app.markAllRead()}>
            Mark all as read
          </button>
        }
      />
      <div className="px-4 pb-8">
        {app.notifications.length === 0 ? (
          <EmptyState icon={<Bell size={28} />} title="You’re all caught up" body="Application updates, interviews, and new matches will land here." />
        ) : (
          groups.map((bucket) => {
            const items = app.notifications.filter((item) => item.bucket === bucket);
            if (!items.length) return null;
            return (
              <section key={bucket} className="mb-4">
                <h2 className="mb-2 text-sm font-semibold text-muted-foreground">{bucket}</h2>
                <div className="space-y-2">
                  {items.map((item) => (
                    <NoticeRow
                      key={item.id}
                      item={item}
                      onOpen={() => {
                        app.markRead(item.id);
                        navigate({ to: item.href as "/" });
                      }}
                      onDelete={() => app.removeNotification(item.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

function NoticeRow({ item, onOpen, onDelete }: { item: Notice; onOpen: () => void; onDelete: () => void }) {
  const Icon = ICONS[item.kind];
  const [x, setX] = useState(0);
  const [start, setStart] = useState<number | null>(null);
  return (
    <div className="relative overflow-hidden rounded-2xl">
      <button type="button" onClick={onDelete} className="absolute inset-y-0 right-0 w-20 bg-danger text-sm font-semibold text-white">
        Delete
      </button>
      <button
        type="button"
        onClick={() => {
          if (x < -40) setX(0);
          else onOpen();
        }}
        onTouchStart={(event) => setStart(event.touches[0]?.clientX ?? 0)}
        onTouchMove={(event) => {
          if (start == null) return;
          const dx = (event.touches[0]?.clientX ?? 0) - start;
          setX(Math.max(-88, Math.min(0, dx)));
        }}
        onTouchEnd={() => setX((value) => (value < -44 ? -80 : 0))}
        style={{ transform: `translateX(${x}px)` }}
        className="relative flex w-full items-start gap-3 bg-card p-4 text-left dark:border dark:border-white/10"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7F8FE] text-[#077A9E] dark:bg-[#0FAEE5]/15 dark:text-[#8FDBF5]">
          <Icon size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            {!item.read && <span className="h-2 w-2 rounded-full bg-[#0FAEE5]" />}
            <span className="truncate font-semibold">{item.title}</span>
          </span>
          <span className="mt-0.5 block text-sm leading-5 text-muted-foreground">{item.body}</span>
          <span className="mt-1 block text-xs text-muted-foreground">{item.time}</span>
        </span>
      </button>
    </div>
  );
}
