import { TransactionFormData, ValidationResult, Tipo } from "./types";
import { API_BASE_URL } from '../../services/api';

const allowedFields = [
    "fecha",
    "cuenta",
    "tipo",
    "descuento_total",
    "total",
    "concepto",
    "carrito",
    "productos",
    "numero_comprobante" // <-- asegúrate de incluirlo aquí
];

// Si hay una función que limpia el objeto:
function cleanPayload(payload: any) {
    const cleaned: any = {};
    for (const key of allowedFields) {
        if (payload[key] !== undefined) {
            cleaned[key] = payload[key];
        }
    }
    return cleaned;
}

export function createHandleSubmit(
    data: {
        fecha: string,
        cuenta: string | number,
        tipo: string,
        descuento_total: number,
        total: number,
        concepto: string,
        carrito: any[],
        numero_comprobante?: number // <-- Añade el campo opcional
    },
    onSuccess: (response?: any) => void,
    onError: (msg: string) => void
) {
    return async () => {
        // Validación básica
        if (!data.fecha || !data.cuenta || !data.tipo) {
            onError("Faltan campos obligatorios");
            return;
        }
        // Validar que total sea un número válido
        if (isNaN(data.total) || data.total < 0) {
            onError("El total ingresado no es válido");
            return;
        }
        // Validar que descuento_total sea un número válido
        if (isNaN(data.descuento_total) || data.descuento_total < 0) {
            onError("El descuento no es válido");
            return;
        }

        // Construye el payload incluyendo numero_comprobante si existe
        let movimientoPayload: any = {
            fecha: data.fecha,
            cuenta: data.cuenta,
            tipo: data.tipo,
            descuento_total: data.descuento_total,
            total: data.total,
            concepto: data.concepto,
            ...(data.tipo === "factura_venta" || data.tipo === "factura_compra"
                ? { carrito: data.carrito }
                : {})
        };

        // --- INCLUYE SIEMPRE numero_comprobante SI EXISTE ---
        if (typeof data.numero_comprobante !== "undefined" && data.numero_comprobante !== null) {
            movimientoPayload.numero_comprobante = data.numero_comprobante;
        }

        // payload = cleanPayload(payload); // Si usas cleanPayload, debe incluir numero_comprobante

        try {
            // DEBUG: log el payload que realmente se envía
            console.log("DEBUG - PAYLOAD ENVIADO AL BACKEND:", JSON.stringify(movimientoPayload));
            const response = await fetch(`${API_BASE_URL}/api/movimientos/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(movimientoPayload)
            });
            if (!response.ok) {
                const errorData = await response.json();
                onError(errorData.detail || "Error al registrar la transacción");
                return;
            }
            const respJson = await response.json();
            onSuccess(respJson);
        } catch (err) {
            onError("Error de red o inesperado");
        }
    };
}