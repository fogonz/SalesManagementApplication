import React, { useEffect, useRef } from 'react';
import { GridStack } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';
import './PerformanceGrid.css';

interface PerformanceDataItem {
  type: any;
  label: string;
  value: number;
  
}

interface PerformanceGridProps {
  performanceData: PerformanceDataItem[];
}

const PerformanceGrid: React.FC<PerformanceGridProps> = ({ performanceData }) => {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current) {
      const grid = GridStack.init(
        {
          float: true,
          margin: 10,
          cellHeight: 160,
          resizable: { handles: '' },
          draggable: {
            handle: '.performance-card',
          },
        },
        gridRef.current
      );

      return () => {
        grid.destroy(false);
      };
    }
  }, []);

  return (
    <div className="bottom-grid">
      <div className="grid-stack performance-grid" ref={gridRef}>
        {performanceData.map((item, index) => (
          <div
            key={index}
            className="grid-stack-item"
            gs-x={(index % 3) * 4}
            gs-y={Math.floor(index / 3)}
            gs-w="4"
            gs-h="1"
          >
            <div className="grid-stack-item-content performance-card">
              <div className="performance-label">{item.label}</div>
              <div className={`performance-value performance-value--${item.type}`}>
                {item.value}%
              </div>
              <div className={`performance-indicator performance-indicator--${item.type}`}>
                {item.type === 'positive' ? '▲' : '▼'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceGrid;
