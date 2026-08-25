'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CatalogoZafir() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 30;

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('productos').select('*');
    if (!error && data) {
      setProductos(data);
    }
    setLoading(false);
  };

  // Resetear a página 1 al filtrar o buscar
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPaginaActual(1);
  };

  const handleCategoria = (cat: string) => {
    setCategoria(cat);
    setPaginaActual(1);
  };

  // Filtrado de productos
  const productosFiltrados = productos.filter((prod) => {
    const coincideNombre = prod.nombre?.toLowerCase().includes(search.toLowerCase()) ||
                          prod.descripcion?.toLowerCase().includes(search.toLowerCase());
    const coincideCategoria = categoria === 'Todos' || prod.categoria?.toLowerCase() === categoria.toLowerCase();
    return coincideNombre && coincideCategoria;
  });

  // Lógica de Paginación (30 por página)
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const indiceInicio = (paginaActual - 1) * productosPorPagina;
  const productosPaginados = productosFiltrados.slice(indiceInicio, indiceInicio + productosPorPagina);

  return (
    <div className="min-h-screen bg-[#0a0d14] text-gray-100 font-sans selection:bg-purple-500 selection:text-white">
      
      {/* NAVBAR SUPERIOR ELEGANTE */}
      <header className="sticky top-0 z-50 bg-[#0e131f]/90 backdrop-blur-md border-b border-gray-800/60 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
{/* Logo Brand Zafir */}
<div className="flex items-center gap-3">
  <div className="bg-black text-white px-4 py-2 rounded-xl font-extrabold tracking-wider border border-gray-800 shadow-md">
    <span className="text-xl">ZAFIR</span>
  </div>
</div>

          {/* Buscador Central */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar fragancia, notas o marcas..."
                value={search}
                onChange={handleSearch}
                className="w-full bg-[#151c2c] border border-gray-800 text-sm text-white placeholder-gray-500 rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:border-purple-500 transition-all shadow-inner"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Botón Admin Discreto */}
          <a
            href="/admin"
            className="flex items-center gap-2 bg-[#182032] hover:bg-purple-950/40 text-gray-300 hover:text-purple-300 border border-gray-700/80 hover:border-purple-500/40 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Panel Admin</span>
          </a>
        </div>

        {/* Buscador Mobile */}
        <div className="px-4 pb-3 md:hidden">
          <input
            type="text"
            placeholder="Buscar fragancia..."
            value={search}
            onChange={handleSearch}
            className="w-full bg-[#151c2c] border border-gray-800 text-sm text-white placeholder-gray-500 rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500"
          />
        </div>
      </header>

      {/* BANNER PRINCIPAL ESTILO HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#111726] to-[#0a0d14] border-b border-gray-800/40 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold rounded-full mb-3 tracking-wider uppercase">
            Colección 2026
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
            Encuentra tu Fragancia Signature
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Catálogo exclusivo de perfumes importados. Precios transparentes en Dólares, Guaraníes y Reales.
          </p>

          {/* FILTROS CATEGORÍAS */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {['Todos', 'Masculino', 'Femenino', 'Unisex', 'Cosméticos', 'Maquillaje'].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoria(cat)}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  categoria === cat
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                    : 'bg-[#151c2c] text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CATÁLOGO DE PRODUCTOS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Contadores y Estado */}
        <div className="flex justify-between items-center mb-6 text-xs text-gray-400">
          <span>Mostrando {productosFiltrados.length > 0 ? indiceInicio + 1 : 0} - {Math.min(indiceInicio + productosPorPagina, productosFiltrados.length)} de {productosFiltrados.length} perfumes</span>
          <span>Página {paginaActual} de {totalPaginas || 1}</span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Cargando catálogo exclusivo...</div>
        ) : productosPaginados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productosPaginados.map((prod) => {
              const img = prod.imagen_url || prod.foto_url || 'https://via.placeholder.com/400?text=Sin+Imagen';
              const whatsappLink = `https://wa.me/595981000000?text=${encodeURIComponent(`Hola Zafir! Me interesa consultar por: ${prod.nombre}`)}`;

              return (
                <div
                  key={prod.id}
                  className="bg-[#121826] border border-gray-800/80 rounded-2xl overflow-hidden hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between shadow-xl group"
                >
                  {/* Foto con Badge */}
                  <div className="relative aspect-square w-full bg-[#0b0e14] overflow-hidden p-4 flex items-center justify-center">
                    {prod.categoria && (
                      <span className="absolute top-3 right-3 bg-[#182032]/90 backdrop-blur-md text-[10px] text-purple-300 font-bold px-2.5 py-1 rounded-full border border-purple-500/20 z-10 uppercase tracking-wider">
                        {prod.categoria}
                      </span>
                    )}
                    <img
                      src={img}
                      alt={prod.nombre}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Imagen+No+Disponible';
                      }}
                    />
                  </div>

                  {/* Detalles */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white mb-1 group-hover:text-purple-300 transition-colors line-clamp-1">
                        {prod.nombre}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                        {prod.descripcion || 'Fragancia importada premium.'}
                      </p>
                    </div>

                    {/* Precios Triple Moneda */}
                    <div className="pt-3 border-t border-gray-800/80">
                      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Precio</div>
                      
                      {/* Principal USD */}
                      <div className="text-xl font-extrabold text-white mb-1">
                        ${Number(prod.precio_usd || 0).toFixed(2)} <span className="text-xs text-gray-400 font-normal">USD</span>
                      </div>

                      {/* Secundarios PYG / BRL */}
                      <div className="flex items-center justify-between text-xs font-semibold mb-4 bg-[#0a0d14]/60 p-2 rounded-lg border border-gray-800/50">
                        <span className="text-emerald-400">Gs. {Number(prod.precio_pyg || 0).toLocaleString('es-PY')}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-blue-400">R$ {Number(prod.precio_brl || 0).toFixed(2)}</span>
                      </div>

                      {/* Botón Pedir */}
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 text-xs"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                        </svg>
                        <span>Pedir por WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            No se encontraron perfumes con esos filtros.
          </div>
        )}

        {/* CONTROLES DE PAGINACIÓN (30 PRODUCTOS MÁXIMO POR PÁGINA) */}
        {totalPaginas > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="px-4 py-2 rounded-xl bg-[#121826] border border-gray-800 text-xs font-semibold text-gray-300 hover:text-white hover:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setPaginaActual(num)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                  paginaActual === num
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-[#121826] border border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
              className="px-4 py-2 rounded-xl bg-[#121826] border border-gray-800 text-xs font-semibold text-gray-300 hover:text-white hover:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Siguiente
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
