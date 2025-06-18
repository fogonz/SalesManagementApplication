import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import HelpMenu from "./pages/Help/help";
import TopBar from "./layouts/TopBar/TopBar";
import Admin from "./pages/Admin/Admin";
import { useState } from "react";
import { DataProvider } from "./contexts/DataContext";

type Tabla = "movimientos" | "cuentas" | "productos";
type Menu = 'transaction' | 'account' | 'product' | null;

function App() {
  const [activeView, setActiveView] = useState<Tabla>('movimientos');
  const [openMenu, setOpenMenu] = useState<Menu>(null);
  
  return (
    <DataProvider>
      <Routes>
        {/* MAIN PATH - HOME */}
        <Route path="/" element={
          <div>
            <TopBar />
            <Home
              activeView={activeView}
              setActiveView={setActiveView}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
            />
          </div>
        } />

        {/* HELP PATH */}
        <Route path="/ayuda" element={
          <div>
            <TopBar />
            <HelpMenu />
          </div>
        } />
              
        {/* ADMIN PATH */}
        <Route path="/admin" element={
          <div>
            <TopBar />
            <Admin
              activeView={activeView}
              setActiveView={setActiveView}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
            />
          </div>
        } />
      </Routes>
    </DataProvider>
  );
}

export default App;