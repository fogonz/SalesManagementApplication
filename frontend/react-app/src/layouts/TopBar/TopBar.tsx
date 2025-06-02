import React from 'react';
import { useNavigate } from 'react-router-dom'
import './TopBar.css';
import { useState } from 'react';

const TopBar: React.FC = () => {

  const [state, setState] = useState<"1" | "2">("1");

  const setActive = (value: "1" | "2") => {
    setState(value);
  };

  const navigate = useNavigate()

  const sectionHelp = () => {
    navigate('/ayuda')
  }

  const sectionAdmin = () => {
    navigate('/admin')
  }

  const sectionHome = () => {
    navigate('/')
    
  }

  return (
    <div className="header-top">
      <div className="header-icons">
        <div className='row'>
          <button onClick={() => {sectionHome(); setActive("1")}} className={`topbar-button ${state === "1" ? "active" : "inactive"}`}> <p>Operador</p> </button>
          <button onClick={() => {sectionAdmin(); setActive("2")}} className={`topbar-button ${state === "1" ? "inactive" : "active"}`}> <p>Administrador</p> </button>
        </div>
      </div>
      <button onClick={sectionHelp} className="header-icon">
          <i className="fas fa-question"></i>
      </button>
    </div>
  );
};

export default TopBar;
