'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPanel() {
  const [autenticado, setAutenticado] = useState(false);
  const [usuarioInput, setUsuarioInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [tab, setTab] = useState<'ingreso' | 'divisas'>('ingreso');
  const [monedas, setMonedas] = useState({ BRL: 5.0, PYG: 7500 });
  
  const [formProducto, setFormProducto] = useState({
    nombre: '', descripcion: '', categoria: 'Masculino',
    costo_usd: '', margen_pct: '30', proveedor: '', num_factura: '',
    foto1_url: '', foto2_url: '', foto3_url: ''
  });

  // CREDENCIALES DE ACCESO
  const USER_ADMIN = 'AdminZaf';
  const PASS_ADMIN = '270413zafir';

  function validarAcceso(e: React.FormEvent) {
    e.preventDefault();
    if (usuarioInput === USER_ADMIN && passwordInput === PASS_ADMIN) {
      setAutenticado(true);
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  }

  useEffect(() => {
    if (autenticado) cargarDivisas();
  }, [autenticado]);

  async function cargarDivisas() {
    const { data } = await supabase.from('divisas').select('*');
    if (data) {
      const pyg = data.find(d => d.moneda === 'PYG')?.tasa_contra_usd || 7500;
      const brl = data.find(d => d.moneda === 'BRL')?.tasa_contra_usd || 5.0;
      setMonedas({ BRL: brl, PYG: pyg });
    }
  }

  async function guardarProducto(e: React.FormEvent) {
    e.preventDefault();
    const costo = parseFloat(formProducto.costo_usd) || 0;
    const margen = parseFloat(formProducto.margen_pct) || 0;
    const precioUsd = costo + (costo * (margen / 100));

    const { error } = await supabase.from('productos').insert([{
      nombre: formProducto.nombre,
      descripcion: formProducto.descripcion,
      categoria: formProducto.categoria,
      costo_usd: costo,
      margen_pct: margen,
      precio_usd: precioUsd,
      precio_pyg: Math.round(precioUsd * monedas.PYG),
      precio_brl: Number((precioUsd * monedas.BRL).toFixed(2)),
      proveedor: formProducto.proveedor,
      num_factura: formProducto.num_factura,
      foto1_url: formProducto.foto1_url,
      foto2_url: formProducto.foto2_url,
      foto3_url: formProducto.foto3_url
    }]);

    if (!error) {
      alert('Producto ingresado correctamente');
      setFormProducto({
        nombre: '', descripcion: '', categoria: 'Masculino',
        costo_usd: '', margen_pct: '30', proveedor: '', num_factura: '',
        foto1_url: '', foto2_url: '', foto3_url: ''
      });
    } else {
      alert('Error al guardar: ' + error.message);
    }
  }

  // PANTALLA DE LOGIN
  if (!autenticado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans p-4">
        <form onSubmit={validarAcceso} className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm space-y-4 border">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Panel Admin</h2>
            <p className="text-sm text-gray-500">Inicia sesión para gestionar el catálogo</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input
              type="text"
              placeholder="Ingresa tu usuario"
              className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-black"
              value={usuarioInput}
              onChange={e => setUsuarioInput(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-black"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-bold hover:bg-purple-700 transition-colors">
            Ingresar
          </button>
        </form>
      </div>
    );
  }

  // PANEL PRINCIPAL
  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans text-gray-800">
      <header className="max-w-5xl mx-auto bg-white p-4 rounded-lg shadow mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">Panel Admin - Perfumería</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab('ingreso')} className={`px-4 py-2 rounded ${tab === 'ingreso' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>Ingresar Producto</button>
          <button onClick={() => setTab('divisas')} className={`px-4 py-2 rounded ${tab === 'divisas' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>Divisas</button>
          <button onClick={() => setAutenticado(false)} className="px-4 py-2 rounded bg-red-500 text-white">Salir</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow">
        {tab === 'ingreso' && (
          <form onSubmit={guardarProducto} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h2 className="col-span-2 text-lg font-bold border-b pb-2">Alta por Factura / Producto</h2>
            <input type="text" placeholder="Nombre del Producto" className="p-2 border rounded" required value={formProducto.nombre} onChange={e => setFormProducto({...formProducto, nombre: e.target.value})} />
            <select className="p-2 border rounded" value={formProducto.categoria} onChange={e => setFormProducto({...formProducto, categoria: e.target.value})}>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Unisex">Unisex</option>
              <option value="Maquillaje">Maquillaje</option>
              <option value="Cosméticos">Cosméticos</option>
            </select>
            <input type="number" step="0.01" placeholder="Costo en USD" className="p-2 border rounded" required value={formProducto.costo_usd} onChange={e => setFormProducto({...formProducto, costo_usd: e.target.value})} />
            <input type="number" step="0.01" placeholder="Margen % (Ej: 30)" className="p-2 border rounded" value={formProducto.margen_pct} onChange={e => setFormProducto({...formProducto, margen_pct: e.target.value})} />
            <input type="text" placeholder="Proveedor" className="p-2 border rounded" value={formProducto.proveedor} onChange={e => setFormProducto({...formProducto, proveedor: e.target.value})} />
            <input type="text" placeholder="N° Factura" className="p-2 border rounded" value={formProducto.num_factura} onChange={e => setFormProducto({...formProducto, num_factura: e.target.value})} />
            <input type="text" placeholder="URL Foto 1" className="p-2 border rounded col-span-2" value={formProducto.foto1_url} onChange={e => setFormProducto({...formProducto, foto1_url: e.target.value})} />
            <textarea placeholder="Descripción" className="p-2 border rounded col-span-2" value={formProducto.descripcion} onChange={e => setFormProducto({...formProducto, descripcion: e.target.value})}></textarea>
            <button type="submit" className="col-span-2 bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">Guardar Producto</button>
          </form>
        )}

        {tab === 'divisas' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b pb-2">Configuración de Cotizaciones</h2>
            <p className="text-sm text-gray-600">Al cambiar la tasa, los precios en PYG y BRL se recalcularán en el catálogo.</p>
            <div className="flex gap-4 items-center">
              <span>1 USD =</span>
              <input type="number" value={monedas.PYG} onChange={e => setMonedas({...monedas, PYG: parseFloat(e.target.value)})} className="p-2 border rounded w-32" />
              <span>PYG</span>
            </div>
            <div className="flex gap-4 items-center">
              <span>1 USD =</span>
              <input type="number" step="0.01" value={monedas.BRL} onChange={e => setMonedas({...monedas, BRL: parseFloat(e.target.value)})} className="p-2 border rounded w-32" />
              <span>BRL</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
