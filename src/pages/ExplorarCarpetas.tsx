import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { PRODUCTS } from '../data/products';
import { ArrowLeft, Moon, Sun, ExternalLink, Folder } from 'lucide-react';
import { getFolderIcon } from '../utils/iconMap';

export const ExplorarCarpetas: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Sort products: put "Resumen" (vendible: false) at the end
  const sortedProducts = [...PRODUCTS].sort((a, b) => {
    if (a.vendible === b.vendible) return 0;
    return a.vendible ? -1 : 1;
  });

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => navigate('/dashboard')}
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

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 text-[var(--color-brand-cyan)] rounded-full mb-6">
            <Folder className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-text-main)] sm:text-4xl">
            Catálogo de Carpetas
          </h1>
          <p className="mt-4 text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
            Explora todo el material disponible. Recuerda que el acceso final se gestiona a través de Google Drive con tu correo electrónico registrado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {sortedProducts.map((product) => (
            <div 
              key={product.id}
              className="card-base p-6 rounded-2xl border border-[var(--color-border)] shadow-sm hover:shadow-md hover:border-[var(--color-brand-cyan)] transition-all flex flex-col"
            >
              <div className="flex justify-between items-start mb-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[var(--color-brand-cyan)]/10 text-[var(--color-brand-cyan)] shrink-0">
                    {getFolderIcon(product.nombre, "w-6 h-6")}
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-text-main)] leading-tight">{product.nombre}</h3>
                </div>
                {product.vendible ? (
                  <span className="inline-block bg-blue-50 dark:bg-blue-900/20 text-[var(--color-brand-cyan)] font-bold px-3 py-1.5 rounded-lg text-sm whitespace-nowrap">
                    S/. {product.precio.toFixed(2)}
                  </span>
                ) : (
                  <span className="inline-block bg-green-50 dark:bg-green-900/20 text-[var(--color-brand-emerald)] font-bold px-3 py-1.5 rounded-lg text-sm whitespace-nowrap">
                    GRATIS
                  </span>
                )}
              </div>
              
              <p className="text-[var(--color-text-muted)] text-sm mb-6 flex-1">
                {product.descripcion}
              </p>

              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-700 rounded-xl font-medium transition-colors shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir en Drive
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
