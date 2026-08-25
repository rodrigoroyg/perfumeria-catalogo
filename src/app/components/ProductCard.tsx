'use client';

import React from 'react';

export interface Product {
  id: string | number;
  name: string;
  brand: string;
  price: number;
  image: string;
  inStock: boolean;
  description?: string;
}

interface ProductCardProps {
  product: Product;
  whatsappNumber?: string;
}

export default function ProductCard({ product, whatsappNumber = '595900000000' }: ProductCardProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleBuy = () => {
    const message = encodeURIComponent(`Hola Zafir, me interesa obtener información sobre el perfume ${product.name} (${product.brand}).`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="bg-[#0e131f] border border-gray-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between hover:border-purple-500/50 transition-all duration-300">
      <div className="relative w-full h-64 bg-white/5 p-4 flex items-center justify-center overflow-hidden">
        {!product.inStock && (
          <span className="absolute top-3 right-3 z-10 bg-red-600/90 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
            Agotado
          </span>
        )}
        <img
          src={product.image || '/placeholder.png'}
          alt={product.name}
          className={`object-contain h-full w-full transition-transform duration-300 hover:scale-105 ${
            !product.inStock ? 'opacity-50 grayscale' : ''
          }`}
        />
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-xs text-purple-400 font-semibold uppercase tracking-widest">{product.brand}</span>
          <h3 className="text-lg font-bold text-gray-100 mt-1 line-clamp-1">{product.name}</h3>
          {product.description && (
            <p className="text-gray-400 text-xs mt-2 line-clamp-2">{product.description}</p>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-gray-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 block">Precio</span>
            <span className="text-lg font-extrabold text-white">{formatPrice(product.price)}</span>
          </div>

          <button
            onClick={handleBuy}
            disabled={!product.inStock}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
              product.inStock
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 active:scale-95'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {product.inStock ? 'Consultar' : 'Sin Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}
