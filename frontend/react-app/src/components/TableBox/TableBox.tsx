import React, { useEffect, useState } from 'react';
import './TableBox.css';
import Transaction from '../Transaction/Transaction'; // Importar el componente Transaction
import TableComponent from '../TableComponent/TableComponent';

// Interfaz actualizada para los datos de la tabla
interface UserRow {
  id: number;
  name: string;
  producto: string;
  fecha: string;
  cuenta: string;
  tipoMovimiento: string;
  abonado: number;
}

const TableBox: React.FC = () => {
    const [isTransactionOpen, setIsTransactionOpen] = useState(false);
    const [data, setData] = useState<UserRow[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

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

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    // Filtrar datos basado en el término de búsqueda
    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cuenta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tipoMovimiento.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        // Simular carga de datos desde una API 
        setTimeout(() => {
            setData([
                { id: 1, name: "Ana García", producto: "Roble", fecha: "2024-05-20", cuenta: "ACC-001", tipoMovimiento: "Depósito", abonado: 2500.00 },
                { id: 2, name: "Luis Martínez", producto: "Arroz", fecha: "2024-05-21", cuenta: "ACC-002", tipoMovimiento: "Transferencia", abonado: 1800.50 },
                { id: 3, name: "Carlos López", producto: "Azucar", fecha: "2024-05-22", cuenta: "ACC-003", tipoMovimiento: "Pago", abonado: 750.25 },
                { id: 4, name: "María Rodríguez", producto: "Hierro", fecha: "2024-05-23", cuenta: "ACC-004", tipoMovimiento: "Depósito", abonado: 3200.00 },
                { id: 5, name: "Pedro Silva", producto: "Bife", fecha: "2024-05-24", cuenta: "ACC-005", tipoMovimiento: "Retiro", abonado: 1500.75 },
                { id: 6, name: "Laura Fernández", producto: "Obeja", fecha: "2024-05-25", cuenta: "ACC-006", tipoMovimiento: "Transferencia", abonado: 2750.00 },
                { id: 7, name: "Diego Morales", producto: "Vaca", fecha: "2024-05-26", cuenta: "ACC-007", tipoMovimiento: "Depósito", abonado: 4100.25 },
                { id: 8, name: "Sofia Herrera", producto: "burro", fecha: "2024-05-27", cuenta: "ACC-008", tipoMovimiento: "Pago", abonado: 950.00 },
                { id: 9, name: "Andrés Castro", producto: "Caballo", fecha: "2024-05-28", cuenta: "ACC-009", tipoMovimiento: "Transferencia", abonado: 2200.80 },
                { id: 10, name: "Valeria Torres", producto: "Aluminio", fecha: "2024-05-29", cuenta: "ACC-010", tipoMovimiento: "Depósito", abonado: 1650.40 },
                { id: 11, name: "Roberto Jiménez", producto: "Hierro", fecha: "2024-05-30", cuenta: "ACC-011", tipoMovimiento: "Retiro", abonado: 800.00 },
                { id: 12, name: "Isabella Vargas", producto: "aaa", fecha: "2024-05-31", cuenta: "ACC-012", tipoMovimiento: "Transferencia", abonado: 3100.90 },
                { id: 13, name: "Joaquín Mendoza", producto: "aaa", fecha: "2024-06-01", cuenta: "ACC-013", tipoMovimiento: "Depósito", abonado: 2800.60 },
                { id: 14, name: "Camila Ruiz", producto: "aaa", fecha: "2024-06-02", cuenta: "ACC-014", tipoMovimiento: "Pago", abonado: 1200.30 },
                { id: 15, name: "Sebastián Ortiz", producto: "aa", fecha: "2024-06-03", cuenta: "ACC-015", tipoMovimiento: "Transferencia", abonado: 1950.70 }
            ]);
        }, 1000);
    }, []);

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
                            value={searchTerm}
                            onChange={handleSearch}
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
                    <TableComponent rows={filteredData} />
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