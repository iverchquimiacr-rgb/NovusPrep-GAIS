import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Catalog } from './pages/Catalog';
import { RegistrarPago } from './pages/RegistrarPago';
import { AdminPagos } from './pages/AdminPagos';
import { SolicitarDescuento } from './pages/SolicitarDescuento';
import { AdminDescuentos } from './pages/AdminDescuentos';
import { ExplorarCarpetas } from './pages/ExplorarCarpetas';
import { MisComprobantes } from './pages/MisComprobantes';
import { AdminUsuarios } from './pages/AdminUsuarios';
import { AdminGanancias } from './pages/AdminGanancias';
import { AdminIA } from './pages/AdminIA';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen text-[var(--color-text-main)] relative pb-12">
          <div className="fixed inset-0 z-0 flex items-center justify-center opacity-10 dark:opacity-20 pointer-events-none">
            <img src="/img/Logo.png" className="w-[50%] max-w-sm object-contain" />
          </div>
          <div className="relative z-10">
            <BrowserRouter>
              <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/catalog" 
              element={
                <ProtectedRoute>
                  <Catalog />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/registrar-pago" 
              element={
                <ProtectedRoute>
                  <RegistrarPago />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/solicitar-descuento" 
              element={
                <ProtectedRoute>
                  <SolicitarDescuento />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/carpetas" 
              element={
                <ProtectedRoute>
                  <ExplorarCarpetas />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/mis-comprobantes" 
              element={
                <ProtectedRoute>
                  <MisComprobantes />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/pagos" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPagos />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/descuentos" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDescuentos />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/usuarios" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminUsuarios />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/ganancias" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminGanancias />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/ia" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminIA />
                </ProtectedRoute>
              } 
            />
            
            <Route path="/" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </div>
          <footer className="fixed bottom-0 w-full text-center py-3 text-xs text-[var(--color-text-muted)] pointer-events-none z-50">
            © 2026 NovusPrep - Quality and Confidence forever
          </footer>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
