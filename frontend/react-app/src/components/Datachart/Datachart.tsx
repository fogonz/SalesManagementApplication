import React, { useEffect, useRef } from 'react';
import { GridStack } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';
import './Datachart.css';

interface DatachartProps {
  ingreso: number;
  egreso: number;
}

const Datachart: React.FC<DatachartProps> = ({ ingreso, egreso }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const total = ingreso - egreso;

  useEffect(() => {
    if (gridRef.current) {
      const grid = GridStack.init(
        {
          float: true,
          margin: 10,
          cellHeight: 160,
          resizable: { handles: '' },
          draggable: {
            handle: '.card',
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
    <div className="datachart-wrapper">
      <div className="grid-stack" ref={gridRef}>
        {/* Ingreso */}
        <div className="grid-stack-item" gs-x="0" gs-y="0" gs-w="6" gs-h="1">
          <div className="grid-stack-item-content">
            <div className="card">
              <div className="metric-item">
                <div className="metric-label">Ingreso</div>
                <div className="metric-value metric-value--positive">
                  ${ingreso.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Egreso */}
        <div className="grid-stack-item" gs-x="6" gs-y="0" gs-w="6" gs-h="1">
          <div className="grid-stack-item-content">
            <div className="card">
              <div className="metric-item">
                <div className="metric-label">Egreso</div>
                <div className="metric-value metric-value--negative">
                  ${egreso.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="grid-stack-item" gs-x="0" gs-y="1" gs-w="12" gs-h="1">
          <div className="grid-stack-item-content">
            <div className="card card--total">
              <div className="metric-item">
                <div className="metric-label">Total</div>
                <div
                  className={`metric-value ${
                    total >= 0
                      ? 'metric-value--positive'
                      : 'metric-value--negative'
                  }`}
                >
                  ${total.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Datachart;
