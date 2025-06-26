import { Routes, Route } from "react-router-dom";
import HelpMenu from "./pages/Help/help";
import TopBar from "./layouts/TopBar/TopBar";
import Admin from "./pages/Admin/Admin";
import { useState } from "react";
import { DataProvider } from "./contexts/DataContext";
import { Tabla, Menu, ValidTabla } from "./types";
import React from "react";


const isValidTabla = (value: string | null): value is ValidTabla => {
  return ['movimientos', 'cuentas', 'productos', 'cajachica'].includes(value as string);
};

function App() {
  const savedView = localStorage.getItem('activeView');
  const initialView = savedView && isValidTabla(savedView) ? savedView : 'movimientos';
  
  const [activeView, setActiveView] = useState<Tabla>(initialView);
  const [openMenu, setOpenMenu] = useState<Menu>(null);

  // Persist activeView on every change
  React.useEffect(() => {
    localStorage.setItem('activeView', activeView);
  }, [activeView]);

  return (
    <DataProvider>
      <TopBar
        activeView={activeView}
        setActiveView={setActiveView}
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
      />

      <Routes>
        {/* Ruta raíz */}
        <Route
          path="/"
          element={
            <Admin 
              activeView={activeView}
              setActiveView={setActiveView} 
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
            />
          }
        />

        {/* Panel de admin */}
        <Route
          path="/admin"
          element={
            <Admin 
              activeView={activeView}
              setActiveView={setActiveView} 
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
            />
          }
        />

        {/* Ayuda */}
        <Route path="/ayuda" element={<HelpMenu />} />
      </Routes>
    </DataProvider>
  );
}

export default App;