import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { PLANS, PRODUCTS, Plan } from '../data/products';
import { Check, ArrowRight, Package, Moon, Sun, ArrowLeft, AlertTriangle, X } from 'lucide-react';

export const Catalog: React.FC = () => {
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<Plan['id'] | null>(
    profile?.paymentType !== 'Ninguno' ? profile?.paymentType as Plan['id'] : null
  );
  const [selectedFolders, setSelectedFolders] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessNotice, setShowSuccessNotice] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const vendibleFolders = useMemo(() => PRODUCTS.filter(p => p.vendible && p.id !== 1), []);

  React.useEffect(() => {
    if (profile && !profile.mustChoosePlan) {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  const handleFolderToggle = (folderId: number) => {
    setSelectedFolders(prev => {
      if (prev.includes(folderId)) {
        return prev.filter(id => id !== folderId);
      }
      if (prev.length >= 4) {
        alert("Solo puedes seleccionar hasta 4 carpetas en el plan personalizado.");
        return prev;
      }
      return [...prev, folderId];
    });
  };

  const calculateTotal = () => {
    if (!selectedPlan) return 0;
    if (selectedPlan === 'Personalizado') {
      return selectedFolders.reduce((total, id) => {
        const folder = PRODUCTS.find(p => p.id === id);
        return total + (folder?.precio || 0);
      }, 0);
    }
    const plan = PLANS.find(p => p.id === selectedPlan);
    return plan?.price || 0;
  };

  const handleConfirmClick = () => {
    if (!selectedPlan) return;
    if (selectedPlan === 'Personalizado' && selectedFolders.length === 0) {
      alert("Debes seleccionar al menos 1 carpeta para el plan personalizado.");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleSaveSelection = async () => {
    setShowConfirmModal(false);
    if (!user || !selectedPlan) return;
    if (selectedPlan === 'Personalizado' && selectedFolders.length === 0) {
      alert("Debes seleccionar al menos 1 carpeta para el plan personalizado.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      
      await updateDoc(userRef, {
        paymentType: selectedPlan,
        baseAmount: calculateTotal(),
        purchasedFolders: selectedPlan === 'Personalizado' ? selectedFolders.map(id => PRODUCTS.find(p => p.id === id)?.nombre) : ['Todas'],
        mustChoosePlan: false,
        paymentConfirmed: 'Pendiente'
      });
      
      setShowSuccessNotice(true);
    } catch (error) {
      console.error("Error al guardar la selección:", error);
      alert("Hubo un error al guardar tu selección. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Theme Toggle & Back Button */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-gray-100 dark:bg-gray-800 rounded-xl transition-colors"
          title="Volver al Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al Dashboard
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-brand-gold)] rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Cambiar tema"
        >
          {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
        </button>
      </div>

      <div className="max-w-7xl mx-auto pb-20">
        <div className="text-center mb-12">
          <img src="/img/Logno.png" alt="NovusPrep" className="h-16 w-auto mx-auto mb-6" onError={(e) => e.currentTarget.style.display = 'none'} />
          <h1 className="text-3xl font-bold text-[var(--color-text-main)] sm:text-4xl">
            Elige tu Plan de Estudio
          </h1>
          <p className="mt-4 text-lg text-[var(--color-text-muted)]">
            Selecciona la suscripción que mejor se adapte a tus necesidades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          {PLANS.map((plan) => (
            <div 
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative card-base rounded-2xl shadow-sm border-2 cursor-pointer transition-all duration-200 flex flex-col
                ${selectedPlan === plan.id 
                  ? 'border-[var(--color-brand-cyan)] ring-4 ring-[var(--color-brand-cyan)]/10 scale-105 z-10' 
                  : 'hover:border-[var(--color-brand-cyan)] hover:shadow-md'
                }`}
            >
              <div className="p-6 flex-1">
                <h3 className="text-xl font-semibold text-[var(--color-text-main)] mb-2">
                  {plan.name}
                  {plan.id === 'General' && (
                    <span className="ml-2 inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-full align-middle">
                      Ahorra S/. 15.00
                    </span>
                  )}
                  {plan.id === 'Mensual' && (
                    <span className="ml-2 inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-full align-middle">
                      Ahorra S/. 1.00 por mes
                    </span>
                  )}
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-[var(--color-text-main)]">
                    {plan.id === 'Personalizado' ? 'Variable' : `S/. ${plan.price.toFixed(2)}`}
                  </span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
                      <Check className="w-4 h-4 text-[var(--color-brand-emerald)] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 pt-0 mt-auto">
                <div className={`w-full py-2.5 px-4 rounded-xl text-center text-sm font-medium transition-colors
                  ${selectedPlan === plan.id 
                    ? 'bg-gradient-to-r from-[var(--color-brand-cyan)] to-[var(--color-brand-emerald)] text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-[var(--color-text-muted)]'
                  }`}
                >
                  {selectedPlan === plan.id ? 'Seleccionado' : 'Elegir plan'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sección de Carpetas para Plan Personalizado */}
        {selectedPlan === 'Personalizado' && (
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-[var(--color-text-main)] mb-2 flex items-center gap-2">
              <Package className="w-6 h-6 text-[var(--color-brand-orange)]" />
              Selecciona tus Carpetas (Máx. 4)
            </h2>
            <p className="text-[var(--color-text-muted)] mb-6">Elige las carpetas específicas que deseas comprar. El precio total se calculará automáticamente.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendibleFolders.map((folder) => {
                const isSelected = selectedFolders.includes(folder.id);
                return (
                  <div 
                    key={folder.id} 
                    onClick={() => handleFolderToggle(folder.id)}
                    className={`card-base p-5 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-[var(--color-brand-cyan)] bg-blue-50/50 dark:bg-blue-900/10' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-[var(--color-text-main)] pr-4">{folder.nombre}</h4>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-[var(--color-brand-cyan)] border-[var(--color-brand-cyan)]' : 'border-gray-300 dark:border-gray-600'}`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1 mb-3 line-clamp-2" title={folder.descripcion}>{folder.descripcion}</p>
                    <span className="inline-block bg-orange-50 dark:bg-orange-900/20 text-[var(--color-brand-orange)] font-medium px-3 py-1 rounded-lg text-sm">
                      S/. {folder.precio.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Barra de acción flotante */}
        {selectedPlan && (
          <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-card)] border-t border-[var(--color-border)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 z-40">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Total a pagar:</p>
                <p className="font-bold text-2xl text-[var(--color-text-main)]">S/. {calculateTotal().toFixed(2)}</p>
              </div>
              <button
                onClick={handleConfirmClick}
                disabled={isSubmitting || (selectedPlan === 'Personalizado' && selectedFolders.length === 0)}
                className="flex items-center gap-2 bg-gradient-to-r from-[var(--color-brand-orange)] to-[var(--color-brand-gold)] hover:scale-[1.02] text-white px-8 py-3 rounded-xl font-medium transition-all disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Procesando...' : 'Confirmar y Continuar'}
                {!isSubmitting && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {/* Modal de Confirmación */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-[var(--color-border)]">
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-orange-50 dark:bg-orange-900/20">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[var(--color-brand-orange)]" />
                  <h2 className="text-lg font-bold text-[var(--color-text-main)]">Confirmar Selección</h2>
                </div>
                <button onClick={() => setShowConfirmModal(false)} className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <p className="text-[var(--color-text-muted)]">
                  Estás a punto de seleccionar el plan <span className="font-bold text-[var(--color-text-main)]">{selectedPlan}</span>.
                </p>
                <p className="text-[var(--color-brand-orange)] font-medium">
                  Ten en cuenta que una vez confirmado, no podrás cambiar de plan más adelante.
                </p>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-[var(--color-text-main)] rounded-xl font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveSelection}
                    className="flex-1 py-2 px-4 bg-[var(--color-brand-cyan)] hover:bg-[var(--color-brand-deep)] text-white rounded-xl font-medium transition-colors"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Éxito */}
        {showSuccessNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-[var(--color-border)]">
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-[var(--color-brand-emerald)]" />
                  <h2 className="text-lg font-bold text-[var(--color-text-main)]">Plan Actualizado</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <p className="text-[var(--color-text-muted)]">
                  Tu plan ha sido actualizado correctamente. Si no ves los cambios reflejados en tu panel principal, por favor cierra sesión y vuelve a ingresar.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setShowSuccessNotice(false);
                      navigate('/dashboard');
                    }}
                    className="w-full py-2 px-4 bg-[var(--color-brand-cyan)] hover:bg-[var(--color-brand-deep)] text-white rounded-xl font-medium transition-colors"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
