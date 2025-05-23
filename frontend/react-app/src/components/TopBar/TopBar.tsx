import React from 'react';
import './TopBar.css';

const TopBar: React.FC = () => {
  const handleHelpClick = () => {
    window.location.href = '/ayuda';
  };

  return (
    <div className="header-top">
      <div className="header-icons">
        <button className="header-icon" onClick={handleHelpClick}>
          <i className="fas fa-question"></i>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
