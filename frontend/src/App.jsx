import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TransformationPage from './pages/TransformationPage';
import DependenciesPage from './pages/DependenciesPage';
import ActionsPage from './pages/ActionsPage';
import KtMasterPage from './pages/KtMasterPage';
import './App.css';

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`app-layout ${collapsed ? 'app-layout--collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="app-main">
        <TopBar />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/transformation" element={<TransformationPage />} />
            <Route path="/dependencies" element={<DependenciesPage />} />
            <Route path="/actions" element={<ActionsPage />} />
            <Route path="/kt-master" element={<KtMasterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
