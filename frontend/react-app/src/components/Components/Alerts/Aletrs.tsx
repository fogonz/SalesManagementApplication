import React, { useState, useRef, useEffect } from 'react';
import './Alerts.css';

const Alerts = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [lastX, setLastX] = useState(0);
  const [lastTime, setLastTime] = useState(0);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const containerRef = useRef(null);
  const animationRef = useRef(null);

  const toggleHeader = () => {
    setIsHeaderVisible(!isHeaderVisible);
  };

  const checkScrollPosition = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeftFade(scrollLeft > 10);
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

    if (deltaTime > 0) {
      setVelocity((currentX - lastX) / deltaTime * 16);
    }

    setLastX(currentX);
    setLastTime(currentTime);

    containerRef.current.scrollLeft = scrollLeft - deltaX;
    checkScrollPosition();
  };

  const applyMomentum = () => {
    if (Math.abs(velocity) > 0.1) {
      containerRef.current.scrollLeft -= velocity;
      setVelocity(velocity * 0.95);
      checkScrollPosition();
      animationRef.current = requestAnimationFrame(applyMomentum);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    containerRef.current.style.cursor = 'grab';

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
    const scrollAmount = e.deltaY * 0.5;
    containerRef.current.scrollLeft += scrollAmount;
    checkScrollPosition();
  };

  const handleScroll = () => {
    checkScrollPosition();
  };

  const handleAlertClick = (alertText, e) => {
    if (Math.abs(velocity) > 0.1 || isDragging) {
      e.preventDefault();
      return;
    }
    console.log('Alert clicked:', alertText);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      checkScrollPosition();

      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('mouseleave', handleMouseLeave);
      container.addEventListener('scroll', handleScroll);
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

  useEffect(() => {
    const handleResize = () => {
      setTimeout(checkScrollPosition, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {!isHeaderVisible && (
        <button className="toggle-header-btn" onClick={toggleHeader}>
          ▼ Mostrar
        </button>
      )}

      <div className={`dashboard-header ${isHeaderVisible ? '' : 'hidden'}`}>
        <div className="header-content">
          <div className="header-left">
            <button className="toggle-hide-btn" onClick={toggleHeader}>
                ▲
            </button>
            <div className="alerts-header-title">
              <span className="analysis-label">ALERTS</span>
            </div>
            <div className="alert-container">
              <div
                className="alert-badges"
                ref={containerRef}
                onMouseDown={handleMouseDown}
              >
                <button
                  className="alert-badge alert-badge--warning"
                  onClick={(e) =>
                    handleAlertClick('Productos de alto rendimiento con stock crítico', e)
                  }
                >
                  % Productos de alto rendimiento con stock crítico
                </button>
                <button
                  className="alert-badge alert-badge--danger"
                  onClick={(e) =>
                    handleAlertClick('Deuda por pagar dentro de 4 días', e)
                  }
                >
                  1 Deuda por pagar dentro de 4 días
                </button>
                <button
                  className="alert-badge alert-badge--info"
                  onClick={(e) =>
                    handleAlertClick('Nuevas órdenes pendientes de revisión', e)
                  }
                >
                  3 Nuevas órdenes pendientes de revisión
                </button>
                <button
                  className="alert-badge alert-badge--warning"
                  onClick={(e) =>
                    handleAlertClick('Inventario bajo en productos', e)
                  }
                >
                  Inventario bajo en 5 productos
                </button>
                <button
                  className="alert-badge alert-badge--danger"
                  onClick={(e) =>
                    handleAlertClick('Facturas vencidas por cobrar', e)
                  }
                >
                  2 Facturas vencidas por cobrar
                </button>
              </div>
              <div
                className={`fade-overlay fade-left ${
                  showLeftFade ? 'fade-visible' : ''
                }`}
              />
              <div
                className={`fade-overlay fade-right ${
                  showRightFade ? 'fade-visible' : ''
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Alerts;
