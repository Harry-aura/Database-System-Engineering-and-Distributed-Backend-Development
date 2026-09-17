/**
 * Root application: role-based React Router route tree wrapped in layout.
 * @module App
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ManageBills from './pages/admin/ManageBills';
import SocietyNotices from './pages/admin/SocietyNotices';
import ResidentDashboard from './pages/resident/ResidentDashboard';
import VisitorApprovals from './pages/resident/VisitorApprovals';
import MyBills from './pages/resident/MyBills';
import BookAmenities from './pages/resident/BookAmenities';
import SecurityDashboard from './pages/security/SecurityDashboard';
import VisitorEntry from './pages/security/VisitorEntry';
import VisitorLog from './pages/security/VisitorLog';

/**
 * Shared authenticated layout (sidebar + navbar + outlet).
 */
function Layout() {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            {/* Admin */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/bills" element={<ManageBills />} />
              <Route path="/admin/notices" element={<SocietyNotices />} />
            </Route>

            {/* Resident */}
            <Route element={<ProtectedRoute roles={['resident']} />}>
              <Route path="/resident" element={<ResidentDashboard />} />
              <Route path="/resident/visitor-approvals" element={<VisitorApprovals />} />
              <Route path="/resident/bills" element={<MyBills />} />
              <Route path="/resident/bookings" element={<BookAmenities />} />
            </Route>

            {/* Security */}
            <Route element={<ProtectedRoute roles={['security']} />}>
              <Route path="/security" element={<SecurityDashboard />} />
              <Route path="/security/entry" element={<VisitorEntry />} />
              <Route path="/security/log" element={<VisitorLog />} />
            </Route>
          </Routes>
        </main>
      </div>
    </div>
  );
}

/**
 * Home redirect based on the authenticated user's role.
 */
function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const home = { admin: '/admin', resident: '/resident', security: '/security' }[user.role];
  return <Navigate to={home || '/login'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* Authenticated layout contains all protected routes. */}
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<Layout />} />
          </Route>
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}