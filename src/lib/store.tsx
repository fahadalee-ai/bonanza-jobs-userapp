import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearStorage, readStorage, writeStorage } from "./storage";
import {
  DEMO_EMAIL,
  JOBS,
  SEED_APPLICATIONS,
  SEED_NOTICES,
  SEED_USER,
  emptyTimeline,
  type Application,
  type Candidate,
  type Notice,
  type SavedSearch,
  type ThemeMode,
} from "./mock-data";

export const STORAGE_KEY = "bonanza.candidate.v1";

export type Toast = { id: number; title: string; body?: string };

type PendingSignup = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

type Snapshot = {
  onboarded: boolean;
  sessionId: string | null;
  users: Candidate[];
  applications: Application[];
  savedIds: string[];
  dismissedIds: string[];
  recent: { jobId: string; at: string }[];
  notifications: Notice[];
  theme: ThemeMode;
  recentSearches: string[];
  savedSearches: SavedSearch[];
  biometricAsked: boolean;
  notifAsked: boolean;
};

type Store = Snapshot & {
  hydrated: boolean;
  user: Candidate | null;
  jobs: typeof JOBS;
  toasts: Toast[];
  lockedUntil: number;
  pendingSignup: PendingSignup | null;
  resetEmail: string;
  markOnboarded: () => void;
  login: (email: string, password: string, remember?: boolean) => { ok: true } | { ok: false; reason: "invalid" | "locked" };
  beginSignup: (input: PendingSignup) => { ok: true } | { ok: false; reason: "exists" };
  verifyOtp: () => boolean;
  requestReset: (email: string) => void;
  resetPassword: (password: string) => boolean;
  logout: () => void;
  deleteAccount: () => void;
  resetDemo: () => void;
  updateUser: (patch: Partial<Candidate>) => void;
  toggleSave: (jobId: string) => void;
  viewJob: (jobId: string) => void;
  dismissJob: (jobId: string) => void;
  clearRecent: () => void;
  applyToJob: (input: {
    jobId: string;
    phone: string;
    location: string;
    resumeName: string;
    coverLetter: string;
  }) => { ok: true; id: string } | { ok: false; reason: "duplicate" | "signedout" };
  withdraw: (id: string) => void;
  decideOffer: (id: string, decision: "accept" | "decline") => void;
  confirmInterview: (id: string) => void;
  rescheduleInterview: (id: string, date: string, time: string) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  removeNotification: (id: string) => void;
  pushToast: (title: string, body?: string) => void;
  dismissToast: (id: number) => void;
  setTheme: (theme: ThemeMode) => void;
  addRecentSearch: (query: string) => void;
  toggleSavedSearch: (query: string) => void;
  setBiometricAsked: () => void;
  setNotifAsked: () => void;
};

const Ctx = createContext<Store | null>(null);
let skipSessionPersist = false;

function fresh(): Snapshot {
  return {
    onboarded: false,
    sessionId: null,
    users: [SEED_USER],
    applications: SEED_APPLICATIONS,
    savedIds: ["j2", "j7", "j8", "j11"],
    dismissedIds: [],
    recent: [
      { jobId: "j5", at: "2h ago" },
      { jobId: "j12", at: "Yesterday" },
      { jobId: "j1", at: "3d ago" },
    ],
    notifications: SEED_NOTICES,
    theme: "light",
    recentSearches: ["product designer", "austin", "nurse"],
    savedSearches: [
      { id: "ss1", label: "Product design in Austin", query: "product designer" },
      { id: "ss2", label: "Remote UX", query: "UX" },
    ],
    biometricAsked: false,
    notifAsked: false,
  };
}

function loadSnapshot(): Snapshot {
  const raw = readStorage(STORAGE_KEY);
  if (!raw) return fresh();
  try {
    const parsed = JSON.parse(raw) as Snapshot;
    if (!parsed.users?.length) return fresh();
    if (!parsed.users.some((user) => user.email === DEMO_EMAIL)) {
      parsed.users = [SEED_USER, ...parsed.users];
    }
    return { ...fresh(), ...parsed, users: parsed.users };
  } catch {
    return fresh();
  }
}

