import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

interface DataState {
  // Datos de gastos
  expensesData: ExpenseData[];
  expensesLoading: boolean;
  expensesError: string | null;
  
  // Datos de productos
  productData: ProductData[];
  productLoading: boolean;
  productError: string | null;
  
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

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // Estados para gastos
  const [expensesData, setExpensesData] = useState<ExpenseData[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [expensesError, setExpensesError] = useState<string | null>(null);
  
  // Estados para productos
  const [productData, setProductData] = useState<ProductData[]>([]);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);
  
  // Estados de configuración
  const [selectedFilter, setSelectedFilter] = useState('Esta Semana');
  
  // Datos calculados
  const ingreso = 400000;
  const egresoTotal = expensesData.reduce((sum, item) => sum + item.value, 0);

  // Función para obtener datos de gastos
  const fetchExpensesData = async () => {
    try {
      setExpensesLoading(true);
      setExpensesError(null);
      
      const response = await fetch('http://localhost:8000/api/movimientos/');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter by the specified expense types
      const expenseTypes = ['pago', 'sueldo', 'aguinaldo', 'impuestos', 'jornal', 'alquiler'];
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
      const response = await fetch('http://localhost:8000/api/ventas-producto/');
      
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

  // Función para refrescar todos los datos
  const refreshData = () => {
    fetchExpensesData();
    fetchProductData();
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