import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AppShell from "@/layouts/AppShell";

import Splash from "@/pages/Splash";
import Login from "@/pages/login";
import Dashboard from "@/pages/Dashboard";
import Attendance from "@/pages/Attendance";
import Members from "@/pages/Members";
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

        {/* App pages — all wrapped in AppShell */}
        <Route element={user ? <AppShell /> : <Navigate to="/login" replace />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/members" element={<Members />} />
          <Route path="/followup" element={<Followup />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}