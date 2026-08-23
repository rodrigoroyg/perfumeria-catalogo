'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Catalogo() {
  const [productos, setProductos] = useState<any[]>([]);
  const [categoria, setCategoria] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('defecto');

  useEffect(() => {
    cargarProductos();
  }, []);

  async function cargarProductos() {
    const { data } = await supabase.from('productos').select('*').eq('activo', true);
    if (data) setProductos(data);
  }

  const filtrados = productos
    .filter(p => categoria === 'Todas' || p.categoria === categoria)
    .filter(p => p.nombre?.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      if (orden === 'menor') return a.precio_usd - b.precio_usd;
      if (orden === 'mayor') return b.precio_usd - a.precio_usd;
      return 0;
    });

  return (
    <div className="max-w-6xl mx-auto p-4 font-sans">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Catálogo de Perfumes</h1>
      </header>

      {/* Buscador y Controles */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar producto..."
          className="p-2 border rounded flex-1"
          onChange={e => setBusqueda(e.target.value)}
        />
        <select className="p-2 border rounded" onChange={e => setCategoria(e.target.value)}>
          <option value="Todas">Todas las categorías</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
          <option value="Unisex">Unisex</option>
          <option value="Maquillaje">Maquillaje</option>
          <option value="Cosméticos">Cosméticos</option>
        </select>
        <select className="p-2 border rounded" onChange={e => setOrden(e.target.value)}>
          <option value="defecto">Ordenar por defecto</option>
          <option value="menor">Menor a mayor precio</option>
          <option value="mayor">Mayor a menor precio</option>
        </select>
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtrados.map(p => (
          <div key={p.id} className="border rounded-lg p-4 shadow-sm bg-white">
            <img src={p.foto1_url || 'https://via.placeholder.com/300'} alt={p.nombre} className="w-full h-48 object-cover rounded mb-4" />
            <span className="text-xs font-semibold uppercase text-purple-600">{p.categoria}</span>
            <h2 className="text-lg font-bold">{p.nombre}</h2>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{p.descripcion}</p>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xl font-extrabold text-green-700">${p.precio_usd} USD</p>
              <p className="text-sm text-gray-600">₲ {Number(p.precio_pyg).toLocaleString()} PYG</p>
              <p className="text-sm text-gray-600">R$ {p.precio_brl} BRL</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
