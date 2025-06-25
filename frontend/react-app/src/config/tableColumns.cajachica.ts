import { CuentaRow } from "../utils/filterUtils";

export const cajachicaColumns = (cuentas: CuentaRow[]) => [
  { key: 'id', label: 'ID' },
  { key: 'fecha', label: 'FECHA' },
  { key: 'tipo', label: 'TIPO' },
  { 
    key: 'cuenta', 
    label: 'CAJA',
    format: (cuenta_id: number) => {
      if (!cuentas || cuentas.length === 0) {
        return 'Cargando...';
      }
      const cuenta = cuentas.find(c => c.id === cuenta_id);
      return cuenta ? cuenta.nombre : `ID: ${cuenta_id} (no encontrada)`;
    }
  },
  { key: 'concepto', label: 'DETALLE' },
  { key: 'abonado', label: 'ABONADO', format: (value: any) => (value ? `${parseFloat(value).toFixed(2)}` : '-')},
  { key: 'total', label: 'TOTAL', format: (value: any) => (value ? `${parseFloat(value).toFixed(2)}` : '-')},
];
