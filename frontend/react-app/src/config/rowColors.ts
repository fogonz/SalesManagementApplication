export const movimientosColorMap: Record<string, string> = {
	factura_venta: '#c3dfb9',
	factura_compra: '#a3c2f5',
	pago: '#ed9797',
	cobranza: '#9df07a',
  };
  
  export const cuentasColorMap: Record<string, string> = {
	proveedor: '#afe4ee',
	cliente: '#9eaff5',
  };
  
  export const productosColorMap: Record<string, string> = {
	baja: '#f5b7b1',
	normal: '#d5f5e3',
	destacado: '#fcf3cf',
  };
  
  export function getCellColorClass(content: string, tableType: 'movimientos' | 'cuentas' | 'productos'): string {
	let colorMap: Record<string, string> = {};
  
	switch (tableType) {
	  case 'movimientos':
		colorMap = movimientosColorMap;
		break;
	  case 'cuentas':
		colorMap = cuentasColorMap;
		break;
	  case 'productos':
		colorMap = productosColorMap;
		break;
	  default:
		break;
	}
  
	return colorMap[content] ?? '';
  }
  