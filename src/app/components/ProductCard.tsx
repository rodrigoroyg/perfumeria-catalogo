import React from 'react';

interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  precio_usd: number;
  precio_pyg: number;
  precio_brl: number;
  stock?: number | string;
  imagen_url?: string;
  foto_url?: string;
  foto1_url?: string;
}

export const ProductCard = ({ producto }: { producto: Producto }) => {
  const imageUrl = producto.imagen_url || producto.foto1_url || producto.foto_url || 'https://via.placeholder.com/400x400?text=Sin+Imagen';

  // Convierte el valor a número por si Supabase lo retorna como string o null
  const cantidadStock = Number(producto.stock ?? 0);
  const tieneStock = !isNaN(cantidadStock) && cantidadStock > 0;

  const formatPYG = (val: number) => new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(val);
  const formatUSD = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const mensajeWhatsapp = encodeURIComponent(`Hola Zafir! Me interesa consultar por: ${producto.nombre}`);

  return (
    <div className="bg-[#121824] border border-gray-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between shadow-xl">
      <div className="relative aspect-square w-full bg-gray-900 overflow-hidden p-4 flex items-center justify-center">
        {producto.categoria && (
          <span className="absolute top-3 right-3 bg-[#1e2638]/80 backdrop-blur-md text-[10px] text-purple-300 font-bold px-2.5 py-1 rounded-full z-10 border border-purple-500/20 uppercase tracking-wider">
            {producto.categoria}
          </span>
        )}
        <img
          src={imageUrl}
          alt={producto.nombre}
          className={`w-full h-full object-contain object-center transition-all duration-500 ${
            !tieneStock ? 'opacity-30 grayscale' : 'hover:scale-105'
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Error+Imagen';
          }}
        />
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white line-clamp-1 mb-1 hover:text-purple-300 transition-colors">{producto.nombre}</h3>

          {/* Badge de Stock */}
          <div className="mb-2">
            {tieneStock ? (
              <span className="inline-block text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-0.5 rounded-full font-medium">
                Stock: {cantidadStock} un.
              </span>
            ) : (
              <span className="inline-block text-[11px] text-red-400 bg-red-950/60 border border-red-800/50 px-2.5 py-0.5 rounded-full font-medium">
                Agotado
              </span>
            )}
          </div>

          <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">{producto.descripcion || 'Fragancia exclusiva importada.'}</p>
        </div>

        <div className="pt-3 border-t border-gray-800/80">
          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Precio</div>
          
          <div className="text-xl font-extrabold text-white mb-1">
            {formatUSD(producto.precio_usd || 0)} <span className="text-xs text-gray-400 font-normal">USD</span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold mb-4 bg-[#0a0d14]/60 p-2 rounded-lg border border-gray-800/50">
            <span className="text-emerald-400">{formatPYG(producto.precio_pyg || 0)}</span>
            <span className="text-gray-600">•</span>
            <span className="text-blue-400">{formatBRL(producto.precio_brl || 0)}</span>
          </div>

          {tieneStock ? (
            <a
              href={`https://wa.me/595985492969?text=${mensajeWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 text-xs"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
              </svg>
              <span>Pedir por WhatsApp</span>
            </a>
          ) : (
Aquí tienes los códigos corregidos y optimizados. El principal problema que tenían era que la página principal (`page`) no estaba utilizando realmente el componente `ProductCard`, sino que duplicaba todo el código visual dentro del bucle `.map()`. 

Además, he unificado el número de WhatsApp, corregido los tipos de TypeScript (`any`) y mejorado la extracción de imágenes.

### 1. Componente `ProductCard.tsx`
Primero, definimos y exportamos la interfaz `Producto` para que ambos archivos la compartan. También unifiqué el número de WhatsApp y la lógica de las imágenes.

```tsx
import React from 'react';

// Exportamos la interfaz para usarla también en la página principal
export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  precio_usd: number;
  precio_pyg: number;
  precio_brl: number;
  stock?: number | string;
  imagen_url?: string;
  foto_url?: string;
  foto1_url?: string;
}

export const ProductCard = ({ producto }: { producto: Producto }) => {
  // Unificamos las posibles propiedades de imagen de Supabase
  const imageUrl = producto.foto1_url || producto.imagen_url || producto.foto_url || '[https://via.placeholder.com/400x400?text=Sin+Imagen](https://via.placeholder.com/400x400?text=Sin+Imagen)';

  // Manejo seguro del stock
  const cantidadStock = Number(producto.stock ?? 0);
  const tieneStock = !isNaN(cantidadStock) && cantidadStock > 0;

  // Formateadores de moneda
  const formatPYG = (val: number) => new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(val);
  const formatUSD = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Número de WhatsApp real unificado
  const numeroWhatsapp = "595985492969";
  const mensajeWhatsapp = encodeURIComponent(`Hola Zafir! Me interesa el perfume: ${producto.nombre}`);

  return (
    <div className="bg-[#121824] border border-gray-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between shadow-xl group">
      <div className="relative aspect-square w-full bg-white overflow-hidden flex items-center justify-center p-4">
        {producto.categoria && (
          <span className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-[10px] text-white font-bold px-2.5 py-1 rounded-full border border-gray-700 z-10 uppercase tracking-wider">
            {producto.categoria}
          </span>
        )}
        <img
          src={imageUrl}
          alt={producto.nombre}
          className={`w-full h-full object-contain transition-transform duration-500 ${
            !tieneStock ? 'opacity-40 grayscale' : 'group-hover:scale-105'
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '[https://via.placeholder.com/400x400?text=Error+Imagen](https://via.placeholder.com/400x400?text=Error+Imagen)';
          }}
        />
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white mb-1 group-hover:text-purple-300 transition-colors line-clamp-1">
            {producto.nombre}
          </h3>

          <div className="mb-2">
            {tieneStock ? (
              <span className="inline-block text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-0.5 rounded-full font-medium">
                Stock: {cantidadStock} un.
              </span>
            ) : (
              <span className="inline-block text-[11px] text-red-400 bg-red-950/60 border border-red-800/50 px-2.5 py-0.5 rounded-full font-medium">
                Agotado
              </span>
            )}
          </div>

          <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
            {producto.descripcion || 'Fragancia exclusiva importada.'}
          </p>
        </div>

        <div className="pt-3 border-t border-gray-800/80">
          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Precio</div>
          
          <div className="text-xl font-extrabold text-white mb-1">
            {formatUSD(producto.precio_usd || 0)} <span className="text-xs text-gray-400 font-normal">USD</span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold mb-4 bg-[#0a0d14]/60 p-2 rounded-lg border border-gray-800/50">
            <span className="text-emerald-400">{formatPYG(producto.precio_pyg || 0)}</span>
            <span className="text-gray-600">•</span>
            <span className="text-blue-400">{formatBRL(producto.precio_brl || 0)}</span>
          </div>

          {tieneStock ? (
            <a
              href={`[https://wa.me/$](https://wa.me/$){numeroWhatsapp}?text=${mensajeWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 text-xs"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
              </svg>
              <span>Pedir por WhatsApp</span>
            </a>
          ) : (
            <button
              disabled
              className="w-full bg-gray-800 text-gray-500 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center text-xs cursor-not-allowed border border-gray-700/50"
            >
              Agotado
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
