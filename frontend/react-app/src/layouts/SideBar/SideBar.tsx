import React from 'react';
import './SideBar.css';
import Options_Home from './SideBarOptions/Options_Home';
import Options_Admin from './SideBarOptions/Options_Admin';

type Tabla = 'movimientos' | 'cuentas' | 'productos';
type AdminView = 'estadisticas' | 'historial' | 'movimientos' | 'cuentas' | 'productos' | 'exportar';

interface SideBarProps {
  currentSection: string;
  activeView: Tabla;
  setActiveView?: React.Dispatch<React.SetStateAction<Tabla>>;
  currentAdminView?: AdminView;
  setCurrentAdminView?: React.Dispatch<React.SetStateAction<AdminView>>;
}

const SideBar: React.FC<SideBarProps> = ({
  activeView, 
  setActiveView, 
  currentAdminView, 
  setCurrentAdminView, 
  currentSection = "home"
}) => {
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
        <Options_Home 
          activeView={activeView}
          setActiveView={setActiveView} toggleActive={function (e: React.MouseEvent<HTMLButtonElement>): void {
            throw new Error('Function not implemented.');
          } }        />
      )}
      {currentSection === "admin" && (
        <Options_Admin 
          activeView={activeView}
          currentAdminView={currentAdminView}
          setCurrentAdminView={setCurrentAdminView} setActiveView={function (value: React.SetStateAction<'movimientos' | 'cuentas' | 'productos'>): void {
            throw new Error('Function not implemented.');
          } }        />
      )}
    </div>
  );
}

export default SideBar;