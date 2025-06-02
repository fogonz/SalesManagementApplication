import React from "react";
import "../Chart.css"

// Datos de ejemplo de ventas diarias
const salesData: { day: number; value: number }[] = [
  { day: 1, value: 25 },
  { day: 2, value: 22 },
  { day: 3, value: 28 },
  { day: 4, value: 32 },
  { day: 5, value: 30 },
  { day: 6, value: 35 },
  { day: 7, value: 33 },
];

const SalesChart: React.FC = () => {
  return (
    <svg width="200" height="100" className="chart-svg">
      {/* Líneas de grid horizontales (valores 0,10,20,30,40) */}
      {[0, 10, 20, 30, 40].map((y) => (
        <line
          key={y}
          className="grid-line"
          x1={20}
          y1={80 - y * 1.5}
          x2={180}
          y2={80 - y * 1.5}
        />
      ))}

      {/* Etiquetas eje Y */}
      {[0, 10, 20, 30, 40].map((y) => (
        <text
          key={y}
          className="axis-label"
          x={15}
          y={85 - y * 1.5}
          textAnchor="end"
        >
          {y}
        </text>
      ))}

      {/* Línea de ventas */}
      <polyline
        className="sales-line"
        points={salesData
          .map((d, i) => `${30 + i * 22},${80 - d.value * 1.5}`)
          .join(" ")}
      />

      {/* Puntos de ventas */}
      {salesData.map((d, i) => (
        <circle
          key={i}
          className="sales-point"
          cx={30 + i * 22}
          cy={80 - d.value * 1.5}
          r={3}
        />
      ))}

      {/* Etiquetas eje X (días 1–7) */}
      {[1, 2, 3, 4, 5, 6, 7].map((day, i) => (
        <text
          key={day}
          className="axis-label"
          x={30 + i * 22}
          y={95}
          textAnchor="middle"
        >
          {day}
        </text>
      ))}
    </svg>
  );
};

export default SalesChart;
