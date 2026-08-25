'use client';

import React, { useState, useEffect, useMemo } from 'react';

// INTERFAZ DE PRODUCTO
export interface Product {
  id: number | string;
  name: string;
  brand: string;
  price: number;
  image?: string;
  inStock: boolean;
  description?: string;
}

// COMPONENTE PRODUCT CARD INTEGRADO
function ProductCard({ product, whatsappNumber }: { product: Product; whatsappNumber: string }) {
  const formattedPrice = new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    maximumFractionDigits: 0,
  }).format(product.price);

  const handleBuy = () => {
    const message = encodeURIComponent(
      `Hola Zafir, me interesa obtener información sobre el perfume: ${product.name} (${product.brand})`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="bg-[#0e131f] border border-gray-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-500/50 transition-all duration-300 group hover:shadow-xl hover:shadow-purple-950/20">
      <div>
        <div className="relative w-full h-52 bg-[#0a0d14] rounded-xl overflow-hidden flex items-center justify-center border border-gray-800/50 group-hover:border-purple-900/40 transition-colors">
          {product.image ? (
            <img src={product.image} alt={product.name} className="object-contain h-full w-full p-4 group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="text-gray-600 text-xs font-medium uppercase tracking-widest flex flex-col items-center gap-2">
              <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>{product.brand}</span>
            </div>
          )}
          <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
            product.inStock ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
          }`}>
            {product.inStock ? 'Disponible' : 'Agotado'}
          </span>
        </div>

        <div className="mt-4 space-y-1.5">
          <p className="text-[11px] font-bold tracking-wider text-purple-400 uppercase">{product.brand}</p>
          <h3 className="font-bold text-base text-white group-hover:text-purple-300 transition-colors line-clamp-1">{product.name}</h3>
          {product.description && (
            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{product.description}</p>
          )}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-800/60 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-gray-500 block font-medium">Precio</span>
          <span className="text-lg font-black text-white tracking-tight">{formattedPrice}</span>
        </div>
        <button
          onClick={handleBuy}
          disabled={!product.inStock}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-purple-600/20 active:scale-95"
        >
          Consultar
        </button>
      </div>
    </div>
  );
}

// PÁGINA PRINCIPAL
const API_URL = process.env.NEXT_PUBLIC_SHEETS_API_URL || ''; 
const WHATSAPP_NUMBER = '595900000000'; 
const ITEMS_PER_PAGE = 8;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        if (!API_URL) {
          setProducts([
            { id: 1, name: 'Club de Nuit Intense Man', brand: 'Armaf', price: 350000, image: '', inStock: true, description: 'Amaderada especiada' },
            { id: 2, name: 'Asad', brand: 'Lattafa', price: 280000, image: '', inStock: true, description: 'Cálida, ambarada' },
            { id: 3, name: 'Hawas for Him', brand: 'Rasasi', price: 450000, image: '', inStock: false, description: 'Acuática y fresca' },
            { id: 4, name: '9AM Dive', brand: 'Afnan', price: 310000, image: '', inStock: true, description: 'Menta y cítricos' },
          ]);
          setLoading(false);
          return;
        }

        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al obtener los datos de la tienda');
        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message || 'Error de conexión');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const brands = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));
    return ['ALL', ...list];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = selectedBrand === 'ALL' || product.brand === selectedBrand;
      return matchesSearch && matchesBrand;
    });
  }, [products, searchTerm, selectedBrand]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-gray-100 font-sans selection:bg-purple-500 selection:text-white flex flex-col justify-between">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#0e131f]/90 backdrop-blur-md border-b border-gray-800/60 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-black tracking-widest text-white uppercase flex items-center gap-1">
            ZAFIR<span className="text-purple-500">.</span>
          </h1>

          <div className="w-full max-w-xs sm:max-w-md">
            <input
              type="text"
              placeholder="Buscar perfume o marca..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0a0d14] border border-gray-800 text-sm rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Catálogo de Perfumes</h2>
            <p className="text-gray-400 text-sm mt-1">Fragancias árabes importadas exclusivas</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0e131f] border border-gray-800 text-xs text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">Todas las marcas</option>
              {brands.filter((b) => b !== 'ALL').map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>

            <span className="text-xs text-gray-400 bg-[#0e131f] border border-gray-800 px-3 py-2 rounded-lg">
              {filteredProducts.length} productos
            </span>
          </div>
        </div>

        {/* LOADING SKELETONS */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#0e131f] border border-gray-800 rounded-xl p-4 h-96 animate-pulse flex flex-col justify-between">
                <div className="w-full h-48 bg-gray-800/50 rounded-lg"></div>
                <div className="space-y-3 mt-4">
                  <div className="h-3 bg-gray-800/50 rounded w-1/3"></div>
                  <div className="h-5 bg-gray-800/50 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-800/50 rounded w-full"></div>
                </div>
                <div className="h-10 bg-gray-800/50 rounded-lg mt-4"></div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {error && !loading && (
          <div className="text-center py-16 bg-[#0e131f] rounded-2xl border border-red-900/40 p-6">
            <p className="text-red-400 font-semibold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-gray-800 text-xs font-bold text-white rounded-lg hover:bg-gray-700"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* GRILLA */}
        {!loading && !error && currentProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} whatsappNumber={WHATSAPP_NUMBER} />
            ))}
          </div>
        )}

        {/* SIN RESULTADOS */}
        {!loading && !error && currentProducts.length === 0 && (
          <div className="text-center py-20 bg-[#0e131f] rounded-2xl border border-gray-800/60">
            <p className="text-gray-400 text-sm">No se encontraron perfumes con los filtros seleccionados.</p>
          </div>
        )}

        {/* PAGINACIÓN */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-800 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 text-gray-300 transition-colors"
            >
              Anterior
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                  currentPage === page
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-800 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 text-gray-300 transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-800/60 bg-[#080b11] pt-12 pb-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-gray-800/60">
            <div className="space-y-4">
              <div className="inline-block bg-white text-black font-black text-xl px-4 py-1.5 rounded-xl tracking-wider uppercase">
                ZAFIR
              </div>
              <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
                Tu destino exclusivo para fragancias importadas, cosméticos y maquillaje. Calidad garantizada al mejor precio.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Ubicación y Contacto</h3>
              <ul className="space-y-2.5 text-xs text-gray-300">
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Pedro Juan Caballero, Paraguay</span>
                </li>
                <li>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-gray-300 hover:text-green-400 transition-colors"
                  >
                    <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>Atención vía WhatsApp</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Síguenos</h3>
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#0e131f] border border-gray-800 flex items-center justify-center text-gray-300 hover:text-white hover:border-purple-500 transition-all"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" strokeWidth="2" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2" />
                  </svg>
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#0e131f] border border-gray-800 flex items-center justify-center text-gray-300 hover:text-white hover:border-purple-500 transition-all"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.592 9 4.816V8z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 text-center text-xs text-gray-500">
            <p>© {new Date().getFullYear()} Zafir. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
