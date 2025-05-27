import React, { useState, forwardRef, useImperativeHandle } from "react";
import "./ProductDisplay.css";

export interface ProductDisplayRef {
  addProduct: () => void;
}

interface ProductDisplayProps {
  searchTerm?: string;
}

const ProductDisplay = forwardRef<ProductDisplayRef, ProductDisplayProps>(({ searchTerm = '' }, ref) => {
  const [products, setProducts] = useState([
    {
      id: 1,
      title: "Auriculares Inalámbricos Bluetooth",
      description: "Sonido de alta calidad con cancelación de ruido",
      price: "$59.99",
      image: "https://via.placeholder.com/200x200.png?text=Producto+1",
      stockAmount: 5,
      stockUnit: "uds",
    },
    {
      id: 2,
      title: "Reloj Inteligente Deportivo",
      description: "Seguimiento de actividad y notificaciones",
      price: "$89.99",
      image: "https://via.placeholder.com/200x200.png?text=Producto+2",
      stockAmount: 2,
      stockUnit: "uds",
    },
    {
      id: 3,
      title: "Cámara de Seguridad WiFi",
      description: "Monitoreo en tiempo real desde tu móvil",
      price: "$39.99",
      image: "https://via.placeholder.com/200x200.png?text=Producto+3",
      stockAmount: 2,
      stockUnit: "uds",
    },
  ]);

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

            <label className="image-upload-label">
              📷 Cambiar imagen
              <input
                type="file"
                accept="image/*"
                className="image-input"
                onChange={(e) => handleImageUpload(product.id, e.target.files[0])}
              />
            </label>

            <input
              className="product-title"
              value={product.title}
              onChange={(e) => handleChange(product.id, "title", e.target.value)}
            />
            <textarea
              className="product-description"
              value={product.description}
              onChange={(e) => handleChange(product.id, "description", e.target.value)}
            />
            <input
              className="product-price"
              value={product.price}
              onChange={(e) => handleChange(product.id, "price", e.target.value)}
            />

            {/* Stock amount + unit */}
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="number"
                className="product-stock"
                value={product.stockAmount}
                onChange={(e) =>
                  handleChange(product.id, "stockAmount", parseFloat(e.target.value) || "")
                }
                min={""}
                placeholder="Cantidad"
              />
              <select
                className="product-stock"
                value={product.stockUnit}
                onChange={(e) =>
                  handleChange(product.id, "stockUnit", e.target.value)
                }
              >
                <option value="uds">uds</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="litros">litros</option>
                <option value="ml">ml</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

ProductDisplay.displayName = 'ProductDisplay';

export default ProductDisplay;