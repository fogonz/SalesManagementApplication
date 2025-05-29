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
        title: "Nuevo Producto",
        description: "Descripción aquí",
        price: "$0.00",
        image: "https://via.placeholder.com/200x200.png?text=Nuevo+Producto",
        stockAmount: 0,
        stockUnit: "uds",
      },
    ]);
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  // Función para normalizar texto (igual que en TableBox)
  const normalizeText = (text: string): string => {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  };

  // Filtrar productos basado en el término de búsqueda
  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    
    const normalizedSearchTerm = normalizeText(searchTerm);
    return (
      normalizeText(product.title).includes(normalizedSearchTerm) ||
      normalizeText(product.description).includes(normalizedSearchTerm) ||
      normalizeText(product.price).includes(normalizedSearchTerm) ||
      normalizeText(product.stockUnit).includes(normalizedSearchTerm) ||
      normalizeText(product.stockAmount.toString()).includes(normalizedSearchTerm)
    );
  });

  // Exponer la función addProduct al componente padre
  useImperativeHandle(ref, () => ({
    addProduct
  }));

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
            <span style={{ color: '#999', fontStyle: 'italic' }}> - No se encontraron productos</span>
          )}
        </div>
      )}

      <div className="product-grid">
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

            <img src={product.image} alt={product.title} className="product-image" />

            <div className="product-title">
              {product.tipo_producto}
            </div>

            <div className="typeTag">
              <div className="tag">PRECIO</div>
              <div className="product-price">
                ${product.precio_venta_unitario}
              </div>
            </div>

            <div className="typeTag">
              <div className="tag">CANTIDAD</div>
              <div className="product-text">
                {product.cantidad}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
});

ProductDisplay.displayName = 'ProductDisplay';

export default ProductDisplay;