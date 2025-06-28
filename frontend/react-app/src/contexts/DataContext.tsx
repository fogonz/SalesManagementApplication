import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { API_BASE_URL } from '../services/api';

// Tipos para los datos
interface ExpenseData {
  name: string;
  value: number;
  percentage: number;
}

interface ProductData {
  name: string;
  ventas: number;
}

interface VentaData {
  date: string;
  sales: number;
  revenue: number;
}

interface DataState {
  // Datos de gastos
  expensesData: ExpenseData[];
  expensesLoading: boolean;
  expensesError: string | null;
  
  // Datos de productos
  productData: ProductData[];
  productLoading: boolean;
  productError: string | null;

  // Datos de Ventas
  ventasData: VentaData[];
  ventasLoading: boolean;
  ventasError: string | null;

  // Filtros y configuración
  selectedFilter: string;
  
  // Datos calculados
  ingreso: number;
  egresoTotal: number;
  
  // Funciones para actualizar datos
  setSelectedFilter: (filter: string) => void;
  refreshData: () => void;
}

const DataContext = createContext<DataState | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

interface GroupedData {
  [key: string]: {
    sales: number;
    revenue: number;
  };
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // Estados para gastos
  const [expensesData, setExpensesData] = useState<ExpenseData[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [expensesError, setExpensesError] = useState<string | null>(null);
  
  // Estados para productos
  const [productData, setProductData] = useState<ProductData[]>([]);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  // Estados para ventas
  const [ventasData, setVentasData] = useState<VentaData[]>([]);
  const [ventasLoading, setVentasLoading] = useState(true);
  const [ventasError, setVentasError] = useState<string | null>(null);
  
  // Estados de configuración
  const [selectedFilter, setSelectedFilter] = useState('Esta Semana');
  
  // Datos calculados
  const egresoTotal = useMemo(() => {
    return expensesData.reduce((sum, item) => sum + item.value, 0);
  }, [expensesData]);

  const ingreso = useMemo(() => {
    return ventasData.reduce((total, item) => total + item.revenue, 0);
  }, [ventasData]);

  // Función para procesar datos de movimientos
  const processMovimientosData = (movimientos: any[]): VentaData[] => {
    // Filtrar solo movimientos de tipo factura_venta
    const ventasMovimientos = movimientos.filter(mov => mov.tipo === 'factura_venta');
    
    // Agrupar por fecha y sumar los montos
    const groupedByDate: GroupedData = ventasMovimientos.reduce((acc: GroupedData, mov) => {
      const fecha = mov.fecha ? new Date(mov.fecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const monto = parseFloat(mov.total) || 0;
      
      if (!acc[fecha]) {
        acc[fecha] = { sales: 0, revenue: 0 };
      }
      
      acc[fecha].sales += monto;
      acc[fecha].revenue += monto; // Para ventas, sales y revenue son el mismo valor
      
      return acc;
    }, {});
    
    // Convertir a array y ordenar por fecha
    return Object.entries(groupedByDate)
      .map(([date, values]) => ({
        date,
        sales: values.sales,
        revenue: values.revenue
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Función para obtener datos de gastos
  const fetchExpensesData = async () => {
    try {
      setExpensesLoading(true);
      setExpensesError(null);
      
      const response = await fetch(`${API_BASE_URL}/movimientos/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter by the specified expense types
      const expenseTypes = [
        'pago', 'sueldo', 'aguinaldo', 'impuestos', 'jornal', 'alquiler',
        'factura_c_varios', 'servicio_cepillado'
      ];
      const filteredData = data.filter((item: any) => expenseTypes.includes(item.tipo));
      
      // Group by tipo and sum the totals
      const groupedExpenses: Record<string, number> = filteredData.reduce((acc: any, item: any) => {
        const tipo = item.tipo;
        const total = parseFloat(item.total);
        
        if (acc[tipo]) {
          acc[tipo] += total;
        } else {
          acc[tipo] = total;
        }
        
        return acc;
      }, {} as Record<string, number>);
      
      // Calculate total for percentages
      const totalAmount = Object.values(groupedExpenses).reduce((sum: number, value: number) => sum + value, 0);
      
      // Convert to chart format
      const chartData = Object.entries(groupedExpenses).map(([tipo, value]: [string, number]) => ({
        name: tipo.charAt(0).toUpperCase() + tipo.slice(1), // Capitalize first letter
        value: value,
        percentage: totalAmount > 0 ? Math.round((value / totalAmount) * 100) : 0
      }));
      
      setExpensesData(chartData);
      
    } catch (err: any) {
      console.error('Error fetching expenses data:', err);
      setExpensesError(err.message);
    } finally {
      setExpensesLoading(false);
    }
  };

  // Función para obtener datos de productos
  const fetchProductData = async () => {
    try {
      setProductLoading(true);
      setProductError(null);
      
      // Use the sales per product endpoint
      const response = await fetch(`${API_BASE_URL}/ventas-producto/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process the data to match the expected format for ProductChart
      const processedData = data
        .map((item: any) => ({
          name: item.nombre_producto, // Map from API response
          ventas: parseFloat(item.total_vendido) // Map from API response
        }))
        .sort((a: ProductData, b: ProductData) => b.ventas - a.ventas) // Sort by sales descending
        .slice(0, 6); // Take top 6 products
      
      setProductData(processedData);
      
    } catch (err: any) {
      console.error('Error fetching product data:', err);
      setProductError(err.message);
    } finally {
      setProductLoading(false);
    }
  };

  // Función para obtener datos de ventas
  const fetchVentasData = async () => {
    try {
      setVentasLoading(true);
      setVentasError(null);
      
      const response = await fetch(`${API_BASE_URL}/movimientos/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Procesar datos para obtener ventas
      const processedData = processMovimientosData(data);
      setVentasData(processedData);
      
    } catch (err: any) {
      console.error('Error fetching ventas data:', err);
      setVentasError(err.message);
    } finally {
      setVentasLoading(false);
    }
  };

  // Función para refrescar todos los datos
  const refreshData = () => {
    fetchExpensesData();
    fetchProductData();
    fetchVentasData();
  };

  // Efecto inicial para cargar datos
  useEffect(() => {
    refreshData();
  }, []);

  // Efecto para recargar datos cuando cambia el filtro
  useEffect(() => {
    refreshData();
  }, [selectedFilter]);

  const value: DataState = {
    expensesData,
    expensesLoading,
    expensesError,
    productData,
    productLoading,
    productError,
    ventasData,
    ventasLoading,
    ventasError,
    selectedFilter,
    ingreso,
    egresoTotal,
    setSelectedFilter,
    refreshData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};