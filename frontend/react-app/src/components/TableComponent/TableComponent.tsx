import React from 'react';
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
  return (
    <div className="table_wrapper">
      <div className="table_container">
        <div className="table_header">
          {columns.map((col) => (
            <div key={col.key as string} className="table_header__cell">
              {col.label}
            </div>
          ))}
        </div>
        <div className="table_body">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className={`table_row ${index % 2 === 0 ? 'table_row--even' : 'table_row--odd'}`}
            >
              {columns.map((col) => (
                <div key={col.key as string} className="table_cell">
                  {col.format ? col.format(row[col.key]) : row[col.key] ?? '-'}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableComponent;
