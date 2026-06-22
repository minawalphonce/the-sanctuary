import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AppShell from "@/layouts/AppShell";

import Splash from "@/pages/Splash";
import Login from "@/pages/login";
import Dashboard from "@/pages/Dashboard";
import Attendance from "@/pages/Attendance";
import Members from "@/pages/Members";
import MemberAddEdit from "@/pages/MemberAddEdit";
import MemberProfile from "@/pages/MemberProfile";
import MemberOverview from "@/pages/MemberOverview";
import MemberHistory from "@/pages/MemberHistory";
import MemberContact from "@/pages/MemberContact";
import Followup from "@/pages/Followup";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

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
    });

    return () => unsubscribe();
  }, []);

  if (!authReady) return <Splash />;

  return (
    <BrowserRouter>
      <Routes>
        {/* Login — no shell, no bottom nav */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

        {/* Everything else requires auth */}
        <Route path="/*" element={user ? <Outlet /> : <Navigate to="/login" replace />}>
          {/* Full-screen modal pages — no shell, no bottom nav */}
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