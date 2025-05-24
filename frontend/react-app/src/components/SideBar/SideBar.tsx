import React from 'react';
import './SideBar.css';

function SideBar() {
  const toggleActive = (event) => {
    const buttons = document.querySelectorAll('.menu-button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
  };

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
        <button className="menu-button" onClick={toggleActive}>
          <i className="fas fa-home"></i> MOVIMIENTOS
        </button>
        <button className="menu-button" onClick={toggleActive}>
          <i className="fas fa-cash-register"></i> CAJA CHICA
        </button>
        <button className="menu-button" onClick={toggleActive}>
          <i className="fas fa-boxes"></i> STOCK
        </button>
        <button className="menu-button" onClick={toggleActive}>
          <i className="fas fa-address-card"></i> CUENTAS
        </button>
      </div>
    </div>
  );
}

export default SideBar;