function todayLabel() {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [snap, setSnap] = useState<Snapshot>(fresh);
  const [hydrated, setHydrated] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [pendingSignup, setPendingSignup] = useState<PendingSignup | null>(null);
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    const loaded = loadSnapshot();
    setSnap(loaded);
    const pending = readStorage("bonanza.pending", true);
    const reset = readStorage("bonanza.reset", true);
    if (pending) setPendingSignup(JSON.parse(pending) as PendingSignup);
    if (reset) setResetEmail(reset);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(STORAGE_KEY, JSON.stringify(skipSessionPersist ? { ...snap, sessionId: null } : snap));
  }, [snap, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    const apply = (dark: boolean) => root.classList.toggle("dark", dark);
    if (snap.theme === "dark") {
      apply(true);
      return;
    }
    if (snap.theme === "light") {
      apply(false);
      return;
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    apply(media.matches);
    const onChange = () => apply(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [snap.theme, hydrated]);

  const user = snap.users.find((item) => item.id === snap.sessionId) ?? null;

  const api = useMemo<Store>(() => {
    const pushToast = (title: string, body?: string) => {
      const id = Date.now() + Math.random();
      setToasts((list) => [...list, { id, title, body }]);
      window.setTimeout(() => setToasts((list) => list.filter((item) => item.id !== id)), 3200);
    };

    const updateUser = (patch: Partial<Candidate>) => {
      setSnap((current) => {
        if (!current.sessionId) return current;
        return {
          ...current,
          users: current.users.map((item) => (item.id === current.sessionId ? { ...item, ...patch } : item)),
        };
      });
    };

    return {
      ...snap,
      hydrated,
      user,
      jobs: JOBS,
      toasts,
      lockedUntil,
      pendingSignup,
      resetEmail,
      markOnboarded: () => setSnap((current) => ({ ...current, onboarded: true })),
      login: (email, password, remember = true) => {
        if (Date.now() < lockedUntil) return { ok: false, reason: "locked" };
        const found = snap.users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
        if (!found || found.password !== password) {
          const next = attempts + 1;
          setAttempts(next);
          if (next >= 5) setLockedUntil(Date.now() + 2 * 60 * 1000);
          return { ok: false, reason: "invalid" };
        }
        setAttempts(0);
        skipSessionPersist = !remember;
        setSnap((current) => ({ ...current, sessionId: found.id, onboarded: true }));
        return { ok: true };
      },
      beginSignup: (input) => {
        if (snap.users.some((item) => item.email.toLowerCase() === input.email.trim().toLowerCase())) {
          return { ok: false, reason: "exists" };
        }
        setPendingSignup(input);
        writeStorage("bonanza.pending", JSON.stringify(input), true);
        return { ok: true };
      },
      verifyOtp: () => {
        if (!pendingSignup) return false;
        const [firstName, ...rest] = pendingSignup.name.trim().split(/\s+/);
        const created: Candidate = {
          ...SEED_USER,
          id: `u-${Date.now()}`,
          firstName: firstName || "New",
          lastName: rest.join(" ") || "Candidate",
          email: pendingSignup.email.trim().toLowerCase(),
          phone: pendingSignup.phone,
          password: pendingSignup.password,
          headline: "",
          summary: "",
          photo: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          linkedin: "",
          portfolio: "",
          industry: "",
          desiredTitle: "",
          resumeName: "",
          resumeSize: "",
          resumeUpdated: "",
          resumeVisible: false,
          profileViews: 0,
          skills: [],
          experience: [],
          education: [],
          certifications: [],
          preferences: {
            ...SEED_USER.preferences,
            roles: [],
            locations: [],
            workModes: [],
            jobTypes: [],
          },
        };
        setSnap((current) => ({
          ...current,
          users: [...current.users, created],
          sessionId: created.id,
          onboarded: true,
          applications: current.applications,
          notifications: [],
          savedIds: [],
          recent: [],
        }));
        setPendingSignup(null);
        clearStorage("bonanza.pending", true);
        return true;
      },
      requestReset: (email) => {
        setResetEmail(email.trim().toLowerCase());
        writeStorage("bonanza.reset", email.trim().toLowerCase(), true);
      },
      resetPassword: (password) => {
        const email = resetEmail.trim().toLowerCase();
        const found = snap.users.find((item) => item.email === email);
        if (!found) return false;
        setSnap((current) => ({
          ...current,
          users: current.users.map((item) => (item.email === email ? { ...item, password } : item)),
        }));
        setResetEmail("");
        clearStorage("bonanza.reset", true);
        return true;
      },
      logout: () => setSnap((current) => ({ ...current, sessionId: null })),
      deleteAccount: () =>
        setSnap((current) => ({
          ...current,
          sessionId: null,
          users: current.users.filter((item) => item.id !== current.sessionId),
          applications: current.applications.filter((item) => item.userId !== current.sessionId),
        })),
      resetDemo: () => {
        clearStorage(STORAGE_KEY);
        setSnap(fresh());
        setPendingSignup(null);
        setResetEmail("");
        pushToast("Sample data restored");
      },
      updateUser,
      toggleSave: (jobId) =>
        setSnap((current) => ({
          ...current,
          savedIds: current.savedIds.includes(jobId)
            ? current.savedIds.filter((id) => id !== jobId)
            : [jobId, ...current.savedIds],
        })),
      viewJob: (jobId) =>
        setSnap((current) => ({
          ...current,
          recent: [{ jobId, at: "Just now" }, ...current.recent.filter((item) => item.jobId !== jobId)].slice(0, 12),
        })),
      dismissJob: (jobId) =>
        setSnap((current) => ({ ...current, dismissedIds: [...current.dismissedIds, jobId] })),
      clearRecent: () => setSnap((current) => ({ ...current, recent: [] })),
      applyToJob: (input) => {
        if (!user) return { ok: false, reason: "signedout" };
        const existing = snap.applications.find(
          (item) =>
            item.userId === user.id &&
            item.jobId === input.jobId &&
            item.status !== "Withdrawn" &&
            item.status !== "Rejected",
        );
        if (existing) return { ok: false, reason: "duplicate" };
        const id = `a-${Date.now()}`;
        const label = todayLabel();
        const job = JOBS.find((item) => item.id === input.jobId);
        const application: Application = {
          id,
          jobId: input.jobId,
          userId: user.id,
          status: "Submitted",
          appliedLabel: label,
          updatedLabel: label,
          resumeName: input.resumeName,
          coverLetter: input.coverLetter,
          timeline: emptyTimeline(label),
        };
        const notice: Notice = {
          id: `n-${Date.now()}`,
          bucket: "Today",
          kind: "status",
          title: "Application submitted",
          body: job ? `${job.title} at ${job.company} is in.` : "Your application was submitted.",
          time: "Just now",
          read: false,
          href: `/applications/${id}`,
        };
        setSnap((current) => ({
          ...current,
          applications: [application, ...current.applications],
          notifications: [notice, ...current.notifications],
          users: current.users.map((item) =>
            item.id === user.id ? { ...item, phone: input.phone } : item,
          ),
        }));
        return { ok: true, id };
      },
      withdraw: (id) =>
        setSnap((current) => ({
          ...current,
          applications: current.applications.map((item) =>
            item.id === id ? { ...item, status: "Withdrawn", updatedLabel: todayLabel() } : item,
          ),
        })),
      decideOffer: (id, decision) =>
        setSnap((current) => ({
          ...current,
          applications: current.applications.map((item) => {
            if (item.id !== id) return item;
            if (decision === "decline") {
              return { ...item, status: "Rejected", updatedLabel: todayLabel(), notes: "You declined this offer." };
            }
            return {
              ...item,
              status: "Hired",
              updatedLabel: todayLabel(),
              timeline: item.timeline.map((step) =>
                step.id === "Hired"
                  ? { ...step, state: "current", date: todayLabel() }
                  : { ...step, state: "done" },
              ),
            };
          }),
        })),
      confirmInterview: (id) =>
        setSnap((current) => ({
          ...current,
          applications: current.applications.map((item) =>
            item.id === id && item.interview ? { ...item, interview: { ...item.interview, confirmed: true } } : item,
          ),
        })),
      rescheduleInterview: (id, date, time) =>
        setSnap((current) => ({
          ...current,
          applications: current.applications.map((item) =>
            item.id === id && item.interview
              ? { ...item, interview: { ...item.interview, date, time, confirmed: false } }
              : item,
          ),
        })),
      markAllRead: () =>
        setSnap((current) => ({
          ...current,
          notifications: current.notifications.map((item) => ({ ...item, read: true })),
        })),
      markRead: (id) =>
        setSnap((current) => ({
          ...current,
          notifications: current.notifications.map((item) => (item.id === id ? { ...item, read: true } : item)),
        })),
      removeNotification: (id) =>
        setSnap((current) => ({
          ...current,
          notifications: current.notifications.filter((item) => item.id !== id),
        })),
      pushToast,
      dismissToast: (id) => setToasts((list) => list.filter((item) => item.id !== id)),
      setTheme: (theme) => setSnap((current) => ({ ...current, theme })),
      addRecentSearch: (query) => {
        const clean = query.trim();
        if (!clean) return;
        setSnap((current) => ({
          ...current,
          recentSearches: [clean, ...current.recentSearches.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 8),
        }));
      },
      toggleSavedSearch: (query) => {
        const clean = query.trim();
        if (!clean) return;
        setSnap((current) => {
          const exists = current.savedSearches.some((item) => item.query.toLowerCase() === clean.toLowerCase());
          return {
            ...current,
            savedSearches: exists
              ? current.savedSearches.filter((item) => item.query.toLowerCase() !== clean.toLowerCase())
              : [{ id: `ss-${Date.now()}`, label: clean, query: clean }, ...current.savedSearches],
          };
        });
      },
      setBiometricAsked: () => setSnap((current) => ({ ...current, biometricAsked: true })),
      setNotifAsked: () => setSnap((current) => ({ ...current, notifAsked: true })),
    };
  }, [snap, hydrated, user, toasts, lockedUntil, attempts, pendingSignup, resetEmail]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useApp() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}
