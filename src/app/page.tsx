'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio_usd: number;
  precio_pyg: number;
  precio_brl: number;
  foto1_url: string;
}

export default function CatalogoPublico() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSel, setCategoriaSel] = useState('Todos');
  const [moneda, setMoneda] = useState<'PYG' | 'USD' | 'BRL'>('PYG');

  useEffect(() => {
    obtenerProductos();
  }, []);

  async function obtenerProductos() {
    setCargando(true);
    try {
      const { data, error } = await supabase.from('productos').select('*');
      if (!error && data) {
        setProductos(data);
      }
    } catch (err) {
      console.error('Error al cargar productos:', err);
    } finally {
      setCargando(false);
    }
  }

  // Filtrado dinámico
  const productosFiltrados = productos.filter(p => {
    const coincideNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCat = categoriaSel === 'Todos' || p.categoria === categoriaSel;
    return coincideNombre && coincideCat;
  });

  const TELEFONO_WHATSAPP = '595981000000'; // Reemplaza por tu número de WhatsApp

  function enviarWhatsApp(producto: Producto) {
    const mensaje = encodeURIComponent(`¡Hola Perfumería Zafir! Me interesa el producto: *${producto.nombre}*. ¿Tienen stock disponible?`);
    window.open(`https://wa.me/${TELEFONO_WHATSAPP}?text=${mensaje}`, '_blank');
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 pb-12">
      {/* Navbar / Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-purple-600 to-indigo-500 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-purple-500/30">
              Z
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">Perfumería Zafir</h1>
              <p className="text-[11px] text-purple-400 font-semibold tracking-wider uppercase">Catálogo Exclusivo</p>
            </div>
          </div>

          {/* Selector de Monedas */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
            <span className="text-xs font-bold text-slate-400 pl-2">Moneda:</span>
            {(['PYG', 'USD', 'BRL'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMoneda(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  moneda === m 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m === 'PYG' ? '₲ PYG' : m === 'USD' ? '$ USD' : 'R$ BRL'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 pt-10 pb-6 text-center space-y-4">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300">
          Encuentra tu Fragancia Ideal
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Explora nuestra selección de perfumería fina importada al mejor precio en Dólares, Guaraníes y Reales.
        </p>

        {/* Buscador & Categorías */}
        <div className="max-w-2xl mx-auto space-y-4 pt-4">
          <input
            type="text"
            placeholder="🔍 Buscar perfume o marca..."
            className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xl"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />

          <div className="flex flex-wrap justify-center gap-2">
            {['Todos', 'Masculino', 'Femenino', 'Unisex', 'Cosméticos'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoriaSel(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  categoriaSel === cat
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/50'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de Productos */}
      <main className="max-w-7xl mx-auto px-4 pt-6">
        {cargando ? (
          <div className="text-center py-20 text-slate-500 font-medium">Cargando fragancias...</div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-20 text-slate-500 font-medium">No se encontraron productos disponibles.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productosFiltrados.map(p => (
              <div key={p.id} className="bg-slate-900 rounded-3xl border border-slate-800/80 overflow-hidden shadow-lg flex flex-col hover:border-purple-500/40 transition-all group">
                {/* Imagen */}
                <div className="h-64 overflow-hidden bg-slate-950 relative">
                  <img
                    src={p.foto1_url || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80'}
                    alt={p.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-purple-300 border border-purple-500/20">
                    {p.categoria}
                  </span>
                </div>

                {/* Detalle */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-100 group-hover:text-purple-300 transition-colors">{p.nombre}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-normal">{p.descripcion || 'Fragancia exclusiva importada.'}</p>
                  </div>

                  {/* Precio & Botón WhatsApp */}
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Precio</span>
                      <span className="text-lg font-black text-emerald-400">
                        {moneda === 'PYG' && `₲ ${p.precio_pyg.toLocaleString()}`}
                        {moneda === 'USD' && `$ ${p.precio_usd.toFixed(2)}`}
                        {moneda === 'BRL' && `R$ ${p.precio_brl.toFixed(2)}`}
                      </span>
                    </div>

                    <button
                      onClick={() => enviarWhatsApp(p)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-2xl transition-all font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-900/20"
                      title="Consultar por WhatsApp"
                    >
                      💬 Pedir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
