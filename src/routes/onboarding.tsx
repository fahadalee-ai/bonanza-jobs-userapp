import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ONBOARDING } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { PrimaryButton } from "@/components/ui-app";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const { markOnboarded } = useApp();
  const slide = ONBOARDING[index] ?? ONBOARDING[0];
  const last = index === ONBOARDING.length - 1;

  const finish = () => {
    markOnboarded();
    navigate({ to: "/welcome" });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="relative h-[52dvh] min-h-[280px] overflow-hidden rounded-b-3xl bg-gradient-to-br from-[#7A22C8] to-[#0FAEE5]">
        <img src={slide.image} alt={slide.alt} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2B1F6E]/55 via-[#7A22C8]/10 to-[#0FAEE5]/10" />
        <button
          type="button"
          onClick={finish}
          className="absolute right-4 top-[max(0.75rem,env(safe-area-inset-top))] rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-navy"
        >
          Skip
        </button>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6">
        <h1 className="text-2xl font-semibold leading-8 text-heading">{slide.title}</h1>
        <p className="mt-3 text-[15px] leading-6 text-muted-foreground">{slide.body}</p>
        <div className="mt-auto pt-8">
          <div className="mb-5 flex justify-center gap-2">
            {ONBOARDING.map((item, dot) => (
              <span
                key={item.title}
                className={dot === index ? "h-2 w-6 rounded-full bg-gradient-to-r from-[#7A22C8] to-[#0FAEE5]" : "h-2 w-2 rounded-full bg-[#E5E7EB]"}
              />
            ))}
          </div>
          <PrimaryButton
            className="w-full"
            onClick={() => {
              if (last) finish();
              else setIndex((value) => value + 1);
            }}
          >
            {last ? "Get Started" : "Next"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
