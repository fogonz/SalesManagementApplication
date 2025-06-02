import React from 'react';
import './SideBar.css';
import { useEffect } from 'react';
import Options_Home from './SideBarOptions/Options_Home';
import Options_Admin from './SideBarOptions/Options_Admin';

type Tabla = 'movimientos' | 'cuentas' | 'productos';

interface SideBarProps {
  setActiveView?: React.Dispatch<React.SetStateAction<Tabla>>;
  currentSection: string;
}

const SideBar: React.FC<SideBarProps> = ({setActiveView, currentSection="home"}) => {
  const toggleActive = (event) => {
    const buttons = document.querySelectorAll('.menu-button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
  };

  useEffect(() => {
    if (setActiveView) {
      setActiveView("movimientos");
    }

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

      {currentSection === "home" && (
          <Options_Home setActiveView={setActiveView} toggleActive={toggleActive} />
      )}
      {currentSection === "admin" && (
          <Options_Admin setActiveView={setActiveView} toggleActive={toggleActive} />
      )}
    </div>
  );
}

export default SideBar;
