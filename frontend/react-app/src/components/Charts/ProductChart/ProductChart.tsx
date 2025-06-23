import React from "react";
import "../Chart.css";

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

const COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"];

const ProductChart = ({ 
  data = [], 
  title = "Productos Más Vendidos",
  noDataMessage = "No hay datos disponibles" 
}) => {
  if (data.length === 0) {
    return <p>{noDataMessage}</p>;
  }

  const chartData = data;

  return (
    <div className="product-chart-container">
      <div className="product-chart-title">{title}</div>
      <div className="chart-content">
        {chartData.length === 0 ? (
          <div className="no-data-message">{noDataMessage}</div>
        ) : (
          <ResponsiveContainer width="100%" height="110%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
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
                contentStyle={{ color: '#000000' }}
                labelStyle={{ color: '#000000' }}
              />
              <Bar dataKey="ventas" barSize={24}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ProductChart;