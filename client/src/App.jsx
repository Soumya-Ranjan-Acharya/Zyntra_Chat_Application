import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import useThemeStore from './store/useThemeStore';

/* ---- Pages ---- */
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import PersonalChatPage from './pages/PersonalChatPage';
import WorkspacePage from './pages/WorkspacePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

/* ---- Protected Route Wrapper ---- */
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

/* ---- Guest-only Route Wrapper ---- */
function GuestRoute({ children }) {
  return children;
}

export default function App() {
  const applyTheme = useThemeStore((s) => s.applyTheme);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  /* Apply saved theme and verify auth on mount */
  useEffect(() => {
    applyTheme();
    checkAuth();
  }, [applyTheme, checkAuth]);

  return (
    <Routes>
      {/* ---- Auth Routes (guest-only) ---- */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        }
      />

      {/* ---- Protected Routes ---- */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      {/* Personal Chat */}
      <Route
        path="/personal"
        element={
          <ProtectedRoute>
            <PersonalChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/personal/:chatId"
        element={
          <ProtectedRoute>
            <PersonalChatPage />
          </ProtectedRoute>
        }
      />

      {/* Workspace */}
      <Route
        path="/workspace"
        element={
          <ProtectedRoute>
            <WorkspacePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/:wsId"
        element={
          <ProtectedRoute>
            <WorkspacePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/:wsId/*"
        element={
          <ProtectedRoute>
            <WorkspacePage />
          </ProtectedRoute>
        }
      />

      {/* Settings */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/:section"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
