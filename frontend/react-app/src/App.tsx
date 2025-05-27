// src/App.tsx
import React, { useState } from "react";
import TopBar from "./components/TopBar/TopBar";
import TableBox from "./components/TableBox/TableBox";
import SideBar from "./components/SideBar/SideBar";
import Transaction from "./components/Transaction/Transaction";
import "./App.css";

function App() {
  // Estado que decide si el popup Transaction está abierto
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);

  // Handler que pasaremos a TableBox para "abrir" el popup
  const handleOpenTransaction = () => setIsTransactionOpen(true);

  // Cuando cierren o acepten en el popup, cerramos
  const handleCloseTransaction = () => {
    setIsTransactionOpen(false);
  };

  const handleAcceptTransaction = () => {
    console.log("Transacción aceptada");
    setIsTransactionOpen(false);
  };

  return (
    <div className="app-wrapper">
      <div className={`app-content ${isTransactionOpen ? "blurred" : ""}`}>
        <TopBar></TopBar>

        <div className="row">
          <SideBar />
          <TableBox onOpenTransaction={handleOpenTransaction} />
        </div>

      </div>

      {/* Renderizar Transaction si: isTransactionOpen = true */}
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
