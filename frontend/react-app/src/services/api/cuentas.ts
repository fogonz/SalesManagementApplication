import { CuentaRow } from '../../utils/filterUtils';
import { API_BASE_URL } from '.';

export const fetchCuentas = async (): Promise<CuentaRow[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cuentas/`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(`Error al cargar cuentas:`, err);
    throw new Error("Error al cargar cuentas");
  }
};
