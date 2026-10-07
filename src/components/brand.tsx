import { cn } from "@/lib/utils";

export function Mark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <rect x="4" y="5" width="10" height="38" rx="3" fill="#0FAEE5" />
      <path
        fill="#7A22C8"
        fillRule="evenodd"
        d="M16 5h10.2C34.2 5 40 9.4 40 15.6c0 4.2-2.5 7.6-6.3 9 4.7 1.3 7.8 5 7.8 9.8C41.5 41.2 34.8 46 26.2 46H16V5zm6.2 6.2v9.2h2.6c3.3 0 5.4-1.8 5.4-4.6s-2.1-4.6-5.4-4.6h-2.6zm0 15.2V39.6h3.4c3.8 0 6.2-2 6.2-6.6s-2.4-6.6-6.2-6.6h-3.4z"
      />
    </svg>
  );
}

export function Logo({
  layout = "horizontal",
  className,
  mark = 36,
}: {
  layout?: "horizontal" | "stacked";
  className?: string;
  mark?: number;
}) {
  const word = (
    <span className="text-[13px] font-bold leading-none tracking-[0.16em] text-navy">
      BONANZA JOBS
    </span>
  );
  if (layout === "stacked") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <Mark size={mark} />
        {word}
      </div>
    );
  }
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <Mark size={mark} />
      {word}
    </div>
  );
}
