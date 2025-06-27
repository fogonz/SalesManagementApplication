import React, { useState, useRef } from 'react'
import './TableComponent.css'
import FloatingCell from '../FloatingCell/FloatingCell'
import { getCellColorClass } from '../../../config/rowColors'
import { editableCells } from '../../../config/editableCells'
import SelectMenu, { SelectMenuOption } from '../SelectMenu/SelectMenu'
import { ConfirmDeleteMenu } from '../../../layouts/menus/ConfitmDelete/ConfirmDelete'

export interface ColumnDefinition {
  key: string
  label: string
  width?: number | string
  format?: (value: any, row?: any) => string
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
  tableType: 'movimientos' | 'cuentas' | 'productos' | 'cajachica' // <-- add cajachica
  movimientosData?: MovimientoRow[]
  movimientosColumns?: ColumnDefinition[] 
  isAdmin?: boolean
  rowSelected?: number | null
  onRowSelect?: (rowId: number | null) => void;
  onCellEdit?: (params: {
    rowId: number;
    field: any;
    prevValue: any;
    newValue: any;
    currentTable?: string; 
  }) => void;
  onRowDelete?: (rowId: number) => void;
  onRefresh?: () => void;
  disableInteractions?: boolean; // <-- NUEVO
}

// Helper function to format tipo values
const formatTipoValue = (value: string): string => {
  if (!value) return value
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
  onCellEdit,
  onRowDelete,
  rowSelected,
  onRefresh,
  disableInteractions = false // <-- NUEVO
}) => {
  const tableRef = useRef<HTMLDivElement>(null)
  const [hoveredCell, setHoveredCell] = useState<any>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedCuentaId, setSelectedCuentaId] = useState<number | null>(null)
  const [selectedCuentaNombre, setSelectedCuentaNombre] = useState<string | null>(null) // NUEVO
  const [editingCell, setEditingCell] = useState<{rowId: number, columnKey: string, prevValue: any} | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [selectMenu, setSelectMenu] = useState<{
    visible: boolean;
    position: { x: number; y: number };
    rowId: number;
    columnKey: string;
    currentValue: any;
    isEditable: boolean;
  } | null>(null)
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null)
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null)
  
  // Delete confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteRowData, setDeleteRowData] = useState<{rowId: number, rowValues: any} | null>(null)

  // New states for large product list modal
  const [showLargeList, setShowLargeList] = useState(false);
  const [largeListItems, setLargeListItems] = useState<any[] | null>(null);
  const [largeListTitle, setLargeListTitle] = useState<string>("");

  const openModal = (cuentaId: number, cuentaNombre: string) => {
    setSelectedCuentaId(cuentaId)
    setSelectedCuentaNombre(cuentaNombre)
    setModalVisible(true)
  }
  
  const closeModal = () => {
    setSelectedCuentaId(null)
    setSelectedCuentaNombre(null)
    setModalVisible(false)
  }

  // This handles cell click, but you want to target the whole row.
  // So, let's add a row click handler below.
  const handleCellClick = (e: React.MouseEvent, rowId: number, columnKey: string, currentValue: any, isEditable: boolean) => {
    if (disableInteractions) return;
    e.preventDefault()
    e.stopPropagation()
    if (selectMenu?.visible) {
      setSelectMenu(null)
      setSelectedRowId(null)
      setSelectedCellId(null)
      return
    }
    setSelectedRowId(rowId)
    setSelectedCellId(`${rowId}-${columnKey}`)
    const rect = e.currentTarget.getBoundingClientRect()
    const position = {
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY,
      width: rect.width // Pass cell width
    }
    setSelectMenu({
      visible: true,
      position,
      rowId,
      columnKey,
      currentValue,
      isEditable
    })
  }

  // NEW: Row click handler to open menu for the whole row
  const handleRowClick = (e: React.MouseEvent, rowId: number) => {
    if (disableInteractions) return;
    e.preventDefault()
    e.stopPropagation()
    // Open menu for the first cell in the row (or just for the row)
    setSelectedRowId(rowId)
    setSelectedCellId(null)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const position = {
      x: rect.right + 10,
      y: rect.top + window.scrollY
    }
    setSelectMenu({
      visible: true,
      position,
      rowId,
      columnKey: '', // No specific cell
      currentValue: null,
      isEditable: false
    })
  }

  const handleEditStart = () => {
    if (disableInteractions) return;
    if (!selectMenu) return
    setEditingCell({ 
      rowId: selectMenu.rowId, 
      columnKey: selectMenu.columnKey, 
      prevValue: selectMenu.currentValue 
    })
    setEditValue(selectMenu.currentValue?.toString() || '')
    setSelectMenu(null)
  }

  // This is the action for "Eliminar Fila"
  const handleDelete = () => {
    if (!selectMenu) return
    // For demo: just log to console
    console.log('Eliminar Fila:', selectMenu.rowId)
    // If you want to show confirmation, keep the rest:
    const rowToDelete = rows.find(row => (row as any).id === selectMenu.rowId);
    if (rowToDelete) {
      setDeleteRowData({
        rowId: selectMenu.rowId,
        rowValues: rowToDelete
      });
      setShowDeleteConfirm(true);
    }
    // DON'T close the select menu here - let the SelectMenu handle it
  }

  const handleViewDetails = () => {
    if (!selectMenu) return
    // Fix: get cuentaId and cuentaNombre from the row when in movimientos table
    if (tableType === 'cuentas' && selectMenu.columnKey === 'nombre') {
      // Buscar el nombre de la cuenta
      const row = rows.find(r => (r as any).id === selectMenu.rowId)
      const cuentaNombre = row ? (row as any).nombre : ''
      openModal(selectMenu.rowId, cuentaNombre)
    } else if (tableType === 'movimientos' && selectMenu.columnKey === 'cuenta') {
      // Find the row and get its 'cuenta' property
      const row = rows.find(r => (r as any).id === selectMenu.rowId)
      const cuentaId = row ? (row as any).cuenta : null
      // Buscar el nombre de la cuenta en movimientosData o rows si está disponible
      let cuentaNombre = ''
      if (cuentaId) {
        // Buscar en rows si son cuentas, si no, buscar en movimientosData
        const cuentaRow = rows.find(r => (r as any).id === cuentaId) || (movimientosData && movimientosData.find(m => m.cuenta === cuentaId))
        cuentaNombre = cuentaRow ? (cuentaRow as any).nombre || '' : ''
      }
      if (cuentaId) {
        openModal(cuentaId, cuentaNombre)
      }
    }
    setSelectMenu(null)
  }

  const closeSelectMenu = () => {
    setSelectMenu(null)
    setSelectedRowId(null)
    setSelectedCellId(null)
  }

  // Handler para mostrar el modal grande de productos
  const handleShowLargeList = (items: any[], title: string) => {
    setLargeListItems(items);
    setLargeListTitle(title);
    setShowLargeList(true);
  };

  const getSelectMenuOptions = (): SelectMenuOption[] => {
    if (!selectMenu) return []
    const options: SelectMenuOption[] = []
    // Edit option (only for editable cells and admin users)
    if (selectMenu.isEditable && isAdmin) {
      options.push({
        label: 'Editar',
        action: handleEditStart,
        icon: '✏️'
      })
    }
    // View details option (for cuenta names in cuentas, or cuenta column in movimientos)
    if (
      (tableType === 'cuentas' && selectMenu.columnKey === 'nombre') ||
      (tableType === 'movimientos' && selectMenu.columnKey === 'cuenta')
    ) {
      options.push({
        label: 'Ver Movimientos',
        action: handleViewDetails,
        icon: '👁️'
      })
    }
    // Opción "Ver más" para celdas con lista de productos
    if (
      selectMenu.columnKey === 'concepto' &&
      tableType === 'movimientos'
    ) {
      const row = rows.find(r => (r as any).id === selectMenu.rowId);
      const items = row && (row as any).items;
      if (items && items.length > 0) {
        options.push({
          label: 'Ver más',
          action: () => handleShowLargeList(items, `Detalle de productos (${items.length})`),
          icon: '🔍'
        });
      }
    }
    // Delete option (always available)
    options.push({
      label: 'Eliminar Fila',
      action: handleDelete,
      icon: '🗑️',
      disabled: false,
      keepOpen: true
    })
    return options
  }

  // Delete confirmation handlers
  const handleDeleteConfirm = () => {
    console.log('Delete confirmed and completed');
    if (onRefresh) {
      onRefresh(); // <-- Refresh table after delete
    }
    setShowDeleteConfirm(false);
    setDeleteRowData(null);
    closeSelectMenu();
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeleteRowData(null);
    closeSelectMenu();
  }

  const handleEditSubmit = (rowId: number, columnKey: any, prevValue: any) => {
    if (disableInteractions) return;
    const hasChanges = editValue !== (prevValue?.toString() || '')
    if (hasChanges && onCellEdit) {
      onCellEdit({
        rowId: rowId,
        field: columnKey,
        prevValue: prevValue,
        newValue: editValue,
        currentTable: tableType // <-- Pasa el nombre de la tabla
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
    if (disableInteractions) return;
    if (e.key === 'Enter') {
      handleEditSubmit(rowId, columnKey, prevValue)
    } else if (e.key === 'Escape') {
      handleEditCancel()
    }
  }

  // Close select menu when clicking outside
  const handleTableClick = () => {
    if (disableInteractions) return;
    if (selectMenu?.visible) {
      closeSelectMenu()
    }
  }

  // Ordenar las filas por id de menor a mayor para todos los tipos de tabla
  const sortedRows = React.useMemo(() => {
    if (!rows.length) return rows;
    if (!('id' in rows[0])) return rows;
    return [...rows].sort((a, b) => {
      return (a as any).id - (b as any).id;
    });
  }, [rows]);

  if (!rows.length) {
    return (
      <div className="table_wrapper" ref={tableRef} onClick={handleTableClick}>
        <div className="table_scroll">
          <div className="table_header">
            {columns.map(col => (
              <div key={col.key} className="table_header__cell" style={{ width: col.width }}>
                {col.label}
              </div>
            ))}
          </div>
          <div className="table_container">
            <div className="table_body">
              <div className="no-data-message">No hay datos disponibles</div>
            </div>
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
    <div className="table_wrapper" ref={tableRef} onClick={handleTableClick}>
      {/* Overlay to block interaction when ConfirmDeleteMenu is open */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.05)',
            zIndex: 2000,
            pointerEvents: 'all'
          }}
        />
      )}
      <div className="table_scroll">
        <div className="table_header">
          {columns.map(col => (
            <div key={col.key} className="table_header__cell" style={{ width: col.width }}>
              {col.label}
            </div>
          ))}
        </div>
        <div className="table_container">
          <div className="table_body">
            {sortedRows.map(row => {
              // Use 'tipo' for cajachica and movimientos, 'tipo_cuenta' for cuentas
              let tipoKey = 'tipo'
              if (tableType === 'cuentas') tipoKey = 'tipo_cuenta'
              const tipoValue = (row as any)[tipoKey]
              const tipoContent = columns.find(c => c.key === tipoKey)?.format?.(tipoValue) ?? tipoValue
              // Use correct tableType for color mapping
              const colorTableType = tableType === 'cajachica' ? 'cajachica' : tableType
              const bgColor = getCellColorClass(tipoContent, colorTableType as any)
              const isSelectedRow = selectedRowId === (row as any).id

              return (
                <div 
                  key={(row as any).id} 
                  className={`table_row ${isSelectedRow && !disableInteractions ? 'selected-row' : ''}`}
                  style={{ backgroundColor: bgColor }}
                  onClick={e => handleRowClick(e, (row as any).id)} // <-- Row click for menu
                >
                  {columns.map(col => {
                    const raw = (row as any)[col.key]
                    
                    // Procesar descuento_total = 0, "0", 0.0, "0.00", null o undefined como celda vacía
                    let isEmptyDescuento =
                      col.key === 'descuento_total' &&
                      (
                        raw === 0 ||
                        raw === null ||
                        raw === undefined ||
                        raw === "0" ||
                        raw === "0.00" ||
                        raw === 0.0
                      )
                    let content: any
                    let symbolAfter = ['descuento', 'descuento_total'].includes(col.key) ? '%' : ''
                    if (isEmptyDescuento) {
                      content = ''
                      symbolAfter = ''
                    } 
                    // Mostrar 0 si la columna es "monto" y el valor es null, "NULL", undefined o 0
                    else if (
                      col.key === 'monto' &&
                      (
                        raw === null ||
                        raw === undefined ||
                        raw === "NULL" ||
                        raw === 0
                      )
                    ) {
                      content = 0
                    } else {
                      // Use row-aware formatter if present
                      if (col.format) {
                        content = col.format(raw, row)
                      } else {
                        content = raw ?? '-'
                      }
                    }

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
                    let isEditable = false

                    if (editableCells.includes(col.key) && isAdmin){
                      isEditable = true;
                    }

                    const isCurrentlyEditing = editingCell?.rowId === (row as any).id && editingCell?.columnKey === col.key
                    const isSelectedCell = selectedCellId === `${(row as any).id}-${col.key}`

                    return (
                      <div
                        key={col.key}
                        className={`table_cell ${isEditable ? 'editable-cell' : ''} ${isSelectedCell && !disableInteractions ? 'selected-cell' : ''}`}
                        style={{ width: col.width, cursor: disableInteractions ? 'default' : 'pointer' }}
                        onClick={e => handleCellClick(e, (row as any).id, col.key, raw, isEditable)}
                        onMouseEnter={e => {
                          if (disableInteractions) return;
                          if (isCurrentlyEditing || selectMenu?.visible) return
                          const rect = e.currentTarget.getBoundingClientRect()
                          const wrap = tableRef.current?.getBoundingClientRect()
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
                          if (disableInteractions) return;
                          if (isCurrentlyEditing || selectMenu?.visible) return
                          const rect = e.currentTarget.getBoundingClientRect()
                          const wrap = tableRef.current?.getBoundingClientRect()
                          if (!wrap) return
                          setHoveredCell({ x: 0, y: 0, width: 0, height: 0, opacity: 0, background: '#fff' })
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

          {/* Solo mostrar FloatingCell y SelectMenu si no está deshabilitado */}
          {hoveredCell && !editingCell && !selectMenu?.visible && !disableInteractions && (
            <FloatingCell
              hoveredCell={hoveredCell}
              isGray={hoveredCell.currentCol === 'id'}
              onShowLargeList={
                hoveredCell.items && hoveredCell.items.length > 0
                  ? () => handleShowLargeList(hoveredCell.items, `Detalle de productos (${hoveredCell.items.length})`)
                  : undefined
              }
            />
          )}
          
          {selectMenu?.visible && !disableInteractions && (
            <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 1003 }}>
              <SelectMenu
                options={getSelectMenuOptions()}
                position={selectMenu.position}
                onClose={closeSelectMenu}
              />
            </div>
          )}

          {/* Delete confirmation modal */}
          {showDeleteConfirm && deleteRowData && (
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none' // allow only the menu to receive pointer events
            }}>
              <div style={{ pointerEvents: 'all' }}>
                <ConfirmDeleteMenu
                  rowId={deleteRowData.rowId}
                  rowValues={deleteRowData.rowValues}
                  currentTable={tableType}
                  onClose={handleDeleteCancel}
                  onAccept={handleDeleteConfirm}
                />
              </div>
            </div>
          )}

          {modalVisible && selectedCuentaId && (
            <>
              <div className="modal-overlay" onClick={closeModal}>
                <div className="modal">
                  <button className="modal-close" onClick={closeModal}>×</button>
                  <h2>
                    Movimientos de la cuenta{selectedCuentaNombre ? `: ${selectedCuentaNombre}` : ` #${selectedCuentaId}`}
                  </h2>
                  <TableComponent
                    columns={movimientosColumns || columns}
                    rows={getMovimientosForCuenta(selectedCuentaId)}
                    tableType="movimientos"
                    isAdmin={false}
                    disableInteractions={true}
                  />
                </div>
              </div>
            </>
          )}

          {/* Modal grande para lista de productos */}
          {showLargeList && largeListItems && (
            <div
              style={{
                position: "fixed",
                top: 0, left: 0, right: 0, bottom: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onClick={() => setShowLargeList(false)}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: 32,
                  minWidth: 400,
                  maxWidth: "90vw",
                  maxHeight: "80vh",
                  overflowY: "auto",
                  boxShadow: "0 4px 32px rgba(0,0,0,0.2)",
                  position: "relative"
                }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowLargeList(false)}
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "transparent",
                    border: "none",
                    fontSize: 24,
                    cursor: "pointer"
                  }}
                  aria-label="Cerrar"
                >
                  &times;
                </button>
                <h2 style={{ marginTop: 0, marginBottom: 24 }}>{largeListTitle}</h2>
                <ul className="floating-list" style={{ cursor: "default" }}>
                  <li className="list-header">
                    <span>Producto</span>
                    <span>Cantidad</span>
                    <span>Precio</span>
                    <span>Total</span>
                  </li>
                  {largeListItems.map((it, i) => (
                    <li key={i}>
                      <span>{it.nombre_producto}</span>
                      <span>
                        {Number.isInteger(Number(it.cantidad))
                          ? Number(it.cantidad)
                          : Number(it.cantidad).toLocaleString("es-AR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                      </span>
                      <span>
                        {"$" + Number(it.precio_unitario).toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span>
                        {"$" + (Number(it.precio_unitario) * Number(it.cantidad)).toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TableComponent