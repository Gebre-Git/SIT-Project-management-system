import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import JoinProject from './pages/JoinProject';
import Profile from './pages/Profile';
import AppLayout from './layouts/AppLayout';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminGroupDetail from './admin/pages/AdminGroupDetail';
import AdminUserDetail from './admin/pages/AdminUserDetail';
import AdminFinalProjectDetail from './admin/pages/AdminFinalProjectDetail';
import AdminInvitePage from './admin/pages/AdminInvitePage';

function App() {
    return (
        <Router>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/projects" element={<Dashboard />} /> {/* Alias for now */}
                    <Route path="/project/:projectId" element={<ProjectDetails />} />
                    <Route path="/join/:inviteCode" element={<JoinProject />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Admin Routes – protected by super_admin claim */}
                <Route element={<ProtectedAdminRoute />}>
                    <Route element={<AppLayout />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/group/:projectId" element={<AdminGroupDetail />} />
                        <Route path="/admin/user/:userId" element={<AdminUserDetail />} />
                        <Route path="/admin/final-project/:projectId/:taskId" element={<AdminFinalProjectDetail />} />
                    </Route>
                </Route>

                {/* Admin Invite – accessible by any authenticated user */}
                <Route path="/admin-invite" element={<AdminInvitePage />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    )
}

export default App;
