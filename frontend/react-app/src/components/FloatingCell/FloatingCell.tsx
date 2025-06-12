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
  currentCol?: string;
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
  } = hoveredCell;

  const isVisible = opacity > 0;

  if (!content || content === "" || content === "-") {
    return null;
  }

  return (
    <div
      className={`floating-cell ${isVisible ? "visible" : ""}`}
      style={{
        left: x,
        top: y,
		minWidth: width,
        height,
        backgroundColor: isGray ? "var(--background-color)" : background,
        color: isGray ? "white" : "black",
      }}
    >
      {symbol}
      {content}
    </div>
  );
};

export default FloatingCell;
