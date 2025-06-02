import React from "react";

type Tabla = "movimientos" | "cuentas" | "productos";

interface OptionsHomeProps {
	setActiveView: React.Dispatch<React.SetStateAction<Tabla>>;
	toggleActive: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Options_Home: React.FC<OptionsHomeProps> = ({setActiveView, toggleActive}) => {
	return (
	<div className="sidebar-options">
		<button
		className="menu-button"
		data-view="movimientos"
		onClick={(e) => {
			setActiveView("movimientos");
			toggleActive(e);
		}}
		>
		<i className="fas fa-home"></i> MOVIMIENTOS
		</button>
		<button
		className="menu-button"
		data-view="cuentas"
		onClick={(e) => {
			setActiveView("cuentas");
			toggleActive(e);
		}}
		>
		<i className="fas fa-circle-user"></i> CUENTAS
		</button>
		<button
		className="menu-button"
		data-view="productos"
		onClick={(e) => {
			setActiveView("productos");
			toggleActive(e);
		}}
		>
		<i className="fas fa-boxes"></i> STOCK
		</button>
	</div>
	);
}

export default Options_Home;