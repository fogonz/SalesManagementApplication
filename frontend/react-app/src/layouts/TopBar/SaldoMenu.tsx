import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../services/api';

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
  const [currentView, setCurrentView] = useState<'password' | 'menu' | 'saldo' | 'balance' | 'quantities'>('password');
  const [balanceResult, setBalanceResult] = useState<string | null>(null);
  const [quantitiesResult, setQuantitiesResult] = useState<string | null>(null);

  useEffect(() => {
    if (visible && saldoActual !== undefined && saldoActual !== null) {
      setValor(saldoActual.toString());
      setError(null);
      setPassword('');
      setAuth(false);
      setCurrentView('password');
      setBalanceResult(null);
      setQuantitiesResult(null);
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
      const resp = await fetch(`${API_BASE_URL}/api/saldo/`, {
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

  const handleBatchRecalculateBalances = async () => {
    setLoading(true);
    setError(null);
    setBalanceResult(null);
    
    try {
      const resp = await fetch(`${API_BASE_URL}/api/movimientos/batch_recalculate_balances/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setError(data.error || 'Error al recalcular balances');
        setLoading(false);
        return;
      }
      
      const data = await resp.json();
      setBalanceResult(`${data.message}. Total de cuentas: ${data.total_accounts}`);
    } catch (e) {
      setError('Error de red al recalcular balances');
    }
    setLoading(false);
  };

  const handleBatchRecalculateQuantities = async () => {
    setLoading(true);
    setError(null);
    setQuantitiesResult(null);
    
    try {
      const resp = await fetch(`${API_BASE_URL}/api/productos/batch_recalculate_quantities/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setError(data.error || 'Error al recalcular cantidades');
        setLoading(false);
        return;
      }
      
      const data = await resp.json();
      setQuantitiesResult(`${data.message}. Total de productos: ${data.total_products}`);
    } catch (e) {
      setError('Error de red al recalcular cantidades');
    }
    setLoading(false);
  };

  const handlePassword = () => {
    if (password === CONFIG_PASSWORD) {
      setAuth(true);
      setCurrentView('menu');
      setError(null);
    } else {
      setError('Contraseña incorrecta');
    }
  };

  const renderPasswordView = () => (
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
  );

  const renderMenuView = () => (
    <div style={{ marginBottom: 16 }}>
      <h4 style={{ marginBottom: 16 }}>Seleccione una opción:</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={() => setCurrentView('saldo')}
          style={{ 
            background: '#28a745', 
            color: '#fff', 
            border: 'none', 
            padding: '12px 16px', 
            borderRadius: 4,
            cursor: 'pointer'
          }}
          disabled={loading}
        >
          📝 Editar Saldo Inicial
        </button>
        <button
          onClick={() => setCurrentView('balance')}
          style={{ 
            background: '#ffc107', 
            color: '#000', 
            border: 'none', 
            padding: '12px 16px', 
            borderRadius: 4,
            cursor: 'pointer'
          }}
          disabled={loading}
        >
          ⚖️ Recalcular Balances de Cuentas
        </button>
        <button
          onClick={() => setCurrentView('quantities')}
          style={{ 
            background: '#17a2b8', 
            color: '#fff', 
            border: 'none', 
            padding: '12px 16px', 
            borderRadius: 4,
            cursor: 'pointer'
          }}
          disabled={loading}
        >
          📦 Recalcular Cantidades de Productos
        </button>
      </div>
    </div>
  );

  const renderSaldoView = () => (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <button
          onClick={() => setCurrentView('menu')}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            fontSize: 18, 
            cursor: 'pointer',
            marginRight: 8
          }}
        >
          ← 
        </button>
        <h4 style={{ margin: 0 }}>Editar Saldo Inicial</h4>
      </div>
      <div style={{ color: 'red', fontWeight: 600, marginBottom: 12 }}>
        <span>⚠️ No editar, solo para configuración inicial.</span>
      </div>
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
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={() => setCurrentView('menu')} disabled={loading}>Volver</button>
        <button
          onClick={handleGuardar}
          style={{ background: '#007bff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4 }}
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </>
  );

  const renderBalanceView = () => (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <button
          onClick={() => setCurrentView('menu')}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            fontSize: 18, 
            cursor: 'pointer',
            marginRight: 8
          }}
        >
          ← 
        </button>
        <h4 style={{ margin: 0 }}>Recalcular Balances</h4>
      </div>
      <div style={{ color: '#856404', background: '#fff3cd', padding: 12, borderRadius: 4, marginBottom: 16 }}>
        <span>⚠️ Esta operación recalculará todos los balances de las cuentas basándose en sus transacciones.</span>
      </div>
      {balanceResult && (
        <div style={{ color: '#155724', background: '#d4edda', padding: 12, borderRadius: 4, marginBottom: 16 }}>
          <span>✅ {balanceResult}</span>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={() => setCurrentView('menu')} disabled={loading}>Volver</button>
        <button
          onClick={handleBatchRecalculateBalances}
          style={{ background: '#ffc107', color: '#000', border: 'none', padding: '8px 16px', borderRadius: 4 }}
          disabled={loading}
        >
          {loading ? 'Recalculando...' : 'Recalcular Balances'}
        </button>
      </div>
    </>
  );

  const renderQuantitiesView = () => (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <button
          onClick={() => setCurrentView('menu')}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            fontSize: 18, 
            cursor: 'pointer',
            marginRight: 8
          }}
        >
          ← 
        </button>
        <h4 style={{ margin: 0 }}>Recalcular Cantidades</h4>
      </div>
      <div style={{ color: '#0c5460', background: '#d1ecf1', padding: 12, borderRadius: 4, marginBottom: 16 }}>
        <span>📦 Esta operación recalculará todas las cantidades de productos basándose en sus transacciones de compra y venta.</span>
      </div>
      {quantitiesResult && (
        <div style={{ color: '#155724', background: '#d4edda', padding: 12, borderRadius: 4, marginBottom: 16 }}>
          <span>✅ {quantitiesResult}</span>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={() => setCurrentView('menu')} disabled={loading}>Volver</button>
        <button
          onClick={handleBatchRecalculateQuantities}
          style={{ background: '#17a2b8', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4 }}
          disabled={loading}
        >
          {loading ? 'Recalculando...' : 'Recalcular Cantidades'}
        </button>
      </div>
    </>
  );

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
        <h3>Configuración del Sistema</h3>
        
        {currentView === 'password' && renderPasswordView()}
        {currentView === 'menu' && renderMenuView()}
        {currentView === 'saldo' && renderSaldoView()}
        {currentView === 'balance' && renderBalanceView()}
        {currentView === 'quantities' && renderQuantitiesView()}
        
        {error && (
          <div style={{ color: 'red', marginTop: 8 }}>{error}</div>
        )}
      </div>
    </div>
  );
};

export default SaldoMenu;
