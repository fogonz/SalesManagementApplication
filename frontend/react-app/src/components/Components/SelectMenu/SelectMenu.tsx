import React, { useState, useEffect } from "react";
import "./SelectMenu.css";

export interface SelectMenuOption {
  label: string;
  action: () => void;
  icon?: string;
  disabled?: boolean;
  keepOpen?: boolean; // New property to control whether menu stays open
}

type SelectMenuProps = {
  options: SelectMenuOption[];
  position: { x: number; y: number; width?: number }; // Add width
  onClose: () => void;
};

const SelectMenu: React.FC<SelectMenuProps> = ({ options, position, onClose }) => {
  // Estado interno para activar la animación de entrada
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Al montar, pide al siguiente tick que meta la clase .mounted
    const id = window.requestAnimationFrame(() => setMounted(true));
    return () => {
      window.cancelAnimationFrame(id);
    };
  }, []);

  return (
    <>
      <div className="select-menu-overlay" onClick={onClose} />
      <div
        className={`select-menu ${mounted ? "mounted" : ""}`}
        style={{
          left: position.x,
          top: position.y,
          width: position.width ? position.width : undefined // Set width if provided
        }}
      >
        <ul className="select-menu-list">
          {options.map((option, idx) => (
            <li key={idx} className="select-menu-item">
              <button
                className="select-menu-button"
                onClick={() => {
                  if (!option.disabled) {
                    option.action();
                    // Only close if keepOpen is not true
                    if (!option.keepOpen) {
                      onClose();
                    }
                  }
                }}
                disabled={option.disabled}
              >
                {option.icon && <span className="select-menu-icon">{option.icon}</span>}
                <span className="select-menu-label">{option.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default SelectMenu;