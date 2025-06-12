import React from "react";
import "./Chart.css";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  { name: "Producto A", ventas: 4400 },
  { name: "Producto B", ventas: 2210 },
  { name: "Producto C", ventas: 1800 },
  { name: "Producto D", ventas: 1450 },
  { name: "Producto E", ventas: 1200 },
  { name: "Producto F", ventas: 2200 },
];

const COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"];

const ProductChart = () => {
  return (
    <div className="product-chart-container">
      <div className="product-chart-title">Productos Más Vendidos</div>
      <div className="chart-content">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10 }}
            />
            <Tooltip
              formatter={(value) => [`${value.toLocaleString()} unidades`, 'Ventas']}
              labelFormatter={(label) => `Producto: ${label}`}
            />
            <Bar dataKey="ventas" barSize={24}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductChart;