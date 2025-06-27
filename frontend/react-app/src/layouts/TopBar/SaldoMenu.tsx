import React, { useState, useEffect } from 'react';

interface SaldoMenuProps {
  visible: boolean;
  onClose: () => void;
  onSave: (nuevoSaldo: number) => void;
  saldoActual?: number | null;
}

const CONFIG_PASSWORD = '765123'; // Cambia esto por una contraseña segura

const SaldoMenu: React.FC<SaldoMenuProps> = ({ visible, onClose, onSave, saldoActual }) => {
  const [valor, setValor] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    if (visible && saldoActual !== undefined && saldoActual !== null) {
      setValor(saldoActual.toString());
      setError(null);
      setPassword('');
      setAuth(false);
    }
  }, [visible, saldoActual]);

  if (!visible) return null;

  const handleGuardar = async () => {
    setLoading(true);
    setError(null);
    const num = parseFloat(valor);
    if (isNaN(num)) {
      setError('Ingrese un número válido');
      setLoading(false);
      return;
    }
    try {
      const resp = await fetch('http://localhost:8000/api/saldo/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saldo_inicial: num }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setError(data.detail || 'Error al guardar el saldo');
        setLoading(false);
        return;
      }
      onSave(num);
    } catch (e) {
      setError('Error de red');
    }
    setLoading(false);
  };

  const handlePassword = () => {
    if (password === CONFIG_PASSWORD) {
      setAuth(true);
      setError(null);
    } else {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <div className="saldo-menu-overlay">
      <div className="saldo-menu-modal" style={{ position: 'relative' }}>
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'transparent',
            border: 'none',
            fontSize: 22,
            cursor: 'pointer',
            color: '#888',
            zIndex: 2
          }}
          aria-label="Cerrar"
          disabled={loading}
        >
          ×
        </button>
        <h3>Editar Saldo Inicial</h3>
        <div style={{ color: 'red', fontWeight: 600, marginBottom: 12 }}>
          <span>⚠️ No editar, solo para configuración inicial.</span>
        </div>
        {!auth ? (
          <div style={{ marginBottom: 16 }}>
            <label>Contraseña para editar:</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', marginTop: 8, padding: 8, fontSize: 16 }}
              disabled={loading}
              onKeyDown={e => { if (e.key === 'Enter') handlePassword(); }}
            />
            <button
              style={{ marginTop: 10, background: '#007bff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, width: '100%' }}
              onClick={handlePassword}
              disabled={loading}
            >
              Autorizar
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label>Saldo inicial:</label>
              <input
                type="number"
                value={valor}
                onChange={e => setValor(e.target.value)}
                style={{ width: '100%', marginTop: 8, padding: 8, fontSize: 16 }}
                disabled={loading}
              />
            </div>
            {error && (
              <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={onClose} disabled={loading}>Cancelar</button>
              <button
                onClick={handleGuardar}
                style={{ background: '#007bff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4 }}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </>
        )}
        {error && !auth && (
          <div style={{ color: 'red', marginTop: 8 }}>{error}</div>
        )}
      </div>
    </div>
  );
};

export default SaldoMenu;
