import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, Moon, Sun, Trash2, User as UserIcon, Eye, X } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  paymentConfirmed: string;
  paymentType?: string;
  baseAmount?: number;
  discountApplied?: number;
  assignedFolders?: number;
}

export const AdminUsuarios: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: UserData[] = [];
      snapshot.forEach((document) => {
        usersData.push({ id: document.id, ...document.data() } as UserData);
      });
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'users', userToDelete));
      setActionMessage({ type: 'success', text: 'Usuario eliminado correctamente.' });
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      setActionMessage({ type: 'error', text: 'Hubo un error al eliminar el usuario.' });
    } finally {
      setUserToDelete(null);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8 relative">
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
            <p>{actionMessage.text}</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Gestión de Usuarios</h1>
          </div>
        </div>

        <div className="card-base rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--color-border)]">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Pago</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--color-bg-card)] divide-y divide-[var(--color-border)]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-text-muted)]">Cargando usuarios...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-text-muted)]">No hay usuarios registrados.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-[var(--color-brand-cyan)] rounded-full">
                            <UserIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[var(--color-text-main)]">{u.displayName || 'Sin nombre'}</div>
                            <div className="text-xs text-[var(--color-text-muted)]">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-muted)] capitalize">
                        {u.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${u.status === 'Activo' ? 'bg-green-100 dark:bg-green-900/20 text-[var(--color-brand-emerald)]' : 
                            'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'}`}
                        >
                          {u.status || 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${u.paymentConfirmed === 'Confirmado' ? 'bg-green-100 dark:bg-green-900/20 text-[var(--color-brand-emerald)]' : 
                            'bg-yellow-100 dark:bg-yellow-900/20 text-[var(--color-brand-orange)]'}`}
                        >
                          {u.paymentConfirmed || 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2 items-center">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="inline-flex items-center gap-1 text-[var(--color-brand-cyan)] hover:text-[var(--color-brand-deep)] bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" /> Ver Perfil
                          </button>
                          <button
                            onClick={() => setUserToDelete(u.id)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-1"
                            title="Eliminar usuario (datos)"
                          >
                            <Trash2 className="w-5 h-5" />
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

      {/* Modal de Perfil de Usuario */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-[var(--color-border)]">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-[var(--color-brand-cyan)]" />
                <h2 className="text-lg font-bold text-[var(--color-text-main)]">Perfil de Usuario</h2>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                  <span className="text-[var(--color-text-muted)]">ID</span>
                  <span className="font-mono text-[var(--color-text-main)] text-xs">{selectedUser.id}</span>
                </div>
                <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                  <span className="text-[var(--color-text-muted)]">Nombre</span>
                  <span className="font-medium text-[var(--color-text-main)]">{selectedUser.displayName || 'Sin nombre'}</span>
                </div>
                <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                  <span className="text-[var(--color-text-muted)]">Correo</span>
                  <span className="font-medium text-[var(--color-text-main)]">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                  <span className="text-[var(--color-text-muted)]">Rol</span>
                  <span className="font-medium text-[var(--color-text-main)] capitalize">{selectedUser.role}</span>
                </div>
                <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                  <span className="text-[var(--color-text-muted)]">Plan Actual</span>
                  <span className="font-medium text-[var(--color-text-main)]">{selectedUser.paymentType || 'Ninguno'}</span>
                </div>
                <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                  <span className="text-[var(--color-text-muted)]">Deuda / Monto Base</span>
                  <span className="font-medium text-[var(--color-text-main)]">S/. {selectedUser.baseAmount || 0}</span>
                </div>
                <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                  <span className="text-[var(--color-text-muted)]">Descuento</span>
                  <span className="font-medium text-[var(--color-brand-emerald)]">{selectedUser.discountApplied || 0}%</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-[var(--color-text-muted)]">Carpetas Asignadas</span>
                  <span className="font-medium text-[var(--color-text-main)]">{selectedUser.assignedFolders || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar Usuario */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-[var(--color-border)] p-6">
            <h2 className="text-xl font-bold text-[var(--color-text-main)] mb-4">Eliminar Usuario</h2>
            <p className="text-[var(--color-text-muted)] mb-6">
              ¿Estás seguro de eliminar los datos de este usuario? Esta acción no se puede deshacer y es solo para limpieza de pruebas.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-800 text-[var(--color-text-main)] rounded-xl font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
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
