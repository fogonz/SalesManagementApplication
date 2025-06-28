import React from "react";
import { Tabla, AdminView } from "../../../types";

interface OptionsAdminProps {
	activeView: Tabla;
	setActiveView: React.Dispatch<React.SetStateAction<Tabla>>;
	currentAdminView?: AdminView;
	setCurrentAdminView: React.Dispatch<React.SetStateAction<AdminView>>;
}

const Options_Admin: React.FC<OptionsAdminProps> = ({
	activeView,
	setActiveView,
	currentAdminView,
	setCurrentAdminView
}) => {
	return (
		<div>
			{/*}
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
					<i className="fas fa-clock-rotate-left"></i> HISTORIAL DE ACCIONES
				</button>	
			</div>
			*/}
			
			<div className="sidebar-options">
				<button
					className={`menu-button${activeView === "movimientos" ? " active" : ""}`}
					data-view="movimientos"
					onClick={() => {
						setCurrentAdminView("movimientos");
						setActiveView("movimientos");
					}}
				>
					<i className="fas fa-home"></i> MOVIMIENTOS
				</button>

				<button
					className={`menu-button${activeView === "cajachica" ? " active" : ""}`}
					data-view="cajachica"
					onClick={() => {
						setCurrentAdminView("cajachica");
						setActiveView("cajachica");
					}}
				>
					<i className="fas fa-cash-register"></i> CAJA CHICA
				</button>

				<button
					className={`menu-button${activeView === "cuentas" ? " active" : ""}`}
					data-view="cuentas"
					onClick={() => {
						setCurrentAdminView("cuentas");
						setActiveView("cuentas");
					}}
				>
					<i className="fas fa-circle-user"></i> CUENTAS
				</button>
				
				<button
					className={`menu-button${activeView === "productos" ? " active" : ""}`}
					data-view="productos"
					onClick={() => {
						setCurrentAdminView("productos");
						setActiveView("productos");
					}}
				>
					<i className="fas fa-boxes"></i> STOCK
				</button>
			</div>

			<div className="line"></div>

			<div className="sidebar-options">
				<button
					className="menu-button-round green-border"
					data-view="exportar"
					onClick={() => {
						setCurrentAdminView("exportar");
					}}
				>
					<i className="fas fa-file-excel"></i> EXPORTAR A EXCEL
				</button>
				{/*
				<button
					className="menu-button-round blue-border"
					onClick={() => {
						setCurrentAdminView("linkDevice")
					}}
				>
					<i className="fas fa-link"></i> VINCULAR DISPOSITIVO
				</button>*/}

				{/* CHAT BUTTON 
				<button
					className="menu-button-round gray-border"
					data-view="chat"
					onClick={(e) => {
						setCurrentAdminView("chat");
					}}
				>
					<i className="fas fa-comments"></i> CHAT
				</button>
				*/}
			</div>
		</div>
	);
}

export default Options_Admin;