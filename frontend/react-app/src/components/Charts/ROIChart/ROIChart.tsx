import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import "./RoiChart.css"
import { useEffect } from 'react';

const ROIChart = ({data = [], noDataMessage = "No hay datos disponibles" }) => {
  if (data.length === 0) {
    return <p>{noDataMessage}</p>;
  }

  useEffect(() => {
    console.log("DATA RECEIVED",data ? data : "no data")
    }
  )

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