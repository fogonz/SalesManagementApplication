import { TransactionFormData, ValidationResult, Tipo } from "./types";

export const createHandleSubmit = (
	formState: {
	  fecha: string;
	  cuenta: string;
	  tipo: string;
	  descuento: string;
	  abonado: string;
	  concepto: string;
	  carrito: {
		id: number;
		nombre: string;
		precio: number;
		cantidad: number;
	  }[];
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
		concepto: formState.concepto,
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
		tipo: formState.tipo.replace(/ /g, "_"),
		fecha: formState.fecha,
		cuenta: parseInt(formState.cuenta, 10),
		cantidad: validation.data?.cantidadNum || 1,
		precio_venta: validation.data?.precioNum || 0,
		total: validation.data?.precioNum || 0,
		numero_comprobante: validation.data?.numeroComprobanteInt || null,
		concepto: formState.concepto,
	  };
  
	  // Apply discount if any
	  if (validation.data?.descuentoPct && validation.data.descuentoPct > 0) {
		payload.total = payload.precio_venta * (1 - validation.data.descuentoPct / 100);
	  }
  
	  // Send to API
	  console.log("Transaction payload:", JSON.stringify(payload));

	  try {
		// Step 1: Create the main transaction
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
  
		const transactionData = await response.json();
		const transactionId = transactionData.id;
		console.log("Transacción creada:", transactionData, "ID:", transactionId);
		
		if (!transactionId) {
		  throw new Error("No se pudo obtener el ID de la transacción creada");
		}

		// Step 3: Create transaction items for each product in the cart
		if (formState.carrito && formState.carrito.length > 0) {
		  await insertTransactionItems(transactionId, formState.carrito, validation.data?.descuentoPct || 0);
		}

		onSuccess();
	  } catch (err) {
		console.error("Error al crear transacción:", err);
		onError(err instanceof Error ? err.message : "Error de conexión");
	  }
	};
};

// Helper function to insert transaction items
const insertTransactionItems = async (
	transactionId: number,
	carrito: Array<{ id: number; nombre: string; precio: number; cantidad: number }>,
	descuentoGeneral: number = 0,
  ) => {
	for (const item of carrito) {
	  const itemPayload = {
		transaccion: transactionId,      // coincide con tu PrimaryKeyRelatedField
		producto: item.id,               // coincide con tu PrimaryKeyRelatedField
		nombre_producto: item.nombre,
		precio_unitario: item.precio,
		cantidad: item.cantidad,
		descuento_item: descuentoGeneral,
	  };
  
	  console.log("Insertando item:", itemPayload);
  
	  const res = await fetch(
		"http://localhost:8000/api/movimientos-items/",
		{
		  method: "POST",
		  headers: { "Content-Type": "application/json" },
		  body: JSON.stringify(itemPayload),
		}
	  );
  
	  const text = await res.text();
	  if (!res.ok) {
		console.error("Error al insertar item, body:", text);
		throw new Error(
		  `Error al insertar item "${item.nombre}": HTTP ${res.status}: ${text}`
		);
	  }
  
	  console.log("Item insertado correctamente:", await JSON.parse(text));
	}
};

// Alternative approach: Insert items one by one (if batch insert is not supported)
const insertTransactionItemsOneByOne = async (
  transactionId: number, 
  carrito: Array<{id: number; nombre: string; precio: number; cantidad: number}>,
  descuentoGeneral: number = 0
) => {
  try {
    const insertPromises = carrito.map(async (item) => {
      const itemPayload = {
        transaccion_id: transactionId,
        producto_id: item.id,
        nombre_producto: item.nombre,
        precio_unitario: item.precio,
        cantidad: item.cantidad,
        descuento_item: descuentoGeneral
      };

      console.log("Inserting transaction item:", itemPayload);

      const response = await fetch("http://localhost:8000/api/movimientos-items/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemPayload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Error desconocido");
        throw new Error(`Error al insertar item ${item.nombre}: HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    });

    // Wait for all items to be inserted
    const results = await Promise.all(insertPromises);
    console.log("Todos los items insertados:", results);
    
  } catch (error) {
    console.error("Error al insertar items individualmente:", error);
    throw error;
  }
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
	  'factura_compra', 
	  'factura_venta', 
	  'pago', 
	  'cobranza',
	  'jornal', 
	  'alquiler',
	  'impuestos', 
	  'sueldo', 
	  'aguinaldo',
	];
	
	const lc = tipo.toLowerCase() as Tipo;

	
	// Types that never can have a number
	if (!allowedWithNumber.includes(lc)) {
	  // Force to undefined/null
	  return { isValid: true };
	}
	
	// Invoices must be sequential (this would need API call to get previous numbers)
	if (lc === 'factura_compra' || lc === 'factura_venta') {
	  // Note: In real implementation, you'd need to fetch previous numbers from API
	  // For now, we'll just validate that if a number is provided, it's positive
	  
	  if (numero !== undefined && numero <= 0) {
		return { isValid: false, error: "El número de comprobante debe ser mayor a 0" };
	  }
	}
	
	return { isValid: true };
  };