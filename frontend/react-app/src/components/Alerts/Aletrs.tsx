import React, { useState, useRef, useEffect } from 'react';
import './Alerts.css';

const Alerts = (Alerts) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [lastX, setLastX] = useState(0);
  const [lastTime, setLastTime] = useState(0);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  const checkScrollPosition = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      
      // Show left fade if scrolled from the beginning
      setShowLeftFade(scrollLeft > 10);
      
      // Show right fade if not at the end
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX);
    setLastX(e.pageX);
    setLastTime(Date.now());
    setScrollLeft(containerRef.current.scrollLeft);
    setVelocity(0);
    containerRef.current.style.cursor = 'grabbing';
    
    // Cancel any ongoing momentum
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const currentX = e.pageX;
    const currentTime = Date.now();
    const deltaX = currentX - startX;
    const deltaTime = currentTime - lastTime;
    
    // Calculate velocity for momentum
    if (deltaTime > 0) {
      setVelocity((currentX - lastX) / deltaTime * 16); // Normalize to 60fps
    }
    
    setLastX(currentX);
    setLastTime(currentTime);
    
    // Apply drag movement
    containerRef.current.scrollLeft = scrollLeft - deltaX;
    checkScrollPosition();
  };

  const applyMomentum = () => {
    if (Math.abs(velocity) > 0.1) {
      containerRef.current.scrollLeft -= velocity;
      setVelocity(velocity * 0.95); // Friction
      checkScrollPosition();
      animationRef.current = requestAnimationFrame(applyMomentum);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    containerRef.current.style.cursor = 'grab';
    
    // Apply momentum if there's enough velocity
    if (Math.abs(velocity) > 0.5) {
      applyMomentum();
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const scrollAmount = e.deltaY * 0.5; // Smooth wheel scrolling
    containerRef.current.scrollLeft += scrollAmount;
    checkScrollPosition();
  };

  const handleScroll = () => {
    checkScrollPosition();
  };

  const handleAlertClick = (alertText, e) => {
    // Prevent click if we were dragging
    if (Math.abs(velocity) > 0.1 || isDragging) {
      e.preventDefault();
      return;
    }
    console.log('Alert clicked:', alertText);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      // Initial check
      checkScrollPosition();
      
      // Mouse events
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('mouseleave', handleMouseLeave);
      container.addEventListener('scroll', handleScroll);
      
      // Wheel event for horizontal scrolling
      container.addEventListener('wheel', handleWheel, { passive: false });

      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('scroll', handleScroll);
        container.removeEventListener('wheel', handleWheel);
        
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isDragging, startX, scrollLeft, velocity, lastX, lastTime]);

  // Check scroll position on window resize
  useEffect(() => {
    const handleResize = () => {
      setTimeout(checkScrollPosition, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="dashboard-header">
      <div className="header-content">
        <div className="header-left">
          <span className="analysis-label">ALERTS</span>
          <div className="alert-container">
            <div 
              className="alert-badges"
              ref={containerRef}
              onMouseDown={handleMouseDown}
            >
              <button 
                className="alert-badge alert-badge--warning"
                onClick={(e) => handleAlertClick('Productos de alto rendimiento con stock crítico', e)}
              >
                % Productos de alto rendimiento con stock crítico
              </button>
              <button 
                className="alert-badge alert-badge--danger"
                onClick={(e) => handleAlertClick('Deuda por pagar dentro de 4 días', e)}
              >
                1 Deuda por pagar dentro de 4 días
              </button>
              <button 
                className="alert-badge alert-badge--info"
                onClick={(e) => handleAlertClick('Nuevas órdenes pendientes de revisión', e)}
              >
                3 Nuevas órdenes pendientes de revisión
              </button>
              <button 
                className="alert-badge alert-badge--warning"
                onClick={(e) => handleAlertClick('Inventario bajo en productos', e)}
              >
                Inventario bajo en 5 productos
              </button>
              <button 
                className="alert-badge alert-badge--danger"
                onClick={(e) => handleAlertClick('Facturas vencidas por cobrar', e)}
              >
                2 Facturas vencidas por cobrar
              </button>
              
            </div>
            
            {/* Fade overlays */}
            <div 
              className={`fade-overlay fade-left ${showLeftFade ? 'fade-visible' : ''}`}
            />
            <div 
              className={`fade-overlay fade-right ${showRightFade ? 'fade-visible' : ''}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;