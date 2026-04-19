import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { db, logout } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { PRODUCTS } from '../data/products';
import { LogOut, User, CreditCard, Folder, FileText, Moon, Sun, Shield, Lock, Tag, ShoppingCart, X, AlertTriangle, ExternalLink, Bell, CheckCircle, XCircle } from 'lucide-react';
import { AIAssistantWidget } from '../components/AIAssistantWidget';
import { getFolderIcon } from '../utils/iconMap';

interface Notification {
  id: string;
  type: 'payment' | 'discount';
  status: 'Aprobado' | 'Rechazado';
  date: any;
  amount?: number;
  discount?: number;
}

export const Dashboard: React.FC = () => {
  const { profile, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPagosModalOpen, setIsPagosModalOpen] = useState(false);
  const [isCarpetasModalOpen, setIsCarpetasModalOpen] = useState(false);
  const [showDiscountWarning, setShowDiscountWarning] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'payments'), where('userId', '==', user.uid), where('status', '==', 'Aprobado'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let sum = 0;
      snapshot.forEach((doc) => {
        sum += doc.data().amount || 0;
      });
      setTotalPaid(sum);
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch notifications (resolved payments and discounts)
  useEffect(() => {
    if (!user) return;

    const qPayments = query(
      collection(db, 'payments'), 
      where('userId', '==', user.uid),
      where('status', 'in', ['Aprobado', 'Rechazado'])
    );

    const qDiscounts = query(
      collection(db, 'discountRequests'), 
      where('userId', '==', user.uid),
      where('status', 'in', ['Aprobado', 'Rechazado'])
    );

    const unsubPayments = onSnapshot(qPayments, (snapshot) => {
      const payments = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'payment' as const,
        status: doc.data().status,
        date: doc.data().date,
        amount: doc.data().amount
      }));
      updateNotifications(payments, 'payment');
    });

    const unsubDiscounts = onSnapshot(qDiscounts, (snapshot) => {
      const discounts = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'discount' as const,
        status: doc.data().status,
        date: doc.data().date,
        discount: doc.data().discountRequested
      }));
      updateNotifications(discounts, 'discount');
    });

    return () => {
      unsubPayments();
      unsubDiscounts();
    };
  }, [user]);

  const updateNotifications = (newItems: Notification[], type: 'payment' | 'discount') => {
    setNotifications(prev => {
      const filtered = prev.filter(n => n.type !== type);
      const combined = [...filtered, ...newItems].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      }).slice(0, 5); // Keep top 5 latest
      
      // Calculate unread based on localStorage
      const lastSeen = localStorage.getItem('lastSeenNotifications');
      const lastSeenTime = lastSeen ? parseInt(lastSeen) : 0;
      const unread = combined.filter(n => {
        const nTime = n.date ? new Date(n.date).getTime() : 0;
        return nTime > lastSeenTime;
      }).length;
      setUnreadCount(unread);
      
      return combined;
    });
  };

  const handleOpenNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (!isNotificationsOpen) {
      setUnreadCount(0);
      localStorage.setItem('lastSeenNotifications', Date.now().toString());
    }
  };

  const isLocked = profile?.status !== 'Activo' || profile?.paymentConfirmed !== 'Confirmado';
  const needsPlan = profile?.mustChoosePlan;

  // Pagos calculations
  const baseAmount = profile?.baseAmount || 0;
  const discount = profile?.discountApplied || 0;
  const totalToPay = baseAmount * (1 - discount / 100);
  const rawPendingBalance = Math.max(0, totalToPay - totalPaid);
  const pendingBalance = Math.round(rawPendingBalance * 10) / 10;

  // Carpetas calculations
  const purchasedNames = profile?.purchasedFolders || [];
  const hasAllFolders = purchasedNames.includes('Todas');
  const userFolders = PRODUCTS.filter(p => 
    p.vendible && (hasAllFolders || purchasedNames.includes(p.nombre))
  );

  return (
    <div className="min-h-screen bg-transparent">
      <nav className="bg-[var(--color-bg-card)] shadow-sm border-b border-[var(--color-border)] relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <img src="/img/Logno.png" alt="NovusPrep" className="h-20 w-auto" onError={(e) => e.currentTarget.style.display = 'none'} />
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:block text-sm text-[var(--color-text-muted)] font-medium">{profile?.displayName}</span>
              
              <div className="relative">
                <button
                  onClick={handleOpenNotifications}
                  className="p-2 text-[var(--color-text-muted)] hover:text-purple-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                  title="Notificaciones"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-[var(--color-bg-card)]">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Notificaciones Recientes</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                          No tienes notificaciones nuevas
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100 dark:divide-slate-700">
                          {notifications.map(notif => (
                            <div key={notif.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                              <div className="flex gap-3">
                                {notif.status === 'Aprobado' ? (
                                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <p className="text-sm text-gray-800 dark:text-gray-200">
                                    {notif.type === 'payment' 
                                      ? `Tu pago de S/.${notif.amount} ha sido ${notif.status.toLowerCase()}.`
                                      : `Tu solicitud de descuento del ${notif.discount}% ha sido ${notif.status.toLowerCase()}.`
                                    }
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {notif.date ? new Date(notif.date).toLocaleDateString() : 'Reciente'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {profile?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-brand-cyan)] rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Ir a Vista de Admin"
                >
                  <Shield className="w-5 h-5" />
                </button>
              )}

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
        {/* Banner para usuarios sin plan */}
        {needsPlan && (
          <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300">¡Bienvenido a NovusPrep!</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Para comenzar a disfrutar de nuestros materiales, por favor elige un plan de suscripción.
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={() => navigate('/catalog')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[var(--color-brand-cyan)] hover:bg-[var(--color-brand-deep)] text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Elegir Plan
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Resumen de Cuenta */}
          <div 
            onClick={() => setIsProfileModalOpen(true)}
            className="card-base p-6 rounded-2xl shadow-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02] border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-500 rounded-xl">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--color-text-main)]">Mi Perfil</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Estado</span>
                <span className={`font-medium ${profile?.status === 'Activo' ? 'text-[var(--color-brand-emerald)]' : 'text-red-600 dark:text-red-400'}`}>
                  {profile?.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Plan</span>
                <span className="font-medium text-[var(--color-text-main)]">
                  {needsPlan ? 'Ninguno' : profile?.paymentType}
                </span>
              </div>
            </div>
          </div>

          {/* Estado de Pagos */}
          <div 
            onClick={() => !needsPlan && setIsPagosModalOpen(true)}
            className={`card-base p-6 rounded-2xl shadow-sm transition-all duration-300 relative overflow-hidden border border-emerald-500/20
              ${needsPlan ? 'cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 cursor-pointer'}`}
          >
            {needsPlan && (
              <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-slate-400" />
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--color-text-main)]">Pagos</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Saldo Pendiente</span>
                <span className={`font-medium ${pendingBalance > 0 ? 'text-[var(--color-brand-orange)]' : 'text-[var(--color-brand-emerald)]'}`}>
                  S/. {pendingBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Carpetas */}
          <div 
            onClick={() => setIsCarpetasModalOpen(true)}
            className="card-base p-6 rounded-2xl shadow-sm hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-[1.02] border border-purple-500/20 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-xl">
                <Folder className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--color-text-main)]">Mis Carpetas</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Compradas</span>
                <span className="font-medium text-[var(--color-text-main)]">{profile?.purchasedFolders?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 mb-4 text-center">
          <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-6">Acciones Rápidas</h2>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            <button 
              onClick={() => navigate('/carpetas')}
              className="card-base shadow-sm flex flex-col items-center justify-center p-6 rounded-2xl border border-[var(--color-border)] hover:border-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:bg-blue-50/50 dark:hover:bg-blue-900/20 w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1rem)] max-w-[280px] transition-all duration-300 group"
            >
              <Folder className="w-8 h-8 text-[var(--color-text-muted)] group-hover:text-blue-500 mb-3 transition-colors" />
              <span className="text-sm font-medium text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]">
                Explorar Carpetas
              </span>
            </button>
            
            {needsPlan && (
              <button 
                onClick={() => navigate('/catalog')}
                className="card-base shadow-sm flex flex-col items-center justify-center p-6 rounded-2xl border border-[var(--color-border)] hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:bg-purple-50/50 dark:hover:bg-purple-900/20 w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1rem)] max-w-[280px] transition-all duration-300 group"
              >
                <ShoppingCart className="w-8 h-8 text-[var(--color-text-muted)] group-hover:text-purple-500 mb-3 transition-colors" />
                <span className="text-sm font-medium text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]">
                  Elegir Plan
                </span>
              </button>
            )}
            
            <button 
              onClick={() => !needsPlan && navigate('/registrar-pago')}
              disabled={needsPlan}
              className={`card-base shadow-sm flex flex-col items-center justify-center p-6 rounded-2xl border border-[var(--color-border)] w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1rem)] max-w-[280px] transition-all duration-300 group
                ${needsPlan ? 'opacity-50 cursor-not-allowed' : 'hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20'}`}
            >
              <CreditCard className={`w-8 h-8 mb-3 transition-colors ${needsPlan ? 'text-gray-400' : 'text-[var(--color-text-muted)] group-hover:text-cyan-500'}`} />
              <span className={`text-sm font-medium ${needsPlan ? 'text-gray-400' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]'}`}>
                Registrar Pago
              </span>
            </button>

            <button 
              onClick={() => setShowDiscountWarning(true)}
              className="card-base shadow-sm flex flex-col items-center justify-center p-6 rounded-2xl border border-[var(--color-border)] hover:border-orange-400 hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:bg-orange-50/50 dark:hover:bg-orange-900/20 w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1rem)] max-w-[280px] transition-all duration-300 group"
            >
              <Tag className="w-8 h-8 text-[var(--color-text-muted)] group-hover:text-orange-500 mb-3 transition-colors" />
              <span className="text-sm font-medium text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]">Solicitar Descuento</span>
            </button>

            <button 
              onClick={() => navigate('/mis-comprobantes')}
              className="card-base shadow-sm flex flex-col items-center justify-center p-6 rounded-2xl border border-[var(--color-border)] hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1rem)] max-w-[280px] transition-all duration-300 group"
            >
              <FileText className="w-8 h-8 mb-3 text-[var(--color-text-muted)] group-hover:text-emerald-500 transition-colors" />
              <span className="text-sm font-medium text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]">
                Mis Comprobantes
              </span>
            </button>
          </div>
        </div>

        {/* Modal de Perfil Completo */}
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-[var(--color-border)]">
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[var(--color-brand-cyan)]" />
                  <h2 className="text-lg font-bold text-[var(--color-text-main)]">Mi Perfil Completo</h2>
                </div>
                <button onClick={() => setIsProfileModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                    <span className="text-[var(--color-text-muted)]">Nombre</span>
                    <span className="font-medium text-[var(--color-text-main)]">{profile?.displayName || 'Sin nombre'}</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                    <span className="text-[var(--color-text-muted)]">Correo</span>
                    <span className="font-medium text-[var(--color-text-main)]">{user?.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                    <span className="text-[var(--color-text-muted)]">Rol</span>
                    <span className="font-medium text-[var(--color-text-main)] capitalize">{profile?.role}</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                    <span className="text-[var(--color-text-muted)]">Plan Actual</span>
                    <span className="font-medium text-[var(--color-text-main)]">{needsPlan ? 'Ninguno' : profile?.paymentType}</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                    <span className="text-[var(--color-text-muted)]">Deuda / Monto Base</span>
                    <span className="font-medium text-[var(--color-text-main)]">S/. {profile?.baseAmount || 0}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-[var(--color-text-muted)]">Descuento Aplicado</span>
                    <span className="font-medium text-[var(--color-brand-emerald)]">{profile?.discountApplied || 0}%</span>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[var(--color-border)] flex flex-col gap-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl text-sm text-center">
                    Si deseas eliminar tu cuenta, por favor comunícate con un administrador.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Modal de Advertencia de Descuento */}
        {showDiscountWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-[var(--color-border)]">
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-orange-50 dark:bg-orange-900/20">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[var(--color-brand-orange)]" />
                  <h2 className="text-lg font-bold text-[var(--color-text-main)]">Aviso Importante</h2>
                </div>
                <button onClick={() => setShowDiscountWarning(false)} className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <p className="text-[var(--color-text-muted)]">
                  Para tener más posibilidades de que se acepte tu solicitud de descuento, se te pedirá adjuntar información personal básica, como recibos de luz, agua, matrículas de colegio o academia que sustenten tu situación.
                </p>
                <p className="text-[var(--color-text-muted)]">
                  Toda la información será tratada con estricta confidencialidad.
                </p>
                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setShowDiscountWarning(false)}
                    className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[var(--color-text-main)] rounded-xl font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      setShowDiscountWarning(false);
                      navigate('/solicitar-descuento');
                    }}
                    className="flex-1 py-2 px-4 bg-[var(--color-brand-orange)] hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Modal de Pagos */}
        {isPagosModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-[var(--color-border)]">
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[var(--color-brand-emerald)]" />
                  <h2 className="text-lg font-bold text-[var(--color-text-main)]">Resumen de Pagos</h2>
                </div>
                <button onClick={() => setIsPagosModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                    <span className="text-[var(--color-text-muted)]">Monto Base</span>
                    <span className="font-medium text-[var(--color-text-main)]">S/. {baseAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                    <span className="text-[var(--color-text-muted)]">Descuento Aplicado</span>
                    <span className="font-medium text-[var(--color-brand-emerald)]">{discount}%</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                    <span className="text-[var(--color-text-muted)]">Total a Pagar</span>
                    <span className="font-bold text-[var(--color-text-main)]">S/. {totalToPay.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                    <span className="text-[var(--color-text-muted)]">Total Pagado</span>
                    <span className="font-bold text-[var(--color-brand-emerald)]">S/. {totalPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-[var(--color-text-muted)]">Saldo Pendiente</span>
                    <span className={`font-bold ${pendingBalance > 0 ? 'text-[var(--color-brand-orange)]' : 'text-[var(--color-text-main)]'}`}>
                      S/. {pendingBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
                {pendingBalance > 0 && (
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setIsPagosModalOpen(false);
                        navigate('/registrar-pago');
                      }}
                      className="w-full py-2 px-4 bg-[var(--color-brand-cyan)] hover:bg-[var(--color-brand-deep)] text-white rounded-xl font-medium transition-colors"
                    >
                      Registrar Pago
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Mis Carpetas */}
        {isCarpetasModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col border border-[var(--color-border)]">
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-purple-50 dark:bg-purple-900/20">
                <div className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-lg font-bold text-[var(--color-text-main)]">Mis Carpetas Adquiridas</h2>
                </div>
                <button onClick={() => setIsCarpetasModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                {userFolders.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userFolders.map((folder) => (
                      <div key={folder.id} className="card-base p-4 rounded-xl border border-[var(--color-border)] flex flex-col">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                            {getFolderIcon(folder.nombre, "w-5 h-5")}
                          </div>
                          <h4 className="font-bold text-[var(--color-text-main)] leading-tight">{folder.nombre}</h4>
                        </div>
                        <p className="text-sm text-[var(--color-text-muted)] mb-4 flex-1 line-clamp-3" title={folder.descripcion}>
                          {folder.descripcion}
                        </p>
                        <a
                          href={folder.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full py-2 px-4 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-700 rounded-xl text-sm font-medium transition-colors shadow-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Abrir en Drive
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Folder className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-[var(--color-text-muted)]">No tienes carpetas adquiridas aún.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}



      </main>

      {/* AI Assistant Floating Widget */}
      <AIAssistantWidget />
    </div>
  );
};
