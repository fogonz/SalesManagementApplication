import * as React from 'react';
import '../menus.css';
import { useEffect, useState } from 'react';

interface ProductProps {
    onClose: () => void;
    onAccept: () => void;
    editingProduct?: ProductData | null; // Optional: for editing existing products
}

interface ProductData {
    id?: number;
    tipo_producto: string;
    precio_venta_unitario: number;
    costo_unitario: number;
    cantidad_inicial: number; // Cambia a cantidad_inicial
}

const NewProduct: React.FC<ProductProps> = ({ onClose, onAccept, editingProduct }) => {
    const [tipoProducto, setTipoProducto] = useState<string>("");
    const [precioVentaUnitario, setPrecioVentaUnitario] = useState<string>("");
    const [costoUnitario, setCostoUnitario] = useState<string>("");
    const [cantidad, setCantidad] = useState<string>("");

    // Load data if editing existing product
    useEffect(() => {
        if (editingProduct) {
            setTipoProducto(editingProduct.tipo_producto);
            setPrecioVentaUnitario(editingProduct.precio_venta_unitario.toString());
            setCostoUnitario(editingProduct.costo_unitario.toString());
            // Usa cantidad_inicial, si no existe deja vacío
            setCantidad(
                editingProduct.cantidad_inicial !== undefined
                    ? editingProduct.cantidad_inicial.toString()
                    : ""
            );
        }
    }, [editingProduct]);

    const [error, setError] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleSubmit = async () => {
        setError("");
        
        // Validation
        if (!tipoProducto.trim()) {
            setError("El tipo de producto es obligatorio");
            return;
        }
        
        if (!precioVentaUnitario || isNaN(parseFloat(precioVentaUnitario)) || parseFloat(precioVentaUnitario) < 0) {
            setError("El precio de venta debe ser un número válido mayor o igual a 0");
            return;
        }

        if (!costoUnitario || isNaN(parseFloat(costoUnitario)) || parseFloat(costoUnitario) < 0) {
            setError("El costo unitario debe ser un número válido mayor o igual a 0");
            return;
        }

        if (!cantidad || isNaN(parseInt(cantidad)) || parseInt(cantidad) < 0) {
            setError("La cantidad debe ser un número entero válido mayor o igual a 0");
            return;
        }

        setIsSubmitting(true);

        try {
            const productData: ProductData = {
                tipo_producto: tipoProducto.trim(),
                precio_venta_unitario: parseFloat(precioVentaUnitario),
                costo_unitario: parseFloat(costoUnitario),
                cantidad_inicial: parseInt(cantidad)
            };

            // Imprime el payload antes de enviar
            console.log("DEBUG FRONTEND - PAYLOAD ENVIADO:", productData);

            const url = editingProduct 
                ? `http://localhost:8000/api/productos/${editingProduct.id}`
                : `http://localhost:8000/api/productos/`;
            
            const method = editingProduct ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar el producto');
            }

            onAccept(); // Call parent success handler
        } catch (err) {
            console.error('Error saving product:', err);
            setError(err instanceof Error ? err.message : 'Error al guardar el producto');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return(
        <div className="page">
            <div className='popup'>
                <div className='content'>
                    <div className="menu_newAccount">
                        <div className="menu_topBar">
                            <div className="text open-sans">
                                {editingProduct ? 'Editando Producto' : 'Nuevo Producto'}
                            </div>
                        </div>

                        <div className="menu_newTransaction_main">
                            <div className="entries">
                                {/* Show error message */}
                                {error && (
                                    <div className="error-message" style={{
                                        color: 'red',
                                        padding: '10px',
                                        backgroundColor: '#ffe6e6',
                                        border: '1px solid #ff9999',
                                        borderRadius: '4px',
                                        marginBottom: '10px'
                                    }}>
                                        {error}
                                    </div>
                                )}

                                <div className="entry">
                                    <div className="entry_label">
                                        <div className="text open-sans">Nombre del Producto</div>
                                    </div>
                                    <input 
                                        type="text" 
                                        className="custom_input" 
                                        placeholder="Ingrese el nombre del producto..."
                                        value={tipoProducto} 
                                        onChange={(e) => setTipoProducto(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="entry">
                                    <div className="entry_label">
                                        <div className="text open-sans">Precio de Venta Unitario</div>
                                    </div>
                                    <input 
                                        type="number" 
                                        className="custom_input" 
                                        placeholder="Ingrese el precio de venta por unidad..."
                                        value={precioVentaUnitario} 
                                        onChange={(e) => setPrecioVentaUnitario(e.target.value)}
                                        disabled={isSubmitting}
                                        step="0.01"
                                        min="0"
                                    />
                                </div>

                                <div className="entry">
                                    <div className="entry_label">
                                        <div className="text open-sans">Costo Unitario</div>
                                    </div>
                                    <input 
                                        type="number" 
                                        className="custom_input" 
                                        placeholder="Ingrese el costo unitario..."
                                        value={costoUnitario} 
                                        onChange={(e) => setCostoUnitario(e.target.value)}
                                        disabled={isSubmitting}
                                        step="0.01"
                                        min="0"
                                    />
                                </div>

                                <div className="entry">
                                    <div className="entry_label">
                                        <div className="text open-sans">Cantidad</div>
                                    </div>
                                    <input 
                                        type="number" 
                                        className="custom_input" 
                                        placeholder="Ingrese la cantidad disponible..."
                                        value={cantidad} 
                                        onChange={(e) => setCantidad(e.target.value)}
                                        disabled={isSubmitting}
                                        step="1"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="menu_bottomBar">
                            <button 
                                className="bigButton button-shadow gray" 
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                <div className="text open-sans">CANCELAR</div>
                            </button>
                            <button 
                                className="bigButton button-shadow green"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                <div className="text open-sans">
                                    {isSubmitting ? 'PROCESANDO...' : 'ACEPTAR'}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="blur-layer"></div>
        </div>
    );
};

export default NewProduct;