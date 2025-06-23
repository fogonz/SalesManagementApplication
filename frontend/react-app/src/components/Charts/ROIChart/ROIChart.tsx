import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import './RoiChart.css';

type ROIChartProps = {
  data: {
    fecha: string;
    ventas: number;
    revenue: number;
  }[];
  loading?: boolean;
  error?: string | null;
};

const ROIChart: React.FC<ROIChartProps> = ({ data, loading, error }) => {
  // Debug logging
  console.log('ROI Chart received data:', data);
  console.log('ROI Chart loading state:', loading);
  console.log('ROI Chart error state:', error);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="chart-loading">
          <p>Cargando datos de ventas...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="chart-error">
          <p>Error al cargar datos: {error}</p>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="chart-no-data">
          <p>No hay datos de ventas disponibles</p>
          <p>Crea algunas facturas de venta para ver los datos aquí</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="fecha"
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#666"
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip
            formatter={(value, name) => [
              `$${Number(value).toLocaleString()}`,
              name === 'ventas' ? 'Ventas' : 'Ingresos Estimados'
            ]}
            labelStyle={{ color: '#000000' }}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              color: '#000000'
            }}
          />
          <Area
            type="monotone"
            dataKey="ventas"
            stackId="1"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stackId="1"
            stroke="#82ca9d"
            fill="#82ca9d"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="roi-chart-container">
      <div className="roi-chart-title">
        Ventas por Fecha
        {data && data.length > 0 && (
          <span className="data-count"> ({data.length} registros)</span>
        )}
      </div>
      <div className="chart-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default ROIChart;