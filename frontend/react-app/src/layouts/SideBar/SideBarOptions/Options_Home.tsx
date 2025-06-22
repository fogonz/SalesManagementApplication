import React from "react";

type Tabla = "movimientos" | "cuentas" | "productos";

interface OptionsHomeProps {
	activeView: string;
	setActiveView: React.Dispatch<React.SetStateAction<Tabla>>;
	toggleActive: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Options_Home: React.FC<OptionsHomeProps> = ({ activeView, setActiveView }) => {
	return (
		<>
			<div className="sidebar-options">
				<button
					className={`menu-button ${activeView === "movimientos" ? "active" : ""}`}
					onClick={() => setActiveView("movimientos")}
				>
					<i className="fas fa-home"></i> MOVIMIENTOS
				</button>

				<button
					className={`menu-button ${activeView === "cuentas" ? "active" : ""}`}
					onClick={() => setActiveView("cuentas")}
				>
					<i className="fas fa-circle-user"></i> CUENTAS
				</button>

				<button
					className={`menu-button ${activeView === "productos" ? "active" : ""}`}
					onClick={() => setActiveView("productos")}
				>
					<i className="fas fa-boxes"></i> STOCK
				</button>
			</div>

			{/**
			<div classname="line"></div>
			
			<div className="sidebar-options">
				<button className="menu-button-round gray-border">
					<i className="fas fa-comments"></i> CHAT
				</button>
			</div>
			 */}
		</>
	);
};

export default Options_Home;