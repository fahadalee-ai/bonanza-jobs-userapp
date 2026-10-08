import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-app";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
});

function Privacy() {
  return (
    <div className="min-h-dvh">
      <PageHeader title="Privacy Policy" fallback="/login" />
      <article className="space-y-4 px-4 pb-10 text-[15px] leading-6 text-muted-foreground">
        <p>We collect the profile, resume, and application details you choose to provide so employers can review you for open roles. Visibility controls in Settings and on your resume decide whether recruiters can find you.</p>
        <p>Application status, interview times, and messages from employers are shown in the app. We use notifications only for the categories you leave on.</p>
        <p>This preview stores your candidate data on this device. A production account would be stored on Bonanza Jobs servers in the United States and shared with an employer only when you apply or make your profile visible.</p>
        <p>You can update or delete your information from Profile and Settings. Questions go to support@thehrsquad.com.</p>
      </article>
    </div>
  );
}
