import React, { useState } from 'react';
import './Login.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://salesmanagementapplication-production.up.railway.app/api';

const Login: React.FC<{ onLogin?: () => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.access) {
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        if (onLogin) onLogin();
        window.location.reload();
      } else {
        setError(data.detail || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error de red');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Iniciar sesión</h2>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoFocus
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
        {error && <div className="login-error">{error}</div>}
      </form>
    </div>
  );
};

export default Login;
