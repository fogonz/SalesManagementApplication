export interface TransactionFormData {
	tipo: string;
	fecha: string;
	numeroComprobante?: string;
	cuenta: string;
	productoTipo?: string;
	cantidad: string;
	precio: string;
	descuento?: string;
	estado?: string;
	abonado?: string;
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
	| 'factura compra' 
	| 'factura venta' 
	| 'pago' 
	| 'cobranza' 
	| 'factura c. varios';