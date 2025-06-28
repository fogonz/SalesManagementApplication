import { Tabla } from "../../types";

export const API_BASE_URL = 'https://d3f0fd3c-97c5-422b-8ede-79bd1c488019.up.railway.app/api';

export interface APIError {
  message: string;
  status: number;
}

// Generic interfaces for all tables
export interface BaseResponse {
  id: number;
  created_at?: string;
  updated_at?: string;
}

export interface BasePayload {
  [key: string]: any;
}

export interface BaseFiltros {
  limit?: number;
  offset?: number;
  [key: string]: any;
}

// Specific interfaces for each table
export interface MovimientoPayload extends BasePayload {
  tipo: 'factura_compra' | 'factura_venta' | 'pago' | 'cobranza';
  fecha: string;
  cuenta: string;
  concepto?: string;
  descuento?: number;
  abonado?: number;
  numeroComprobante?: string;
  estado?: string;
  productos?: Array<{
    id: number;
    cantidad: number;
    precio: number;
  }>;
}

export interface MovimientoResponse extends BaseResponse {
  tipo: string;
  fecha: string;
  cuenta: string;
  concepto?: string;
  descuento?: number;
  abonado?: number;
  total?: number;
  estado?: string;
}

export interface CuentaPayload extends BasePayload {
  nombre: string;
  tipo: string;
  saldo?: number;
  descripcion?: string;
}

export interface CuentaResponse extends BaseResponse {
  nombre: string;
  tipo: string;
  saldo?: number;
  descripcion?: string;
}

export interface ProductoPayload extends BasePayload {
  nombre: string;
  precio: number;
  categoria?: string;
  descripcion?: string;
  stock?: number;
}

export interface ProductoResponse extends BaseResponse {
  nombre: string;
  precio: number;
  categoria?: string;
  descripcion?: string;
  stock?: number;
}

export interface MovimientoItemPayload extends BasePayload {
  movimiento: number;
  producto: number;
  cantidad: number;
  precio: number;
}

export interface MovimientoItemResponse extends BaseResponse {
  movimiento: number;
  producto: number;
  cantidad: number;
  precio: number;
  subtotal?: number;
}

// Generic API class
class GenericAPI<TPayload extends BasePayload, TResponse extends BaseResponse> {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async crear(payload: TPayload): Promise<TResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/${this.endpoint}`, {
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

      return await response.json() as TResponse;
    } catch (error) {
      console.error(`Error creating ${this.endpoint}:`, error);
      throw error;
    }
  }

  async obtener(id: number): Promise<TResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/${this.endpoint}/${id}/`, {
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

      return await response.json() as TResponse;
    } catch (error) {
      console.error(`Error fetching ${this.endpoint}:`, error);
      throw error;
    }
  }

  async listar(filtros: BaseFiltros = {}): Promise<TResponse[]> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const url = `${API_BASE_URL}/${this.endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
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

      return await response.json() as TResponse[];
    } catch (error) {
      console.error(`Error listing ${this.endpoint}:`, error);
      throw error;
    }
  }

  async actualizar(id: number, payload: Partial<TPayload>): Promise<TResponse> {
    try {
      const existingRecord = await this.obtener(id);
      
      const completePayload = {
        ...existingRecord,
        ...payload
      };
      
      const { id: recordId, created_at, updated_at, ...payloadData } = completePayload;
      
      // Remove nested fields if not explicitly being updated (for movimientos)
      if (this.endpoint === 'movimientos' && !payload.hasOwnProperty('productos')) {
        delete payloadData.productos;
      }
      
      const response = await fetch(`${API_BASE_URL}/${this.endpoint}/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: APIError = {
          message: errorData.message || `Error ${response.status}: ${response.statusText}`,
          status: response.status
        };
        throw new Error(error.message);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error(`Error updating ${this.endpoint}:`, error);
      throw error;
    }
  }

  async actualizarCampos(id: number, payload: Partial<TPayload>): Promise<TResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/${this.endpoint}/${id}/`, {
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
      
      return await response.json();
      
    } catch (error) {
      console.error(`Error updating ${this.endpoint} fields:`, error);
      throw error;
    }
  }

  async eliminar(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/${this.endpoint}/${id}/`, {
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

      // Only parse JSON if there is content
      const text = await response.text();
      if (text) {
        return JSON.parse(text);
      }
      return null;
    } catch (error) {
      console.error(`Error deleting ${this.endpoint}:`, error);
      throw error;
    }
  }
}

// Create API instances for each table
export const movimientosAPI = new GenericAPI<MovimientoPayload, MovimientoResponse>('movimientos');
export const cuentasAPI = new GenericAPI<CuentaPayload, CuentaResponse>('cuentas');
export const productosAPI = new GenericAPI<ProductoPayload, ProductoResponse>('productos');
export const movimientoItemsAPI = new GenericAPI<MovimientoItemPayload, MovimientoItemResponse>('movimiento-items');

// Mejorada: fetchTableData usa los endpoints correctos y retorna todos los campos relevantes
export const fetchTableData = async (table: string, baseURL = '') => {
  // Map cajachica to movimientos
  const realTable = table === 'cajachica' ? 'movimientos' : table;

  // Si se pasa un baseURL, usar API_BASE_URL en vez de baseURL directo
  const urlBase = baseURL || API_BASE_URL;
  const url = `${urlBase}/${realTable}/`;

  if (baseURL) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error fetching data');
    return await response.json();
  }

  // Usar los métodos listar() de las instancias API para obtener todos los campos
  switch (realTable) {
    case 'movimientos':
      return await movimientosAPI.listar();
    case 'cuentas':
      return await cuentasAPI.listar();
    case 'productos':
      return await productosAPI.listar();
    case 'movimiento-items':
      return await movimientoItemsAPI.listar();
    default:
      throw new Error(`Unknown table: ${realTable}`);
  }
};

// Helper function to get the appropriate API instance
export const getAPI = (table: string) => {
  switch (table) {
    case 'movimientos':
      return movimientosAPI;
    case 'cuentas':
      return cuentasAPI;
    case 'productos':
      return productosAPI;
    case 'movimiento-items':
      return movimientoItemsAPI;
    default:
      throw new Error(`Unknown table: ${table}`);
  }
}

// Helper for saldo fetch/update (no afecta el funcionamiento de GenericAPI ni fetchTableData)
export const fetchSaldo = async () => {
  const response = await fetch(`${API_BASE_URL}/saldo/`);
  if (!response.ok) throw new Error('Error fetching saldo');
  return await response.json();
};

export const patchSaldo = async (saldo_inicial: number) => {
  const response = await fetch(`${API_BASE_URL}/saldo/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ saldo_inicial }),
  });
  if (!response.ok) throw new Error('Error updating saldo');
  return await response.json();
};