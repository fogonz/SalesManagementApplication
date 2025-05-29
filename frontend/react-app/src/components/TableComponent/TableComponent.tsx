import React, { useState, useRef } from 'react';
import './TableComponent.css';

export interface MovimientoRow {
  id: number;
  tipo_comprobante: string;
  fecha: string;
  cuenta: number;
  cantidad?: number | null;
  precio_venta?: number | null;
  total?: string | null;
  producto: number;
  numero_comprobante: number;
  saldo_diferencia?: number | null;
  concepto: string;
}

export interface CuentaRow {
  id: number;
  tipo_comprobante: string;
  fecha: string;
  cuenta: number;
  cantidad?: number | null;
  precio_venta?: number | null;
  total?: string | null;
  producto: number;
  numero_comprobante: number;
  saldo_diferencia?: number | null;
  concepto: string;
}

type ColumnDefinition = {
  key: string;
  label: string;
  format?: (value: any) => string;
};

interface TableProps {
  columns: ColumnDefinition[];
  rows: any[]; // Puede ser MovimientoRow[], CuentaRow[], etc.
}


const TableComponent: React.FC<TableProps> = ({ rows, columns }) => {
  const [trackerPosition, setTrackerPosition] = useState({ x: 0, y: 0 });
  const [isTrackerVisible, setIsTrackerVisible] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  return (
    <div className="table_wrapper" ref={tableRef}>
      <div className="table_container">
        {/* ... (header remains the same) */}
        <div className="table_body">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className={`table_row ${index % 2 === 0 ? 'table_row--even' : 'table_row--odd'}`}
            >
              {columns.map((col) => (
                <div 
                  key={col.key as string} 
                  className="table_cell"
                  onMouseMove={(e) => {
                    setTrackerPosition({
                      x: e.clientX,
                      y: e.clientY
                    });
                    setIsTrackerVisible(true);
                  }}
                  onMouseLeave={() => setIsTrackerVisible(false)}
                >
                  {col.format ? col.format(row[col.key]) : row[col.key] ?? '-'}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div 
        id="mouse-tracker"
        className="mouse-tracker"
        style={{
          left: `${trackerPosition.x}px`,
          top: `${trackerPosition.y}px`,
          opacity: isTrackerVisible ? 1 : 0
        }}
      />
    </div>
  );
};

export default TableComponent;
