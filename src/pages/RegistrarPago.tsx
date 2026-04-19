import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { db, storage } from '../firebase';
import { collection, addDoc, doc, updateDoc, query, where, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Upload, ArrowLeft, CheckCircle, AlertCircle, Moon, Sun } from 'lucide-react';

export const RegistrarPago: React.FC = () => {
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);

  const [generatedPayment, setGeneratedPayment] = useState<any>(null);

  React.useEffect(() => {
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

  const baseAmount = profile?.baseAmount || 0;
  const discount = profile?.discountApplied || 0;
  const totalToPay = baseAmount * (1 - discount / 100);
  const rawPendingBalance = Math.max(0, totalToPay - totalPaid);
  const pendingBalance = Math.round(rawPendingBalance * 10) / 10;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let receiptUrl = '';

      // Si hay archivo, lo subimos primero
      if (file) {
        const fileRef = ref(storage, `receipts/${user.uid}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        receiptUrl = await getDownloadURL(snapshot.ref);
      }

      // Creamos el registro de pago
      const paymentData = {
        userId: user.uid,
        amount: parseFloat(amount),
        date: new Date().toISOString(),
        status: 'Pendiente',
        receiptUrl: receiptUrl || null
      };

      const docRef = await addDoc(collection(db, 'payments'), paymentData);

      // Actualizamos el estado del usuario
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        paymentConfirmed: 'Pendiente'
      });

      setGeneratedPayment({ id: docRef.id, ...paymentData });
      setSuccess(true);

    } catch (err: any) {
      console.error("Error al registrar pago:", err);
      setError(err.message || "Hubo un error al registrar el pago.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success && generatedPayment) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4 print:p-0 print:min-h-0 print:block">
        <div className="card-base p-8 rounded-2xl shadow-xl max-w-md w-full text-center print:shadow-none print:border-none print:max-w-none print:w-full print:p-0">
          <div id="receipt-content" className="p-4 bg-[var(--color-bg-card)] print:p-0">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 text-[var(--color-brand-emerald)] rounded-full flex items-center justify-center mx-auto mb-4 print:bg-green-100 print:text-green-600">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text-main)] mb-2 print:text-black">Pago Registrado</h2>
            <p className="text-[var(--color-text-muted)] mb-6 print:text-gray-600">Tu pago ha sido registrado y está en revisión.</p>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-[var(--color-border)] rounded-xl p-4 mb-6 text-left text-sm print:bg-white print:border-gray-300 print:text-black">
              <h3 className="font-bold text-center mb-3 text-[var(--color-text-main)] border-b border-[var(--color-border)] pb-2 print:text-black print:border-gray-300">Comprobante de Solicitud</h3>
              <div className="space-y-2 text-[var(--color-text-muted)] print:text-black">
                <p><span className="font-semibold text-[var(--color-text-main)] print:text-black">ID Pago:</span> {generatedPayment.id}</p>
                <p><span className="font-semibold text-[var(--color-text-main)] print:text-black">Usuario:</span> {profile?.displayName || user?.email}</p>
                <p><span className="font-semibold text-[var(--color-text-main)] print:text-black">Monto:</span> S/. {generatedPayment.amount.toFixed(2)}</p>
                <p><span className="font-semibold text-[var(--color-text-main)] print:text-black">Fecha:</span> {new Date(generatedPayment.date).toLocaleString()}</p>
              </div>
            </div>
          </div>

            <div className="flex flex-col gap-3 print:hidden mt-6">
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full bg-[var(--color-brand-cyan)] hover:bg-[var(--color-brand-deep)] text-white px-4 py-2 rounded-xl font-medium transition-colors"
              >
                Volver al inicio
              </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8 relative">
      {/* Theme Toggle & Back Button */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Volver al Dashboard"
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

      <div className="max-w-xl mx-auto mt-8">
        <div className="card-base rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden">
          <div className="bg-gradient-to-r from-[var(--color-brand-cyan)] to-[var(--color-brand-emerald)] px-6 py-4">
            <h1 className="text-xl font-bold text-white">Registrar Pago</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">
                Monto a pagar (S/.)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-[var(--color-text-muted)] sm:text-sm">S/.</span>
                </div>
                <input
                  type="number"
                  step="0.10"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-main)] px-4 py-3 focus:ring-2 focus:ring-[var(--color-brand-cyan)] focus:border-transparent outline-none transition-all"
                  placeholder={pendingBalance > 0 ? pendingBalance.toFixed(2) : "0.00"}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">
                Subir Comprobante <span className="text-[var(--color-text-muted)] font-normal">(<span className="text-red-500 font-bold">obligatorio para Yape</span>)</span>
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[var(--color-border)] border-dashed rounded-xl hover:border-[var(--color-brand-cyan)] transition-colors bg-[var(--color-bg-card)]">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-[var(--color-text-muted)]" />
                  <div className="flex text-sm text-[var(--color-text-muted)] justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-[var(--color-bg-card)] rounded-md font-medium text-[var(--color-brand-cyan)] hover:text-[var(--color-brand-deep)] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[var(--color-brand-cyan)]"
                    >
                      <span>Sube un archivo</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*,.pdf" onChange={handleFileChange} />
                    </label>
                    <p className="pl-1">o arrastra y suelta</p>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    PNG, JPG, PDF hasta 5MB
                  </p>
                </div>
              </div>
              {file && (
                <p className="mt-2 text-sm text-[var(--color-brand-emerald)] font-medium flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Archivo seleccionado: {file.name}
                </p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !amount}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[var(--color-brand-orange)] to-[var(--color-brand-gold)] hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-orange)] disabled:opacity-70 disabled:scale-100"
              >
                {isSubmitting ? 'Registrando...' : 'Confirmar Registro de Pago'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
