import { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { checkAccess } from "@/lib/sheets";
import AppShell from "@/layouts/AppShell";
import { Toaster } from "@/components/ui/sonner";

import Splash from "@/pages/Splash";
import Login from "@/pages/login";
import AccessDenied from "@/pages/AccessDenied";
import NoConnection from "@/pages/NoConnection";
import Dashboard from "@/pages/Dashboard";
import Attendance from "@/pages/Attendance";
import Members from "@/pages/Members";
import MemberAddEdit from "@/pages/MemberAddEdit";
import MemberProfile from "@/pages/MemberProfile";
import MemberOverview from "@/pages/MemberOverview";
import MemberHistory from "@/pages/MemberHistory";
import MemberContact from "@/pages/MemberContact";
import Followup from "@/pages/Followup";
import TakeAttendance from "@/pages/TakeAttendance";
import MyProfile from "@/pages/MyProfile";
import PrivacyPolicy from "@/pages/legal/PrivacyPolicy";
import TermsAndConditions from "@/pages/legal/TermsAndConditions";

type AccessState = "checking" | "ok" | "denied" | "offline";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [accessState, setAccessState] = useState<AccessState>("checking");

  useEffect(() => {
    // Sign-in happens via signInWithPopup (see pages/login.tsx), which
    // resolves with both the Firebase user and the Google Sheets access
    // token in one round-trip. The Sheets token expires after ~1h and
    // can't be silently refreshed (Google requires a user gesture), so
    // store/data.ts signs the user out when it expires, which routes
    // back here to /login for a fresh popup sign-in.
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
      if (!u) setAccessState("checking");
    });

    return () => unsubscribe();
  }, []);

  // Re-runs every time a user becomes signed in — both right after login
  // and on every app open (Firebase restores the session from storage,
  // which triggers onAuthStateChanged again) — per the access-check story.
  const runAccessCheck = useCallback(async () => {
    setAccessState("checking");
    const result = await checkAccess();
    switch (result.status) {
      case "ok":
        setAccessState("ok");
        break;
      case "forbidden":
        setAccessState("denied");
        break;
      case "network-error":
        setAccessState("offline");
        break;
      case "unauthenticated":
        // Sheets token is bad/expired — sign out and let /login mint a fresh one.
        await signOut(auth);
        break;
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    // Queued as a microtask so the state update isn't synchronous within
    // the effect body (avoids cascading-render lint/perf footgun).
    queueMicrotask(runAccessCheck);
  }, [user, runAccessCheck]);

  if (!authReady) return <Splash />;

  if (user && accessState !== "ok") {
    if (accessState === "denied") return <AccessDenied />;
    if (accessState === "offline") return <NoConnection onRetry={runAccessCheck} />;
    return <Splash />;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Login — no shell, no bottom nav */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

        {/* Public legal pages — no auth required, no shell */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />

        {/* Everything else requires auth */}
        <Route path="/*" element={user ? <Outlet /> : <Navigate to="/login" replace />}>
          {/* Full-screen modal pages — no shell, no bottom nav */}
          <Route path="profile" element={<MyProfile />} />
          <Route path="attendance/take" element={<TakeAttendance />} />
          <Route path="attendance/take/:sessionId" element={<TakeAttendance />} />
          <Route path="members/add" element={<MemberAddEdit />} />
          <Route path="members/:id/edit" element={<MemberAddEdit />} />
          <Route path="members/:id" element={<MemberProfile />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<MemberOverview />} />
            <Route path="history" element={<MemberHistory />} />
            <Route path="contact" element={<MemberContact />} />
          </Route>

          {/* App pages — all wrapped in AppShell */}
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="members" element={<Members />} />
            <Route path="followup" element={<Followup />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
