import { useState } from "react";
import TopBar from "../../layouts/TopBar/TopBar";
import SideBar from "../../layouts/SideBar/SideBar";
import TableBox from "../../components/TableBox/TableBox";
import Transaction from "../../components/Transaction/Transaction";

type Tabla = "movimientos" | "cuentas" | "productos";

const Home = () => {
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [activeView, setActiveView] = useState<Tabla>("movimientos");
  const [refreshTrigger, setRefreshTrigger] = useState(0); 

  const handleOpenTransaction = () => setIsTransactionOpen(true);
  const handleCloseTransaction = () => setIsTransactionOpen(false);
  const handleAcceptTransaction = () => {
    console.log("Transacción aceptada");
    setIsTransactionOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app-wrapper">
      <div className={`app-content ${isTransactionOpen ? "blurred" : ""}`}>
        <div className="row">
          <SideBar activeView={activeView} setActiveView={setActiveView} currentSection="home"/>
          <TableBox
            onOpenTransaction={handleOpenTransaction}
            activeView={activeView}
            setActiveView={setActiveView}
            refreshTrigger={refreshTrigger} 
          />
        </div>
      </div>
      {isTransactionOpen && (
        <Transaction
          onClose={handleCloseTransaction}
          onAccept={handleAcceptTransaction}
        />
      )}
    </div>
  );
};

export default Home;
