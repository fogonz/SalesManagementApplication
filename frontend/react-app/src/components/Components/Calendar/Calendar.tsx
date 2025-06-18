import React, { useState } from 'react';
import './Calendar.css';

interface CalendarProps {
  onDateSelect: (dates: string[]) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState(new Set<string>());
  
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const navigateMonth = (direction: 'prev' | 'next', e: React.MouseEvent) => {
    e.stopPropagation(); 
    const newMonth = direction === 'prev' ? currentMonth - 1 : currentMonth + 1;
    const newDate = new Date(currentYear, newMonth, 1);
    setCurrentDate(newDate);
  };
  
  const navigateYear = (direction: 'prev' | 'next', e: React.MouseEvent) => {
    e.stopPropagation(); 
    const newYear = direction === 'prev' ? currentYear - 1 : currentYear + 1;
    const newDate = new Date(newYear, currentMonth, 1);
    setCurrentDate(newDate);
  };
  
  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear;
  };
  
  const formatDateForFilter = (day: number) => {
    const month = (currentMonth + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    return `${currentYear}-${month}-${dayStr}`;
  };
  
  const getDayKey = (day: number) => formatDateForFilter(day);
  const isSelected = (day: number) => selectedDays.has(getDayKey(day));
  
  const toggleDaySelection = (day: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const dayKey = getDayKey(day);
    const newSelectedDays = new Set(selectedDays);
    
    if (newSelectedDays.has(dayKey)) {
      newSelectedDays.delete(dayKey);
    } else {
      newSelectedDays.add(dayKey);
    }
    
    setSelectedDays(newSelectedDays);
    onDateSelect(Array.from(newSelectedDays));
  };
  
  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDays(new Set());
    onDateSelect([]);
  };
  
  const renderCalendarDays = () => {
    const calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="calendar-day-empty"></div>
      );
    }
    
    // Add all days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const isTodayDay = isToday(day);
      const isSelectedDay = isSelected(day);
      
      let dayClass = 'calendar-day';
      if (isTodayDay) dayClass += ' calendar-day-today';
      if (isSelectedDay) dayClass += ' calendar-day-selected';
      
      calendarDays.push(
        <div
          key={`${currentYear}-${currentMonth}-${day}`}
          className={dayClass}
          onClick={(e) => toggleDaySelection(day, e)}
        >
          {day}
        </div>
      );
    }
    
    return calendarDays;
  };
  
  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button
            onClick={(e) => navigateYear('prev', e)}
            className="calendar-nav-btn"
            title="Año anterior"
          >
            <span className="nav-icon">«</span>
          </button>
          <button
            onClick={(e) => navigateMonth('prev', e)}
            className="calendar-nav-btn"
            title="Mes anterior"
          >
            <span className="nav-icon">‹</span>
          </button>
        </div>
        
        <h2 className="calendar-title">
          {months[currentMonth]} {currentYear}
        </h2>
        
        <div className="calendar-nav">
          <button
            onClick={(e) => navigateMonth('next', e)}
            className="calendar-nav-btn"
            title="Mes siguiente"
          >
            <span className="nav-icon">›</span>
          </button>
          <button
            onClick={(e) => navigateYear('next', e)}
            className="calendar-nav-btn"
            title="Año siguiente"
          >
            <span className="nav-icon">»</span>
          </button>
        </div>
      </div>
      
      <div className="calendar-weekdays">
        {days.map(day => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>
      
      <div className="calendar-days">
        {renderCalendarDays()}
      </div>
      
      {selectedDays.size > 0 && (
        <div className="calendar-selection">
          <div className="calendar-selection-content">
            <span className="calendar-selection-text">
              {selectedDays.size} día{selectedDays.size !== 1 ? 's' : ''} seleccionado{selectedDays.size !== 1 ? 's' : ''}
            </span>
            <button
              onClick={clearSelection}
              className="calendar-clear-btn"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}
      
      <div className="calendar-footer">
        <div className="calendar-today-info">
          <span className="today-label">Hoy:</span>
          <span className="today-date">
            {today.toLocaleDateString('es-ES', { 
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;