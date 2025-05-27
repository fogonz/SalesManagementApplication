import React, { useEffect, useState } from 'react'
import './help.css'

const HelpMenu: React.FC = () => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([])
  const [darkMode, setDarkMode] = useState(false)

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

  // Alternar visibilidad de una respuesta
  const toggleAnswer = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  const faqs = [
    {
      question: 'Quiero añadir un producto nuevo que no está en el menú',
      answer:
        'Para añadir un producto nuevo, ve al menú de productos y haz clic en "Agregar". Completa los campos requeridos y guarda.',
    },
    {
      question: 'Necesito ayuda añadiendo un movimiento / producto / cliente',
      answer:
        'Selecciona el módulo correspondiente (movimientos, productos o clientes), haz clic en "Nuevo" y sigue las instrucciones del formulario.',
    },
    {
      question: 'Quiero ver el tutorial explicativo',
      answer: (
        <div className="tutorial">
          <strong>(Tutorial explicativo)</strong>
          <br />
          <br />
          <img src="/api/placeholder/500/200" alt="Tutorial explicativo" />
        </div>
      ),
    },
    {
      question: 'Quiero consultar reportes básicos',
      answer:
        'Ve a la sección de "Reportes", selecciona el tipo de informe (ventas, inventario, etc.) y el rango de fechas.',
    },
  ]

  return (
    <div className="container">
      <div className="logo-section">
        <img
          src="https://images.steamusercontent.com/ugc/1298675651395030773/1490E7F605879E8E6336535DE2F282BE766BF930/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false"
          alt="Logo"
        />
        <div className="logo-text">
          <div className="logo-title">Ferretería Lo de Pablo</div>
          <div className="logo-subtitle">
            Aplicación de Registro y
            <br />
            Administración de Ventas
          </div>
        </div>
      </div>

      {faqs.map((faq, index) => (
        <React.Fragment key={index}>
          <button className="question" onClick={() => toggleAnswer(index)}>
            {faq.question}
          </button>
          <div
            className="answer"
            style={{ display: openIndexes.includes(index) ? 'block' : 'none' }}
          >
            {faq.answer}
          </div>
        </React.Fragment>
      ))}

      <div className="dark-mode-container">
        <span>Modo Oscuro</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode((prev) => !prev)}
          />
          <span className="slider"></span>
        </label>
      </div>
    </div>
  )
}

export default HelpMenu
