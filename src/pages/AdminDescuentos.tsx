import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, CheckCircle, XCircle, ExternalLink, Clock, Moon, Sun, Eye, X, Trash2 } from 'lucide-react';

interface DiscountRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  answers: any;
  score: number;
  suggestedDiscount: number;
  proofUrls: string[];
  status: 'Pendiente' | 'Aprobado' | 'Rechazado';
  createdAt: any;
}

export const AdminDescuentos: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [requests, setRequests] = useState<DiscountRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<DiscountRequest | null>(null);
  const [finalDiscount, setFinalDiscount] = useState<number>(0);
  const [actionModal, setActionModal] = useState<{type: 'approve' | 'reject' | 'delete', reqId?: string} | null>(null);
  const [actionMessage, setActionMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'discountRequests'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData: DiscountRequest[] = [];
      snapshot.forEach((document) => {
        requestsData.push({ id: document.id, ...document.data() } as DiscountRequest);
      });
      setRequests(requestsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openModal = (req: DiscountRequest) => {
    setSelectedRequest(req);
    setFinalDiscount(req.suggestedDiscount);
  };

  const closeModal = () => {
    setSelectedRequest(null);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    try {
      await updateDoc(doc(db, 'discountRequests', selectedRequest.id), {
        status: 'Aprobado',
        approvedDiscount: finalDiscount,
        processedDate: new Date().toISOString()
      });

      await updateDoc(doc(db, 'users', selectedRequest.userId), {
        discountApplied: finalDiscount
      });

      setActionMessage({ type: 'success', text: 'Descuento aprobado correctamente.' });
      closeModal();
    } catch (error) {
      console.error("Error aprobando descuento:", error);
      setActionMessage({ type: 'error', text: 'Hubo un error al aprobar el descuento.' });
    } finally {
      setActionModal(null);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    try {
      await updateDoc(doc(db, 'discountRequests', selectedRequest.id), {
        status: 'Rechazado',
        processedDate: new Date().toISOString()
      });
      setActionMessage({ type: 'success', text: 'Descuento rechazado correctamente.' });
      closeModal();
    } catch (error) {
      console.error("Error rechazando descuento:", error);
      setActionMessage({ type: 'error', text: 'Hubo un error al rechazar el descuento.' });
    } finally {
      setActionModal(null);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleDelete = async () => {
    if (!actionModal || actionModal.type !== 'delete' || !actionModal.reqId) return;
    
    try {
      await deleteDoc(doc(db, 'discountRequests', actionModal.reqId));
      setActionMessage({ type: 'success', text: 'Solicitud eliminada correctamente.' });
    } catch (error) {
      console.error("Error eliminando solicitud:", error);
      setActionMessage({ type: 'error', text: 'Hubo un error al eliminar la solicitud.' });
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

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Gestión de Descuentos</h1>
          </div>
        </div>

        <div className="card-base rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--color-border)]">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Puntaje</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Dcto. Sugerido</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--color-bg-card)] divide-y divide-[var(--color-border)]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[var(--color-text-muted)]">Cargando solicitudes...</td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[var(--color-text-muted)]">No hay solicitudes registradas.</td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-muted)]">
                        {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString() : 'Reciente'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[var(--color-text-main)]">{req.userName || 'Usuario'}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">{req.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-text-main)]">
                        {req.score} pts
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-brand-cyan)]">
                        {req.suggestedDiscount}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${req.status === 'Aprobado' ? 'bg-green-100 dark:bg-green-900/20 text-[var(--color-brand-emerald)]' : 
                            req.status === 'Rechazado' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400' : 
                            'bg-yellow-100 dark:bg-yellow-900/20 text-[var(--color-brand-orange)]'}`}
                        >
                          {req.status === 'Pendiente' && <Clock className="w-3 h-3" />}
                          {req.status === 'Aprobado' && <CheckCircle className="w-3 h-3" />}
                          {req.status === 'Rechazado' && <XCircle className="w-3 h-3" />}
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2 items-center">
                          <button
                            onClick={() => openModal(req)}
                            className="inline-flex items-center gap-1 text-[var(--color-brand-cyan)] hover:text-[var(--color-brand-deep)] bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" /> Ver Detalles
                          </button>
                          <button
                            onClick={() => setActionModal({ type: 'delete', reqId: req.id })}
                            className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-1"
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

      {/* Modal de Detalles */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-[var(--color-border)]">
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
              <h2 className="text-xl font-bold text-[var(--color-text-main)]">Detalles de Solicitud</h2>
              <button onClick={closeModal} className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Info Usuario */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-[var(--color-border)]">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Usuario</p>
                  <p className="font-medium text-[var(--color-text-main)]">{selectedRequest.userName}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">{selectedRequest.userEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Métricas</p>
                  <p className="font-medium text-[var(--color-text-main)]">Puntaje: {selectedRequest.score}</p>
                  <p className="text-sm text-[var(--color-brand-cyan)] font-medium">Sugerido: {selectedRequest.suggestedDiscount}%</p>
                </div>
              </div>

              {/* Motivo */}
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-main)] mb-2 uppercase tracking-wider">Motivo de la Solicitud</h3>
                <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
                  <p className="text-[var(--color-text-main)] whitespace-pre-wrap">{selectedRequest.answers?.p13 || 'No especificado'}</p>
                </div>
              </div>

              {/* Respuestas Clave (Resumen) */}
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-main)] mb-2 uppercase tracking-wider">Datos Socioeconómicos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 border border-[var(--color-border)] rounded-lg">
                    <span className="text-[var(--color-text-muted)] block text-xs">Personas en hogar:</span>
                    <span className="font-medium text-[var(--color-text-main)]">
                      {selectedRequest.answers?.p1 === '0' ? '2 o menos' : 
                       selectedRequest.answers?.p1 === '1' ? '3 a 4' : 
                       selectedRequest.answers?.p1 === '2' ? '5 a 6' : '7 o más'}
                    </span>
                  </div>
                  <div className="p-3 border border-[var(--color-border)] rounded-lg">
                    <span className="text-[var(--color-text-muted)] block text-xs">Ingreso mensual:</span>
                    <span className="font-medium text-[var(--color-text-main)]">{selectedRequest.answers?.p7}</span>
                  </div>
                  <div className="p-3 border border-[var(--color-border)] rounded-lg">
                    <span className="text-[var(--color-text-muted)] block text-xs">Tipo de vivienda:</span>
                    <span className="font-medium text-[var(--color-text-main)] capitalize">{selectedRequest.answers?.p2?.replace('_', ' ')}</span>
                  </div>
                  <div className="p-3 border border-[var(--color-border)] rounded-lg">
                    <span className="text-[var(--color-text-muted)] block text-xs">Colegio:</span>
                    <span className="font-medium text-[var(--color-text-main)] capitalize">{selectedRequest.answers?.p9?.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Archivos */}
              {selectedRequest.proofUrls && selectedRequest.proofUrls.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-main)] mb-2 uppercase tracking-wider">Documentos Adjuntos</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedRequest.proofUrls.map((url, idx) => {
                      const isDataUrl = url.startsWith('data:');
                      return (
                        <a 
                          key={idx}
                          href={url}
                          target={isDataUrl ? undefined : "_blank"}
                          rel="noopener noreferrer"
                          download={isDataUrl ? `documento_${idx + 1}` : undefined}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-[var(--color-text-main)] rounded-lg text-sm font-medium transition-colors border border-[var(--color-border)]"
                        >
                          <ExternalLink className="w-4 h-4 text-[var(--color-brand-cyan)]" />
                          {isDataUrl ? `Descargar Documento ${idx + 1}` : `Ver Documento ${idx + 1}`}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Acciones */}
            {selectedRequest.status === 'Pendiente' && (
              <div className="p-6 border-t border-[var(--color-border)] bg-gray-50 dark:bg-gray-800/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <label className="text-sm font-medium text-[var(--color-text-main)] whitespace-nowrap">Otorgar Descuento:</label>
                  <select 
                    value={finalDiscount}
                    onChange={(e) => setFinalDiscount(Number(e.target.value))}
                    className="w-full sm:w-32 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-main)] font-bold text-[var(--color-brand-cyan)] focus:ring-2 focus:ring-[var(--color-brand-cyan)]"
                  >
                    <option value={0}>0%</option>
                    <option value={25}>25%</option>
                    <option value={50}>50%</option>
                    <option value={75}>75%</option>
                    <option value={100}>100%</option>
                  </select>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setActionModal({ type: 'reject' })}
                    className="flex-1 sm:flex-none px-6 py-2.5 text-red-600 hover:text-red-900 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl font-medium transition-colors"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => setActionModal({ type: 'approve' })}
                    className="flex-1 sm:flex-none px-6 py-2.5 text-white bg-[var(--color-brand-emerald)] hover:bg-green-600 rounded-xl font-medium transition-colors shadow-sm"
                  >
                    Aprobar Descuento
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-[var(--color-border)] p-6">
            <h2 className="text-xl font-bold text-[var(--color-text-main)] mb-4">
              {actionModal.type === 'approve' ? 'Aprobar Descuento' : actionModal.type === 'reject' ? 'Rechazar Descuento' : 'Eliminar Solicitud'}
            </h2>
            <p className="text-[var(--color-text-muted)] mb-6">
              {actionModal.type === 'approve' ? `¿Estás seguro de aprobar un descuento del ${finalDiscount}% para este usuario?` : 
               actionModal.type === 'reject' ? '¿Estás seguro de rechazar esta solicitud de descuento?' : 
               '¿Estás seguro de eliminar esta solicitud? Esta acción no se puede deshacer.'}
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
