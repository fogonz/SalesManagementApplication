export const movimientosColorMap: Record<string, string> = {
	factura_venta:  '#c3dfb9',
	factura_compra: '#a3c2f5',
	pago:           '#ed9797',
	cobranza:       '#7be05d',
	jornal:         '#b0f57e',
	alquiler:       '#62c86f',
	impuestos:      '#98da3b',
	sueldo:         '#b4e89c',
	aguinaldo:      '#6fc15d',
	// Cajachica-specific: fallback for other tipos
	cajachica:      '#f7e6b7'
};

export const cajachicaColorMap: Record<string, string> = {
	pago:      '#ed9797',
	cobranza:  '#7be05d',
	jornal:    '#ed9797',
	alquiler:  '#ed9797',
	impuestos: '#ed9797',
	sueldo:    '#ed9797',
	aguinaldo: '#ed9797',
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
  
export function getCellColorClass(content: string, tableType: 'movimientos' | 'cuentas' | 'productos' | 'cajachica'): string {
	let colorMap: Record<string, string> = {};

	switch (tableType) {
	  case 'movimientos':
		colorMap = movimientosColorMap;
		break;
	  case 'cajachica':
		colorMap = cajachicaColorMap;
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

	// For cajachica, fallback to 'otro' if not found
	if (tableType === 'cajachica') {
		return colorMap[content] ?? colorMap['otro'] ?? '';
	}
	return colorMap[content] ?? '';
}
