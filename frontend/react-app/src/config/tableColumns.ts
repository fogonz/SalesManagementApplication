// Configuration functions
import { Tabla } from "../types";
import { CuentaRow } from "../utils/filterUtils";
import { cajachicaColumns } from "./tableColumns.cajachica";

export const getColumnsForActiveView = (activeView: Tabla, cuentas: CuentaRow[]) => {
  switch (activeView) {
	case 'movimientos':
	  return [
		{ key: 'id', label: 'ID' },
		{ key: 'fecha', label: 'FECHA' },
		{ key: 'tipo', label: 'TIPO' },
		{ 
		  key: 'cuenta', 
		  label: 'CUENTA',
		  format: (cuenta_id: number) => {
			if (!cuentas || cuentas.length === 0) {
			  return 'Cargando...';
			}
			
			const cuenta = cuentas.find(c => c.id === cuenta_id);
			
			return cuenta ? cuenta.nombre : `ID: ${cuenta_id} (no encontrada)`;
		  }
		},
		{ key: 'concepto', label: 'CONCEPTO' },
		{ key: 'descuento_total', label: 'DESCUENTO', format: (value: any) => (value ? `${parseFloat(value).toFixed(2)}` : '-')},
		{ key: 'total', label: 'TOTAL', format: (value: any) => (value ? `${parseFloat(value).toFixed(2)}` : '-')}
	  ];
	case 'cajachica':
	  return cajachicaColumns(cuentas);
	case 'cuentas':
	  return [
		{ key: 'id', label: 'ID' },
		{ key: 'nombre', label: 'NOMBRE' },
		{ key: 'contacto_mail', label: 'E-MAIL'},
		{ key: 'contacto_telefono', label: 'TELÉFONO' },
		{ key: 'tipo_cuenta', label: 'TIPO de CUENTA'},
		{ key: 'monto', label: 'MONTO', format: (value: any) => (value ? `${parseFloat(value).toFixed(2)}` : '-')}
	  ];
	case 'productos':
	  return [];
	default:
	  return [];
  }
};