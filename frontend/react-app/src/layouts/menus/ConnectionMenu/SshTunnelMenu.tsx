import React, { useState, useEffect } from 'react';
import './SshTunnelMenu.css';
import { API_BASE_URL } from '../../../services/api';
import { authFetch } from '../../../utils/authFetch';

type SshTunnelMenuProps = {
  onConnect: (config: any) => Promise<void>;
  onCancel?: () => void;
  isConnected: boolean;
};

type Mode = "host" | "client";

const SshTunnelMenu: React.FC<SshTunnelMenuProps> = ({ onConnect, onCancel }) => {
  const [mode, setMode] = useState<Mode>('host');
  // SSH fields
  const [sshHost, setSshHost] = useState('');
  const [sshPort, setSshPort] = useState('22');
  const [sshUser, setSshUser] = useState('');
  const [sshPassword, setSshPassword] = useState('');
  // MySQL fields
  const [mysqlHost, setMysqlHost] = useState('127.0.0.1');
  const [mysqlPort, setMysqlPort] = useState('3306');
  const [mysqlUser, setMysqlUser] = useState('');
  const [mysqlPassword, setMysqlPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SSH Host status (for Windows/Linux)
  const [sshInstalled, setSshInstalled] = useState<boolean | null>(null);
  const [sshRunning, setSshRunning] = useState<boolean | null>(null);
  const [sshActionLoading, setSshActionLoading] = useState(false);
  const [sshError, setSshError] = useState<string | null>(null);
  const [osType, setOsType] = useState<'windows' | 'linux' | null>(null);

  // Nuevo: Estado para crear el túnel SSH como host
  const [tunnelCreated, setTunnelCreated] = useState<boolean>(false);
  const [tunnelLoading, setTunnelLoading] = useState<boolean>(false);
  const [tunnelError, setTunnelError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "host") {
      setSshError(null);
      setSshInstalled(null);
      setSshRunning(null);
      // Detect OS and check SSH status
      authFetch(`${API_BASE_URL}/api/ssh-status/`)
        .then(res => res.json())
        .then(data => {
          // Si el backend no puede detectar correctamente, pero el usuario está en Linux, asumimos instalado
          let detectedOs: 'windows' | 'linux' = data.os === 'windows' ? 'windows' : 'linux';
          setOsType(detectedOs);

          // Si el backend no puede detectar, pero no hay error, asumimos instalado en Linux
          if (detectedOs === 'linux' && data.installed === false && !data.error) {
            setSshInstalled(true);
            setSshRunning(true); // asume que está corriendo si no hay error
          } else {
            setSshInstalled(data.installed);
            setSshRunning(data.running);
          }
          if (data.error) setSshError(data.error);
        })
        .catch(err => setSshError(err.message));
    }
  }, [mode]);

  const handleInstallSsh = async () => {
    setSshActionLoading(true);
    setSshError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/ssh-install/`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) {
        // Si el backend no soporta instalación automática, muestra instrucciones manuales según OS detectado
        if (
          (osType === 'linux') ||
          (data.error && (data.error.includes('Solo soportado en Windows') || data.error.includes('not supported')))
        ) {
          setSshError(
            "Instalación automática no soportada en Linux. " +
            "Por favor instala manualmente con: sudo apt install openssh-server"
          );
        } else {
          setSshError(data.error || 'Error al instalar OpenSSH');
        }
      } else {
        setSshInstalled(true);
        setTimeout(() => handleCheckSsh(), 1000);
      }
    } catch (err: any) {
      setSshError(err.message);
    } finally {
      setSshActionLoading(false);
    }
  };

  const handleStartSsh = async () => {
    setSshActionLoading(true);
    setSshError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/ssh-start/`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) setSshError(data.error || 'Error al iniciar OpenSSH');
      else setSshRunning(true);
    } catch (err: any) {
      setSshError(err.message);
    } finally {
      setSshActionLoading(false);
    }
  };

  const handleCheckSsh = async () => {
    setSshError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/ssh-status/`);
      const data = await res.json();
      setOsType(data.os === 'windows' ? 'windows' : 'linux');
      setSshInstalled(data.installed);
      setSshRunning(data.running);
      if (data.error) setSshError(data.error);
    } catch (err: any) {
      setSshError(err.message);
    }
  };

  const handleCreateTunnel = async () => {
    setTunnelLoading(true);
    setTunnelError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/create-ssh-tunnel/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ssh_port: sshPort,
          ssh_user: sshUser,
          ssh_password: sshPassword,
          mysql_port: mysqlPort,
          mysql_user: mysqlUser,
          mysql_password: mysqlPassword,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setTunnelError(data.error || 'Error al crear el túnel');
        setTunnelCreated(false);
      } else {
        setTunnelCreated(true);
        setTunnelError(null);
      }
    } catch (err: any) {
      setTunnelError(err.message);
      setTunnelCreated(false);
    } finally {
      setTunnelLoading(false);
    }
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/test-mysql-ssh-tunnel/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ssh_host: sshHost,
          ssh_port: sshPort,
          ssh_user: sshUser,
          ssh_password: sshPassword,
          mysql_host: mysqlHost,
          mysql_port: mysqlPort,
          mysqlUser,
          mysqlPassword,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Error al conectar');
      } else {
        setError(null);
        await onConnect({
          sshHost, sshPort, sshUser, sshPassword,
          mysqlHost, mysqlPort, mysqlUser, mysqlPassword
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error al conectar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ssh-tunnel-menu">
      <div className="ssh-tunnel-menu__modal">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            className={`ssh-tunnel-menu__button${mode === "host" ? " active" : ""}`}
            style={{ flex: 1, background: mode === "host" ? "#059669" : "#10b981" }}
            onClick={() => setMode("host")}
            type="button"
          >
            Soy el Host
          </button>
          <button
            className={`ssh-tunnel-menu__button${mode === "client" ? " active" : ""}`}
            style={{ flex: 1, background: mode === "client" ? "#059669" : "#10b981" }}
            onClick={() => setMode("client")}
            type="button"
          >
            Soy el Cliente
          </button>
        </div>
        {mode === "host" ? (
          <>
            <h2 className="ssh-tunnel-menu__title">Modo Host</h2>
            <div>
              <p>Para ser host, asegúrate de tener un servidor SSH corriendo en tu máquina y que el puerto esté accesible.</p>
              <ul>
                <li>Tu usuario debe tener acceso a la base de datos MySQL local.</li>
                <li>Comparte tu IP pública, puerto SSH, usuario y contraseña SSH con el cliente.</li>
              </ul>
              <div style={{ margin: "1em 0" }}>
                <b>Estado del servidor SSH:</b><br />
                {sshError && <span style={{ color: "red" }}>{sshError}</span>}
                <div className="ssh-tunnel-menu__actions" style={{ margin: "0.5em 0 0 0", flexWrap: "wrap" }}>
                  {sshInstalled === null ? (
                    <span>Verificando...</span>
                  ) : !sshInstalled ? (
                    <>
                      <span style={{ display: "block", marginBottom: 8 }}>
                        {osType === 'windows'
                          ? 'OpenSSH Server NO está instalado (Windows)'
                          : 'OpenSSH Server NO está instalado (Linux)'}
                      </span>
                      <button
                        className="ssh-tunnel-menu__button ssh-tunnel-menu__button--connect"
                        onClick={handleInstallSsh}
                        disabled={sshActionLoading}
                        style={{ marginBottom: 8 }}
                      >
                        {sshActionLoading ? "Instalando..." : (osType === 'windows' ? "Instalar OpenSSH Server (Windows)" : "Instalar OpenSSH Server (Linux)")}
                      </button>
                      {osType === 'linux' && (
                        <span style={{ fontSize: "0.9em", color: "#555" }}>
                          Si falla, instala manualmente con:<br />
                          <code>sudo apt install openssh-server</code>
                        </span>
                      )}
                    </>
                  ) : !sshRunning ? (
                    <>
                      <span style={{ display: "block", marginBottom: 8 }}>
                        OpenSSH Server instalado pero NO iniciado.
                      </span>
                      <button
                        className="ssh-tunnel-menu__button ssh-tunnel-menu__button--connect"
                        onClick={handleStartSsh}
                        disabled={sshActionLoading}
                        style={{ marginBottom: 8 }}
                      >
                        {sshActionLoading ? "Iniciando..." : "Iniciar OpenSSH Server"}
                      </button>
                      {osType === 'linux' && (
                        <span style={{ fontSize: "0.9em", color: "#555" }}>
                          Si falla, inicia manualmente con:<br />
                          <code>sudo service ssh start</code>
                        </span>
                      )}
                    </>
                  ) : (
                    <span style={{ color: "green", display: "block", marginBottom: 8 }}>
                      OpenSSH Server <b>corriendo</b> y listo para conexiones.
                    </span>
                  )}
                  <button
                    className="ssh-tunnel-menu__button ssh-tunnel-menu__button--status"
                    onClick={handleCheckSsh}
                    disabled={sshActionLoading}
                  >
                    Actualizar estado
                  </button>
                </div>
              </div>
              {/* Nuevo: Botón para crear el túnel SSH como host */}
              <div className="ssh-tunnel-menu__actions" style={{ marginTop: 16 }}>
                <button
                  className="ssh-tunnel-menu__button ssh-tunnel-menu__button--connect"
                  onClick={handleCreateTunnel}
                  disabled={tunnelLoading || !sshRunning}
                >
                  {tunnelLoading ? "Creando túnel..." : "Crear túnel SSH (abrir puerto)"}
                </button>
                {tunnelCreated && (
                  <span style={{ color: "green", marginLeft: 12 }}>
                    Túnel SSH creado y escuchando.
                  </span>
                )}
                {tunnelError && (
                  <span style={{ color: "red", marginLeft: 12 }}>
                    {tunnelError}
                  </span>
                )}
              </div>
              <p>El cliente se conectará usando estos datos y accederá a tu base de datos MySQL a través del túnel SSH.</p>
            </div>
          </>
        ) : (
          <>
            <h2 className="ssh-tunnel-menu__title">Conectarse como Cliente (SSH Tunnel)</h2>
            <form onSubmit={handleClientSubmit} className="ssh-tunnel-menu__form">
              <div className="ssh-tunnel-menu__field">
                <label className="ssh-tunnel-menu__label">Host SSH</label>
                <input type="text" value={sshHost} onChange={e => setSshHost(e.target.value)} required placeholder="IP o dominio del host" className="ssh-tunnel-menu__input" />
              </div>
              <div className="ssh-tunnel-menu__field">
                <label className="ssh-tunnel-menu__label">Puerto SSH</label>
                <input type="text" value={sshPort} onChange={e => setSshPort(e.target.value)} required placeholder="22" className="ssh-tunnel-menu__input" />
              </div>
              <div className="ssh-tunnel-menu__field">
                <label className="ssh-tunnel-menu__label">Usuario SSH</label>
                <input type="text" value={sshUser} onChange={e => setSshUser(e.target.value)} required placeholder="ej: felipe" className="ssh-tunnel-menu__input" />
              </div>
              <div className="ssh-tunnel-menu__field">
                <label className="ssh-tunnel-menu__label">Contraseña SSH</label>
                <input type="password" value={sshPassword} onChange={e => setSshPassword(e.target.value)} required placeholder="Contraseña SSH" className="ssh-tunnel-menu__input" />
              </div>
              <div className="ssh-tunnel-menu__field">
                <label className="ssh-tunnel-menu__label">Host MySQL (en el host)</label>
                <input type="text" value={mysqlHost} onChange={e => setMysqlHost(e.target.value)} required placeholder="127.0.0.1" className="ssh-tunnel-menu__input" />
              </div>
              <div className="ssh-tunnel-menu__field">
                <label className="ssh-tunnel-menu__label">Puerto MySQL (en el host)</label>
                <input type="text" value={mysqlPort} onChange={e => setMysqlPort(e.target.value)} required placeholder="3306" className="ssh-tunnel-menu__input" />
              </div>
              <div className="ssh-tunnel-menu__field">
                <label className="ssh-tunnel-menu__label">Usuario MySQL</label>
                <input type="text" value={mysqlUser} onChange={e => setMysqlUser(e.target.value)} required placeholder="root" className="ssh-tunnel-menu__input" />
              </div>
              <div className="ssh-tunnel-menu__field">
                <label className="ssh-tunnel-menu__label">Contraseña MySQL</label>
                <input type="password" value={mysqlPassword} onChange={e => setMysqlPassword(e.target.value)} required placeholder="Contraseña MySQL" className="ssh-tunnel-menu__input" />
              </div>
              {error && <p className="ssh-tunnel-menu__error">{error}</p>}
              <div className="ssh-tunnel-menu__actions">
                <button type="submit" disabled={loading} className="ssh-tunnel-menu__button ssh-tunnel-menu__button--connect">
                  {loading ? 'Conectando...' : 'Conectar'}
                </button>
                <button type="button" onClick={onCancel} className="ssh-tunnel-menu__button ssh-tunnel-menu__button--disconnect">
                  Cancelar
                </button>
              </div>
            </form>
            <div style={{ fontSize: "0.95em", marginTop: "1em" }}>
              <b>¿No tienes los datos?</b> Pídele al host que te los comparta.<br />
              <b>El túnel SSH permite conectar de forma segura a la base de datos MySQL remota.</b>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SshTunnelMenu;