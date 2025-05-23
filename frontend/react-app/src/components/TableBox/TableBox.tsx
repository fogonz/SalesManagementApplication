import React, { useState } from 'react';
import './TableBox.css';
import Transaction from '../Transaction/Transaction'; // Importar el componente Transaction

const TableBox: React.FC = () => {
    const [isTransactionOpen, setIsTransactionOpen] = useState(false);

    const handleAddMovement = () => {
        setIsTransactionOpen(true);
    };

    const handleCloseTransaction = () => {
        setIsTransactionOpen(false);
    };

    const handleAcceptTransaction = () => {
        // Aquí puedes agregar la lógica para procesar la transacción
        console.log("Transacción aceptada");
        setIsTransactionOpen(false);
    };

    return(
        <div className="content-container">
            <div className="content-box">
                <div className="toolbar">
                    <div className="toolbar-nav">
                        <div className="toolbar-icon">
                            <i className="fas fa-home"></i>
                        </div>
                        <div className="toolbar-icon">
                            <i className="fas fa-list"></i>
                        </div>
                        <div className="toolbar-icon">
                            <i className="fas fa-table"></i>
                        </div>
                    </div>

                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar movimientos..."
                        />
                        <button className="search-button">
                            <i className="fas fa-search"></i>
                        </button>
                    </div>
                    
                    <div className="toolbar-actions">
                        <button className="action-button">
                            <i className="fas fa-filter"></i>
                        </button>
                        <button className="action-button">
                            <i className="fas fa-sort"></i>
                        </button>
                        <button className="add-button" onClick={handleAddMovement}>
                            <span>Añadir Movimiento</span>
                            <i className="fas fa-plus"></i>
                        </button>
                    </div>
                </div>

                <div id="table-container">
                    <div id="root"></div>
                </div>
            </div>

            {/* Renderizar el componente Transaction condicionalmente */}
            {isTransactionOpen && (
                <Transaction 
                    onClose={handleCloseTransaction}
                    onAccept={handleAcceptTransaction}
                />
            )}
        </div>
    );
};

export default TableBox;