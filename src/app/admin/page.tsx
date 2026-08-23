'use client';
import { useState } from 'react';

export default function AdminPanel() {
  const [autenticado, setAutenticado] = useState(false);
  const [usuarioInput, setUsuarioInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

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

  if (!autenticado) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
        <form onSubmit={validarAcceso} style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '320px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>Acceso Admin</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Usuario</label>
            <input
              type="text"
              value={usuarioInput}
              onChange={e => setUsuarioInput(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Contraseña</label>
            <input
              type="password"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
              required
            />
          </div>

          <button type="submit" style={{ width: '100%', backgroundColor: '#9333ea', color: '#fff', padding: '0.5rem', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            Ingresar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Panel de Administración Conectado</h1>
      <p>Bienvenido al sistema.</p>
      <button onClick={() => setAutenticado(false)} style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Cerrar Sesión
      </button>
    </div>
  );
}
