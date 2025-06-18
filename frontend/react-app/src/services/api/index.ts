import { Tabla } from '../../utils/filterUtils';
export const API_BASE_URL = 'http://localhost:8000/api';

export const fetchTableData = async (activeView: Tabla): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${activeView}`);
    const data = await response.json();
    console.log("DATANEW", data)
    return data;
  } catch (err) {
    console.error(`Error al cargar ${activeView}:`, err);
    throw err;
  }
};
