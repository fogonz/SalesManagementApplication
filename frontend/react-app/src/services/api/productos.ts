import { ProductoRow } from '../../utils/filterUtils';
import { authFetch } from '../../utils/authFetch';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://salesmanagementapplication-production.up.railway.app/api';

// Type definitions
interface ProductoPayload {
  nombre: string;
  descripcion?: string;
  precio: number;
  costo?: number;
  categoria?: string;
  stock?: number;
  codigo?: string;
  unidad?: string;
  activo?: boolean;
}

interface ProductoResponse extends ProductoRow {
  id: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

interface ProductoFiltros {
  categoria?: string;
  activo?: boolean;
  precio_min?: number;
  precio_max?: number;
  stock_min?: number;
  stock_max?: number;
  busqueda?: string;
  codigo?: string;
  ordenar_por?: 'nombre' | 'precio' | 'stock' | 'fecha_creacion';
  orden?: 'asc' | 'desc';
  limite?: number;
  pagina?: number;
}

interface APIError {
  message: string;
  status: number;
}

class ProductosAPI {
  async crear(payload: ProductoPayload): Promise<ProductoResponse> {
    try {
      const response = await authFetch(`${API_BASE_URL}/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: APIError = {
          message: errorData.message || `Error ${response.status}: ${response.statusText}`,
          status: response.status
        };
        throw new Error(error.message);
      }

      const data: ProductoResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async obtener(id: number): Promise<ProductoResponse> {
    try {
      const response = await authFetch(`${API_BASE_URL}/productos/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: APIError = {
          message: errorData.message || `Error ${response.status}: ${response.statusText}`,
          status: response.status
        };
        throw new Error(error.message);
      }

      return await response.json() as ProductoResponse;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  async listar(filtros: ProductoFiltros = {}): Promise<ProductoResponse[]> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const url = `${API_BASE_URL}/productos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await authFetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: APIError = {
          message: errorData.message || `Error ${response.status}: ${response.statusText}`,
          status: response.status
        };
        throw new Error(error.message);
      }

      return await response.json() as ProductoResponse[];
    } catch (error) {
      console.error('Error listing products:', error);
      throw error;
    }
  }

  async actualizar(id: number, payload: Partial<ProductoPayload>): Promise<ProductoResponse> {
    try {
      const response = await authFetch(`${API_BASE_URL}/productos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: APIError = {
          message: errorData.message || `Error ${response.status}: ${response.statusText}`,
          status: response.status
        };
        throw new Error(error.message);
      }

      return await response.json() as ProductoResponse;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async eliminar(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await authFetch(`${API_BASE_URL}/productos/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: APIError = {
          message: errorData.message || `Error ${response.status}: ${response.statusText}`,
          status: response.status
        };
        throw new Error(error.message);
      }

      return await response.json() as { success: boolean; message?: string };
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async actualizarCampos(id: number, payload: Partial<ProductoPayload>): Promise<ProductoResponse> {
    const response = await authFetch(`${API_BASE_URL}/productos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: APIError = {
        message: errorData.message || `Error ${response.status}: ${response.statusText}`,
        status: response.status
      };
      throw new Error(error.message);
    }

    return await response.json() as ProductoResponse;
  }

  // Specific methods for product operations
  async activar(id: number): Promise<ProductoResponse> {
    return this.actualizar(id, { activo: true });
  }

  async desactivar(id: number): Promise<ProductoResponse> {
    return this.actualizar(id, { activo: false });
  }

  async actualizarStock(id: number, nuevoStock: number): Promise<ProductoResponse> {
    return this.actualizar(id, { stock: nuevoStock });
  }

  async actualizarPrecio(id: number, nuevoPrecio: number): Promise<ProductoResponse> {
    return this.actualizar(id, { precio: nuevoPrecio });
  }

  // Method to get products by category
  async obtenerPorCategoria(categoria: string, filtros: ProductoFiltros = {}): Promise<ProductoResponse[]> {
    return this.listar({
      ...filtros,
      categoria
    });
  }

  // Method to search products
  async buscar(termino: string, filtros: ProductoFiltros = {}): Promise<ProductoResponse[]> {
    return this.listar({
      ...filtros,
      busqueda: termino
    });
  }

  // Method to get products with low stock
  async obtenerStockBajo(stockMinimo: number = 10, filtros: ProductoFiltros = {}): Promise<ProductoResponse[]> {
    return this.listar({
      ...filtros,
      stock_max: stockMinimo
    });
  }

  // Method to get active products only
  async obtenerActivos(filtros: ProductoFiltros = {}): Promise<ProductoResponse[]> {
    return this.listar({
      ...filtros,
      activo: true
    });
  }

  // Method to get products by price range
  async obtenerPorRangoPrecio(precioMin: number, precioMax: number, filtros: ProductoFiltros = {}): Promise<ProductoResponse[]> {
    return this.listar({
      ...filtros,
      precio_min: precioMin,
      precio_max: precioMax
    });
  }

  // Method to get product by code
  async obtenerPorCodigo(codigo: string): Promise<ProductoResponse | null> {
    try {
      const productos = await this.listar({ codigo });
      return productos.length > 0 ? productos[0] : null;
    } catch (error) {
      console.error('Error fetching product by code:', error);
      throw error;
    }
  }

  // Legacy method to maintain compatibility with your existing fetchProductos
  async fetchProductos(): Promise<ProductoRow[]> {
    return this.listar();
  }
}

// Create and export a singleton instance
const productosAPI = new ProductosAPI();

// Export both the class and the singleton instance for flexibility
export { ProductosAPI };
export default productosAPI;

// Also export the legacy function for backward compatibility
export const fetchProductos = async (): Promise<ProductoRow[]> => {
  return productosAPI.fetchProductos();
};