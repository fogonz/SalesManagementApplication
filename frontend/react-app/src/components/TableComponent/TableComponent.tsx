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
          <div className="table_header__cell table_header__cell--id">ID</div>
          <div className="table_header__cell table_header__cell--date">Fecha</div>
          <div className="table_header__cell table_header__cell--account">Cuenta</div>
          <div className="table_header__cell table_header__cell--product">Producto</div>
          <div className="table_header__cell table_header__cell--movement">Tipo</div>
          <div className="table_header__cell table_header__cell--amount">Cantidad</div>
          <div className="table_header__cell table_header__cell--amount">P. Venta</div>
          <div className="table_header__cell table_header__cell--amount">Total</div>
          <div className="table_header__cell table_header__cell--amount">Saldo Dif.</div>
          <div className="table_header__cell table_header__cell--movement">Concepto</div>
        </div>
        <div className="table_body">
          {rows.map((mov, index) => (
            <div
              key={mov.id}
              className={`table_row ${index % 2 === 0 ? 'table_row--even' : 'table_row--odd'}`}
            >
              <div className="table_cell table_cell--id">{mov.id}</div>
              <div className="table_cell table_cell--date">{mov.fecha}</div>
              <div className="table_cell table_cell--account">{mov.cuenta}</div>
              <div className="table_cell table_cell--product">{mov.producto}</div>
              <div className="table_cell table_cell--movement">{mov.tipo_comprobante}</div>
              <div className="table_cell table_cell--amount">
                {mov.cantidad != null ? mov.cantidad : '-'}
              </div>
              <div className="table_cell table_cell--amount">
                {mov.precio_venta != null ? `$${mov.precio_venta.toFixed(2)}` : '-'}
              </div>
              <div className="table_cell table_cell--amount">
                {mov.total != null ? `$${parseFloat(mov.total).toFixed(2)}` : '-'}
              </div>
              <div className="table_cell table_cell--amount">
                {mov.saldo_diferencia != null ? `$${mov.saldo_diferencia.toFixed(2)}` : '-'}
              </div>
              <div className="table_cell table_cell--movement">{mov.concepto}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableComponent;