import React from 'react';
import './SideBar.css';
import Options_Home from './SideBarOptions/Options_Home';
import Options_Admin from './SideBarOptions/Options_Admin';
import { Tabla, AdminView } from '../../types';

interface SideBarProps {
  currentSection: string;
  activeView: Tabla;
  setActiveView?: React.Dispatch<React.SetStateAction<Tabla>>;
  currentAdminView?: AdminView;
  setCurrentAdminView?: React.Dispatch<React.SetStateAction<AdminView>>;
  isMobile?: boolean; // Agregado para manejar vista móvil
}

const SideBar: React.FC<SideBarProps> = ({
  activeView, 
  setActiveView, 
  currentAdminView, 
  setCurrentAdminView, 
  currentSection = "home",
  isMobile = false // Valor por defecto en false
}) => {
  return (
    <div className={`sidebar${isMobile ? ' mobile-hidden' : ''}`}>
      <div className="logo-section">
        <img
          src="https://static.tingelmar.com/app/uy/negocios/g/30/81030/g81030-sm-0-0-1-12411261855.jpg"
          alt="Logo"
          className="logo-img"
        />
        <div className="logo-text">
          <div className="logo-title">Maderas del Mar</div>
          <div className="logo-subtitle">
            Aplicación de Registro y<br />Administración de Inventario y Finanzas
          </div>
        </div>
      </div>

      {currentSection === "home" && setActiveView && (
        <Options_Home
          activeView={activeView as "movimientos" | "cuentas" | "productos"}
          setActiveView={setActiveView as React.Dispatch<React.SetStateAction<"movimientos" | "cuentas" | "productos">>}
          toggleActive={() => {}}
        />
      )}
      {currentSection === "admin" && setActiveView && setCurrentAdminView && (
        <Options_Admin 
          activeView={activeView as "movimientos" | "cuentas" | "productos" | "cajachica"}
          setActiveView={setActiveView as React.Dispatch<React.SetStateAction<"movimientos" | "cuentas" | "productos" | "cajachica">>}
          currentAdminView={currentAdminView}
          setCurrentAdminView={setCurrentAdminView}
        />
      )}
    </div>
  );
}

export default SideBar;