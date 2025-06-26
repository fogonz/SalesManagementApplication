import { TransactionFormData, ValidationResult, Tipo } from "./types";

export function createHandleSubmit(
    data: {
        fecha: string,
        cuenta: string | number,
        tipo: string,
        descuento_total: number,
        total: number,
        concepto: string,
        carrito: any[]
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

        const movimientoPayload = {
            fecha: data.fecha,
            cuenta: data.cuenta,
            tipo: data.tipo,
            descuento_total: data.descuento_total,
            total: data.total,
            concepto: data.concepto,
            productos: data.carrito.map(item => item.id)
        };

        try {
            const response = await fetch('http://localhost:8000/api/movimientos/', {
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