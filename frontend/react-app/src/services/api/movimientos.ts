import { authFetch } from '../../utils/authFetch';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://salesmanagementapplication-production.up.railway.app/api';

import { APIError } from "./apiTypes";

export interface MovimientoPayload {
  tipo: 'factura_compra' | 'factura_venta' | 'pago' | 'cobranza' ;
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

export interface MovimientoResponse {
  id: number;
  tipo: string;
  fecha: string;
  cuenta: string;
  concepto?: string;
  descuento?: number;
  abonado?: number;
  total?: number;
  estado?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MovimientoFiltros {
  tipo?: string;
  cuenta?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: string;
  limit?: number;
  offset?: number;
}

class MovimientosAPI {
  async crear(payload: MovimientoPayload): Promise<MovimientoResponse> {
    try {
      const response = await authFetch(`${API_BASE_URL}/movimientos`, {
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

      const data: MovimientoResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating movement:', error);
      throw error;
    }
  }

  async obtener(id: number): Promise<MovimientoResponse> {
    try {
      const response = await authFetch(`${API_BASE_URL}/movimientos/${id}/`, {
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

      return await response.json() as MovimientoResponse;
    } catch (error) {
      console.error('Error fetching movement:', error);
      throw error;
    }
  }

  async listar(filtros: MovimientoFiltros = {}): Promise<MovimientoResponse[]> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const url = `${API_BASE_URL}/movimientos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
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

      return await response.json() as MovimientoResponse[];
    } catch (error) {
      console.error('Error listing movements:', error);
      throw error;
    }
  }

  async actualizar(id: number, payload: Partial<MovimientoPayload>): Promise<MovimientoResponse> {
    try {
      // First, get the existing record
      const existingRecord = await this.obtener(id);
      
      // Create complete payload by merging existing record with new payload
      const completePayload = {
        ...existingRecord,
        ...payload
      };
      
      // Remove fields that don't belong in the payload or cause serializer issues
      const { id: recordId, created_at, updated_at, ...payloadData } = completePayload;
      
      // If productos is not being explicitly updated, remove it to avoid nested field issues
      if (!payload.hasOwnProperty('productos')) {
        delete payloadData.productos;
      }
      
      // Now send the complete object
      const response = await authFetch(`${API_BASE_URL}/movimientos/${id}/`, {
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
      console.error('Error updating movement:', error);
      throw error;
    }
  }

  // Alternative method for simple field updates (PATCH instead of PUT)
  async actualizarCampos(id: number, payload: Partial<MovimientoPayload>): Promise<MovimientoResponse> {
    try {
      const response = await authFetch(`${API_BASE_URL}/movimientos/${id}/`, {
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
      console.error('Error updating movement fields:', error);
      throw error;
    }
  }

  async eliminar(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await authFetch(`${API_BASE_URL}/movimientos/${id}/`, {
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
      console.error('Error deleting movement:', error);
      throw error;
    }
  }

  // Specific methods for transaction types
  async crearFacturaVenta(payload: Omit<MovimientoPayload, 'tipo'>): Promise<MovimientoResponse> {
    return this.crear({
      ...payload,
      tipo: 'factura_venta'
    });
  }

  async crearFacturaCompra(payload: Omit<MovimientoPayload, 'tipo'>): Promise<MovimientoResponse> {
    return this.crear({
      ...payload,
      tipo: 'factura_compra'
    });
  }

  async crearPago(payload: Omit<MovimientoPayload, 'tipo'>): Promise<MovimientoResponse> {
    return this.crear({
      ...payload,
      tipo: 'pago'
    });
  }

  async crearCobranza(payload: Omit<MovimientoPayload, 'tipo'>): Promise<MovimientoResponse> {
    return this.crear({
      ...payload,
      tipo: 'cobranza'
    });
  }

  // Method to get movements by account
  async obtenerPorCuenta(cuentaId: string, filtros: MovimientoFiltros = {}): Promise<MovimientoResponse[]> {
    return this.listar({
      ...filtros,
      cuenta: cuentaId
    });
  }

  // Method to get movements by date range
  async obtenerPorFechas(fechaInicio: string, fechaFin: string, filtros: MovimientoFiltros = {}): Promise<MovimientoResponse[]> {
    return this.listar({
      ...filtros,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    });
  }

  // Method to get movements by type
  async obtenerPorTipo(tipo: MovimientoPayload['tipo'], filtros: MovimientoFiltros = {}): Promise<MovimientoResponse[]> {
    return this.listar({
      ...filtros,
      tipo
    });
  }
}

// Create and export a singleton instance
const movimientosAPI = new MovimientosAPI();
export default movimientosAPI;