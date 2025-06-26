export interface TransactionFormData {
	fecha: string;
	cuenta: string | number;
	tipo: string;
	descuento_total: number;
	total: number;
	concepto: string;
	carrito: any[];
}
  
export interface ValidationResult {
	isValid: boolean;
	error?: string;
	data?: {
	  cantidadNum?: number;
	  precioNum: number;
	  numeroComprobanteInt?: number;
	  descuentoPct: number;
	};
}
  
export type Tipo = 
	| 'factura_compra' 
	| 'factura_venta' 
	| 'pago' 
	| 'cobranza' 
	| 'jornal' 
	| 'alquiler' 
	| 'impuestos' 
	| 'sueldo' 
	| 'aguinaldo';