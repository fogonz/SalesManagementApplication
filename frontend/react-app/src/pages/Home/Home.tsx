import React, { useState, useEffect } from "react";
import TopBar from "../../layouts/TopBar/TopBar";
import SideBar from "../../layouts/SideBar/SideBar";
import TableBox from "../../layouts/TableBox/TableBox";
import Transaction from "../../layouts/menus/NewTransaction/NewTransaction";
import NewAccount from "../../layouts/menus/NewAccount/NewAccount";
import NewProduct from "../../layouts/menus/NewProduct/NewProduct";
import { ValidTabla, Tabla, Menu, HomeProps } from "../../types";

const Home: React.FC<HomeProps> = ({ activeView, setActiveView, openMenu, setOpenMenu }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const savedView = localStorage.getItem('activeView') as Tabla;
    if (savedView) {
      setActiveView(savedView);
    }
  }, [setActiveView]);

  useEffect(() => {
    localStorage.setItem('activeView', activeView);
  }, [activeView]);

  const open = (menu: Exclude<Menu, null>) => setOpenMenu(menu);
  const close = () => setOpenMenu(null);

  const handleAcceptTransaction = () => {
    console.log("Transacción aceptada");
    close();
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAcceptAccount = () => {
    console.log("Cuenta guardada");
    close();
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAcceptProduct = () => {
    console.log("Producto guardado");
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
          isAdmin={false}
          activeView={activeView as ValidTabla}
          setActiveView={setActiveView}
          refreshTrigger={refreshTrigger}
          onOpenMenu={() => open(
            activeView === 'movimientos' ? 'transaction' : 
            activeView === 'cuentas' ? 'account' : 
            activeView === 'productos' ? 'product' :
            'transaction'
          )}
        />
      </div>

      {openMenu === 'transaction' && (
        <Transaction onClose={close} onAccept={handleAcceptTransaction} />
      )}
      {openMenu === 'account' && (
        <NewAccount onClose={close} onAccept={handleAcceptAccount} />
      )}
      {openMenu === 'product' && (
        <NewProduct onClose={close} onAccept={handleAcceptProduct} />
      )}
    </div>
  );
};

export default Home;