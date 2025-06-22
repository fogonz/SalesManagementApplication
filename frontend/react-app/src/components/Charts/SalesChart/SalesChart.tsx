import React from "react";
import '../Chart.css';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8DD1E1",
  "#D084D0",
  "#FFB347",
  "#87CEEB"
];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={10}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#333' }}>
          {data.name}
        </p>
        <p style={{ margin: '0', color: '#666' }}>
          Valor: ${data.value.toLocaleString()}
        </p>
        <p style={{ margin: '0', color: '#666' }}>
          Porcentaje: {data.percentage}%
        </p>
      </div>
    );
  }
  return null;
};

const PieChartExpenses = ({ 
  data = [], 
  title = "Distribución de Gastos",
  outerRadius = 70,
  colors = COLORS,
  noDataMessage = "No hay datos disponibles"
}) => {
  // Check if data is empty or null
  if (!data || data.length === 0) {
    return (
      <div className="expense-chart-container">
        <div className="expense-chart-title">{title}</div>
        <div className="chart-content" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          minHeight: '200px'
        }}>
          <span style={{
            color: '#666',
            fontSize: '16px',
            fontStyle: 'italic'
          }}>
            {noDataMessage}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-chart-container">
      <div className="expense-chart-title">{title}</div>
      <div className="expense-chart-content">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={outerRadius}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip active={undefined} payload={undefined} />} />

          </PieChart>
        </ResponsiveContainer>
        <div className="chartdata">
          <ul>
            {data.map((entry,index) => (
              <li key={index}>
                <span className="type"> {entry.name}: </span> 
                <span className="price"> ${entry.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PieChartExpenses;