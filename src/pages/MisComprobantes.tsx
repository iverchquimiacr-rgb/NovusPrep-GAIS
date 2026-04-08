import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, ExternalLink, Clock, CheckCircle, XCircle, FileText, Eye, X } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  receiptUrl: string;
  status: 'Pendiente' | 'Aprobado' | 'Rechazado';
  createdAt: any;
  date?: string;
  planName?: string;
}

export const MisComprobantes: React.FC = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  useEffect(() => {
    if (!profile?.uid) return;

    const q = query(
      collection(db, 'payments'),
      where('userId', '==', profile.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const paymentsData: Payment[] = [];
      snapshot.forEach((doc) => {
        paymentsData.push({ id: doc.id, ...doc.data() } as Payment);
      });
      setPayments(paymentsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.uid]);

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-[var(--color-bg-card)] rounded-full shadow-sm transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Mis Comprobantes</h1>
        </div>

        <div className="card-base rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden">
          <div className="p-6 border-b border-[var(--color-border)] flex items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-[var(--color-brand-cyan)] rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text-main)]">Historial de Pagos</h2>
              <p className="text-sm text-[var(--color-text-muted)]">Aquí puedes ver el estado de todos los pagos que has registrado.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--color-border)]">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Concepto</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--color-bg-card)] divide-y divide-[var(--color-border)]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-text-muted)]">Cargando comprobantes...</td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                      No tienes pagos registrados aún.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-muted)]">
                        {payment.date ? new Date(payment.date).toLocaleDateString() : 'Reciente'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-text-main)]">
                        {payment.planName || 'Suscripción'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-text-main)]">
                        S/. {payment.amount}
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
                        <div className="flex justify-end gap-3">
                          {payment.receiptUrl && (
                            <a
                              href={payment.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[var(--color-text-muted)] hover:text-[var(--color-brand-cyan)] transition-colors"
                              title="Ver archivo subido"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => setSelectedReceipt(payment)}
                            className="inline-flex items-center gap-1 text-[var(--color-brand-cyan)] hover:text-[var(--color-brand-deep)] transition-colors"
                            title="Ver recibo generado"
                          >
                            <Eye className="w-4 h-4" /> Recibo
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

      {/* Modal del Recibo Generado */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col border border-[var(--color-border)]">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-lg font-bold text-[var(--color-text-main)]">Recibo de Pago</h2>
              <button onClick={() => setSelectedReceipt(null)} className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-sm" id="receipt-content">
              <div className="text-center mb-6 border-b border-[var(--color-border)] pb-4">
                <img src="/img/Logno.png" alt="NovusPrep" className="h-8 mx-auto mb-2" onError={(e) => e.currentTarget.style.display = 'none'} />
                <p className="text-xs text-[var(--color-text-muted)] mt-2">Comprobante de Transacción</p>
              </div>

              <div className="space-y-2 border-y border-dashed border-[var(--color-border)] py-4">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">ID Transacción:</span>
                  <span className="font-mono text-[var(--color-text-main)] text-xs">{selectedReceipt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Fecha:</span>
                  <span className="font-medium text-[var(--color-text-main)]">
                    {selectedReceipt.date ? new Date(selectedReceipt.date).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Estado:</span>
                  <span className="font-medium text-[var(--color-text-main)]">{selectedReceipt.status}</span>
                </div>
              </div>

              <div className="space-y-2 py-2">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Usuario:</span>
                  <span className="font-medium text-[var(--color-text-main)]">{profile?.displayName || user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">ID Usuario:</span>
                  <span className="font-mono text-[var(--color-text-main)] text-xs">{profile?.uid?.substring(0, 8)}...</span>
                </div>
                <div className="flex justify-between text-base font-bold mt-4 pt-4 border-t border-[var(--color-border)]">
                  <span className="text-[var(--color-text-main)]">Total Pagado:</span>
                  <span className="text-[var(--color-brand-emerald)]">S/. {selectedReceipt.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[var(--color-border)] bg-gray-50 dark:bg-gray-800/30">
              <p className="text-sm text-[var(--color-text-muted)] italic text-center mb-3">
                Si deseas guardar este comprobante, por favor toma una captura de pantalla.
              </p>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-full bg-[var(--color-brand-cyan)] hover:bg-[var(--color-brand-deep)] text-white px-4 py-2 rounded-xl font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
