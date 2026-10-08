import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-app";

export const Route = createFileRoute("/terms")({
  component: Terms,
});

function Terms() {
  return (
    <div className="min-h-dvh">
      <PageHeader title="Terms of Service" fallback="/login" />
      <article className="space-y-4 px-4 pb-10 text-[15px] leading-6 text-muted-foreground">
        <p>These terms cover the Bonanza Jobs candidate app for job seekers in the United States. By creating an account you agree to use the service honestly and only for your own job search.</p>
        <p>You are responsible for the accuracy of your profile, resume, and application answers. Employers make their own hiring decisions. Bonanza Jobs does not guarantee interviews, offers, or employment.</p>
        <p>The service is free for candidates. Do not share your login, scrape the job catalog, or submit applications for someone else without their permission.</p>
        <p>We may suspend an account that misrepresents identity, work authorization, or experience. You can delete your account from Settings at any time.</p>
      </article>
    </div>
  );
}
