import React, { useState } from 'react';
import './ShoppingCart.css';

interface Producto {
  id: number;
  tipo_producto: string;
  precio_venta_unitario: number;
}

interface ItemCarrito {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface ProductGridProps {
  productos?: Producto[] | null;
}

const ProductGrid: React.FC<ProductGridProps> = ({ productos }) => {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

  // Manejo seguro de productos con múltiples verificaciones
  const productosSeguro = productos ?? [];
  const productosValidos = Array.isArray(productosSeguro) ? productosSeguro : [];

  const obtenerCantidad = (productoId: number): number => {
    const item = carrito.find(item => item.id === productoId);
    return item ? item.cantidad : 0;
  };

  const actualizarCantidad = (producto: Producto, nuevaCantidad: number): void => {
    const cantidad = Math.max(0, parseInt(String(nuevaCantidad)) || 0);
    
    setCarrito(prevCarrito => {
      const carritoSinItem = prevCarrito.filter(item => item.id !== producto.id);
      
      if (cantidad > 0) {
        const nuevoItem: ItemCarrito = {
          id: producto.id,
          nombre: producto.tipo_producto,
          precio: producto.precio_venta_unitario,
          cantidad
        };
        return [...carritoSinItem, nuevoItem];
      }
      
      return carritoSinItem;
    });
  };

  const incrementarCantidad = (producto: Producto): void => {
    const cantidadActual = obtenerCantidad(producto.id);
    actualizarCantidad(producto, cantidadActual + 1);
  };

  const decrementarCantidad = (producto: Producto): void => {
    const cantidadActual = obtenerCantidad(producto.id);
    actualizarCantidad(producto, cantidadActual - 1);
  };

  const manejarCambioInput = (
    e: React.ChangeEvent<HTMLInputElement>, 
    producto: Producto
  ): void => {
    e.stopPropagation();
    actualizarCantidad(producto, parseInt(e.target.value) || 0);
  };

  const manejarClickBoton = (
    e: React.MouseEvent, 
    accion: () => void
  ): void => {
    e.stopPropagation();
    accion();
  };

  const manejarMouseEnter = (e: React.MouseEvent<HTMLDivElement>): void => {
    const target = e.currentTarget;
    const controles = target.querySelector('.product-grid__controls') as HTMLElement;
    
    target.classList.add('product-grid__item--hover');
    if (controles) {
      controles.classList.add('product-grid__controls--visible');
    }
  };

  const manejarMouseLeave = (e: React.MouseEvent<HTMLDivElement>): void => {
    const target = e.currentTarget;
    const controles = target.querySelector('.product-grid__controls') as HTMLElement;
    
    target.classList.remove('product-grid__item--hover');
    if (controles) {
      controles.classList.remove('product-grid__controls--visible');
    }
  };

  // Si no hay productos válidos, mostrar mensaje alternativo
  if (!productosValidos.length) {
    return (
      <div className="product-grid">
        <div className="product-grid__empty">
          <p>No hay productos disponibles</p>
        </div>
        
        {/* Panel de debug */}
        <div className="product-grid__debug">
          <h3>Estado del carrito:</h3>
          <pre>{JSON.stringify(carrito, null, 2)}</pre>
          <p>Total de productos: {carrito.length}</p>
          <p>Total de unidades: {carrito.reduce((total, item) => total + item.cantidad, 0)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-grid">
      <div className="product-grid__container">
        {productosValidos.map(producto => {
          const cantidad = obtenerCantidad(producto.id);
          
          return (
            <div
              key={producto.id}
              className="product-grid__item"
              onMouseEnter={manejarMouseEnter}
              onMouseLeave={manejarMouseLeave}
            >
              <div className="product-grid__name">
                {producto.tipo_producto}
              </div>
              
              <div className="product-grid__controls">
                <button
                  className="product-grid__button product-grid__button--decrement"
                  onClick={(e) => manejarClickBoton(e, () => decrementarCantidad(producto))}
                  aria-label="Decrementar cantidad"
                >
                  -
                </button>
                
                <input
                  type="number"
                  min="0"
                  value={cantidad}
                  onChange={(e) => manejarCambioInput(e, producto)}
                  onClick={(e) => e.stopPropagation()}
                  className="product-grid__input"
                  aria-label="Cantidad del producto"
                />
                
                <button
                  className="product-grid__button product-grid__button--increment"
                  onClick={(e) => manejarClickBoton(e, () => incrementarCantidad(producto))}
                  aria-label="Incrementar cantidad"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Panel de debug */}
      <div className="product-grid__debug">
        <h3>Estado del carrito:</h3>
        <pre>{JSON.stringify(carrito, null, 2)}</pre>
        <p>Total de productos: {carrito.length}</p>
        <p>Total de unidades: {carrito.reduce((total, item) => total + item.cantidad, 0)}</p>
      </div>
    </div>
  );
};

// Componente de ejemplo para mostrar el uso
const App: React.FC = () => {
  const productosEjemplo: Producto[] = [
    { id: 1, tipo_producto: "Laptop Dell", precio_venta_unitario: 1200.50 },
    { id: 2, tipo_producto: "Mouse Inalámbrico", precio_venta_unitario: 25.99 },
    { id: 3, tipo_producto: "Teclado Mecánico", precio_venta_unitario: 89.99 },
    { id: 4, tipo_producto: "Monitor 24\"", precio_venta_unitario: 299.99 },
    { id: 5, tipo_producto: "Auriculares", precio_venta_unitario: 79.99 },
    { id: 6, tipo_producto: "Webcam HD", precio_venta_unitario: 45.00 }
  ];

  return (
    <div>
      <h2>Con productos:</h2>
      <ProductGrid productos={productosEjemplo} />
      
      <h2>Sin productos:</h2>
      <ProductGrid productos={null} />
      
      <h2>Array vacío:</h2>
      <ProductGrid productos={[]} />
      
      <h2>Sin prop:</h2>
      <ProductGrid />
    </div>
  );
};

export default ProductGrid;