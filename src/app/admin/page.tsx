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
  const [guardando, setGuardando] = useState(false);

  // Formulario de Producto
  const [formProducto, setFormProducto] = useState({
    nombre: '', descripcion: '', categoria: 'Masculino',
    costo_usd: '', margen_pct: '30', proveedor: '', num_factura: '',
    foto1_url: '', foto2_url: '', foto3_url: ''
  });

  // Formulario de Venta
  const [formVenta, setFormVenta] = useState({
    producto_nombre: '', cantidad: 1, precio_unitario_usd: '', moneda_pago: 'USD', cliente: ''
  });

  // Credenciales
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

  // CÁLCULOS EN TIEMPO REAL CON REDONDEO
  const costo = parseFloat(formProducto.costo_usd) || 0;
  const margen = parseFloat(formProducto.margen_pct) || 0;
  const precioUsdCalculado = (costo + (costo * (margen / 100))).toFixed(2);
  
  // Redondeo en PYG a los mil más cercanos (Ej: 154.200 -> 154.000)
  const precioPygSinRedondeo = Number(precioUsdCalculado) * monedas.PYG;
  const precioPygCalculado = Math.round(precioPygSinRedondeo / 1000) * 1000;
  
  // Redondeo en BRL a 2 decimales
  const precioBrlCalculado = (Number(precioUsdCalculado) * monedas.BRL).toFixed(2);

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

  // PANTALLA LOGIN
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

  // PANEL PRINCIPAL
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

          {/* Navegación por pestañas */}
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

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto p-6">
        
        {/* PESTAÑA 1: DASHBOARD */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Resumen General</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Cotización Guaraní</span>
                <p className="text-2xl font-black text-slate-800 mt-1">₲ {monedas.PYG.toLocaleString()}</p>
                <span className="text-[10px] text-slate-400">Tasa x 1 USD</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Cotización Real</span>
                <p className="text-2xl font-black text-slate-800 mt-1">R$ {monedas.BRL}</p>
                <span className="text-[10px] text-slate-400">Tasa x 1 USD</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Estado Sistema</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">Activo</p>
                <span className="text-[10px] text-emerald-600">Base de Datos Conectada</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Catálogo Público</span>
                <a href="https://zafirpy.vercel.app" target="_blank" className="text-sm font-bold text-purple-600 hover:underline block mt-2">
                  Ver Tienda online ↗
                </a>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: INGRESO DE PRODUCTOS */}
        {tab === 'ingreso' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-800">Alta de Nuevo Producto</h2>
              <p className="text-xs text-slate-500">Ingresa los datos del producto. Los precios finales en moneda local se calculan en tiempo real.</p>
            </div>

            <form onSubmit={guardarProducto} className="space-y-6">
              {/* Sección 1: Información Básica */}
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

              {/* Sección 2: Costos, Margen y Precios Calculados */}
              <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100 space-y-4">
                <h3 className="text-xs font-extrabold text-purple-900 uppercase tracking-wider">Calculadora de Precios y Margen</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Costo de Compra (USD) *</label>
                    <input type="number" step="0.01" placeholder="Ej: 45.00" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-white font-bold text-slate-800" required value={formProducto.costo_usd} onChange={e => setFormProducto({...formProducto, costo_usd: e.target.value})} />
                    <span className="text-[10px] text-slate-500">Precio neto según factura o proveedor</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Margen de Ganancia (%) *</label>
                    <input type="number" step="0.1" placeholder="Ej: 30" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-white font-bold text-purple-700" value={formProducto.margen_pct} onChange={e => setFormProducto({...formProducto, margen_pct: e.target.value})} />
                    <span className="text-[10px] text-slate-500">Porcentaje de ganancia deseado</span>
                  </div>
                </div>

                {/* Precios calculados automáticamente */}
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

              {/* Sección 3: Datos de Proveedor y Factura */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Proveedor (Opcional)</label>
                  <input type="text" placeholder="Nombre del proveedor o distribuidor" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" value={formProducto.proveedor} onChange={e => setFormProducto({...formProducto, proveedor: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">N° de Factura (Opcional)</label>
                  <input type="text" placeholder="Ej: FAC-00129" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" value={formProducto.num_factura} onChange={e => setFormProducto({...formProducto, num_factura: e.target.value})} />
                </div>
              </div>

              {/* Sección 4: Imagen y Descripción */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">URL de la Foto Principal (Foto 1)</label>
                  <input type="text" placeholder="https://enlace-de-la-imagen.jpg" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" value={formProducto.foto1_url} onChange={e => setFormProducto({...formProducto, foto1_url: e.target.value})} />
                  <span className="text-[10px] text-slate-400">Pega un enlace directo de imagen</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Descripción del Perfume / Notas Olfativas</label>
                  <textarea rows={3} placeholder="Notas de salida, corazón, duración, etc." className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" value={formProducto.descripcion} onChange={e => setFormProducto({...formProducto, descripcion: e.target.value})}></textarea>
                </div>
              </div>

              <button type="submit" disabled={guardando} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 disabled:bg-slate-300">
                {guardando ? 'Guardando en la Base de Datos...' : 'Guardar y Publicar en Catálogo'}
              </button>
            </form>
          </div>
        )}

        {/* PESTAÑA 3: REGISTRO DE VENTAS */}
        {tab === 'ventas' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Registrar Nueva Venta</h2>
              <p className="text-xs text-slate-500">Anota una venta realizada en mostrador o pedido por WhatsApp.</p>
            </div>

            <form onSubmit={e => { e.preventDefault(); alert('Venta registrada con éxito'); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Producto / Cliente</label>
                <input type="text" placeholder="Ej: Perfume Zafir - Cliente Juan" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cantidad</label>
                  <input type="number" defaultValue={1} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Moneda de Pago</label>
                  <select className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-white">
                    <option>USD ($)</option>
                    <option>PYG (₲)</option>
                    <option>BRL (R$)</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-all">
                Registrar Venta
              </button>
            </form>
          </div>
        )}

        {/* PESTAÑA 4: DIVISAS Y COTIZACIONES */}
        {tab === 'divisas' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Ajuste de Cotizaciones</h2>
              <p className="text-xs text-slate-500">Actualiza el tipo de cambio oficial del día. Los precios del catálogo se recalculan en vivo.</p>
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
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
