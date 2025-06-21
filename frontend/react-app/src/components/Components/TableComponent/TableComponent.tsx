import React, { useState, useRef } from 'react'
import './TableComponent.css'
import FloatingCell from '../FloatingCell/FloatingCell'
import { getCellColorClass } from '../../../config/rowColors'
import { editableCells } from '../../../config/editableCells'

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
  cuenta: number
  total: string | number | null
  descuento_total?: string | number | null
  concepto?: string
  cantidad_productos?: number
  name?: string
  producto?: string
  tipoMovimiento?: string
  abonado?: number | null
  items?: { nombre_producto: string; precio_unitario: string; cantidad: string; descuento_item: string }[]
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
  movimientosData?: MovimientoRow[]
  movimientosColumns?: ColumnDefinition[] 
  isAdmin?: boolean
  onCellEdit?: (params: {
    rowId: number;
    field: any;
    prevValue: any;
    newValue: any;
  }) => void;
}

// Helper function to format tipo values
const formatTipoValue = (value: string): string => {
  if (!value) return value
  
  // Replace underscores with spaces and capitalize first letter
  return value
    .replace(/_/g, ' ')
    .charAt(0).toUpperCase() + value.replace(/_/g, ' ').slice(1)
}

const TableComponent: React.FC<TableProps> = ({ 
  columns, 
  rows, 
  tableType, 
  movimientosData, 
  movimientosColumns, 
  isAdmin,
  onCellEdit 
}) => {
  const tableRef = useRef<HTMLDivElement>(null)
  const [hoveredCell, setHoveredCell] = useState<any>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedCuentaId, setSelectedCuentaId] = useState<number | null>(null)
  const [editingCell, setEditingCell] = useState<{rowId: number, columnKey: string, prevValue: any} | null>(null)
  const [editValue, setEditValue] = useState<string>('')

  const openModal = (cuentaId: number) => {
    setSelectedCuentaId(cuentaId)
    setModalVisible(true)
  }
  
  const closeModal = () => {
    setSelectedCuentaId(null)
    setModalVisible(false)
  }

  const handleCellClick = (rowId: number, columnKey: string, currentValue: any, isEditable: boolean) => {
    if (tableType === 'cuentas' && columnKey === 'nombre') {
      openModal(rowId)
      return
    }
    
    if (isEditable && isAdmin) {
      setEditingCell({ rowId, columnKey, prevValue: currentValue })
      setEditValue(currentValue?.toString() || '')
    }
  }

  const handleEditSubmit = (rowId: number, columnKey: any, prevValue: any) => {
    if (onCellEdit) {
      onCellEdit({
        rowId: rowId,
        field: columnKey,
        prevValue: prevValue,
        newValue: editValue
      });
    }
    setEditingCell(null)
    setEditValue('')
  }

  const handleEditCancel = () => {
    setEditingCell(null)
    setEditValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent, rowId: number, columnKey: string, prevValue: any) => {
    if (e.key === 'Enter') {
      handleEditSubmit(rowId, columnKey, prevValue)
    } else if (e.key === 'Escape') {
      handleEditCancel()
    }
  }

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

  // Get movimientos for the selected cuenta
  const getMovimientosForCuenta = (cuentaId: number): MovimientoRow[] => {
    if (!movimientosData) return []
    return movimientosData.filter(m => m.cuenta === cuentaId)
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

                  if (
                    col.key === 'concepto' &&
                    (row as any).items &&
                    ['factura_venta', 'factura_compra'].includes((row as any).tipo)
                  ) {
                    content = `${(row as any).items.length} producto/s`
                  }
                  
                  if (col.key === 'tipo' || col.key === 'tipo_cuenta' || col.key === 'tipoMovimiento') {
                    content = content !== '-' ? formatTipoValue(content) : content
                  }

                  const symbol = ['total', 'monto', 'estado'].includes(col.key) ? '$' : ''
                  const symbolAfter = ['descuento', 'descuento_total'].includes(col.key) ? '%' : ''
                  let isEditable = false

                  if (editableCells.includes(col.key)){
                    isEditable = true;
                  }

                  const isCurrentlyEditing = editingCell?.rowId === (row as any).id && editingCell?.columnKey === col.key

                  return (
                    <div
                      key={col.key}
                      className={`table_cell ${isEditable && isAdmin ? 'editable-cell' : ''}`}
                      style={{ width: col.width }}
                      onMouseEnter={e => {
                        if (isCurrentlyEditing) return
                        
                        console.log(col.key)
                        const rect = e.currentTarget.getBoundingClientRect()
                        const wrap = tableRef.current?.getBoundingClientRect()

                        // Don't show anything in case there's no cell being hovered
                        if (!wrap) return

                        const items =
                          col.key === 'concepto' &&
                          tableType === 'movimientos' &&
                          (row as MovimientoRow).items
                            ? (row as MovimientoRow).items
                            : undefined

                        setHoveredCell({
                          x: rect.left - wrap.left,
                          y: rect.top - wrap.top,
                          width: rect.width,
                          height: rect.height,
                          opacity: 1,
                          background: bgColor,
                          symbol,
                          content,
                          symbolAfter,
                          isAdmin,
                          isEditable,
                          items,
                          currentCol: col.key

                        })
                      }}
                      onMouseLeave={e => {
                        if (isCurrentlyEditing) return
                        
                        const rect = e.currentTarget.getBoundingClientRect()
                        const wrap = tableRef.current?.getBoundingClientRect()
                        if (!wrap) return
                        setHoveredCell({ x: 0, y: 0, width: 0, height: 0, opacity: 0, background: '#fff' })
                      }}
                      onClick={e => {
                        handleCellClick((row as any).id, col.key, raw, isEditable)
                      }}
                    >
                      {isCurrentlyEditing ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleEditSubmit((row as any).id, col.key, editingCell.prevValue)}
                          onKeyDown={(e) => handleKeyDown(e, (row as any).id, col.key, editingCell.prevValue)}
                          className="edit-input"
                          autoFocus
                          style={{
                            width: '100%',
                            border: 'none',
                            outline: 'none',
                            backgroundColor: 'transparent',
                            fontSize: 'inherit',
                            fontFamily: 'inherit',
                            padding: '0',
                            margin: '0'
                          }}
                        />
                      ) : (
                        <>
                          {symbol}
                          {content}
                          {symbolAfter}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {hoveredCell && !editingCell && <FloatingCell hoveredCell={hoveredCell} isGray={hoveredCell.currentCol === 'id'} />}
        {modalVisible && selectedCuentaId && (
          <>
            <div className="modal-overlay" onClick={closeModal} />
            <div className="modal">
              <button className="modal-close" onClick={closeModal}>×</button>
              <h2>Movimientos de la cuenta #{selectedCuentaId}</h2>
              <TableComponent
                columns={movimientosColumns || columns}
                rows={getMovimientosForCuenta(selectedCuentaId)}
                tableType="movimientos"
                onCellEdit={onCellEdit}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default TableComponent