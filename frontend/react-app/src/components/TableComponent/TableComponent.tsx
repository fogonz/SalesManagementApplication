import React, { useState, useRef } from 'react'
import './TableComponent.css'
import FloatingCell from '../FloatingCell/FloatingCell'
import { getCellColorClass } from '../../config/rowColors'

export interface ColumnDefinition {
  key: string
  label: string
  width?: number | string
  format?: (value: any) => string
}

export interface MovimientoRow {
  id: number
  fecha: string
  tipo: string
  cuenta_id: number
  producto_id: number
  total: string | number | null
  name?: string
  producto?: string
  cuenta?: string
  tipoMovimiento?: string
  abonado?: number | null
}

export interface CuentaRow {
  id: number
  nombre: string
  contacto_mail: string
  contacto_telefono: string
  tipo_cuenta: string
  saldo?: number | null
  tipo?: string
}

export interface ProductoRow {
  id: number
  descripcion: string
  stock: number | null
  precio: number | null
}

type TableRow = MovimientoRow | CuentaRow | ProductoRow

type TableProps = {
  columns: ColumnDefinition[]
  rows: TableRow[]
  tableType: 'movimientos' | 'cuentas' | 'productos'
}

// Helper function to format tipo values
const formatTipoValue = (value: string): string => {
  if (!value) return value
  
  // Replace underscores with spaces and capitalize first letter
  return value
    .replace(/_/g, ' ')
    .charAt(0).toUpperCase() + value.replace(/_/g, ' ').slice(1)
}

const TableComponent: React.FC<TableProps> = ({ columns, rows, tableType }) => {
  const tableRef = useRef<HTMLDivElement>(null)
  const [hoveredCell, setHoveredCell] = useState<any>(null)

  if (!rows.length) {
    return (
      <div className="table_wrapper" ref={tableRef}>
        <div className="table_container">
          <div className="table_header">
            {columns.map(col => (
              <div key={col.key} className="table_header__cell" style={{ width: col.width }}>
                {col.label}
              </div>
            ))}
          </div>
          <div className="table_body">
            <div className="no-data-message">No hay datos disponibles</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="table_wrapper" ref={tableRef}>
      <div className="table_container">
        <div className="table_header">
          {columns.map(col => (
            <div key={col.key} className="table_header__cell" style={{ width: col.width }}>
              {col.label}
            </div>
          ))}
        </div>

        <div className="table_body">
          {rows.map(row => {
            const tipoKey = tableType === 'movimientos' ? 'tipo' : 'tipo_cuenta'
            const tipoValue = (row as any)[tipoKey]
            const tipoContent = columns.find(c => c.key === tipoKey)?.format?.(tipoValue) ?? tipoValue
            const bgColor = getCellColorClass(tipoContent, tableType)

            return (
              <div key={(row as any).id} className="table_row" style={{ backgroundColor: bgColor }}>
                {columns.map(col => {
                  const raw = (row as any)[col.key]
                  let content = col.format ? col.format(raw) : raw ?? '-'
                  
                  
                  if (col.key === 'tipo' || col.key === 'tipo_cuenta' || col.key === 'tipoMovimiento') {
                    content = content !== '-' ? formatTipoValue(content) : content
                  }
                  
                  const symbol = ['total', 'monto', 'estado'].includes(col.key) ? '$' : ''
                  const symbolAfter = ['descuento', 'descuento_total'].includes(col.key) ? '%' : ''

                  return (
                    <div
                      key={col.key}
                      className="table_cell"
                      style={{ width: col.width }}
                      onMouseEnter={e => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const wrap = tableRef.current?.getBoundingClientRect()
                        if (!wrap) return
                        setHoveredCell({
                          x: rect.left - wrap.left,
                          y: rect.top - wrap.top,
                          width: rect.width,
                          height: rect.height,
                          opacity: 1,
                          background: bgColor,
                          symbol,
                          content,
                          currentCol: col.key
                        })
                      }}
                      onMouseLeave={e => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const wrap = tableRef.current?.getBoundingClientRect()
                        if (!wrap) return
                        setHoveredCell({ x: 0, y: 0, width: 0, height: 0, opacity: 0, background: '#fff' })
                      }}
                    >
                      {symbol}{content}{symbolAfter}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {hoveredCell && <FloatingCell hoveredCell={hoveredCell} isGray={hoveredCell.currentCol === 'id'} />}
      </div>
    </div>
  )
}

export default TableComponent