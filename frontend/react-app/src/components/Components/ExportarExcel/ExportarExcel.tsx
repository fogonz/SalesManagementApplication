import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { fetchTableData } from '../../../services/api';
import './ExportarExcel.css';

const ExportarExcel: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (table: 'movimientos' | 'cuentas' | 'productos') => {
    setLoading(table);
    try {
      let data = await fetchTableData(table);
      if (!data || data.length === 0) {
        alert('No hay datos para exportar.');
        setLoading(null);
        return;
      }

      // Si es movimientos, obtener cuentas para mapear nombre
      let cuentas: any[] = [];
      if (table === 'movimientos') {
        cuentas = await fetchTableData('cuentas');
      }

      // Procesar movimientos: agregar columna total, mostrar productos en concepto y nombre de cuenta
      if (table === 'movimientos') {
        data = data.map((row: any) => {
          const total = row.total !== undefined ? row.total : '';
          let concepto = row.concepto;
          if (Array.isArray(row.items) && row.items.length > 0) {
            const productos = row.items.map(
              (item: any) =>
                `${item.nombre_producto} (x${item.cantidad}, $${item.precio_unitario}${item.descuento_item ? `, desc: ${item.descuento_item}%` : ''})`
            );
            concepto = productos.join('; ');
          }
          // Buscar nombre de cuenta
          let cuentaNombre = row.cuenta;
          if (cuentas && cuentas.length > 0) {
            const cuentaObj = cuentas.find((c: any) => c.id === row.cuenta);
            cuentaNombre = cuentaObj ? cuentaObj.nombre : row.cuenta;
          }
          const { items, ...rest } = row;
          return {
            ...rest,
            cuenta: cuentaNombre,
            concepto,
            total,
          };
        });
        // Ordenar por id ascendente
        data = data.sort((a: any, b: any) => a.id - b.id);
        const columnsOrder = [
          'id', 'fecha', 'tipo', 'cuenta', 'concepto', 'descuento_total', 'total'
        ];
        data = data.map((row: any) => {
          const ordered: any = {};
          columnsOrder.forEach(col => { ordered[col] = row[col]; });
          Object.keys(row).forEach(col => {
            if (!ordered.hasOwnProperty(col)) ordered[col] = row[col];
          });
          return ordered;
        });
      }

      // Ordenar por id ascendente para cuentas y productos
      if ((table === 'cuentas' || table === 'productos') && data.length > 0 && data[0].id) {
        data = data.sort((a: any, b: any) => a.id - b.id);
      }

      // Ocultar cantidad_inicial en productos
      if (table === 'productos') {
        data = data.map(({ cantidad_inicial, ...rest }: any) => rest);
      }

      // Convertir a hoja de Excel
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, table.charAt(0).toUpperCase() + table.slice(1));
      XLSX.writeFile(wb, `${table}.xlsx`);
    } catch (err) {
      alert('Error al exportar datos.');
    }
    setLoading(null);
  };

  const exportOptions = [
    {
      key: 'movimientos',
      title: 'Exportar Movimientos',
      description: 'Exporta todos los movimientos financieros',
      icon: '📊',
      className: 'export-card--movimientos'
    },
    {
      key: 'cuentas',
      title: 'Exportar Cuentas',
      description: 'Exporta la información de las cuentas',
      icon: '💳',
      className: 'export-card--cuentas'
    },
    {
      key: 'productos',
      title: 'Exportar Productos',
      description: 'Exporta el catálogo de productos',
      icon: '📦',
      className: 'export-card--productos'
    }
  ] as const;

  return (
    <div className="export-container">
      <div className="export-wrapper">
        {/* Header */}
        <div className="export-header">
          <div className="export-header__icon">
            <span>📈</span>
          </div>
          <h1 className="export-header__title">Exportar Datos a Excel</h1>
          <p className="export-header__subtitle">
            Descarga tus datos en formato Excel de manera rápida y sencilla
          </p>
        </div>

        {/* Export Cards */}
        <div className="export-grid">
          {exportOptions.map((option) => (
            <div
              key={option.key}
              className={`export-card ${option.className}`}
            >
              <div className="export-card__content">
                {/* Icon and Title */}
                <div className="export-card__header">
                  <div className="export-card__icon">
                    <span>{option.icon}</span>
                  </div>
                  <h3 className="export-card__title">
                    {option.title}
                  </h3>
                  <p className="export-card__description">
                    {option.description}
                  </p>
                </div>

                {/* Export Button */}
                <button
                  onClick={() => handleExport(option.key)}
                  disabled={loading === option.key}
                  className={`export-button ${loading === option.key ? 'export-button--loading' : ''}`}
                >
                  {loading === option.key ? (
                    <div className="export-button__loading">
                      <div className="spinner"></div>
                      <span>Exportando...</span>
                    </div>
                  ) : (
                    <div className="export-button__content">
                      <span className="export-button__icon">⬇️</span>
                      <span>Exportar</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="export-info">
          <div className="export-info__icon">
            <span>ℹ️</span>
          </div>
          <div className="export-info__content">
            <h3 className="export-info__title">
              Información sobre la exportación
            </h3>
            <ul className="export-info__list">
              <li>• Los archivos se descargarán en formato .xlsx</li>
              <li>• Los datos se ordenan por fecha (más recientes primero)</li>
              <li>• Los movimientos incluyen detalles de productos expandidos</li>
              <li>• En movimientos, la columna "cuenta" muestra el nombre de la cuenta</li>
              <li>• La exportación puede tardar unos segundos según el volumen de datos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportarExcel;