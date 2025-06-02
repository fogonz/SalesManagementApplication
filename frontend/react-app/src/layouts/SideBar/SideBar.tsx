import React from 'react';
import './SideBar.css';
import { useEffect } from 'react';

type Tabla = 'movimientos' | 'cuentas' | 'productos';

interface SideBarProps {
  setActiveView: React.Dispatch<React.SetStateAction<Tabla>>;
}

const SideBar: React.FC<SideBarProps> = ({setActiveView}) => {
  const toggleActive = (event) => {
    const buttons = document.querySelectorAll('.menu-button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
  };

  useEffect(() => {
    setActiveView("movimientos");

    // 2. Find the MOVIMIENTOS button (we know it's the first .menu-button) and add "active"
    const firstBtn = document.querySelector<HTMLButtonElement>(".menu-button");
    if (firstBtn) {
      firstBtn.classList.add("active");
    }
  }, [setActiveView])

  return (
    <div className="sidebar">
      <div className="logo-section">
        <img
          src="https://www.chile.ferreteriascercademi.com/wp-content/uploads/2023/01/AF1QipP47hhyrLPk3aRQDARC3EjtbgWFBXdNh3zfowBnw408-h306-k-no.jpeg"
          alt="Logo"
        />
        <div className="logo-text">
          <div className="logo-title">Ferretería Lo de Pablo</div>
          <div className="logo-subtitle">
            Aplicación de Registro y<br />Administración de Ventas
          </div>
        </div>
      </div>

      <div className="sidebar-menu-container">
        <button className="menu-button" onClick={(e) => {setActiveView('movimientos'); toggleActive(e);}}>
          <i className="fas fa-home"></i> MOVIMIENTOS
        </button>
        <button className="menu-button" onClick={(e) => {setActiveView('cuentas'); toggleActive(e);}}>
          <i className="fas fa-circle-user"></i> CUENTAS
        </button>
        <button className="menu-button" onClick={(e) => {setActiveView('productos'); toggleActive(e);}}>
          <i className="fas fa-boxes"></i> STOCK
        </button>
      </div>
    </div>
  );
}

export default SideBar;
