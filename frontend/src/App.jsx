import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './lib/ThemeContext';
import { AuthProvider, useAuth } from './lib/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';

// Componente para proteger todas las rutas que requieren Authentication
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900 dark:text-white">Cargando aplicación...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// Componente para proteger áreas exclusivas del Admin (ej: Ajustes, Inventario)
const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAdmin) return <Navigate to="/" replace />; // Devuelve al POS
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-right" />
          <Routes>
            {/* Ruta pública (Login) */}
            <Route path="/login" element={<Login />} />

            {/* Rutas administrativas protegidas (Layout con Sidebar Global) */}
            <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>

              {/* POS es la página principal ahora, pero envuelta en el Layout */}
              <Route path="/" element={<POS />} />

              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/inventory" element={
                <AdminRoute>
                  <Inventory />
                </AdminRoute>
              } />

              <Route path="/settings" element={
                <AdminRoute>
                  <Settings />
                </AdminRoute>
              } />
            </Route>

          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
