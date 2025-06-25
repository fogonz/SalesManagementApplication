import React from "react";

const DeleteButton = () => (
  <svg
    width="40px"
    height="40px"
    viewBox="0 0 24 24"
    style={{
      stroke: '#e53e3e',
      fill: 'none',
      strokeWidth: 1.5,
      strokeLinecap: 'round',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.fill = '#e53e3e';
      e.currentTarget.style.stroke = '#374151';

      const minus = e.currentTarget.querySelector('#minus') as SVGPathElement | null;
      if (minus) {
        minus.style.transition = 'transform 0.5s ease';
        minus.style.transformOrigin = '12px 12px';
        minus.style.transform = 'rotate(90deg)';
      }
    }}
    onMouseLeave={e => {
      e.currentTarget.style.fill = 'none';
      e.currentTarget.style.stroke = '#e53e3e';

      const minus = e.currentTarget.querySelector('#minus') as SVGPathElement | null;
      if (minus) {
        minus.style.transition = 'transform 0.5s ease';
        minus.style.transformOrigin = '12px 12px';
        minus.style.transform = 'rotate(0deg)';
      }
    }}
  >
    <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" />
    <path id="minus" d="M8 12H16" />
  </svg>
);

export default DeleteButton;
