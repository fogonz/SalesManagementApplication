import React from "react";

type Tabla = "movimientos" | "cuentas" | "productos";

interface OptionsAdminProps {
	setActiveView: React.Dispatch<React.SetStateAction<Tabla>>;
	toggleActive: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Options_Admin: React.FC<OptionsAdminProps> = ({toggleActive}) => {
	return (
		<div>
			<div className="sidebar-options">
				<button
					className="menu-button"
					data-view="productos"
					onClick={(e) => {
						toggleActive(e);
						}
				}>
					<i className="fas fa-chart-simple"></i> ESTADÍSTICAS
				</button>	

				<button
					className="menu-button"
					data-view="productos"
					onClick={(e) => {
						toggleActive(e);
						}
				}>
					<i className="fas fa-clock-rotate-left"></i> HISTORIAL MOVIMIENTOS
				</button>	
			</div>
			
			<div className="sidebar-options">
				<button
					className="menu-button"
					data-view="movimientos"
					onClick={(e) => {
						toggleActive(e);
						}
				}>
					<i className="fas fa-home"></i> MOVIMIENTOS
					<i className="fas fa-pen"></i>
				</button>

				<button
					className="menu-button"
					data-view="cuentas"
					onClick={(e) => {
						toggleActive(e);
						}
				}>
					<i className="fas fa-circle-user"></i> CUENTAS
					<i className="fas fa-pen"></i>
				</button>
				
				<button
					className="menu-button"
					data-view="productos"
					onClick={(e) => {
						toggleActive(e);
						}
				}>
					<i className="fas fa-boxes"></i> STOCK
					<i className="fas fa-pen"></i>
				</button>
				
			</div>
		</div>
	);
}

export default Options_Admin;