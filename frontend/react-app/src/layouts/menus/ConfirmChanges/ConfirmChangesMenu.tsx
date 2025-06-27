import React from "react";
import { useState } from "react";
import { movimientosAPI, cuentasAPI, productosAPI, movimientoItemsAPI } from "../../../services/api";
import "./ConfirmChanges.css"; // Importa el CSS

interface ConfirmProps {
	onClose: () => void;
    onAccept: () => void;
	prevValue: number | string;
	newValue: number | string;
	rowId: number;
	field: string;
	currentTable: string;
}

export const ConfirmChangesMenu: React.FC<ConfirmProps> = ({ 
	prevValue, 
	newValue, 
	onClose, 
	onAccept,
	rowId,
	field,
	currentTable
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async () => {
		setIsLoading(true);
		setError(null);

		try {
			// Create the payload with the updated field
			const updatePayload = {
				[field]: newValue
			};

			// Map of table names to their corresponding API objects
			const apiMap: { [key: string]: any } = {
				movimientos: movimientosAPI,
				cuentas: cuentasAPI,
				productos: productosAPI,
				'movimiento-items': movimientoItemsAPI
			};

			// Normalize currentTable to match API keys (lowercase, plural)
			let normalizedTable = currentTable.toLowerCase();
			if (normalizedTable === 'cajachica') {
				normalizedTable = 'movimientos';
			} else if (normalizedTable.endsWith('a')) {
				// e.g. 'cuenta' -> 'cuentas', 'movimiento' -> 'movimientos', 'producto' -> 'productos'
				normalizedTable += 's';
			}
			if (normalizedTable === 'movimientoitems' || normalizedTable === 'movimiento_items') {
				normalizedTable = 'movimiento-items';
			}

			const api = apiMap[normalizedTable];
			if (!api) {
				throw new Error(`Tabla no soportada: ${currentTable}`);
			}

			await api.actualizarCampos(rowId, updatePayload);
			
			// Call the onAccept callback to notify parent component of success
			onAccept();
			
			// Close the modal
			onClose();
		} catch (err) {
			// Handle any errors that occur during the update
			const errorMessage = err instanceof Error ? err.message : `Error al actualizar ${currentTable}`;
			setError(errorMessage);
			console.error(`Error updating ${currentTable}:`, err);
		} finally {
			setIsLoading(false);
		}
	};

	return(
		<div className="confirm-popup">
			<div className="confirm-wrapper">
				<div className="confirm-menu">
					<div className="confirm-topBar">
						<span> Confirmar Cambios </span> 
					</div>
					<div className="confirm-content">
						<main className="confirm-valuesContainer">
							<div className="confirm-value confirm-value-old"> {prevValue} </div>
							<i className="fas fa-arrow-down confirm-arrow"></i>
							<div className="confirm-value confirm-value-new"> {newValue} </div>
						</main>
						{error && (
							<div className="confirm-error-message">
								{error}
							</div>
						)}
					</div>
					<div className="confirm-bottomBar">
						<button 
							onClick={onClose} 
							className="confirm-btn confirm-btn-gray"
							disabled={isLoading}
						> 
							CERRAR 
						</button>
						<button 
							onClick={handleSubmit} 
							className="confirm-btn confirm-btn-green"
							disabled={isLoading}
						> 
							{isLoading ? 'ACTUALIZANDO...' : 'ACEPTAR'}
						</button>
					</div>
				</div>
			</div>
		</div>
	)	
}