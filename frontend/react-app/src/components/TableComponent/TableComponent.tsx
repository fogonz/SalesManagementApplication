import React from 'react';
import './TableComponent.css';

interface UserRow {
  id: number;
  name: string;
  age: number;
  fecha: string;
  cuenta: string;
  tipoMovimiento: string;
  abonado: number;
}

interface TableProps {
  rows: UserRow[];
}

const TableComponent: React.FC<TableProps> = ({ rows }) => {
  return (
    <div className="table_wrapper">
      <div className="table_container">
        <div className="table_header">
          <div className="table_header__cell table_header__cell--id">ID</div>
          <div className="table_header__cell table_header__cell--name">Nombre</div>
          <div className="table_header__cell table_header__cell--age">Edad</div>
          <div className="table_header__cell table_header__cell--date">Fecha</div>
          <div className="table_header__cell table_header__cell--account">Cuenta</div>
          <div className="table_header__cell table_header__cell--movement">Tipo de Movimiento</div>
          <div className="table_header__cell table_header__cell--amount">Abonado</div>
        </div>
        <div className="table_body">
          {rows.map((user, index) => (
            <div 
              key={user.id} 
              className={`table_row ${index % 2 === 0 ? 'table_row--even' : 'table_row--odd'}`}
            >
              <div className="table_cell table_cell--id">{user.id}</div>
              <div className="table_cell table_cell--name">{user.name}</div>
              <div className="table_cell table_cell--age">{user.age}</div>
              <div className="table_cell table_cell--date">{user.fecha}</div>
              <div className="table_cell table_cell--account">{user.cuenta}</div>
              <div className="table_cell table_cell--movement">{user.tipoMovimiento}</div>
              <div className="table_cell table_cell--amount">
                ${user.abonado.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableComponent;