import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, CheckCircle, XCircle, ExternalLink, Clock, Moon, Sun, Trash2 } from 'lucide-react';

interface Payment {
  id: string;
  userId: string;
  amount: number;
  date: string;
  status: 'Pendiente' | 'Aprobado' | 'Rechazado';
  receiptUrl: string | null;
  userName?: string; // We'll fetch this
}

export const AdminPagos: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionModal, setActionModal] = useState<{type: 'approve' | 'reject' | 'delete', paymentId: string, userId?: string} | null>(null);
  const [actionMessage, setActionMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'payments'), orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const paymentsData: Payment[] = [];
      
      for (const document of snapshot.docs) {
        const data = document.data() as Omit<Payment, 'id'>;
        
        // Fetch user name
        let userName = 'Usuario Desconocido';
        try {
          const userSnap = await getDoc(doc(db, 'users', data.userId));
          if (userSnap.exists()) {
            userName = userSnap.data().displayName || userSnap.data().email;
          }
        } catch (e) {
          console.error("Error fetching user", e);
        }

        paymentsData.push({
          id: document.id,
          ...data,
          userName
        });
      }
      
      setPayments(paymentsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async () => {
    if (!actionModal || actionModal.type !== 'approve' || !actionModal.userId) return;
    
    try {
      await updateDoc(doc(db, 'payments', actionModal.paymentId), {
        status: 'Aprobado',
        processedDate: new Date().toISOString()
      });

      await updateDoc(doc(db, 'users', actionModal.userId), {
        paymentConfirmed: 'Confirmado',
        lastPaymentDate: new Date().toISOString(),
        status: 'Activo'
      });

      setActionMessage({ type: 'success', text: 'Pago aprobado correctamente.' });
    } catch (error) {
      console.error("Error aprobando pago:", error);
      setActionMessage({ type: 'error', text: 'Hubo un error al aprobar el pago.' });
    } finally {
      setActionModal(null);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleReject = async () => {
    if (!actionModal || actionModal.type !== 'reject' || !actionModal.userId) return;
    
    try {
      await updateDoc(doc(db, 'payments', actionModal.paymentId), {
        status: 'Rechazado',
        processedDate: new Date().toISOString()
      });

      await updateDoc(doc(db, 'users', actionModal.userId), {
        paymentConfirmed: 'Pendiente'
      });
      setActionMessage({ type: 'success', text: 'Pago rechazado correctamente.' });
    } catch (error) {
      console.error("Error rechazando pago:", error);
      setActionMessage({ type: 'error', text: 'Hubo un error al rechazar el pago.' });
    } finally {
      setActionModal(null);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleDelete = async () => {
    if (!actionModal || actionModal.type !== 'delete') return;
    
    try {
      await deleteDoc(doc(db, 'payments', actionModal.paymentId));
      setActionMessage({ type: 'success', text: 'Pago eliminado correctamente.' });
    } catch (error) {
      console.error("Error eliminando pago:", error);
      setActionMessage({ type: 'error', text: 'Hubo un error al eliminar el pago.' });
    } finally {
      setActionModal(null);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8 relative">
      {/* Theme Toggle & Back Button */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => navigate('/admin')}
          className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Volver al Panel"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-brand-gold)] rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Cambiar tema"
        >
          {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
        </button>
      </div>

      <div className="max-w-7xl mx-auto mt-8">
        {actionMessage && (
          <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${actionMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {actionMessage.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <p>{actionMessage.text}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Gestión de Pagos</h1>
          </div>
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Buscar por ID, Usuario o Nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)] text-[var(--color-text-main)] focus:ring-2 focus:ring-[var(--color-brand-cyan)] focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="card-base rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--color-border)]">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Comprobante</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--color-bg-card)] divide-y divide-[var(--color-border)]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[var(--color-text-muted)]">Cargando pagos...</td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[var(--color-text-muted)]">No hay pagos registrados.</td>
                  </tr>
                ) : (
                  payments
                    .filter(payment => 
                      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      payment.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (payment.userName && payment.userName.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-muted)]">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[var(--color-text-main)]">{payment.userName}</div>
                        <div className="text-xs text-[var(--color-text-muted)] font-mono">{payment.userId.substring(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-text-main)]">
                        S/. {payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col gap-1">
                          <span className="text-[var(--color-text-main)] font-mono text-xs" title="ID del Sistema">
                            ID: {payment.id}
                          </span>
                          {payment.receiptUrl ? (
                            <a 
                              href={payment.receiptUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[var(--color-brand-cyan)] hover:underline text-xs"
                            >
                              Ver adjunto (Yape) <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-gray-400 italic text-xs">Sin adjunto</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${payment.status === 'Aprobado' ? 'bg-green-100 dark:bg-green-900/20 text-[var(--color-brand-emerald)]' : 
                            payment.status === 'Rechazado' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400' : 
                            'bg-yellow-100 dark:bg-yellow-900/20 text-[var(--color-brand-orange)]'}`}
                        >
                          {payment.status === 'Pendiente' && <Clock className="w-3 h-3" />}
                          {payment.status === 'Aprobado' && <CheckCircle className="w-3 h-3" />}
                          {payment.status === 'Rechazado' && <XCircle className="w-3 h-3" />}
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2 items-center">
                          {payment.status === 'Pendiente' && (
                            <>
                              <button
                                onClick={() => setActionModal({ type: 'approve', paymentId: payment.id, userId: payment.userId })}
                                className="text-[var(--color-brand-emerald)] hover:text-green-900 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 px-3 py-1 rounded-lg transition-colors"
                              >
                                Aprobar
                              </button>
                              <button
                                onClick={() => setActionModal({ type: 'reject', paymentId: payment.id, userId: payment.userId })}
                                className="text-red-600 hover:text-red-900 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 px-3 py-1 rounded-lg transition-colors"
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setActionModal({ type: 'delete', paymentId: payment.id })}
                            className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-2"
                            title="Eliminar registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-[var(--color-border)] p-6">
            <h2 className="text-xl font-bold text-[var(--color-text-main)] mb-4">
              {actionModal.type === 'approve' ? 'Aprobar Pago' : actionModal.type === 'reject' ? 'Rechazar Pago' : 'Eliminar Pago'}
            </h2>
            <p className="text-[var(--color-text-muted)] mb-6">
              {actionModal.type === 'approve' ? '¿Estás seguro de aprobar este pago? El usuario tendrá acceso a sus planes.' : 
               actionModal.type === 'reject' ? '¿Estás seguro de rechazar este pago? El usuario deberá registrar un nuevo pago.' : 
               '¿Estás seguro de eliminar este registro de pago? Esta acción no se puede deshacer.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setActionModal(null)}
                className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-800 text-[var(--color-text-main)] rounded-xl font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={actionModal.type === 'approve' ? handleApprove : actionModal.type === 'reject' ? handleReject : handleDelete}
                className={`flex-1 py-2 px-4 text-white rounded-xl font-medium transition-colors ${
                  actionModal.type === 'approve' ? 'bg-[var(--color-brand-emerald)] hover:bg-green-600' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
