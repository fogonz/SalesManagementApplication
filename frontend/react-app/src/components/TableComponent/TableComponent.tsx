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

interface TableProps {
  rows: MovimientoRow[];
}

const TableComponent: React.FC<TableProps> = ({ rows }) => {
  return (
    <div className="table_wrapper">
      <div className="table_container">
        <div className="table_header">
          <div className="table_header__cell">ID</div>
          <div className="table_header__cell">Fecha</div>
          <div className="table_header__cell">Cuenta</div>
          <div className="table_header__cell">Producto</div>
          <div className="table_header__cell">Tipo</div>
          <div className="table_header__cell">Cantidad</div>
          <div className="table_header__cell">Precio Venta</div>
          <div className="table_header__cell">Total</div>
          <div className="table_header__cell">Saldo Diferencia</div>
          <div className="table_header__cell">Concepto</div>
        </div>
        <div className="table_body">
          {rows.map((mov, index) => (
            <div
              key={mov.id}
              className={`table_row ${index % 2 === 0 ? 'table_row--even' : 'table_row--odd'}`}
            >
              <div className="table_cell">{mov.id}</div>
              <div className="table_cell">{mov.fecha}</div>
              <div className="table_cell">{mov.cuenta}</div>
              <div className="table_cell">{mov.producto}</div>
              <div className="table_cell">{mov.tipo_comprobante}</div>
              <div className="table_cell">
                {mov.cantidad != null ? mov.cantidad : '-'}
              </div>
              <div className="table_cell">
                {mov.precio_venta != null ? `\$${mov.precio_venta.toFixed(2)}` : '-'}
              </div>
              <div className="table_cell">
                {mov.total != null ? `\$${parseFloat(mov.total).toFixed(2)}` : '-'}
              </div>
              <div className="table_cell">
                {mov.saldo_diferencia != null ? `\$${mov.saldo_diferencia.toFixed(2)}` : '-'}
              </div>
              <div className="table_cell">{mov.concepto}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableComponent;
