import { ProductoRow } from '../../utils/filterUtils';
import { API_BASE_URL } from '.';

export const fetchProductos = async (): Promise<ProductoRow[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/productos/`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(`Error al cargar productos:`, err);
    throw err;
  }
};
