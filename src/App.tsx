/* eslint-disable react/jsx-sort-props */
import { Route, Routes, Navigate } from "react-router-dom";

import AdminPage from "@/pages/admin/Dashboard";
import UsersPage from "@/pages/admin/Users";
import SettingsPage from "@/pages/admin/Settings";
import LoginPage from "@/pages/auth/Login";
import ProtectedRoute from "@/components/ProtectedRoute";
import IndexPage from "@/pages/Home";
import AdminLayout from "@/layouts/admin";
import ArchiveLayout from "@/layouts/archive";
import SertifikatPage from "@/pages/archives/Sertifikat";
import SuratKeluarPage from "@/pages/archives/SuratKeluar";
import SuratMasukPage from "@/pages/archives/SuratMasuk";
import { NotificationProvider } from "@/context/NotificationContext";

function App() {
  return (
    <NotificationProvider>
      <Routes>
        {/* Public Routes */}
        <Route element={<LoginPage />} path="/login" />
        <Route element={<IndexPage />} path="/" />

        {/* Admin Specific Routes */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route element={<AdminLayout />}>
            <Route element={<AdminPage />} path="/admin" />
            <Route element={<UsersPage />} path="/admin/users" />
            <Route element={<SettingsPage />} path="/admin/settings" />
          </Route>
        </Route>

        {/* Staff Specific Routes */}
        <Route element={<ProtectedRoute allowedRoles={["STAFF"]} />}>
          <Route element={<Navigate replace to="/archives" />} path="/staff" />
        </Route>

        {/* Shared Protected Routes (Admin & Staff) */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN", "STAFF"]} />}>
          <Route element={<AdminLayout />}>
            <Route element={<ArchiveLayout />} path="/archives">
              <Route element={<Navigate replace to="surat-masuk" />} index />
              <Route element={<SuratMasukPage />} path="surat-masuk" />
              <Route element={<SuratKeluarPage />} path="surat-keluar" />
              <Route element={<SertifikatPage />} path="sertifikat" />
            </Route>
          </Route>
        </Route>

        {/* Fallback - Kalau nyasar */}
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </NotificationProvider>
  );
}

export default App;
