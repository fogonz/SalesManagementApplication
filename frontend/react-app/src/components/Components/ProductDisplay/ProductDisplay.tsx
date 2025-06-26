import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import "./ProductDisplay.css";

export interface ProductDisplayRef {
  addProduct: () => void;
  refreshData: () => void;
}

interface ProductDisplayProps {
  searchTerm?: string;
  refreshTrigger?: number;
  isAdmin?: boolean;
  onCellEdit?: (params: {
    rowId: number;
    field: string;
    prevValue: any;
    newValue: any;
    currentTable?: string; // <-- Agrega esta línea
  }) => void;
}

const ProductDisplay = forwardRef<ProductDisplayRef, ProductDisplayProps>(({ 
  searchTerm = '', 
  refreshTrigger, 
  isAdmin,
  onCellEdit 
}, ref) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingCell, setEditingCell] = useState<{productId: number, field: string, prevValue: any} | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Extract fetch function so it can be reused
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/productos/');
      if (!response.ok) throw new Error('Error al obtener productos');

      const data = await response.json();
      setProducts(data);
      console.log(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle refreshTrigger prop changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchProducts();
    }
  }, [refreshTrigger]);

  const handleChange = (id, key, value) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, [key]: value } : product
      )
    );
  };

  const handleImageUpload = (id, file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange(id, "image", reader.result);
    };
    if (file) reader.readAsDataURL(file);
  };

  const addProduct = () => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    setProducts([
      ...products,
      {
        id: newId,
        tipo_producto: "Nuevo Producto",
        descripcion: "Descripción aquí",
        precio_venta_unitario: 0,
        costo_unitario: 0,
        image: "https://via.placeholder.com/200x200.png?text=Nuevo+Producto",
        cantidad: 0,
      },
    ]);
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  // Editing functions
  const handleCellClick = (productId: number, field: string, currentValue: any) => {
    if (isAdmin) {
      setEditingCell({ productId, field, prevValue: currentValue });
      setEditValue(currentValue?.toString() || '');
    }
  };

  const handleEditSubmit = (productId: number, field: string, prevValue: any) => {
    // Check if there are actual changes
    const hasChanges = editValue !== (prevValue?.toString() || '');
    
    if (hasChanges && onCellEdit) {
      onCellEdit({
        rowId: productId,
        field: field,
        prevValue: prevValue,
        newValue: editValue,
        currentTable: 'productos' // <-- Asegúrate de pasar esto
      });
    }
    
    // Update local state for immediate UI feedback
    if (hasChanges) {
      handleChange(productId, field, editValue);
    }
    
    setEditingCell(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, productId: number, field: string, prevValue: any) => {
    if (e.key === 'Enter') {
      handleEditSubmit(productId, field, prevValue);
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  // Check if a field is currently being edited
  const isCurrentlyEditing = (productId: number, field: string) => {
    return editingCell?.productId === productId && editingCell?.field === field;
  };

  // Render editable field component
  const renderEditableField = (product: any, field: string, displayValue: any, className: string = '') => {
    const isEditing = isCurrentlyEditing(product.id, field);
    const isEditable = isAdmin;

    if (isEditing) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleEditSubmit(product.id, field, editingCell?.prevValue)}
          onKeyDown={(e) => handleKeyDown(e, product.id, field, editingCell?.prevValue)}
          className="product-edit-input"
          autoFocus
        />
      );
    }

    return (
      <div
        className={`${className} ${isEditable ? 'product-editable-field' : ''}`}
        onClick={() => handleCellClick(product.id, field, product[field])}
        onMouseEnter={(e) => {
          if (isEditable) {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (isEditable) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        {displayValue}
      </div>
    );
  };

  // Función para normalizar texto
  const normalizeText = (text: string): string => {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  };

  // Función para convertir valor a string de forma segura
  const safeStringify = (value: any): string => {
    if (value === null || value === undefined) return '';
    return String(value);
  };

  // Filtrar productos basado en el término de búsqueda
  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    
    const normalizedSearchTerm = normalizeText(searchTerm);
    
    // Buscar en todos los campos relevantes del producto
    const searchableFields = [
      safeStringify(product.tipo_producto),
      safeStringify(product.descripcion),
      safeStringify(product.precio_venta_unitario),
      safeStringify(product.cantidad),
      safeStringify(product.id)
    ];
    
    return searchableFields.some(field => 
      normalizeText(field).includes(normalizedSearchTerm)
    );
  });

  useImperativeHandle(ref, () => ({
    addProduct,
    refreshData: fetchProducts
  }));

  if (loading) {
    return (
      <div className="product-container">
        <div className="view-controls">
          <span className="view-controls-label">Vista:</span>
          <button
            onClick={() => setViewMode('grid')}
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
          >
            🔳 Cuadrícula
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
          >
            📋 Lista
          </button>
        </div>
        <div className="product-content">
          <div style={{ padding: '20px', textAlign: 'center' }}>
            Cargando productos...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-container">
        <div className="view-controls">
          <span className="view-controls-label">Vista:</span>
          <button
            onClick={() => setViewMode('grid')}
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
          >
            🔳 Cuadrícula
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
          >
            📋 Lista
          </button>
        </div>
        <div className="product-content">
          <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-container">
      <div className="view-controls">
        <span className="view-controls-label">Vista:</span>
        <button
          onClick={() => setViewMode('grid')}
          className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
        >
          🔳 Cuadrícula
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
        >
          📋 Lista
        </button>
      </div>

      <div className="product-content">
        {searchTerm && (
          <div className="search-info">
            Mostrando {filteredProducts.length} de {products.length} productos que coinciden con "{searchTerm}"
            {filteredProducts.length === 0 && (
              <span className="search-info-no-results"> - No se encontraron productos</span>
            )}
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="product-grid2">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-title">
                  {renderEditableField(
                    product, 
                    'tipo_producto', 
                    product.tipo_producto || 'Sin nombre',
                    'product-title-content'
                  )}
                </div>

                <div className="typeTag">
                  <div className="tag">PRECIO</div>
                  <div className="product-price">
                    $
                    {renderEditableField(
                      product,
                      'precio_venta_unitario',
                      product.precio_venta_unitario || 0,
                      'product-price-content'
                    )}
                  </div>
                </div>
                
                {isAdmin && (
                  <div className="typeTag">
                    <div className="tag">COSTO UNITARIO</div>
                    <div className="product-text">
                      $
                      {renderEditableField(
                        product,
                        'costo_unitario',
                        product.costo_unitario || 0,
                        'product-cost-content'
                      )}
                    </div>
                  </div>
                )}

                <div className="typeTag">
                  <div className="tag">CANTIDAD</div>
                  <div className="product-text">
                    {renderEditableField(
                      product,
                      'cantidad',
                      product.cantidad || 0,
                      'product-quantity-content'
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="product-list">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-list-item">
                <div className="product-list-content">
                  <h3 className="product-list-title">
                    {renderEditableField(
                      product,
                      'tipo_producto',
                      product.tipo_producto || 'Sin nombre',
                      'product-list-title-content'
                    )}
                  </h3>
                  
                  {product.descripcion && (
                    <p className="product-list-description">
                      {product.descripcion}
                    </p>
                  )}

                  <div className="product-list-details">
                    <div className="product-list-detail-item">
                      <span className="product-list-detail-label">PRECIO:</span>
                      <span className="product-list-detail-value price">
                        $
                        {renderEditableField(
                          product,
                          'precio_venta_unitario',
                          product.precio_venta_unitario || 0,
                          'product-list-price-content'
                        )}
                      </span>
                    </div>
                    <div className="product-list-detail-item">
                      <span className="product-list-detail-label">COSTO UNITARIO:</span>
                      <span className="product-list-detail-value cost">
                        $
                        {renderEditableField(
                          product,
                          'costo_unitario',
                          product.costo_unitario || 0,
                          'product-list-cost-content'
                        )}
                      </span>
                    </div>
                    <div className="product-list-detail-item">
                      <span className="product-list-detail-label">CANTIDAD:</span>
                      <span className={`product-list-detail-value ${
                        (product.cantidad || 0) > 0 ? 'quantity-available' : 'quantity-unavailable'
                      }`}>
                        {renderEditableField(
                          product,
                          'cantidad',
                          product.cantidad || 0,
                          'product-list-quantity-content'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !searchTerm && (
          <div className="product-empty-state">
            No hay productos disponibles
          </div>
        )}
      </div>
    </div>
  );
});

ProductDisplay.displayName = 'ProductDisplay';

export default ProductDisplay;