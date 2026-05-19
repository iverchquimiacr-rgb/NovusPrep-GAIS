import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
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
import { Temario } from './pages/Temario';
import { Legal } from './pages/Legal';
import { X, Mail } from 'lucide-react';

export default function App() {
  const [showContact, setShowContact] = useState(false);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen text-[var(--color-text-main)] relative pb-12">
            <div className="fixed inset-0 z-0 flex items-center justify-center opacity-10 dark:opacity-20 pointer-events-none">
              <img src="/img/Logo.png" className="w-[50%] max-w-sm object-contain" />
            </div>
            <div className="relative z-10">
              <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/temario" element={<Temario />} />
            <Route path="/legal" element={<Legal />} />
            
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
            </div>
            <footer className="fixed bottom-0 w-full text-center py-3 text-xs text-[var(--color-text-muted)] pointer-events-none z-50 flex justify-center gap-4">
              <span>© 2026 NovusPrep - Quality and Confidence forever</span>
              <button onClick={() => setShowContact(true)} className="hover:underline pointer-events-auto text-[var(--color-brand-cyan)]">Contáctanos</button>
              <Link to="/legal" className="hover:underline pointer-events-auto text-[var(--color-brand-cyan)]">Políticas y Legal</Link>
            </footer>

            {showContact && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm pointer-events-auto">
                <div className="bg-[var(--color-bg-card)] max-w-sm w-full rounded-2xl shadow-xl p-6 relative">
                  <button 
                    onClick={() => setShowContact(false)}
                    className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h2 className="text-xl font-bold text-[var(--color-text-main)] mb-3">Dinos tus opiniones</h2>
                  <p className="text-[var(--color-text-muted)] mb-6 text-sm leading-relaxed">
                    Si tienes alguna duda, sugerencia o inconveniente, no dudes en escribirnos a nuestro correo electrónico. Te responderemos lo más pronto posible.
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-xl flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm">
                      <Mail className="w-6 h-6 text-[var(--color-brand-cyan)]" />
                    </div>
                    <a href="mailto:novusprep@gmail.com" className="font-semibold text-lg text-[var(--color-text-main)] hover:text-[var(--color-brand-cyan)] transition-colors">
                      novusprep@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
