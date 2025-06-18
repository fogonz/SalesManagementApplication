import React from "react";

type Tabla = "movimientos" | "cuentas" | "productos";
type AdminView = 'estadisticas' | 'historial' | 'movimientos' | 'cuentas' | 'productos' | 'exportar';

interface OptionsAdminProps {
	activeView: string;
	setActiveView: React.Dispatch<React.SetStateAction<Tabla>>;
	toggleActive?: (e: React.MouseEvent<HTMLButtonElement>) => void;
	currentAdminView?: string;
	setCurrentAdminView: React.Dispatch<React.SetStateAction<AdminView>>; // Remove optional
}

const Options_Admin: React.FC<OptionsAdminProps> = ({ 
	setActiveView, 
	toggleActive, 
	currentAdminView, 
	setCurrentAdminView 
}) => {
	return (
		<div>
			<div className="sidebar-options">
				<button
					className="menu-button"
					data-view="estadisticas"
					onClick={(e) => {
						toggleActive?.(e);
						setCurrentAdminView("estadisticas");
					}}
				>
					<i className="fas fa-chart-simple"></i> ESTADÍSTICAS
				</button>	

				<button
					className="menu-button"
					data-view="historial"
					onClick={(e) => {
						toggleActive?.(e);
						setCurrentAdminView("historial");
					}}
				>
					<i className="fas fa-clock-rotate-left"></i> HISTORIAL MOVIMIENTOS
				</button>	
			</div>
			
			<div className="sidebar-options">
				<button
					className="menu-button"
					data-view="movimientos"
					onClick={(e) => {
						toggleActive?.(e);
						setCurrentAdminView("movimientos");
						setActiveView("movimientos");
					}}
				>
					<i className="fas fa-home"></i> MOVIMIENTOS
					<i className="fas fa-pen"></i>
				</button>

				<button
					className="menu-button"
					data-view="cuentas"
					onClick={(e) => {
						toggleActive?.(e);
						setCurrentAdminView("cuentas");
						setActiveView("cuentas");
					}}
				>
					<i className="fas fa-circle-user"></i> CUENTAS
					<i className="fas fa-pen"></i>
				</button>
				
				<button
					className="menu-button"
					data-view="productos"
					onClick={(e) => {
						toggleActive?.(e);
						setCurrentAdminView("productos");
						setActiveView("productos");
					}}
				>
					<i className="fas fa-boxes"></i> STOCK
					<i className="fas fa-pen"></i>
				</button>
			</div>

			<div className="sidebar-options">
				<button
					className="menu-button"
					data-view="exportar"
					onClick={(e) => {
						toggleActive?.(e);
						setCurrentAdminView("exportar");
					}}
				>
					<i className="fas fa-file-excel"></i> EXPORTAR EXCEL
				</button>
			</div>
		</div>
	);
}

export default Options_Admin;