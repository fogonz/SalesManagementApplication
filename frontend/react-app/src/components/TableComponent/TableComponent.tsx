import React, { useState, useRef } from 'react';
import './TableComponent.css';

export interface MovimientoRow {
  id: number;
  fecha: string;
  tipo_comprobante: string;
  cuenta_id: number;
  producto_id: number;
  total: string | number | null;
  name?: string;
  producto?: string;
  cuenta?: string;
  tipoMovimiento?: string;
  abonado?: number | null;
}

export interface CuentaRow {
  id: number;
  nombre: string;
  contacto_mail: string;
  contacto_telefono: string;
  tipo_cuenta: string;
  saldo?: number | null;
  tipo?: string;
}

export interface ProductoRow {
  id: number;
  descripcion: string;
  stock: number | null;
  precio: number | null;
}

type ColumnDefinition = {
  key: string;
  label: string;
  format?: (value: any) => string;
};

interface TableProps {
  columns: ColumnDefinition[];
  rows: MovimientoRow[] | CuentaRow[] | ProductoRow[];
}

const TableComponent: React.FC<TableProps> = ({ rows, columns }) => {
  const [trackerPosition, setTrackerPosition] = useState({ x: 0, y: 0 });
  const [isTrackerVisible, setIsTrackerVisible] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Si no hay filas, mostrar mensaje
  if (!rows || rows.length === 0) {
    return (
      <div className="table_wrapper" ref={tableRef}>
        <div className="table_container">
          <div className="table_header">
            {columns.map((col) => (
              <div key={col.key} className="table_header__cell">
                {col.label}
              </div>
            ))}
          </div>
          <div className="table_body">
            <div className="no-data-message">
              No hay datos disponibles
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="table_wrapper" ref={tableRef}>
      <div className="table_container">
        {/* Table Header */}
        <div className="table_header">
          {columns.map((col) => (
            <div key={col.key} className="table_header__cell">
              {col.label}
            </div>
          ))}
        </div>
        
        {/* Table Body */}
        <div className="table_body">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className={`table_row ${index % 2 === 0 ? 'table_row--even' : 'table_row--odd'}`}
            >
              {columns.map((col) => (
                <div
                  key={col.key}
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
                  {col.format ? col.format((row as any)[col.key]) : (row as any)[col.key] ?? '-'}
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