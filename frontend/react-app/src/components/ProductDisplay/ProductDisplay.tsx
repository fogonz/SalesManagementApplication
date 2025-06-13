import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import "./ProductDisplay.css";

export interface ProductDisplayRef {
  addProduct: () => void;
}

interface ProductDisplayProps {
  searchTerm?: string;
}

const ProductDisplay = forwardRef<ProductDisplayRef, ProductDisplayProps>(({ searchTerm = '' }, ref) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/productos/');
        if (!response.ok) throw new Error('Error al obtener productos');

        const data = await response.json();
        setProducts(data);
        console.log(data)
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

  }, []);

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

  // Exponer la función addProduct al componente padre
  useImperativeHandle(ref, () => ({
    addProduct
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
      {searchTerm && (
        <div className="search-info" style={{ 
          padding: '10px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '5px', 
          margin: '10px 0',
          fontSize: '14px',
          color: '#666'
        }}>
          Mostrando {filteredProducts.length} de {products.length} productos que coinciden con "{searchTerm}"
          {filteredProducts.length === 0 && (
            <span style={{ color: '#e74c3c', fontStyle: 'italic' }}> - No se encontraron productos</span>
          )}
        </div>
      )}

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

      {filteredProducts.length === 0 && !searchTerm && (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: '#666',
          fontSize: '16px'
        }}>
          No hay productos disponibles
        </div>
      )}
    </div>
  );
});

ProductDisplay.displayName = 'ProductDisplay';

export default ProductDisplay;