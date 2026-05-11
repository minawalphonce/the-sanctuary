import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import AppShell from "@/layouts/AppShell";

import Login from "@/pages/login";
// import Dashboard from "@/pages/Dashboard";
// import Attendance from "@/pages/Attendance";
// import Members from "@/pages/Members";
// import Followup from "@/pages/Followup";

const NoImplemented = () => <div>Not implemented</div>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login — no shell, no bottom nav */}
        <Route path="/login" element={<Login />} />

        {/* App pages — all wrapped in AppShell */}
        <Route element={<AppShell />}>
          <Route path="/" element={<NoImplemented />} />
          <Route path="/attendance" element={<NoImplemented />} />
          <Route path="/members" element={<NoImplemented />} />
          <Route path="/followup" element={<NoImplemented />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}