import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import AppShell from "@/layouts/AppShell";

import Login from "@/pages/login";
import Dashboard from "@/pages/Dashboard";
import Attendance from "@/pages/Attendance";
import Members from "@/pages/Members";
import Followup from "@/pages/Followup";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login — no shell, no bottom nav */}
        <Route path="/login" element={<Login />} />

        {/* App pages — all wrapped in AppShell */}
        <Route element={<AppShell />}>
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