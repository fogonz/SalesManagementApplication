import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import "./RoiChart.css"

const data = [
  {
    date: 'May 1',
    sales: 12500,
    revenue: 25000,
  },
  {
    date: 'May 5',
    sales: 15800,
    revenue: 31600,
  },
  {
    date: 'May 10',
    sales: 18200,
    revenue: 36400,
  },
  {
    date: 'May 15',
    sales: 22100,
    revenue: 44200,
  },
  {
    date: 'May 20',
    sales: 19800,
    revenue: 39600,
  },
  {
    date: 'May 25',
    sales: 26300,
    revenue: 52600,
  },
  {
    date: 'May 31',
    sales: 28900,
    revenue: 57800,
  },
];

const ROIChart = () => {
  return (
    <div className="roi-chart-container">
      <div className="roi-chart-title">Ventas</div>
      <div className="chart-content">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                `$${value.toLocaleString()}`,
                name === 'sales' ? 'Ventas' : 'Ingresos'
              ]}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stackId="1"
              stroke="#8884d8"
              fill="#8884d8"
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stackId="1"
              stroke="#82ca9d"
              fill="#82ca9d"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ROIChart;