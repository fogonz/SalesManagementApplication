import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import "./ProductDisplay.css";


export interface ProductDisplayRef {
  addProduct: () => void;
  refreshData: () => void;
}

interface ProductDisplayProps {
  searchTerm?: string;
  refreshTrigger?: number;
}

const ProductDisplay = forwardRef<ProductDisplayRef, ProductDisplayProps>(({ searchTerm = '', refreshTrigger }, ref) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
        image: "https://via.placeholder.com/200x200.png?text=Nuevo+Producto",
        cantidad: 0,
      },
    ]);
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
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
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Cargando productos...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-container">
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
          Error: {error}
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
              <button
                onClick={() => deleteProduct(product.id)}
                className="delete-button"
                title="Eliminar producto"
                aria-label="Eliminar producto"
              >
                ×
              </button>

              <img 
                src={product.image || "https://via.placeholder.com/200x200.png?text=Sin+Imagen"} 
                alt={product.tipo_producto || 'Producto'} 
                className="product-image" 
              />

              <div className="product-title">
                {product.tipo_producto || 'Sin nombre'}
              </div>

              <div className="typeTag">
                <div className="tag">PRECIO</div>
                <div className="product-price">
                  ${product.precio_venta_unitario || 0}
                </div>
              </div>

              <div className="typeTag">
                <div className="tag">CANTIDAD</div>
                <div className="product-text">
                  {product.cantidad || 0}
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
              <button
                onClick={() => deleteProduct(product.id)}
                className="product-list-delete-btn"
                title="Eliminar producto"
                aria-label="Eliminar producto"
              >
                ×
              </button>

              <img 
                src={product.image || "https://via.placeholder.com/80x80.png?text=Sin+Imagen"} 
                alt={product.tipo_producto || 'Producto'} 
                className="product-list-image"
              />

              <div className="product-list-content">
                <h3 className="product-list-title">
                  {product.tipo_producto || 'Sin nombre'}
                </h3>
                
                {product.descripcion && (
                  <p className="product-list-description">
                    {product.descripcion}
                  </p>
                )}

                <div className="product-list-details">
                  <div className="product-list-detail-item">
                    <span className="product-list-detail-label">ID:</span>
                    <span className="product-list-detail-value">{product.id}</span>
                  </div>
                  <div className="product-list-detail-item">
                    <span className="product-list-detail-label">Precio:</span>
                    <span className="product-list-detail-value price">
                      ${product.precio_venta_unitario || 0}
                    </span>
                  </div>
                  <div className="product-list-detail-item">
                    <span className="product-list-detail-label">Cantidad:</span>
                    <span className={`product-list-detail-value ${
                      (product.cantidad || 0) > 0 ? 'quantity-available' : 'quantity-unavailable'
                    }`}>
                      {product.cantidad || 0}
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
  );
});

ProductDisplay.displayName = 'ProductDisplay';

export default ProductDisplay;