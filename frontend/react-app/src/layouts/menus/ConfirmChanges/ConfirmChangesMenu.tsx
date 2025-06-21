import React from "react";
import { useState } from "react";
import movimientosAPI from "../../../services/api/movimientos";

interface ConfirmProps {
	onClose: () => void;
    onAccept: () => void;
	prevValue: number | string;
	newValue: number | string;
	// Added new props for the update operation
	rowId: number;
	field: string; // The field being updated (e.g., 'abonado', 'descuento', 'concepto', etc.)
}

export const ConfirmChangesMenu: React.FC<ConfirmProps> = ({ 
	prevValue, 
	newValue, 
	onClose, 
	onAccept,
	rowId,
	field 
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

			// Call the actualizar method from movimientosAPI
			await movimientosAPI.actualizarCampos(rowId, updatePayload);
			
			// Call the onAccept callback to notify parent component of success
			onAccept();
			
			// Close the modal
			onClose();
		} catch (err) {
			// Handle any errors that occur during the update
			const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el movimiento';
			setError(errorMessage);
			console.error('Error updating movement:', err);
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