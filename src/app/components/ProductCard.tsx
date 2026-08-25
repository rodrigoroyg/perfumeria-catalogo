import React from 'react';

interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  precio_usd: number;
  precio_pyg: number;
  precio_brl: number;
  imagen_url?: string;
  foto_url?: string;
}

export const ProductCard = ({ producto }: { producto: Producto }) => {
  // Soporte para leer la imagen desde imagen_url o foto_url
  const imageUrl = producto.imagen_url || producto.foto_url || 'https://via.placeholder.com/400x400?text=Sin+Imagen';

  // Formateadores de moneda
  const formatPYG = (val: number) => new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(val);
  const formatUSD = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const mensajeWhatsapp = encodeURIComponent(`Hola Zafir! Me interesa el perfume: ${producto.nombre}`);

  return (
    <div className="bg-[#121824] border border-gray-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between shadow-xl">
      <div className="relative aspect-square w-full bg-gray-900 overflow-hidden">
        {producto.categoria && (
          <span className="absolute top-3 right-3 bg-[#1e2638]/80 backdrop-blur-md text-xs text-purple-300 font-medium px-3 py-1 rounded-full z-10 border border-purple-500/20">
            {producto.categoria}
          </span>
        )}
        <img
          src={imageUrl}
          alt={producto.nombre}
          className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Error+Imagen';
          }}
        />
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{producto.nombre}</h3>
          <p className="text-xs text-gray-400 line-clamp-2 mb-4">{producto.descripcion || 'Fragancia exclusiva importada.'}</p>
        </div>

        <div className="pt-3 border-t border-gray-800/80">
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Precio</div>
          
          {/* Precio Principal USD */}
          <div className="text-xl font-extrabold text-white mb-1">
            {formatUSD(producto.precio_usd || 0)}
          </div>

          {/* Precios Secundarios PYG y BRL */}
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-4">
            <span>{formatPYG(producto.precio_pyg || 0)}</span>
            <span className="text-gray-500">•</span>
            <span className="text-blue-400">{formatBRL(producto.precio_brl || 0)}</span>
          </div>

          <a
            href={`https://wa.me/595981000000?text=${mensajeWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
          >
            <span>Pedir por WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
