import React from 'react';
import './TableBox.css';

const TableBox: React.FC = () => {
	return(
		<div className="content-container">
			<div className="content-box">
			<div className="toolbar">
				<div className="toolbar-nav">
				<div className="toolbar-icon">
					<i className="fas fa-home"></i>
				</div>
				<div className="toolbar-icon">
					<i className="fas fa-list"></i>
				</div>
				<div className="toolbar-icon">
					<i className="fas fa-table"></i>
				</div>
				</div>

				<div className="search-container">
				<input
					type="text"
					className="search-input"
					placeholder="Buscar movimientos..."
				/>
				<button className="search-button">
					<i className="fas fa-search"></i>
				</button>
				</div>
				<div className="toolbar-actions">
				<button className="action-button">
					<i className="fas fa-filter"></i>
				</button>
				<button className="action-button">
					<i className="fas fa-sort"></i>
				</button>
				<button className="add-button">
					<span>Añadir Movimiento</span>
					<i className="fas fa-plus"></i>
				</button>
				</div>
			</div>

			<div id="table-container">
				<div id="root"></div>
			</div>
			</div>
      	</div>
	);
};

export default TableBox;