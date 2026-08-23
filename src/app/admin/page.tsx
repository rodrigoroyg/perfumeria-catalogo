'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPanel() {
  const [autenticado, setAutenticado] = useState(false);
  const [usuarioInput, setUsuarioInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [tab, setTab] = useState<'dashboard' | 'ingreso' | 'ventas' | 'divisas'>('dashboard');
  
  // Tasa de Divisas
  const [monedas, setMonedas] = useState({ BRL: 5.0, PYG: 7500 });
  const [guardandoDivisas, setGuardandoDivisas] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Métrica Dashboard
  const [metaVentas, setMetaVentas] = useState(5000);
  const [ventasActuales, setVentasActuales] = useState(3250);
  const [gastos, setGastos] = useState({ limite: 1500, actual: 420 });
  const [inversiones, setInversiones] = useState({ meta: 8000, actual: 5400 });
  const [desplegarRanking, setDesplegarRanking] = useState(true);

  // Formulario de Producto
  const [formProducto, setFormProducto] = useState({
    nombre: '', descripcion: '', categoria: 'Masculino',
    costo_usd: '', margen_pct: '30', proveedor: '', num_factura: '',
    foto1_url: '', foto2_url: '', foto3_url: ''
  });

  // Formulario de Venta Avanzado
  const [formVenta, setFormVenta] = useState({
    cliente: '',
    producto: '',
    cantidad: 1,
    precioUsd: '',
    monedaPago: 'PYG',
    montoRecibido: ''
  });

  // Credenciales
  const USER_ADMIN = 'AdminZaf';
  const PASS_ADMIN = '270413zafir';

  // Productos Top (Ranking)
  const topProductos = [
    { id: 1, nombre: 'Carolina Herrera Bad Boy 100ml', ventas: 42, totalUsd: 3780 },
    { id: 2, nombre: 'Paco Rabanne One Million 100ml', ventas: 35, totalUsd: 2975 },
    { id: 3, nombre: 'Dior Sauvage Eau de Parfum', ventas: 28, totalUsd: 3080 },
    { id: 4, nombre: 'Versace Eros Flame 100ml', ventas: 19, totalUsd: 1520 },
  ];

  function validarAcceso(e: React.FormEvent) {
    e.preventDefault();
    if (usuarioInput === USER_ADMIN && passwordInput === PASS_ADMIN) {
      setAutenticado(true);
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  }

  useEffect(() => {
    if (autenticado) {
      cargarDivisas();
    }
  }, [autenticado]);

  async function cargarDivisas() {
    try {
      const { data } = await supabase.from('divisas').select('*');
      if (data && data.length > 0) {
        const pyg = data.find(d => d.moneda === 'PYG')?.tasa_contra_usd || 7500;
        const brl = data.find(d => d.moneda === 'BRL')?.tasa_contra_usd || 5.0;
        setMonedas({ BRL: brl, PYG: pyg });
      }
    } catch (err) {
      console.log('Usando tasas predeterminadas');
    }
  }

  async function guardarDivisasDB() {
    setGuardandoDivisas(true);
    try {
      await supabase.from('divisas').upsert([
        { moneda: 'PYG', tasa_contra_usd: monedas.PYG },
        { moneda: 'BRL', tasa_contra_usd: monedas.BRL }
      ]);
      alert('¡Cotizaciones de divisas actualizadas correctamente!');
    } catch (err: any) {
      alert('Error al guardar cotizaciones: ' + err.message);
    } finally {
      setGuardandoDivisas(false);
    }
  }

  // CÁLCULOS DE PRECIO DE PRODUCTO
  const costo = parseFloat(formProducto.costo_usd) || 0;
  const margen = parseFloat(formProducto.margen_pct) || 0;
  const precioUsdCalculado = (costo + (costo * (margen / 100))).toFixed(2);
  const precioPygSinRedondeo = Number(precioUsdCalculado) * monedas.PYG;
  const precioPygCalculado = Math.round(precioPygSinRedondeo / 1000) * 1000;
  const precioBrlCalculado = (Number(precioUsdCalculado) * monedas.BRL).toFixed(2);

  // CÁLCULOS DE VENTA Y VUELTO
  const totalUsdVenta = (parseFloat(formVenta.precioUsd) || 0) * (formVenta.cantidad || 1);
  const totalPygVenta = Math.round((totalUsdVenta * monedas.PYG) / 1000) * 1000;
  const totalBrlVenta = Number((totalUsdVenta * monedas.BRL).toFixed(2));

  let totalAPagar = totalUsdVenta;
  if (formVenta.monedaPago === 'PYG') totalAPagar = totalPygVenta;
  if (formVenta.monedaPago === 'BRL') totalAPagar = totalBrlVenta;

  const recibido = parseFloat(formVenta.montoRecibido) || 0;
  const vuelto = recibido > totalAPagar ? recibido - totalAPagar : 0;

  // Porcentajes Dashboard
  const pctMetaVentas = Math.min(Math.round((ventasActuales / metaVentas) * 100), 100);
  const pctGastos = Math.min(Math.round((gastos.actual / gastos.limite) * 100), 100);
  const pctInversiones = Math.min(Math.round((inversiones.actual / inversiones.meta) * 100), 100);

  async function guardarProducto(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);

    try {
      const { error } = await supabase.from('productos').insert([{
        nombre: formProducto.nombre,
        descripcion: formProducto.descripcion,
        categoria: formProducto.categoria,
        costo_usd: costo,
        margen_pct: margen,
        precio_usd: parseFloat(precioUsdCalculado),
        precio_pyg: precioPygCalculado,
        precio_brl: parseFloat(precioBrlCalculado),
        proveedor: formProducto.proveedor,
        num_factura: formProducto.num_factura,
        foto1_url: formProducto.foto1_url,
        foto2_url: formProducto.foto2_url,
        foto3_url: formProducto.foto3_url
      }]);

      if (!error) {
        alert('¡Producto guardado exitosamente!');
        setFormProducto({
          nombre: '', descripcion: '', categoria: 'Masculino',
          costo_usd: '', margen_pct: '30', proveedor: '', num_factura: '',
          foto1_url: '', foto2_url: '', foto3_url: ''
        });
      } else {
        alert('Error al guardar: ' + error.message);
      }
    } catch (err: any) {
      alert('Error de conexión: ' + err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (!autenticado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 font-sans p-4">
        <form onSubmit={validarAcceso} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm space-y-5">
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-800">Perfumería Zafir</h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1 font-semibold">Panel Administrativo</p>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Usuario</label>
            <input
              type="text"
              placeholder="Ej: AdminZaf"
              className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-slate-900 font-medium"
              value={usuarioInput}
              onChange={e => setUsuarioInput(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-slate-900 font-medium"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all">
            Iniciar Sesión
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl">Z</div>
            <div>
              <h1 className="text-lg font-bold">Perfumería Zafir</h1>
              <p className="text-xs text-slate-400">Panel de Control & Gestión</p>
            </div>
          </div>

          <nav className="flex bg-slate-800 p-1.5 rounded-xl gap-1">
            <button onClick={() => setTab('dashboard')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${tab === 'dashboard' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'}`}>📊 Dashboard</button>
            <button onClick={() => setTab('ingreso')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${tab === 'ingreso' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'}`}>➕ Cargar Producto</button>
            <button onClick={() => setTab('ventas')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${tab === 'ventas' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'}`}>🛒 Ventas</button>
            <button onClick={() => setTab('divisas')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${tab === 'divisas' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'}`}>💱 Divisas</button>
          </nav>

          <button onClick={() => setAutenticado(false)} className="px-4 py-2 bg-rose-600/20 text-rose-400 border border-rose-600/30 text-xs font-bold rounded-xl hover:bg-rose-600 hover:text-white transition-all">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* PESTAÑA DASHBOARD */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Métricas & Metas del Mes</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">🎯 Meta de Ventas</span>
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">{pctMetaVentas}% Completado</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm font-black">
                    <span>${ventasActuales.toLocaleString()} USD</span>
                    <span className="text-slate-400">Meta: ${metaVentas.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${pctMetaVentas}%` }}></div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">Faltan ${(metaVentas - ventasActuales).toLocaleString()} USD para cumplir la meta del mes.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">💸 Gastos Varios</span>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">{pctGastos}% Usado</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm font-black">
                    <span>${gastos.actual.toLocaleString()} USD</span>
                    <span className="text-slate-400">Límite: ${gastos.limite.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${pctGastos}%` }}></div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">Presupuesto disponible: ${(gastos.limite - gastos.actual).toLocaleString()} USD.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">📦 Inversión Stock</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{pctInversiones}% Ejecutado</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm font-black">
                    <span>${inversiones.actual.toLocaleString()} USD</span>
                    <span className="text-slate-400">Objetivo: ${inversiones.meta.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${pctInversiones}%` }}></div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">Capital invertido en compras recientes.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <button 
                onClick={() => setDesplegarRanking(!desplegarRanking)}
                className="w-full p-5 bg-slate-50 flex justify-between items-center text-left border-b border-slate-100 hover:bg-slate-100 transition-all"
              >
                <div>
                  <h3 className="font-bold text-slate-800">🏆 Productos Más Vendidos (Top Ranking)</h3>
                  <p className="text-xs text-slate-500">Haz clic para desplegar u ocultar la lista detallada de rendimiento</p>
                </div>
                <span className="text-slate-400 font-bold text-lg">{desplegarRanking ? '▲' : '▼'}</span>
              </button>

              {desplegarRanking && (
                <div className="p-6 divide-y divide-slate-100">
                  {topProductos.map((item, index) => (
                    <div key={item.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${index === 0 ? 'bg-amber-400 text-white' : index === 1 ? 'bg-slate-300 text-slate-700' : index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          #{index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.nombre}</p>
                          <p className="text-xs text-slate-400">{item.ventas} unidades vendidas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-800">${item.totalUsd.toLocaleString()} USD</span>
                        <span className="block text-[10px] text-slate-400">₲ {(item.totalUsd * monedas.PYG).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA INGRESO PRODUCTO */}
        {tab === 'ingreso' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-800">Alta de Nuevo Producto</h2>
              <p className="text-xs text-slate-500">Ingresa los datos del producto. Los precios finales en moneda local se calculan en tiempo real.</p>
            </div>

            <form onSubmit={guardarProducto} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Perfume / Producto *</label>
                  <input type="text" placeholder="Ej: Carolina Herrera Bad Boy 100ml" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" required value={formProducto.nombre} onChange={e => setFormProducto({...formProducto, nombre: e.target.value})} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoría *</label>
                  <select className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-white" value={formProducto.categoria} onChange={e => setFormProducto({...formProducto, categoria: e.target.value})}>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Unisex">Unisex</option>
                    <option value="Maquillaje">Maquillaje</option>
                    <option value="Cosméticos">Cosméticos</option>
                  </select>
                </div>
              </div>

              <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100 space-y-4">
                <h3 className="text-xs font-extrabold text-purple-900 uppercase tracking-wider">Calculadora de Precios y Margen</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Costo de Compra (USD) *</label>
                    <input type="number" step="0.01" placeholder="Ej: 45.00" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-white font-bold text-slate-800" required value={formProducto.costo_usd} onChange={e => setFormProducto({...formProducto, costo_usd: e.target.value})} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Margen de Ganancia (%) *</label>
                    <input type="number" step="0.1" placeholder="Ej: 30" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-white font-bold text-purple-700" value={formProducto.margen_pct} onChange={e => setFormProducto({...formProducto, margen_pct: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-400 block">Venta en USD</span>
                    <span className="text-lg font-black text-purple-700">${precioUsdCalculado}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-400 block">Venta PYG (Redondeado)</span>
                    <span className="text-lg font-black text-emerald-600">₲ {precioPygCalculado.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-400 block">Venta BRL</span>
                    <span className="text-lg font-black text-blue-600">R$ {precioBrlCalculado}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Proveedor (Opcional)</label>
                  <input type="text" placeholder="Nombre del proveedor" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" value={formProducto.proveedor} onChange={e => setFormProducto({...formProducto, proveedor: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">N° de Factura (Opcional)</label>
                  <input type="text" placeholder="Ej: FAC-00129" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" value={formProducto.num_factura} onChange={e => setFormProducto({...formProducto, num_factura: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">URL de la Foto Principal (Foto 1)</label>
                  <input type="text" placeholder="https://enlace-de-la-imagen.jpg" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" value={formProducto.foto1_url} onChange={e => setFormProducto({...formProducto, foto1_url: e.target.value})} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Descripción del Perfume / Notas Olfativas</label>
                  <textarea rows={3} placeholder="Notas de salida, corazón, duración, etc." className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" value={formProducto.descripcion} onChange={e => setFormProducto({...formProducto, descripcion: e.target.value})}></textarea>
                </div>
              </div>

              <button type="submit" disabled={guardando} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md disabled:bg-slate-300">
                {guardando ? 'Guardando...' : 'Guardar y Publicar en Catálogo'}
              </button>
            </form>
          </div>
        )}

        {/* PESTAÑA VENTAS - CON CALCULADORA DE VUELTO / CAMBIO */}
        {tab === 'ventas' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Registrar Venta & Calculadora de Cambio</h2>
              <p className="text-xs text-slate-500">Ingresa la venta y calcula al instante el vuelto en la moneda seleccionada.</p>
            </div>

            <form onSubmit={e => { e.preventDefault(); alert('Venta registrada con éxito'); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cliente (Opcional)</label>
                  <input type="text" placeholder="Ej: María Giménez" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" value={formVenta.cliente} onChange={e => setFormVenta({...formVenta, cliente: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Producto Vendido *</label>
                  <input type="text" placeholder="Ej: CH Bad Boy 100ml" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" required value={formVenta.producto} onChange={e => setFormVenta({...formVenta, producto: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Precio Unitario en USD *</label>
                  <input type="number" step="0.01" placeholder="Ej: 85.00" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800" required value={formVenta.precioUsd} onChange={e => setFormVenta({...formVenta, precioUsd: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cantidad *</label>
                  <input type="number" min={1} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800" value={formVenta.cantidad} onChange={e => setFormVenta({...formVenta, cantidad: parseInt(e.target.value) || 1})} />
                </div>
              </div>

              {/* Caja de Cobro y Cambio */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 shadow-lg">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Caja & Cobro Efectivo</span>
                  <div className="flex gap-2">
                    {['PYG', 'USD', 'BRL'].map(m => (
                      <button key={m} type="button" onClick={() => setFormVenta({...formVenta, monedaPago: m})} className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${formVenta.monedaPago === m ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold">Total USD</span>
                    <span className="text-base font-black text-white">${totalUsdVenta.toFixed(2)}</span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold">Total PYG</span>
                    <span className="text-base font-black text-emerald-400">₲ {totalPygVenta.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold">Total BRL</span>
                    <span className="text-base font-black text-blue-400">R$ {totalBrlVenta.toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Cliente Paga con ({formVenta.monedaPago})
                    </label>
                    <input 
                      type="number" 
                      placeholder={formVenta.monedaPago === 'PYG' ? 'Ej: 700000' : 'Ej: 100'} 
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-lg font-black text-amber-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={formVenta.montoRecibido}
                      onChange={e => setFormVenta({...formVenta, montoRecibido: e.target.value})}
                    />
                  </div>

                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex flex-col justify-center text-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Vuelto / Cambio a Entregar</span>
                    <span className="text-2xl font-black text-emerald-400 mt-1">
                      {formVenta.monedaPago === 'PYG' && `₲ ${Math.round(vuelto).toLocaleString()}`}
                      {formVenta.monedaPago === 'USD' && `$ ${vuelto.toFixed(2)}`}
                      {formVenta.monedaPago === 'BRL' && `R$ ${vuelto.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md">
                Registrar Venta Concretada
              </button>
            </form>
          </div>
        )}

        {/* PESTAÑA DIVISAS CON BOTÓN GUARDAR */}
        {tab === 'divisas' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Ajuste de Cotizaciones</h2>
              <p className="text-xs text-slate-500">Actualiza las tasas oficiales del día y presiona guardar para aplicarlas al catálogo.</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase block">Dólar a Guaraníes (PYG)</span>
                  <span className="text-xs text-slate-400">1 USD equivale a:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">₲</span>
                  <input type="number" value={monedas.PYG} onChange={e => setMonedas({...monedas, PYG: parseFloat(e.target.value) || 0})} className="p-2 border border-slate-300 rounded-lg text-sm font-bold w-32" />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase block">Dólar a Reales (BRL)</span>
                  <span className="text-xs text-slate-400">1 USD equivale a:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">R$</span>
                  <input type="number" step="0.01" value={monedas.BRL} onChange={e => setMonedas({...monedas, BRL: parseFloat(e.target.value) || 0})} className="p-2 border border-slate-300 rounded-lg text-sm font-bold w-32" />
                </div>
              </div>

              <button 
                type="button" 
                onClick={guardarDivisasDB}
                disabled={guardandoDivisas}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-md shadow-purple-100 disabled:bg-slate-300"
              >
                {guardandoDivisas ? 'Guardando Cotizaciones...' : '💾 Guardar Cotizaciones'}
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
