import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import HelpMenu from "./pages/Help/help";
import TopBar from "./layouts/TopBar/TopBar";
import Admin from "./pages/Admin/Admin";
import { useState } from "react";
import { DataProvider } from "./contexts/DataContext";

type Tabla = "movimientos" | "cuentas" | "productos";
type Menu = 'transaction' | 'account' | 'product' | null;

const isValidTabla = (value: string): value is Tabla => {
  return ['movimientos', 'cuentas', 'productos'].includes(value);
};

function App() {
  const savedView = localStorage.getItem('activeView');
  const initialView = savedView && isValidTabla(savedView) ? savedView : 'movimientos';
  
  const [activeView, setActiveView] = useState<Tabla>(initialView);
  const [openMenu, setOpenMenu] = useState<Menu>(null);

  return (
    <DataProvider>
      <TopBar
        activeView={activeView}
        setActiveView={setActiveView}
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
      />
      <Routes>
        <Route path="/" element={
          <Home 
            activeView={activeView}
            setActiveView={setActiveView}
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
          />
        } />
        <Route path="/ayuda" element={<HelpMenu />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </DataProvider>
  );
}

export default App;