import React, { useState } from 'react';
import './SshTunnelMenu.css';

export interface TunnelConfig {
  host: string;
  sshPort: number;
  username: string;
  authMethod: 'password' | 'privateKey';
  password?: string;
  privateKey?: string;
  localPort: number;
  remotePort: number;
}

type SshTunnelMenuProps = {
  onConnect: (config: TunnelConfig) => Promise<void>;
  onDisconnect: () => Promise<void>;
  isConnected: boolean;
};

const SshTunnelMenu: React.FC<SshTunnelMenuProps> = ({ onConnect, onDisconnect, isConnected }) => {
  const [config, setConfig] = useState<TunnelConfig>({
    host: '',
    sshPort: 22,
    username: '',
    authMethod: 'password',
    password: '',
    privateKey: '',
    localPort: 3307,
    remotePort: 3306,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = <K extends keyof TunnelConfig>(key: K, value: TunnelConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onConnect(config);
    } catch (err: any) {
      setError(err.message || 'Error al conectar');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setError(null);
    setLoading(true);
    try {
      await onDisconnect();
    } catch (err: any) {
      setError(err.message || 'Error al desconectar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ssh-tunnel-menu">
      <div className="ssh-tunnel-menu__modal">
        <h2 className="ssh-tunnel-menu__title">Configuración Conexión Remota</h2>
        <form onSubmit={handleSubmit} className="ssh-tunnel-menu__form">
          <div className="ssh-tunnel-menu__field">
            <label className="ssh-tunnel-menu__label">Host</label>
            <input
              type="text"
              value={config.host}
              onChange={e => handleChange('host', e.target.value)}
              required
              placeholder="ej: 123.45.67.89"
              className="ssh-tunnel-menu__input"
            />
          </div>
          <div className="ssh-tunnel-menu__grid">
            <div className="ssh-tunnel-menu__field">
              <label className="ssh-tunnel-menu__label">Puerto SSH</label>
              <input
                type="number"
                value={config.sshPort}
                onChange={e => handleChange('sshPort', Number(e.target.value))}
                required
                className="ssh-tunnel-menu__input"
              />
            </div>
            <div className="ssh-tunnel-menu__field">
              <label className="ssh-tunnel-menu__label">Usuario</label>
              <input
                type="text"
                value={config.username}
                onChange={e => handleChange('username', e.target.value)}
                required
                className="ssh-tunnel-menu__input"
              />
            </div>
          </div>

          <div className="ssh-tunnel-menu__field">
            <label className="ssh-tunnel-menu__label">Método de Autenticación</label>
            <select
              value={config.authMethod}
              onChange={e => handleChange('authMethod', e.target.value as any)}
              className="ssh-tunnel-menu__select"
            >
              <option value="password">Contraseña</option>
              <option value="privateKey">Llave Privada</option>
            </select>
          </div>

          {config.authMethod === 'password' ? (
            <div className="ssh-tunnel-menu__field">
              <label className="ssh-tunnel-menu__label">Contraseña</label>
              <input
                type="password"
                value={config.password}
                onChange={e => handleChange('password', e.target.value)}
                required
                className="ssh-tunnel-menu__input"
              />
            </div>
          ) : (
            <div className="ssh-tunnel-menu__field">
              <label className="ssh-tunnel-menu__label">Llave Privada (PEM)</label>
              <textarea
                rows={5}
                value={config.privateKey}
                onChange={e => handleChange('privateKey', e.target.value)}
                required
                className="ssh-tunnel-menu__textarea"
              />
            </div>
          )}

          <div className="ssh-tunnel-menu__grid">
            <div className="ssh-tunnel-menu__field">
              <label className="ssh-tunnel-menu__label">Puerto Local</label>
              <input
                type="number"
                value={config.localPort}
                onChange={e => handleChange('localPort', Number(e.target.value))}
                required
                className="ssh-tunnel-menu__input"
              />
            </div>
            <div className="ssh-tunnel-menu__field">
              <label className="ssh-tunnel-menu__label">Puerto Remoto</label>
              <input
                type="number"
                value={config.remotePort}
                onChange={e => handleChange('remotePort', Number(e.target.value))}
                required
                className="ssh-tunnel-menu__input"
              />
            </div>
          </div>

          {error && <p className="ssh-tunnel-menu__error">{error}</p>}

          <div className="ssh-tunnel-menu__actions">
            {isConnected ? (
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={loading}
                className="ssh-tunnel-menu__button ssh-tunnel-menu__button--disconnect"
              >
                {loading ? 'Desconectando...' : 'Desconectar'}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="ssh-tunnel-menu__button ssh-tunnel-menu__button--connect"
              >
                {loading ? 'Conectando...' : 'Conectar'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SshTunnelMenu;
