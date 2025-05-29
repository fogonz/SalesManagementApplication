import React from 'react';
import { useNavigate } from 'react-router-dom'
import './TopBar.css';

const TopBar: React.FC = () => {

  const navigate = useNavigate()

  const sectionHelp = () => {
    navigate('/ayuda')
  }

  const sectionAdmin = () => {
    navigate('/administrador')
  }

  const sectionHome = () => {
    navigate('/')
  }

  return (
    <div className="header-top">
      <div className="header-icons">
        <div className='row'>
          <button onClick={sectionHome} className='topbar-button'> <p>Operador</p> </button>
          <button onClick={sectionAdmin} className='topbar-button'> <p>Administrador</p> </button>
        </div>
      </div>
      <button onClick={sectionHelp} className="header-icon">
          <i className="fas fa-question"></i>
      </button>
    </div>
  );
};

export default TopBar;
