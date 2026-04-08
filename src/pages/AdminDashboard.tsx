import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { logout, db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { LogOut, Users, CreditCard, FileText, Moon, Sun, User, TrendingUp, Brain } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [pendingPayments, setPendingPayments] = useState(0);
  const [pendingDiscounts, setPendingDiscounts] = useState(0);

  useEffect(() => {
    // Escuchar pagos pendientes
    const qPayments = query(collection(db, 'payments'), where('status', '==', 'Pendiente'));
    const unsubPayments = onSnapshot(qPayments, (snapshot) => {
      setPendingPayments(snapshot.size);
    }, (error) => {
      console.error("Error fetching pending payments:", error);
    });

    // Escuchar descuentos pendientes
    const qDiscounts = query(collection(db, 'discountRequests'), where('status', '==', 'Pendiente'));
    const unsubDiscounts = onSnapshot(qDiscounts, (snapshot) => {
      setPendingDiscounts(snapshot.size);
    }, (error) => {
      console.error("Error fetching pending discounts:", error);
    });

    return () => {
      unsubPayments();
      unsubDiscounts();
    };
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      <nav className="bg-[var(--color-bg-card)] shadow-sm border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <img src="/img/Logno.png" alt="NovusPrep" className="h-20 w-auto" onError={(e) => e.currentTarget.style.display = 'none'} />
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:block text-sm text-[var(--color-text-muted)] font-medium">Admin: {profile?.displayName}</span>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-brand-cyan)] rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Ir a Vista de Usuario"
              >
                <User className="w-5 h-5" />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-brand-gold)] rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Cambiar tema"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              <button
                onClick={logout}
                className="p-2 text-[var(--color-text-muted)] hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => navigate('/admin/usuarios')}
            className="card-base p-6 rounded-2xl shadow-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02] border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-500 rounded-xl">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text-main)]">Usuarios</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Gestionar cuentas y roles</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => navigate('/admin/pagos')}
            className="card-base p-6 rounded-2xl shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] border border-emerald-500/20 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all duration-300 cursor-pointer relative"
          >
            {pendingPayments > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg animate-pulse border-2 border-white dark:border-slate-900">
                {pendingPayments}
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-xl">
                <CreditCard className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text-main)]">Pagos</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Aprobar o rechazar pagos</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => navigate('/admin/descuentos')}
            className="card-base p-6 rounded-2xl shadow-sm hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:scale-[1.02] border border-orange-500/20 hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-all duration-300 cursor-pointer relative"
          >
            {pendingDiscounts > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg animate-pulse border-2 border-white dark:border-slate-900">
                {pendingDiscounts}
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-xl">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text-main)]">Solicitudes</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Revisar descuentos</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => navigate('/admin/ganancias')}
            className="card-base p-6 rounded-2xl shadow-sm hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:scale-[1.02] border border-yellow-500/20 hover:border-yellow-400 hover:bg-yellow-50/50 dark:hover:bg-yellow-900/20 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500 rounded-xl">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text-main)]">Ganancias</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Resumen histórico</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => navigate('/admin/ia')}
            className="card-base p-6 rounded-2xl shadow-sm hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-[1.02] border border-purple-500/20 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-xl">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text-main)]">Cerebro IA</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Configurar base de datos</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
