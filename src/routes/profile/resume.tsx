import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { ConfirmDialog, PageHeader, Sheet, Toggle, useGuard } from "@/components/ui-app";

export const Route = createFileRoute("/profile/resume")({
  component: ResumePage,
});

function ResumePage() {
  const app = useGuard();
  const user = app.user;
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(false);
  const [ask, setAsk] = useState(false);
  const [remove, setRemove] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  if (!user) return null;

  const startUpload = () => setAsk(true);

  const onFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      app.pushToast("File is over 5 MB");
      return;
    }
    setProgress(15);
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          window.clearInterval(timer);
          return 100;
        }
        return value + 20;
      });
    }, 180);
    window.setTimeout(() => {
      app.updateUser({
        resumeName: file.name,
        resumeSize: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        resumeUpdated: "Today",
      });
      if (file.type === "application/pdf") setFileUrl(URL.createObjectURL(file));
      setProgress(0);
      app.pushToast("Resume updated");
    }, 1000);
  };

  return (
    <div className="min-h-dvh">
      <PageHeader title="Resume" fallback="/profile" />
      <div className="space-y-4 px-4">
        {user.resumeName ? (
          <div className="rounded-2xl bg-card p-4 dark:border dark:border-white/10">
            <p className="font-semibold">{user.resumeName}</p>
            <p className="text-sm text-muted-foreground">{user.resumeSize} · Uploaded {user.resumeUpdated}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-blue">
              <button type="button" onClick={() => setPreview(true)}>Preview</button>
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([`${user.firstName} ${user.lastName}\n${user.headline}\n${user.summary}`], { type: "text/plain" });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = user.resumeName.replace(/\.pdf$/i, ".txt");
                  link.click();
                }}
              >
                Download
              </button>
              <button type="button" onClick={startUpload}>Replace</button>
              <button type="button" className="text-danger" onClick={() => setRemove(true)}>Delete</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No resume on file yet.</p>
        )}
        {progress > 0 && (
          <div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-gradient-to-r from-[#7A22C8] to-[#0FAEE5]" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Uploading… {progress}%</p>
          </div>
        )}
        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#7A22C8] bg-card text-center">
          <span className="font-semibold text-[#7A22C8]">Tap to upload</span>
          <span className="mt-1 text-xs text-muted-foreground">PDF, DOC, DOCX · 5 MB max</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf"
            className="sr-only"
            onClick={(event) => {
              event.preventDefault();
              startUpload();
            }}
          />
        </label>
        <div className="rounded-2xl bg-card px-4 dark:border dark:border-white/10">
          <Toggle
            checked={user.resumeVisible}
            onChange={(resumeVisible) => app.updateUser({ resumeVisible })}
            label="Let employers and recruiters find my resume"
          />
        </div>
      </div>
      <Sheet open={ask} title="Access your files?" onClose={() => setAsk(false)}>
        <p className="text-sm leading-5 text-muted-foreground">Bonanza Jobs needs access to a resume file on this device. We only upload the file you choose.</p>
        <label className="mt-4 flex h-[52px] w-full cursor-pointer items-center justify-center rounded-[14px] bg-gradient-to-br from-[#7A22C8] to-[#0FAEE5] font-semibold text-white">
          Allow and choose a file
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setAsk(false);
              if (file) onFile(file);
            }}
          />
        </label>
      </Sheet>
      <Sheet open={preview} title="Preview" onClose={() => setPreview(false)}>
        {fileUrl ? (
          <iframe title="Resume preview" src={fileUrl} className="h-[60dvh] w-full rounded-xl border border-border" />
        ) : (
          <article className="rounded-xl border border-border bg-white p-4 text-[#1B1B2F]">
            <p className="text-lg font-bold">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-[#0FAEE5]">{user.headline}</p>
            <p className="mt-1 text-xs text-[#6B7280]">{user.city}, {user.state} · {user.phone} · {user.email}</p>
            <p className="mt-3 text-sm leading-5">{user.summary}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide">Experience</p>
            {user.experience.map((item) => (
              <p key={item.id} className="mt-1 text-sm">{item.title}, {item.company}</p>
            ))}
          </article>
        )}
      </Sheet>
      <ConfirmDialog
        open={remove}
        title="Delete resume?"
        body="Employers won’t be able to download it until you upload a new file."
        confirmLabel="Delete"
        danger
        onClose={() => setRemove(false)}
        onConfirm={() => {
          app.updateUser({ resumeName: "", resumeSize: "", resumeUpdated: "", resumeVisible: false });
          setFileUrl("");
          setRemove(false);
        }}
      />
    </div>
  );
}
