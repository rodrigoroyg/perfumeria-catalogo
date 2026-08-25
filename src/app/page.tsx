'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ProductCard } from './ProductCard'; // <-- AJUSTA ESTA RUTA SI ES NECESARIO

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

  const cambiarPagina = (nuevaPagina: number) => {
    setPaginaActual(nuevaPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {/* AQUÍ ESTABA EL ERROR: AHORA LLAMAMOS AL COMPONENTE PRODUCTCARD */}
            {productosPaginados.map((prod) => (
              <ProductCard key={prod.id} producto={prod} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            No se encontraron perfumes con esos filtros.
          </div>
        )}

        {/* CONTROLES DE PAGINACIÓN */}
        {totalPaginas > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => cambiarPagina(Math.max(paginaActual - 1, 1))}
              disabled={paginaActual === 1}
              className="px-4 py-2 rounded-xl bg-[#121826] border border-gray-800 text-xs font-semibold text-gray-300 hover:text-white hover:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => cambiarPagina(num)}
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
              onClick={() => cambiarPagina(Math.min(paginaActual + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
              className="px-4 py-2 rounded-xl bg-[#121826] border border-gray-800 text-xs font-semibold text-gray-300 hover:text-white hover:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Siguiente
            </button>
          </div>
        )}
      </main>

      {/* FOOTER ELEGANTE / PIE DE PÁGINA */}
      <footer className="bg-[#080b10] border-t border-gray-800/80 text-gray-400 py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-3">
            <div className="inline-block bg-white text-black px-3 py-1 rounded-lg font-black tracking-widest text-lg">
              ZAFIR
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Tu destino exclusivo para fragancias importadas, cosméticos y maquillaje. Calidad garantizada al mejor precio.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Ubicación y Contacto</h4>
            <div className="flex items-start gap-2 text-xs">
              <svg className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Pedro Juan Caballero, Paraguay</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Atención vía WhatsApp</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Síguenos</h4>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-[#121826] border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-purple-500/50 transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-[#121826] border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-purple-500/50 transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-gray-800/50 mt-10 pt-6 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} Zafir. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
