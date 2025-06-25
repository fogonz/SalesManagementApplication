import React from "react";
import { useState } from "react";
import { movimientosAPI, cuentasAPI, productosAPI, movimientoItemsAPI } from "../../../services/api";

interface ConfirmDeleteProps {
	onClose: () => void;
    onAccept: () => void;
	rowId: number;
	rowValues: any;
	currentTable: string;
}

export const ConfirmDeleteMenu: React.FC<ConfirmDeleteProps> = ({ 
	rowId,
	rowValues,
	onClose, 
	onAccept,
	currentTable
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async () => {
		setIsLoading(true);
		setError(null);

		try {
			// Map of table names to their corresponding API objects
			const apiMap: { [key: string]: any } = {
				movimientos: movimientosAPI,
				cuentas: cuentasAPI,
				productos: productosAPI,
				movimientoItems: movimientoItemsAPI,
				movimiento_items: movimientoItemsAPI
			};

			// Fix: Use correct endpoint key for movimientos
			let api = apiMap[currentTable];
			if (!api && currentTable === "movimiento-items") {
				api = movimientoItemsAPI;
			}
			if (!api && currentTable === "movimiento_items") {
				api = movimientoItemsAPI;
			}
			if (!api) {
				throw new Error(`Tabla no soportada: ${currentTable}`);
			}

			// Fix: Ensure correct endpoint and trailing slash for DELETE
			await api.eliminar(rowId);

			onAccept();
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : `Error al eliminar de ${currentTable}`;
			setError(errorMessage);
			console.error(`Error deleting from ${currentTable}:`, err);
		} finally {
			setIsLoading(false);
		}
	};

	// Helper function to render row values in a readable format
	const renderRowValues = () => {
		if (!rowValues) return null;

		// Get the most relevant fields to display based on table type
		const getRelevantFields = () => {
			switch (currentTable) {
				case 'movimientos':
					return ['id', 'fecha', 'tipo', 'concepto', 'total'];
				case 'cuentas':
					return ['id', 'nombre', 'contacto_mail', 'tipo_cuenta'];
				case 'productos':
					return ['id', 'descripcion', 'stock', 'precio'];
				default:
					// Show first 5 fields for unknown table types
					return Object.keys(rowValues).slice(0, 5);
			}
		};

		const relevantFields = getRelevantFields();

		return (
			<div className="row-preview">
				{relevantFields.map(field => {
					const value = rowValues[field];
					if (value === null || value === undefined) return null;
					
					return (
						<div key={field} className="field-row">
							<span className="field-label">{field}:</span>
							<span className="field-value">{value}</span>
						</div>
					);
				})}
			</div>
		);
	};

	return(
		<div className="popup">
			<div className="wrapper">
				<div className="menu_confirmChanges">
					<div className="menu_topBar">
						<span> Confirmar Eliminación </span> 
					</div>
					<div className="wrapper">
						<main className="valuesContainer">
							<div className="delete-warning">
								<i className="fas fa-exclamation-triangle" style={{ color: '#ff6b6b', fontSize: '24px', marginBottom: '10px' }}></i>
								<p>¿Estás seguro de que deseas eliminar este registro?</p>
							</div>
							
							{/* Show the row data to be deleted */}
							{renderRowValues()}
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
							CANCELAR 
						</button>
						<button 
							onClick={handleSubmit} 
							className="bigButton button-shadow red"
							disabled={isLoading}
						> 
							{isLoading ? 'ELIMINANDO...' : 'ELIMINAR'}
						</button>
					</div>
				</div>
			</div>
		</div>
	)	
}