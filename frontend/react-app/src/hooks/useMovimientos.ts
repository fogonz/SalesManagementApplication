import { useState } from 'react';
import movimientosAPI from '../services/api/movimientos';

export const useMovimientos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const crearMovimiento = async (payload) => {
    setLoading(true);
    setError(null);
    
    try {
      const resultado = await movimientosAPI.crear(payload);
      return resultado;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { crearMovimiento, loading, error };
};