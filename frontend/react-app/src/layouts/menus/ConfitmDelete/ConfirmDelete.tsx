import React from "react";
import { useState } from "react";
import { movimientosAPI, cuentasAPI, productosAPI, movimientoItemsAPI } from "../../../services/api";
import "./ConfirmDelete.css";

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
			const apiMap: { [key: string]: any } = {
				movimientos: movimientosAPI,
				cuentas: cuentasAPI,
				productos: productosAPI,
				movimientoItems: movimientoItemsAPI,
				movimiento_items: movimientoItemsAPI
			};

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

	return(
		<div style={{
			position: "fixed",
			inset: 0,
			background: "rgba(20, 20, 20, 0.7)",
			zIndex: 3000,
			display: "flex",
			alignItems: "center",
			justifyContent: "center"
		}}>
			<div style={{
				background: "#23272f",
				borderRadius: 18,
				boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
				minWidth: 340,
				maxWidth: "90vw",
				width: 370,
				overflow: "hidden",
				padding: 0
			}}>
				<div style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "stretch"
				}}>
					<div style={{
						background: "linear-gradient(90deg, #263238 0%, #37474f 100%)",
						color: "#fff",
						fontWeight: 600,
						fontSize: "1.18rem",
						padding: "18px 0",
						textAlign: "center",
						letterSpacing: "0.5px",
						width: "100%",
						boxSizing: "border-box"
					}}>
						<span> Confirmar Eliminación </span> 
					</div>
					<div style={{ width: "100%" }}>
						<main style={{
							padding: "28px 24px 18px 24px",
							background: "#d1d1d1"
						}}>
							<div style={{
								textAlign: "center",
								marginBottom: 20,
								padding: "22px 12px 16px 12px",
								background: "#fff3f3",
								border: "1.5px solid #ffb3b3",
								borderRadius: 10,
								boxShadow: "0 2px 8px 0 rgba(255, 107, 107, 0.10)"
							}}>
								<div style={{
									fontWeight: 700,
									fontSize: "1.15rem",
									color: "#d90429",
									marginBottom: 8,
									letterSpacing: "0.5px"
								}}>
									¡Atención!
								</div>
								<p style={{
									margin: 0,
									fontWeight: 500,
									color: "#333",
									fontSize: "1.08rem"
								}}>
									¿Estás seguro de que deseas eliminar este registro?
								</p>
							</div>
						</main>
						
						{error && (
							<div style={{
								color: "#ef5350",
								marginTop: 10,
								textAlign: "center",
								fontWeight: 500,
								fontSize: "1rem"
							}}>
								{error}
							</div>
						)}
					</div>
					<div style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						gap: 12,
						padding: "18px 24px 22px 24px",
						background: "#1a1d22",
						width: "100%",
						boxSizing: "border-box"
					}}>
						<button 
							onClick={onClose} 
							disabled={isLoading}
							style={{
								flex: 1,
								fontSize: "1rem",
								padding: "12px 0",
								borderRadius: 8,
								minWidth: 90,
								maxWidth: 160,
								fontWeight: 600,
								border: "none",
								cursor: "pointer",
								background: "#37474f",
								color: "#b0bec5",
								boxShadow: "0 2px 8px rgba(220,53,69,0.10)"
							}}
						> 
							CANCELAR 
						</button>
						<button 
							onClick={handleSubmit} 
							disabled={isLoading}
							style={{
								flex: 1,
								fontSize: "1rem",
								padding: "12px 0",
								borderRadius: 8,
								minWidth: 90,
								maxWidth: 160,
								fontWeight: 600,
								border: "1px solid #dc3545",
								cursor: "pointer",
								background: "linear-gradient(90deg, #dc3545 0%, #c82333 100%)",
								color: "#fff",
								boxShadow: "0 2px 8px rgba(220,53,69,0.10)",
								opacity: isLoading ? 0.6 : 1
							}}
						> 
							{isLoading ? 'ELIMINANDO...' : 'ELIMINAR'}
						</button>
					</div>
				</div>
			</div>
		</div>
	)	
}