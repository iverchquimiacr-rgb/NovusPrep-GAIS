import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, Moon, Sun, Save, Brain, CheckCircle, AlertCircle } from 'lucide-react';
import { DEFAULT_AI_KNOWLEDGE } from '../data/defaultAiKnowledge';

export const AdminIA: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        const docRef = doc(db, 'settings', 'ai_knowledge');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().content) {
          setContent(docSnap.data().content);
        } else {
          // Default template
          setContent(DEFAULT_AI_KNOWLEDGE);
        }
      } catch (error) {
        console.error("Error fetching AI knowledge:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchKnowledge();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'ai_knowledge'), { content });
      setMessage({ type: 'success', text: 'Base de conocimientos guardada correctamente.' });
    } catch (error) {
      console.error("Error saving AI knowledge:", error);
      setMessage({ type: 'error', text: 'Error al guardar la base de conocimientos.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => navigate('/admin')}
          className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Volver"
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

      <div className="max-w-4xl mx-auto mt-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-main)]">Cerebro de la IA</h1>
            <p className="text-[var(--color-text-muted)]">Actualiza la base de conocimientos del asistente virtual</p>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p>{message.text}</p>
          </div>
        )}

        <div className="card-base p-6 rounded-2xl shadow-sm border border-[var(--color-border)]">
          <div className="mb-4">
            <p className="text-sm text-[var(--color-text-muted)] mb-2">
              Pega aquí el contenido de tu documento Word. Recuerda usar etiquetas como <strong>[Práctica]</strong>, <strong>[Teoría]</strong> o <strong>[Material de Profesor]</strong> para que la IA pueda identificar el tipo de contenido y dar mejores recomendaciones.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-[500px] p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)] text-[var(--color-text-main)] focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-y font-mono text-sm leading-relaxed"
                placeholder="Pega aquí tu catálogo de carpetas y temas..."
              />
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
