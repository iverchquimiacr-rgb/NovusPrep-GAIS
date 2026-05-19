import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithGoogle, loginWithEmail, registerWithEmail } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, BookOpen, Eye, EyeOff, Info } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  React.useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, profile, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Login failed", error);
      setError('Error al iniciar sesión con Google. Verifica los permisos o intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, ingresa correo y contraseña.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      if (isRegistering) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (error: any) {
      console.error("Email auth failed", error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado. Intenta iniciar sesión.');
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        setError('Correo o contraseña incorrectos.');
      } else if (error.code === 'auth/weak-password') {
        setError('La contraseña es muy débil. Debe tener al menos 6 caracteres.');
      } else if (error.code === 'auth/operation-not-allowed') {
        setError('El registro con correo no está habilitado actualmente. Por favor, utiliza Google.');
      } else {
        setError('Error al procesar la solicitud. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-center border border-gray-100 dark:border-gray-700">
        <img 
          src="/img/Logno.png" 
          alt="NovusPrep" 
          className="mx-auto h-24 w-auto mb-4"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {isRegistering ? 'Crea una cuenta nueva' : 'Inicia sesión para acceder a tu cuenta'}
        </p>

        {error && (
          <div className="mb-4 space-y-2">
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-800">
              {error}
            </div>
            <div className="flex items-start gap-2 text-xs text-left bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-3 rounded-xl border border-blue-100 dark:border-blue-800">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Si tienes problemas para {isRegistering ? 'registrarte' : 'iniciar sesión'} manualmente, ¡intenta directamente con Google más abajo! Es seguro y más rápido. Si sigues teniendo inconvenientes, por favor contáctanos a novusprep@gmail.com.</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-brand-cyan)] focus:border-transparent outline-none transition-all"
                placeholder="tu@correo.com"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-brand-cyan)] focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[var(--color-brand-cyan)] focus:outline-none transition-colors"
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          {isRegistering && (
            <div className="flex items-start gap-2 text-sm text-left mt-2">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="text-gray-600 dark:text-gray-400">
                He leído y acepto los <Link to="/legal" target="_blank" className="text-[var(--color-brand-cyan)] hover:underline">Términos y Condiciones</Link> y la <Link to="/legal" target="_blank" className="text-[var(--color-brand-cyan)] hover:underline">Política de Privacidad</Link>.
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (isRegistering && !termsAccepted)}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-brand-cyan)] hover:bg-[var(--color-brand-deep)] text-white font-medium py-3 px-4 rounded-xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : (isRegistering ? 'Registrarse' : 'Iniciar Sesión')}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">O continúa con</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 font-medium py-3 px-4 rounded-xl transition-all shadow-sm disabled:opacity-70 mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
          <button 
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }} 
            className="ml-1 text-[var(--color-brand-cyan)] hover:underline font-medium"
          >
            {isRegistering ? 'Inicia sesión' : 'Regístrate'}
          </button>
        </p>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 w-full flex flex-col items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">¿Quieres ver qué temas tenemos?</p>
          <button
            onClick={() => navigate('/temario')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-brand-cyan)] bg-blue-50 dark:bg-blue-900/20 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Explorar Temario
          </button>
        </div>
      </div>
    </div>
  );
};
