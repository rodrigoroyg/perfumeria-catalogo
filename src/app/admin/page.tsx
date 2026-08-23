'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ItemFactura {
  codigo: string;
  nombre: string;
  categoria: string;
  costo_usd: number;
  margen_pct: number;
  precio_usd: number;
  cantidad: number;
  subtotal: number;
  descripcion: string;
  foto1_url: string;
}

export default function AdminPanel() {
  const [autenticado, setAutenticado] = useState(false);
  const [usuarioInput, setUsuarioInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [tab, setTab] = useState<'dashboard' | 'ingreso' | 'ventas' | 'divisas'>('dashboard');
  
  // Tasa de Divisas
  const [monedas, setMonedas] = useState({ BRL: 5.25, PYG: 6000 });
  const [guardandoDivisas, setGuardandoDivisas] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Métrica Dashboard
  const [metaVentas, setMetaVentas] = useState(5000);
  const [ventasActuales, setVentasActuales] = useState(3250);
  const [gastos, setGastos] = useState({ limite: 1500, actual: 420 });
  const [inversiones, setInversiones] = useState({ meta: 8000, actual: 5400 });
  const [desplegarRanking, setDesplegarRanking] = useState(true);

  // ESTADO DE FACTURA DE ENTRADA
  const [datosFactura, setDatosFactura] = useState({
    proveedor: 'Monalisa',
    numFactura: '',
    fecha: new Date().toISOString().split('T')[0],
    montoTotalEsperado: ''
  });

  const [itemsFactura, setItemsFactura] = useState<ItemFactura[]>([]);

  // Formulario del Item Actual
  const [formProducto, setFormProducto] = useState({
    nombre: '',
    categoria: 'Masculino',
    costo_usd: '',
    margen_pct: '30',
    cantidad: '1',
    descripcion: '',
    foto1_url: ''
  });

  // Formulario de Venta
  const [formVenta, setFormVenta] = useState({
    cliente: '',
    producto: '',
    cantidad: 1,
    precioUsd: '',
    metodoPago: 'Efectivo',
    monedaPago: 'PYG',
    montoRecibido: ''
  });

  // Credenciales
  const USER_ADMIN = 'AdminZaf';
  const PASS_ADMIN = '270413zafir';

  // Productos Top
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

  // CÁLCULOS DEL ITEM INDIVIDUAL
  const costoIndividual = parseFloat(formProducto.costo_usd) || 0;
  const margenIndividual = parseFloat(formProducto.margen_pct) || 0;
  const cantidadIndividual = parseInt(formProducto.cantidad) || 1;
  const precioUsdCalculado = costoIndividual + (costoIndividual * (margenIndividual / 100));
  const subtotalCostoItem = costoIndividual * cantidadIndividual;

  // CÁLCULOS GENERALES DE LA FACTURA
  const sumaSubtotalesCosto = itemsFactura.reduce((acc, item) => acc + item.subtotal, 0);
  const montoEsperado = parseFloat(datosFactura.montoTotalEsperado) || 0;
  const diferenciaFactura = Number((montoEsperado - sumaSubtotalesCosto).toFixed(2));
  const facturaCuadrada = montoEsperado > 0 && Math.abs(diferenciaFactura) < 0.01 && itemsFactura.length > 0;

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

  function agregarProductoALista(e: React.FormEvent) {
    e.preventDefault();
    if (!formProducto.nombre || !formProducto.costo_usd) {
      alert('Ingresa el nombre y costo del producto');
      return;
    }

    const nuevoCodigo = `PROD-${String(itemsFactura.length + 1).padStart(3, '0')}`;
    const nuevoItem: ItemFactura = {
      codigo: nuevoCodigo,
      nombre: formProducto.nombre,
      categoria: formProducto.categoria,
      costo_usd: costoIndividual,
      margen_pct: margenIndividual,
      precio_usd: Number(precioUsdCalculado.toFixed(2)),
      cantidad: cantidadIndividual,
      subtotal: Number(subtotalCostoItem.toFixed(2)),
      descripcion: formProducto.descripcion,
      foto1_url: formProducto.foto1_url
    };

    setItemsFactura([...itemsFactura, nuevoItem]);
    setFormProducto({
      nombre: '',
      categoria: 'Masculino',
      costo_usd: '',
      margen_pct: '30',
      cantidad: '1',
      descripcion: '',
      foto1_url: ''
    });
  }

  function eliminarItem(index: number) {
    const actualizada = itemsFactura.filter((_, i) => i !== index);
    setItemsFactura(actualizada);
  }

  async function guardarFacturaCompleta() {
    if (!facturaCuadrada) return;
    setGuardando(true);

    try {
      const productosParaBD = itemsFactura.map(item => ({
        nombre: item.nombre,
        descripcion: item.descripcion,
        categoria: item.categoria,
        costo_usd: item.costo_usd,
        margen_pct: item.margen_pct,
        precio_usd: item.precio_usd,
        precio_pyg: Math.round((item.precio_usd * monedas.PYG) / 1000) * 1000,
        precio_brl: Number((item.precio_usd * monedas.BRL).toFixed(2)),
        proveedor: datosFactura.proveedor,
        num_factura: datosFactura.numFactura,
        foto1_url: item.foto1_url
      }));

      const { error } = await supabase.from('productos').insert(productosParaBD);

      if (!error) {
        alert('¡Factura y catálogo de productos guardados con éxito!');
        setItemsFactura([]);
        setDatosFactura({
          proveedor: 'Monalisa',
          numFactura: '',
          fecha: new Date().toISOString().split('T')[0],
          montoTotalEsperado: ''
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
            <input type="text" placeholder="Ej: AdminZaf" className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 font-medium" value={usuarioInput} onChange={e => setUsuarioInput(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contraseña</label>
            <input type="password" placeholder="••••••••" className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 font-medium" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} required />
          </div>
          <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-all">Iniciar Sesión</button>
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
            <button onClick={() => setTab('ingreso')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${tab === 'ingreso' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'}`}>📄 Cargar Factura</button>
            <button onClick={() => setTab('ventas')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${tab === 'ventas' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'}`}>🛒 Ventas</button>
            <button onClick={() => setTab('divisas')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${tab === 'divisas' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'}`}>💱 Divisas</button>
          </nav>
          <button onClick={() => setAutenticado(false)} className="px-4 py-2 bg-rose-600/20 text-rose-400 border border-rose-600/30 text-xs font-bold rounded-xl hover:bg-rose-600 hover:text-white transition-all">Cerrar Sesión</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Métricas & Metas del Mes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-500 uppercase">🎯 Meta de Ventas</span>
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">{pctMetaVentas}%</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm font-black">
                    <span>${ventasActuales.toLocaleString()} USD</span>
                    <span className="text-slate-400">Meta: ${metaVentas.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: `${pctMetaVentas}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-500 uppercase">💸 Gastos Varios</span>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">{pctGastos}%</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm font-black">
                    <span>${gastos.actual.toLocaleString()} USD</span>
                    <span className="text-slate-400">Límite: ${gastos.limite.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pctGastos}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-500 uppercase">📦 Inversión Stock</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{pctInversiones}%</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm font-black">
                    <span>${inversiones.actual.toLocaleString()} USD</span>
                    <span className="text-slate-400">Objetivo: ${inversiones.meta.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pctInversiones}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA CARGA POR FACTURA DE ENTRADA */}
        {tab === 'ingreso' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* 1. Datos de la Factura Cabeza */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
                1. Datos de la Factura de Entrada / Proveedor
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Proveedor *</label>
                  <select 
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-white font-medium"
                    value={datosFactura.proveedor}
                    onChange={e => setDatosFactura({...datosFactura, proveedor: e.target.value})}
                  >
                    <option value="Monalisa">Monalisa</option>
                    <option value="SABA SA">SABA SA</option>
                    <option value="La Petisquera">La Petisquera</option>
                    <option value="Proveedor Importación Directa">Proveedor Importación Directa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de Factura *</label>
                  <input 
                    type="date" 
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-medium" 
                    value={datosFactura.fecha}
                    onChange={e => setDatosFactura({...datosFactura, fecha: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">N° de Factura / Nota *</label>
                  <input 
                    type="text" 
                    placeholder="Ej: FAC-98213" 
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-medium"
                    value={datosFactura.numFactura}
                    onChange={e => setDatosFactura({...datosFactura, numFactura: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monto Total Nota (USD) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="Ej: 1500.00" 
                    className="w-full p-2.5 border border-purple-300 bg-purple-50 rounded-xl text-sm font-black text-purple-900"
                    value={datosFactura.montoTotalEsperado}
                    onChange={e => setDatosFactura({...datosFactura, montoTotalEsperado: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* 2. Agregar Producto a la Factura */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
                2. Agregar Perfume / Producto
              </h2>
              <form onSubmit={agregarProductoALista} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Perfume *</label>
                    <input type="text" placeholder="Ej: CH Bad Boy Le Parfum 100ml" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" value={formProducto.nombre} onChange={e => setFormProducto({...formProducto, nombre: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Categoría</label>
                    <select className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-white" value={formProducto.categoria} onChange={e => setFormProducto({...formProducto, categoria: e.target.value})}>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Unisex">Unisex</option>
                      <option value="Cosméticos">Cosméticos</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Costo USD *</label>
                    <input type="number" step="0.01" placeholder="45.00" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold" value={formProducto.costo_usd} onChange={e => setFormProducto({...formProducto, costo_usd: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Margen % *</label>
                    <input type="number" step="0.1" placeholder="30" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold text-purple-700" value={formProducto.margen_pct} onChange={e => setFormProducto({...formProducto, margen_pct: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cantidad *</label>
                    <input type="number" min="1" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold" value={formProducto.cantidad} onChange={e => setFormProducto({...formProducto, cantidad: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Precio Venta USD</label>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black text-emerald-600">
                      ${precioUsdCalculado.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="URL Foto principal (Opcional)" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" value={formProducto.foto1_url} onChange={e => setFormProducto({...formProducto, foto1_url: e.target.value})} />
                  <input type="text" placeholder="Notas olfativas / Descripción (Opcional)" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" value={formProducto.descripcion} onChange={e => setFormProducto({...formProducto, descripcion: e.target.value})} />
                </div>

                <button type="submit" className="w-full bg-purple-600 text-white py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-all text-sm shadow-sm">
                  ➕ Agregar Producto a la Lista Borrador
                </button>
              </form>
            </div>

            {/* 3. Tabla Borrador y Cuadre de Factura */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
                3. Detalle de Items Acomulados
              </h2>

              {itemsFactura.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No has agregado productos a esta factura aún.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] uppercase font-black text-slate-500 bg-slate-50">
                        <th className="p-3">Código</th>
                        <th className="p-3">Nombre</th>
                        <th className="p-3">Costo USD</th>
                        <th className="p-3">Margen %</th>
                        <th className="p-3">Cant.</th>
                        <th className="p-3">Precio Venta</th>
                        <th className="p-3">Subtotal Costo</th>
                        <th className="p-3 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {itemsFactura.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-purple-600">{item.codigo}</td>
                          <td className="p-3 font-bold text-slate-800">{item.nombre}</td>
                          <td className="p-3 font-medium">${item.costo_usd.toFixed(2)}</td>
                          <td className="p-3 font-medium">{item.margen_pct}%</td>
                          <td className="p-3 font-bold">{item.cantidad}</td>
                          <td className="p-3 font-bold text-emerald-600">${item.precio_usd.toFixed(2)}</td>
                          <td className="p-3 font-black text-slate-800">${item.subtotal.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <button onClick={() => eliminarItem(idx)} className="text-rose-600 font-bold hover:bg-rose-50 px-2 py-1 rounded-lg">✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Caja de Verificación y Cuadre */}
              <div className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-4 ${facturaCuadrada ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                <div>
                  <p className="text-xs font-bold text-slate-700">Resumen de Cuadre de Factura:</p>
                  <p className="text-xs text-slate-500">Monto Factura Esperado: <strong className="text-slate-900">${montoEsperado.toFixed(2)} USD</strong> | Suma Carga Actual: <strong className="text-slate-900">${sumaSubtotalesCosto.toFixed(2)} USD</strong></p>
                </div>

                <div className="text-right">
                  {facturaCuadrada ? (
                    <span className="inline-block px-3 py-1 bg-emerald-600 text-white font-extrabold text-xs rounded-full">
                      ✓ Factura Cuadrada Correctamente
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-amber-600 text-white font-extrabold text-xs rounded-full">
                      ⚠️ Diferencia: ${diferenciaFactura.toFixed(2)} USD
                    </span>
                  )}
                </div>
              </div>

              <button 
                onClick={guardarFacturaCompleta} 
                disabled={!facturaCuadrada || guardando} 
                className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {guardando ? 'Guardando Factura en Sistema...' : '💾 Guardar Factura de Entrada'}
              </button>
            </div>
          </div>
        )}

        {/* VENTAS */}
        {tab === 'ventas' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Registrar Venta</h2>
              <p className="text-xs text-slate-500">Ingresa los datos de la transacción y selecciona el método de pago.</p>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Precio Unitario USD *</label>
                  <input type="number" step="0.01" placeholder="Ej: 85.00" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800" required value={formVenta.precioUsd} onChange={e => setFormVenta({...formVenta, precioUsd: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cantidad *</label>
                  <input type="number" min={1} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800" value={formVenta.cantidad} onChange={e => setFormVenta({...formVenta, cantidad: parseInt(e.target.value) || 1})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Método de Pago *</label>
                  <select 
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-white font-bold text-purple-700" 
                    value={formVenta.metodoPago} 
                    onChange={e => setFormVenta({...formVenta, metodoPago: e.target.value})}
                  >
                    <option value="Efectivo">💵 Efectivo</option>
                    <option value="Tarjeta">💳 Tarjeta</option>
                    <option value="Transferencia bancaria">🏦 Transferencia Bancaria</option>
                    <option value="Pix">⚡ Pix</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Total USD</span>
                  <span className="text-lg font-black text-slate-800">${totalUsdVenta.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Total PYG</span>
                  <span className="text-lg font-black text-emerald-600">₲ {totalPygVenta.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Total BRL</span>
                  <span className="text-lg font-black text-blue-600">R$ {totalBrlVenta.toFixed(2)}</span>
                </div>
              </div>

              {formVenta.metodoPago === 'Efectivo' && (
                <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 shadow-lg">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Cobro en Efectivo & Calculadora de Cambio</span>
                    <div className="flex gap-2">
                      {['PYG', 'USD', 'BRL'].map(m => (
                        <button key={m} type="button" onClick={() => setFormVenta({...formVenta, monedaPago: m})} className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${formVenta.monedaPago === m ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                          {m}
                        </button>
                      ))}
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
              )}

              <button type="submit" className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md">
                Registrar Venta Concretada
              </button>
            </form>
          </div>
        )}

        {/* DIVISAS */}
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
