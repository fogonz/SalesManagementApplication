import React from "react";
import "./FloatingCell.css";

export type HoveredCell = {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  background: string;
  symbol?: string;
  symbolAfter?: string;
  content?: string;
  currentCol?: string;
  isEditable?: boolean;
  items?: { nombre_producto: string, precio_unitario: number , cantidad: number}[]
};

type FloatingCellProps = {
  hoveredCell: HoveredCell;
  isGray?: boolean;
};

const FloatingCell: React.FC<FloatingCellProps> = ({
  hoveredCell,
  isGray = false,
}) => {
  const {
    x,
    y,
    width,
    height,
    opacity,
    background,
    symbol,
    content,
    items,
    symbolAfter,
    isEditable
  } = hoveredCell;

  const isVisible = opacity > 0;

  // Si no hay contenido ni items, no renderizar
  if ((!content || content === "-") && (!items || items.length === 0)) {
    return null;
  }

  return (
    <div
      className={`floating-cell ${isVisible ? "visible" : ""}`}
      style={{
        left: x,
        top: y,
        minWidth: width,
        minHeight: height,
        backgroundColor: hoveredCell.background,
        color: isGray ? "white" : "var(--font-color-table)",
      }}
    >
      {items && items.length ? (
        <>
          <div className="cellContent">
            {symbol}
            {content}
          </div>
          <ul className="floating-list">
            <li className="list-header">
              <span>Producto</span>
              <span>Cantidad</span>
            </li>
            {items.map((it, i) => (
              <li key={i}>
                <span>{it.nombre_producto}</span>
                <span>{it.cantidad}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <div className="cellContent">
            {symbol}
            {content}
            {symbolAfter}
            {hoveredCell.isEditable && <i className="fas fa-pen"></i>}
          </div>
        </>
      )}
    </div>
  );
};

export default FloatingCell;