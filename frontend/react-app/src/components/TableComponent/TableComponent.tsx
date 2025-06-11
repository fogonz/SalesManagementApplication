import React, { useState, useRef } from 'react';
import './TableComponent.css';
import { getCellColorClass } from '../../config/rowColors';

export interface MovimientoRow {
  id: number;
  fecha: string;
  tipo: string;
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
  tableType: 'movimientos' | 'cuentas' | 'productos';
}

const TableComponent: React.FC<TableProps> = ({ rows, columns, tableType }) => {
  const tableRef = useRef<HTMLDivElement>(null);
  console.log(tableType)

  const [hoveredCell, setHoveredCell] = useState<{
    content: React.ReactNode;
    x: number;
    y: number;
    width: number;
    height: number;
    opacity: number;
    background: string;
  } | null>(null);

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
            <div className="no-data-message">No hay datos disponibles</div>
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
          {rows.map((row, index) => {
            const tipoCol: ColumnDefinition | undefined = tableType === "movimientos"
            ? columns.find(col => col.key === 'tipo')
            : columns.find(col => col.key === 'tipo_cuenta');

            const tipoContent = tipoCol
              ? (tipoCol.format ? tipoCol.format((row as any)[tipoCol.key]) : (row as any)[tipoCol.key])
              : '';

            const color = getCellColorClass(tipoContent, tableType);

            return(
            <div
              key={row.id}
              className="table_row"
              style={{ backgroundColor: color}}
            >
              {columns.map((col) => {
                const content = col.format?.((row as any)[col.key]) ?? (row as any)[col.key] ?? '-';
                return (
                  <div
                    key={col.key}
                    className="table_cell"

                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const wrapperRect = tableRef.current?.getBoundingClientRect();
                    
                      if (!wrapperRect || content==='') return;
                    
                      setHoveredCell({
                        content,
                        x: rect.left - wrapperRect.left,
                        y: rect.top - wrapperRect.top,
                        width: rect.width,
                        height: rect.height,
                        opacity: 1,
                        background: color
                      });
                      }}

                    onMouseLeave={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const wrapperRect = tableRef.current?.getBoundingClientRect();
                    
                      if (!wrapperRect) return;
                      setHoveredCell({
                      content,
                      x: rect.left - wrapperRect.left,
                      y: rect.top - wrapperRect.top,
                      width: 0,
                      height: 0,
                      opacity: 0,
                      background: 'white'

                      });
                    }}
                  >
                    {content}
                  </div>
                );
              })}

            </div>
          )})}
        </div>

        {/* Floating Cell */}
        {hoveredCell && (
          <div
            className="floating-cell"
            style={{
              left: hoveredCell.x,
              top: hoveredCell.y,
              width: 'max-content',
              height: hoveredCell.height,
              position: 'absolute', 
              opacity: hoveredCell.opacity,
              backgroundColor: hoveredCell.background

            }}
          >
            {hoveredCell.content}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableComponent;
