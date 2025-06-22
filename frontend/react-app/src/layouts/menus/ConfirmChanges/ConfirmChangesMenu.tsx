import React from "react";
import { useState } from "react";
import { movimientosAPI, cuentasAPI, productosAPI, movimientoItemsAPI } from "../../../services/api";

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
				movimientoItems: movimientoItemsAPI,
				movimiento_items: movimientoItemsAPI
			};

			// Get the appropriate API and call actualizarCampos
			const api = apiMap[currentTable];
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
		<div className="popup">
			<div className="wrapper">
				<div className="menu_confirmChanges">
					<div className="menu_topBar">
						<span> Confirmar Cambios </span> 
					</div>
					<div className="wrapper">
						<main className="valuesContainer">
							<div className="values"> {prevValue} </div>
							<i className="fas fa-arrow-down"></i>
							<div className="values"> {newValue} </div>
						</main>
						
						{/* Show error message if there's an error */}
						{error && (
							<div className="error-message" style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>
								{error}
							</div>
						)}
					</div>
					<div className="menu_bottomBar">
						<button 
							onClick={onClose} 
							className="bigButton button-shadow gray"
							disabled={isLoading}
						> 
							CERRAR 
						</button>
						<button 
							onClick={handleSubmit} 
							className="bigButton button-shadow green"
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