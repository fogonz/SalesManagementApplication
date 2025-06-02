import React from "react";
import "../Chart.css"; // Asume que defines aquí las clases .chart-svg, .roi-line, .roe-line, .roi-point, .roe-point

// Datos de ejemplo para ROI y ROE
const roiData: { x: number; roi: number; roe: number }[] = [
  { x: 1, roi: 22, roe: 8 },
  { x: 2, roi: 28, roe: 12 },
  { x: 3, roi: 25, roe: 15 },
  { x: 4, roi: 30, roe: 18 },
  { x: 5, roi: 32, roe: 16 },
  { x: 6, roi: 28, roe: 20 },
  { x: 7, roi: 35, roe: 13 },
];

const ROIChart: React.FC = () => {
  return (
    <svg width="180" height="80" className="chart-svg">
      <defs>
        <linearGradient id="roiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="roeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#fca5a5" />
        </linearGradient>
      </defs>

      {/* Línea ROI (verde) */}
      <polyline
        className="roi-line"
        points={roiData
          .map((d, i) => `${i * 28 + 10},${70 - d.roi}`)
          .join(" ")}
      />

      {/* Línea ROE (roja) */}
      <polyline
        className="roe-line"
        points={roiData
          .map((d, i) => `${i * 28 + 10},${70 - d.roe}`)
          .join(" ")}
      />

      {/* Puntos ROI */}
      {roiData.map((d, i) => (
        <circle
          key={`roi-${i}`}
          className="roi-point"
          cx={i * 28 + 10}
          cy={70 - d.roi}
          r={3}
        />
      ))}

      {/* Puntos ROE */}
      {roiData.map((d, i) => (
        <circle
          key={`roe-${i}`}
          className="roe-point"
          cx={i * 28 + 10}
          cy={70 - d.roe}
          r={3}
        />
      ))}
    </svg>
  );
};

export default ROIChart;
