import React from 'react';
import { useNavigate } from 'react-router-dom'
import './TopBar.css';
import './DarkMode.css';
import { useState, useEffect } from 'react';

const TopBar: React.FC = () => {
  const [state, setState] = useState<"1" | "2" | "0">("1");
  const [darkMode, setDarkMode] = useState(false);

  const setActive = (value: "1" | "2") => {
    setState(value);
  };

  const navigate = useNavigate()

  // Cargar preferencia de modo oscuro desde localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode')
    if (savedMode === 'enabled') {
      setDarkMode(true)
      document.body.classList.add('dark-mode')
    }
  }, [])

  // Actualizar clase del body cada vez que cambia darkMode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode')
      localStorage.setItem('darkMode', 'enabled')
    } else {
      document.body.classList.remove('dark-mode')
      localStorage.setItem('darkMode', 'disabled')
    }
  }, [darkMode])

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
          <button onClick={() => {sectionHome(); setActive("1")}} className={`topbar-button ${state === "1" ? "active" : "inactive"}`}> 
            <p>Operador</p> 
          </button>
          <button onClick={() => {sectionAdmin(); setActive("2")}} className={`topbar-button ${state === "1" ? "inactive" : "active"}`}> 
            <p>Admin</p> 
          </button>
        </div>
      </div>
      
      <div className="header-right-controls">
        {/* Dark Mode Toggle */}
        <div className="dark-mode-container">
          
          <label className="switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode((prev) => !prev)}
            />
            <span className="slider"></span>
          </label>
        </div>
        
        {/* Help Button */}
        <button onClick={() => {sectionHelp(); setState("0")}} className="header-icon">
          <i className="fas fa-question"></i>
        </button>
      </div>
    </div>
  );
};

export default TopBar;