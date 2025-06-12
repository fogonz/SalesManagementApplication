import { useState } from "react";
import TopBar from "../../layouts/TopBar/TopBar";
import SideBar from "../../layouts/SideBar/SideBar";
import TableBox from "../../components/TableBox/TableBox";
import Transaction from "../../layouts/menus/NewTransaction/NewTransaction";
import NewAccount from "../../layouts/menus/NewAccount/NewAccount";

type Tabla = "movimientos" | "cuentas" | "productos";
type Menu = 'transaction' | 'account' | 'product' | null;

const Home = () => {
  const [openMenu, setOpenMenu] = useState<Menu>(null);
  const [activeView, setActiveView] = useState<Tabla>('movimientos');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const open = (menu: Exclude<Menu, null>) => setOpenMenu(menu);
  const close = () => setOpenMenu(null);

  const handleAcceptTransaction = () => {
    console.log("Transacción aceptada");
    close();
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app-wrapper">
      <div className={`app-content ${openMenu ? "blurred" : ""}`}>
        <SideBar
          activeView={activeView}
          setActiveView={setActiveView}
          currentSection="home"
        />
        <TableBox
          activeView={activeView}
          setActiveView={setActiveView}
          refreshTrigger={refreshTrigger}
          onOpenMenu={() => open(
            activeView === 'movimientos'
              ? 'transaction'
              : activeView === 'cuentas'
              ? 'account'
              : 'product'
          )}
        />
      </div>

      {/* Renderizas cada modal según openMenu */}
      {openMenu === 'transaction' && (
        <Transaction onClose={close} onAccept={handleAcceptTransaction} />
      )}
      {openMenu === 'account' && (
        <NewAccount onClose={close} onAccept={handleAcceptTransaction} />
      )}
      {openMenu === 'product' && (
        <Transaction onClose={close} onAccept={() => {
          console.log("Producto creado");
          close();
          setRefreshTrigger(prev => prev + 1);
        }} />
      )}
    </div>
  );
};


export default Home;
