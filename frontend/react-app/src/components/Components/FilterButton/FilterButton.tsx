import React, { useState } from 'react';
import './FilterButton.css';

interface FilterButtonProps {
  selectedFilter: string;
  filterOptions: string[];
  onFilterChange: (filter: string) => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  selectedFilter,
  filterOptions,
  onFilterChange
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleFilterChange = (filter: string) => {
    onFilterChange(filter);
    setIsDropdownOpen(false);
  };

  return (
    <div className="filter-container">
      <div className="filter-dropdown">
        <button 
          className="filter-button" 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span className="filter-text">{selectedFilter}</span>
          <span className={`filter-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
        </button>
        
        {isDropdownOpen && (
          <div className="filter-dropdown-menu">
            {filterOptions.map((option) => (
              <button
                key={option}
                className={`filter-option ${selectedFilter === option ? 'active' : ''}`}
                onClick={() => handleFilterChange(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterButton;