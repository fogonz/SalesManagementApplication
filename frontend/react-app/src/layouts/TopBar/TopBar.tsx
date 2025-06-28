import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'
import './TopBar.css';
import './DarkMode.css';
import { useState, useEffect } from 'react';
import { TopBarProps } from '../../types';
import SaldoMenu from './SaldoMenu';

const TopBar: React.FC<TopBarProps> = ({activeView, setActiveView, openMenu, setOpenMenu }) => {
  const [state, setState] = useState<"1" | "2" | "0">("1");
  const [darkMode, setDarkMode] = useState(false);
  const [saldoMenuVisible, setSaldoMenuVisible] = useState(false);
  const [saldoActual, setSaldoActual] = useState<number | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  const setActive = (value: "1" | "2") => {
    setState(value);
  };

  // Determinar el estado activo basado en la ruta actual
  useEffect(() => {
    const currentPath = location.pathname;
    
    if (currentPath === '/admin') {
      setState("2");
    } else if (currentPath === '/ayuda') {
      setState("0");
    } else if (currentPath === '/') {
      setState("1");
    }
  }, [location.pathname]);

  // Cargar preferencia de modo oscuro desde localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode')
    if (savedMode === 'enabled') {
      setDarkMode(true)
      document.body.classList.add('dark-mode')
    }
  }, [])

  // Actualizar clase del body cada vez que cambia darkMode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode')
      localStorage.setItem('darkMode', 'enabled')
    } else {
      document.body.classList.remove('dark-mode')
      localStorage.setItem('darkMode', 'disabled')
    }
  }, [darkMode])

  // Fetch saldo actual al abrir el menú
  useEffect(() => {
    if (saldoMenuVisible) {
      fetch('/api/saldo/')
        .then(res => res.json())
        .then(data => {
          setSaldoActual(data.saldo_inicial); // <-- Cambia a saldo_inicial
        });
    }
  }, [saldoMenuVisible]);

  const handleSaveSaldo = async (nuevoSaldo: number) => {
    await fetch('/api/saldo/', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ saldo_inicial: nuevoSaldo }) // <-- Cambia a saldo_inicial
    });
    setSaldoMenuVisible(false);
    setSaldoActual(nuevoSaldo);
    // Opcional: notificar o refrescar
  };

  const sectionHelp = () => {
    navigate('/ayuda')
  }

  const sectionAdmin = () => {
    navigate('/admin')
  }

  const sectionHome = () => {
    navigate('/')
  }

  // Handler para logout
  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    window.location.reload();
  };

  return (
    <div className="header-top">
      {/* Botón recargar página completamente a la izquierda */}
      <button
        className="topbar-refresh-btn"
        title="Recargar página"
        style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: 16 }}
        onClick={() => window.location.reload()}
      >
        <i className="fas fa-rotate-right" style={{ color: 'white' }} />
      </button>
      <div className="header-right-controls">
        {/* Botón Logout */}
        <button
          className="topbar-logout-btn"
          title="Cerrar sesión"
          style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 8, color: 'white' }}
          onClick={handleLogout}
        >
          <i className="fas fa-sign-out-alt" style={{ marginRight: '6px' }} /> Cerrar sesión
        </button>
        {/* Botón engranaje para saldo */}
        <button
          className="topbar-gear-btn"
          title="Editar saldo"
          style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 8 }}
          onClick={() => setSaldoMenuVisible(true)}
        >
          <i className="fas fa-gear" />
        </button>
        {/* Dark Mode Toggle */}
        <div className="dark-mode-container">
                     
          <label className="switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode((prev) => !prev)}
            />
            <span className="slider"></span>
          </label>
        </div>
                 
        {/* Help Button 
        <button onClick={() => {sectionHelp(); setState("0")}} className="header-icon">
          <i className="fas fa-question"></i>
        </button>
        */}
      </div>
      <SaldoMenu
        visible={saldoMenuVisible}
        onClose={() => setSaldoMenuVisible(false)}
        onSave={handleSaveSaldo}
        saldoActual={saldoActual}
      />
    </div>
  );
};

export default TopBar;