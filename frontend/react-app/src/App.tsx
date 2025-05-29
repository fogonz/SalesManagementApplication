// src/App.tsx
import React, { useState } from "react";
import TopBar from "./components/TopBar/TopBar";
import TableBox from "./components/TableBox/TableBox";
import SideBar from "./components/SideBar/SideBar";
import Transaction from "./components/Transaction/Transaction";
import "./App.css";

// Definí el tipo de vista posible
type Tabla = "movimientos" | "cuentas" | "productos";

function App() {
  // Estado que decide si el popup Transaction está abierto
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);

  // Estado que maneja cuál tabla está activa
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
        <TopBar />

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
}

export default App;
