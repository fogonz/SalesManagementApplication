import { CuentaRow } from '../../utils/filterUtils';
import { authFetch } from '../../utils/authFetch';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://salesmanagementapplication-production.up.railway.app/api';

export const fetchCuentas = async (): Promise<CuentaRow[]> => {
  try {
    const response = await authFetch(`${API_BASE_URL}/cuentas/`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(`Error al cargar cuentas:`, err);
    throw new Error("Error al cargar cuentas");
  }
};
