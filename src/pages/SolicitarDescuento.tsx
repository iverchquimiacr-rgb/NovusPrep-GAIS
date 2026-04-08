import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Send, Tag, AlertCircle, Upload, File as FileIcon, X } from 'lucide-react';

export const SolicitarDescuento: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    p1: '0',
    p2: 'propio_pagado',
    p3: [] as string[],
    p4: '',
    p5: 'empresa',
    p6: '3+',
    p7: '3500+',
    p8: [] as string[],
    p9: 'privado_alto',
    p10: 'alto',
    p11: 'no',
    p12: 'propia',
    p13: '',
    p14: 'redes'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => {
        const list = prev[name as keyof typeof prev] as string[];
        if (checked) {
          return { ...prev, [name]: [...list, value] };
        } else {
          return { ...prev, [name]: list.filter(item => item !== value) };
        }
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => {
        if (file.size > 500 * 1024) {
          alert(`El archivo ${file.name} es demasiado grande. El límite es 500KB.`);
          return false;
        }
        return true;
      });
      if (files.length + validFiles.length > 2) {
        alert('Solo puedes subir un máximo de 2 archivos.');
        setFiles(prev => [...prev, ...validFiles].slice(0, 2));
      } else {
        setFiles(prev => [...prev, ...validFiles]);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const calculateScore = () => {
    let score = 0;
    
    score += parseInt(formData.p1);
    
    const p2Scores: Record<string, number> = { propio_pagado: 0, propio_cuotas: 1, alquilada: 2, prestada: 3, cuarto: 4 };
    score += p2Scores[formData.p2] || 0;
    
    const allServices = ['agua', 'desague', 'luz', 'internet', 'streaming'];
    const missingServices = allServices.filter(s => !formData.p3.includes(s));
    score += missingServices.length * 2;
    
    const p5Scores: Record<string, number> = { empresa: 0, planilla: 1, independiente: 2, agricola: 3, pension: 3, sin_ingresos: 5 };
    score += p5Scores[formData.p5] || 0;
    
    const p6Scores: Record<string, number> = { '3+': 0, '2': 1, '1': 2, '0': 4 };
    score += p6Scores[formData.p6] || 0;
    
    const p7Scores: Record<string, number> = { '3500+': 0, '1800-3500': 1, '930-1800': 2, '500-930': 4, '0-500': 6 };
    score += p7Scores[formData.p7] || 0;
    
    score += formData.p8.length * 2;
    
    const p9Scores: Record<string, number> = { privado_alto: 0, privado_medio: 1, privado_bajo: 2, publico: 4 };
    score += p9Scores[formData.p9] || 0;
    
    const p10Scores: Record<string, number> = { alto: 0, medio: 1, bajo: 2, no: 4 };
    score += p10Scores[formData.p10] || 0;
    
    const p11Scores: Record<string, number> = { no: 0, ocasional: 1, propios: 2, hogar: 3 };
    score += p11Scores[formData.p11] || 0;
    
    const p12Scores: Record<string, number> = { propia: 0, compartida: 1, no: 3 };
    score += p12Scores[formData.p12] || 0;
    
    return score;
  };

  const getDiscountPercentage = (score: number) => {
    if (score >= 35) return 100;
    if (score >= 25) return 75;
    if (score >= 15) return 50;
    if (score >= 8) return 25;
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.p13.trim()) {
      setError('Por favor, explica por qué necesitas el descuento.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fileUrls: string[] = [];
      
      // Convert files to Base64
      for (const file of files) {
        const base64 = await fileToBase64(file);
        fileUrls.push(base64);
      }

      const score = calculateScore();
      const suggestedDiscount = getDiscountPercentage(score);

      await addDoc(collection(db, 'discountRequests'), {
        userId: profile?.uid,
        userEmail: profile?.email,
        userName: profile?.displayName,
        answers: formData,
        score: score,
        suggestedDiscount: suggestedDiscount,
        proofUrls: fileUrls,
        status: 'Pendiente',
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
    } catch (err) {
      console.error('Error al enviar solicitud:', err);
      setError('Hubo un error al enviar tu solicitud. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-[var(--color-bg-card)] rounded-full shadow-sm transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Solicitud de descuento socioeconómico</h1>
        </div>

        <div className="card-base rounded-2xl shadow-sm border border-[var(--color-border)] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-[var(--color-brand-orange)] rounded-xl">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Completa este formulario. La información será evaluada por el equipo para determinar el porcentaje de descuento aplicable.</p>
            </div>
          </div>

          {success ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
              <h3 className="text-lg font-medium text-green-800 dark:text-green-400 mb-2">¡Solicitud enviada con éxito!</h3>
              <p className="text-green-600 dark:text-green-500 mb-6">
                Hemos recibido tu solicitud y los documentos adjuntos. Nuestro equipo la revisará y te daremos una respuesta pronto.
                <br /><br />
                <strong>En un plazo de 48 horas se enviará una respuesta. Una vez aceptada o rechazada la solicitud, ya se puede elegir un plan.</strong>
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
              >
                Volver al Inicio
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* BLOQUE 1 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[var(--color-text-main)] border-b border-[var(--color-border)] pb-2">🏠 Tu hogar</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">¿Cuántas personas viven en tu hogar?</label>
                    <select name="p1" value={formData.p1} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-main)]">
                      <option value="0">2 o menos</option>
                      <option value="1">3 a 4</option>
                      <option value="2">5 a 6</option>
                      <option value="3">7 o más</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Tipo de vivienda</label>
                    <select name="p2" value={formData.p2} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-main)]">
                      <option value="propio_pagado">Propia pagada</option>
                      <option value="propio_cuotas">Propia en cuotas</option>
                      <option value="alquilada">Alquilada</option>
                      <option value="prestada">Prestada</option>
                      <option value="cuarto">Cuarto alquilado</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">Servicios disponibles</label>
                    <div className="flex flex-wrap gap-4">
                      {['agua', 'desague', 'luz', 'internet', 'streaming'].map(servicio => (
                        <label key={servicio} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                          <input type="checkbox" name="p3" value={servicio} checked={formData.p3.includes(servicio)} onChange={handleInputChange} className="rounded border-gray-300 text-[var(--color-brand-cyan)] focus:ring-[var(--color-brand-cyan)]" />
                          <span className="capitalize">{servicio === 'desague' ? 'Desagüe' : servicio}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Distrito</label>
                    <input type="text" name="p4" value={formData.p4} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-main)]" required />
                  </div>
                </div>
              </div>

              {/* BLOQUE 2 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[var(--color-text-main)] border-b border-[var(--color-border)] pb-2">💰 Situación económica</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Fuente de ingresos principal</label>
                    <select name="p5" value={formData.p5} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-main)]">
                      <option value="empresa">Empresa propia</option>
                      <option value="planilla">Trabajo en planilla</option>
                      <option value="independiente">Independiente</option>
                      <option value="agricola">Agrícola</option>
                      <option value="pension">Pensión</option>
                      <option value="sin_ingresos">Sin ingresos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Personas que aportan</label>
                    <select name="p6" value={formData.p6} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-main)]">
                      <option value="3+">3 o más</option>
                      <option value="2">2</option>
                      <option value="1">1</option>
                      <option value="0">Ninguna</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Ingreso mensual en casa</label>
                    <select name="p7" value={formData.p7} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-main)]">
                      <option value="3500+">+3500</option>
                      <option value="1800-3500">1800-3500</option>
                      <option value="930-1800">930-1800</option>
                      <option value="500-930">500-930</option>
                      <option value="0-500">Menos de 500</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">Problemas recientes</label>
                    <div className="flex flex-wrap gap-4">
                      {['vivienda', 'servicios', 'alimentacion', 'estudios'].map(problema => (
                        <label key={problema} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                          <input type="checkbox" name="p8" value={problema} checked={formData.p8.includes(problema)} onChange={handleInputChange} className="rounded border-gray-300 text-[var(--color-brand-cyan)] focus:ring-[var(--color-brand-cyan)]" />
                          <span className="capitalize">{problema === 'alimentacion' ? 'Alimentación' : problema}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* BLOQUE 3 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[var(--color-text-main)] border-b border-[var(--color-border)] pb-2">🎓 Situación del estudiante</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Colegio</label>
                    <select name="p9" value={formData.p9} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-main)]">
                      <option value="privado_alto">Privado alto: Más de 900</option>
                      <option value="privado_medio">Privado medio: S/.401 - S/.900</option>
                      <option value="privado_bajo">Privado bajo: S/.50 - S/400</option>
                      <option value="publico">Público</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Academia - Pensión que pagas</label>
                    <select name="p10" value={formData.p10} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-main)]">
                      <option value="alto">Alta: Más de 400</option>
                      <option value="medio">Media: S/.251 - S/.400</option>
                      <option value="bajo">Económica: S/.100 - S/.250</option>
                      <option value="no">No puedo pagar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Trabajo</label>
                    <select name="p11" value={formData.p11} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-main)]">
                      <option value="no">No trabajo</option>
                      <option value="ocasional">Ocasional</option>
                      <option value="propios">Para mí</option>
                      <option value="hogar">Aporto al hogar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Acceso a computadora</label>
                    <select name="p12" value={formData.p12} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-main)]">
                      <option value="propia">Propia</option>
                      <option value="compartida">Compartida</option>
                      <option value="no">No tengo</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BLOQUE 4 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[var(--color-text-main)] border-b border-[var(--color-border)] pb-2">📝 Tu solicitud</h3>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">¿Por qué necesitas el descuento?</label>
                  <textarea name="p13" value={formData.p13} onChange={handleInputChange} rows={4} className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-main)] resize-none" required></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">¿Cómo conociste NovusPrep?</label>
                  <select name="p14" value={formData.p14} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-main)]">
                    <option value="redes">Redes</option>
                    <option value="amigo">Amigo</option>
                    <option value="grupo">Grupo</option>
                    <option value="google">Google</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              {/* Pruebas / Archivos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[var(--color-text-main)] border-b border-[var(--color-border)] pb-2">📎 Documentos de sustento (Opcional)</h3>
                <p className="text-sm text-[var(--color-text-muted)]">Puedes adjuntar recibos de luz, agua, matrículas de colegio o academia que sustenten tu solicitud en cuanto a vivienda y tipo de colegio y academia.</p>
                
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer border-[var(--color-border)] hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Haz clic para subir</span> o arrastra y suelta</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-4">
                        PDF, PNG, JPG (Max. 500KB por archivo, máx. 2 archivos).<br/>
                        <span className="text-[var(--color-brand-orange)] font-medium">Nota: Si tienes más de 2 documentos, te sugerimos tomar una sola foto o captura que agrupe varios de ellos.</span>
                      </p>
                    </div>
                    <input type="file" className="hidden" multiple onChange={handleFileChange} accept=".pdf,image/*" />
                  </label>
                </div>

                {files.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-[var(--color-border)]">
                        <div className="flex items-center gap-3">
                          <FileIcon className="w-5 h-5 text-[var(--color-brand-cyan)]" />
                          <span className="text-sm text-[var(--color-text-main)] truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                        </div>
                        <button type="button" onClick={() => removeFile(index)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="pt-4">
                <p className="text-sm text-[var(--color-text-muted)] text-center mb-6">
                  Al enviar declaras que la información es verídica.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[var(--color-brand-cyan)] hover:bg-[var(--color-brand-deep)] text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    'Enviando...'
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar Solicitud
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
