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
  onShowLargeList?: () => void; // nueva prop
};

const FloatingCell: React.FC<FloatingCellProps> = ({
  hoveredCell,
  isGray = false,
  // onShowLargeList ya no se usa aquí
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
    <>
      <div
        className={`floating-cell ${isVisible ? "visible" : ""}`}
        style={{
          left: x,
          top: y,
          minWidth: width, // El ancho mínimo es el de la celda original
          // Elimina maxWidth y permite que el ancho crezca según el contenido
          minHeight: Math.min(height, 220), // Limita el alto máximo
          maxHeight: 220,
          overflowY: "auto",
          backgroundColor: hoveredCell.background,
          color: isGray ? "white" : "var(--font-color-table)",
          zIndex: 1000,
          fontSize: 14,
          boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
          width: "fit-content", // Permite que el ancho crezca según el contenido
          maxWidth: "90vw", // Opcional: no exceder el viewport
        }}
      >
        {items && items.length ? (
          <>
            <div className="cellContent">
              {symbol}
              {content}
              {/* Elimina el botón de lupa aquí */}
            </div>
            <ul className="floating-list" style={{ cursor: "default" }}>
              <li className="list-header">
                <span className="">Producto</span>
                <span className="">Cantidad</span>
                <span className="">Precio</span>
                <span className="">Total</span>
              </li>
              {items.map((it, i) => (
                <li key={i}>
                  <span>{it.nombre_producto}</span>
                  <span>
                    {Number.isInteger(Number(it.cantidad))
                      ? Number(it.cantidad)
                      : Number(it.cantidad).toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                  </span>
                  <span>
                    {"$" + it.precio_unitario.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span>
                    {"$" + (it.precio_unitario * it.cantidad).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
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
      {/* El modal grande ahora lo maneja el padre */}
    </>
  );
};

export default FloatingCell;