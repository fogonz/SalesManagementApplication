import { useState } from "react";
import TopBar from "../../layouts/TopBar/TopBar";
import SideBar from "../../layouts/SideBar/SideBar";
import TableBox from "../../components/TableBox/TableBox";
import Transaction from "../../components/Transaction/Transaction";

type Tabla = "movimientos" | "cuentas" | "productos";

const Home = () => {
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [activeView, setActiveView] = useState<Tabla>("movimientos");

  const handleOpenTransaction = () => setIsTransactionOpen(true);
  const handleCloseTransaction = () => setIsTransactionOpen(false);
  const handleAcceptTransaction = () => {
    console.log("Transacción aceptada");
    setIsTransactionOpen(false);
  };

  return (
    <div className="app-wrapper">
      <div className={`app-content ${isTransactionOpen ? "blurred" : ""}`}>
        <div className="row">
          <SideBar setActiveView={setActiveView} />
          <TableBox
            onOpenTransaction={handleOpenTransaction}
            activeView={activeView}
            setActiveView={setActiveView}
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
