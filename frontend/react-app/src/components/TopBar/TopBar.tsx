import React from 'react';
import { useNavigate } from 'react-router-dom'
import './TopBar.css';

const TopBar: React.FC = () => {

  const navigate = useNavigate()

  const goToAyuda = () => {
    navigate('/ayuda')
  }

  return (
    <div className="header-top">
      <div className="header-icons">
        <button onClick={goToAyuda} className="header-icon">
          <i className="fas fa-question"></i>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
