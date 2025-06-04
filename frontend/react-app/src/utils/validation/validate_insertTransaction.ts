import { TransactionFormData, ValidationResult, Tipo } from "./types";

export const createHandleSubmit = (
	formState: {
	  fecha: string;
	  cuenta: string;
	  tipo: string;
	  descuento: string;
	  abonado: string;
	  // Add other form fields as needed
	},
	onSuccess: () => void,
	onError: (error: string) => void
  ) => {
	return async () => {
	  // Prepare form data for validation
	  const formData: TransactionFormData = {
		tipo: formState.tipo,
		fecha: formState.fecha,
		cuenta: formState.cuenta,
		cantidad: "1", // Default or from cart
		precio: formState.abonado,
		descuento: formState.descuento,
		// Add other fields as needed
	  };
  
	  // Validate the transaction
	  const validation = validateTransaction(formData);
	  
	  if (!validation.isValid) {
		onError(`Validación falló: ${validation.error}`);
		return;
	  }
  
	  // If validation passes, prepare payload
	  const payload = {
		tipo: formState.tipo,
		fecha: formState.fecha,
		cuenta: parseInt(formState.cuenta, 10),
		cantidad: validation.data?.cantidadNum || 1,
		precio_venta: validation.data?.precioNum || 0,
		total: validation.data?.precioNum || 0,
		producto_id: null,
		numero_comprobante: validation.data?.numeroComprobanteInt || null,
		saldo_diferencia: null,
		concepto: null,
	  };
  
	  // Apply discount if any
	  if (validation.data?.descuentoPct && validation.data.descuentoPct > 0) {
		payload.total = payload.precio_venta * (1 - validation.data.descuentoPct / 100);
	  }
  
	  // Send to API
	  try {
		const response = await fetch("http://localhost:8000/api/movimientos/", {
		  method: "POST",
		  headers: {
			"Content-Type": "application/json",
		  },
		  body: JSON.stringify(payload),
		});
  
		if (!response.ok) {
		  const errorText = await response.text().catch(() => "Error desconocido");
		  throw new Error(`HTTP ${response.status}: ${errorText}`);
		}
  
		const data = await response.json();
		console.log("Transacción creada:", data);
		onSuccess();
	  } catch (err) {
		console.error("Error al crear transacción:", err);
		onError(err instanceof Error ? err.message : "Error de conexión");
	  }
	};
};

export const validateTransaction = (formData: TransactionFormData): ValidationResult => {
	const { tipo, fecha, cuenta, cantidad, precio, numeroComprobante, descuento } = formData;
	
	// Basic required field validation
	if (!tipo || !fecha || !cuenta || (!cantidad && !precio)) {
	  return { isValid: false, error: "Faltan campos por completar" };
	}
	
	// Number parsing with error handling
	try {
	  const cantidadNum = cantidad ? parseFloat(cantidad) : undefined;
	  const precioNum = parseFloat(precio);
	  const numeroComprobanteInt = numeroComprobante ? parseInt(numeroComprobante) : undefined;
	  const descuentoPct = descuento ? parseFloat(descuento) : 0.0;
	  
	  if (isNaN(precioNum)) {
		return { isValid: false, error: "El precio debe ser un número válido" };
	  }
	  
	  if (cantidad && isNaN(cantidadNum!)) {
		return { isValid: false, error: "La cantidad debe ser un número válido" };
	  }
	  
	  if (descuento && isNaN(descuentoPct)) {
		return { isValid: false, error: "El descuento debe ser un número válido" };
	  }
	  
	  // Business rules validation
	  const businessValidation = validateBusinessRules(
		tipo as Tipo, 
		numeroComprobanteInt
	  );
	  
	  if (!businessValidation.isValid) {
		return businessValidation;
	  }
	  
	  return { 
		isValid: true, 
		data: { cantidadNum, precioNum, numeroComprobanteInt, descuentoPct } 
	  };
	} catch (error) {
	  return { isValid: false, error: `Error numérico: ${error}` };
	}
  };
  
  const validateBusinessRules = (
	tipo: Tipo, 
	numero?: number
  ): ValidationResult => {
	const allowedWithNumber: Tipo[] = [
	  'factura compra', 
	  'factura venta', 
	  'pago', 
	  'cobranza'
	];
	
	const lc = tipo.toLowerCase() as Tipo;
	
	// Types that never can have a number
	if (!allowedWithNumber.includes(lc)) {
	  // Force to undefined/null
	  return { isValid: true };
	}
	
	// Invoices must be sequential (this would need API call to get previous numbers)
	if (lc === 'factura compra' || lc === 'factura venta' || lc === 'factura c. varios') {
	  // Note: In real implementation, you'd need to fetch previous numbers from API
	  // For now, we'll just validate that if a number is provided, it's positive
	  if (numero !== undefined && numero <= 0) {
		return { isValid: false, error: "El número de comprobante debe ser mayor a 0" };
	  }
	}
	
	return { isValid: true };
  };