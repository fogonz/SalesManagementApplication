import React from "react";

const AddButton = () => (
	<svg
		width="40px"
		height="40px"
		viewBox="0 0 24 24"
		style={{
			stroke: '#13a813',
			fill: 'none',
			strokeWidth: '1.5',
			transition: 'all 0.3s ease'
		}}
		onMouseEnter={e => {
			e.currentTarget.style.fill = '#13a813';
			e.currentTarget.style.stroke = '#374151';
		}}
		onMouseLeave={e => {
			e.currentTarget.style.fill = 'none';
			e.currentTarget.style.stroke = '#13a813';
		}}
	>
		<path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"></path>
		<path d="M8 12H16"></path>
		<path d="M12 16V8"></path>
	</svg>
);

export default AddButton;