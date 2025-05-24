import React from 'react';
import './TableComponent.css';

interface UserRow {
  id: number;
  name: string;
  age: number;
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
        </div>
        <div className="table_body">
          {rows.map((user) => (
            <div key={user.id} className="table_row">
              <div className="table_cell table_cell--id">{user.id}</div>
              <div className="table_cell table_cell--name">{user.name}</div>
              <div className="table_cell table_cell--age">{user.age}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableComponent;
