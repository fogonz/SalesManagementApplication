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
  content?: string;
  symbolAfter,
  isAdmin,
  editable,
  currentCol?: string;
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
    symbolAfter,
    isAdmin,
    editable,
    items,
  } = hoveredCell;

  const isVisible = opacity > 0;

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
        backgroundColor: isGray ? "var(--background-color)" : background,
        color: isGray ? "white" : "var(--font-color-table)",
      }}
    >
      {items && items.length ? (
        <>
          <div className="content">
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
          <div className="content">
            {symbol}
            {content}
            {symbolAfter}
            {isAdmin && editable && (<i className='fas fa-pen right'></i>)}
          </div>
        </>
      )}
    </div>
  );
};

export default FloatingCell;
