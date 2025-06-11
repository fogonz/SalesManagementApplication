import * as React from 'react';
import './Transaction.css';
import { useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { createHandleSubmit, validateTransaction } from '../../utils/validation/validate_insertTransaction';
import ProductGrid from '../ShoppingCart/ShoppingCart'; 

// Updated ProductItem with add functionality
const ProductItem = ({ index, style, data, onAddProduct }) => (
    <div style={style} className="productDB">
        <div className='wrapper'>
            <div className='hide'><span>{data[index]?.cantidad}</span></div>
            <div className='scroll_content'><span className='show'>{data[index]?.tipo_producto}</span></div>
            <div className='hide'><span>${data[index]?.precio_venta_unitario}</span></div>
        </div>
        <button 
            className='add_button' 
            onClick={() => onAddProduct(data[index])}
            disabled={!data[index]}
        > 
            <i className='fas fa-plus'></i> 
        </button>
    </div>
);

interface TransactionProps {
    onClose: () => void;
    onAccept: () => void;
}

interface ItemCarrito {
    id: number;
    nombre: string;
    precio: number;
    cantidad: number;
}

export interface ProductoRow {
    id: any;
    tipo_producto: any;
    cantidad: any;
    precio_venta_unitario: any;
    costo_unitario: any;
}

interface CuentaOption {
    id: number;
    nombre: string;
    contacto_mail: string;
    contacto_telefono: string;
    monto: number;
    tipo_cuenta: string;
}

const Transaction: React.FC<TransactionProps> = ({ onClose, onAccept }) => {
    const [fecha, setFecha] = useState<string>("");
    const [cuenta, setCuenta] = useState<string>("");
    const [tipo, setTipo] = useState<string>("");
    const [descuento, setDescuento] = useState<string>("");
    const [concepto, setConcepto] = useState<string>("");
    const [total, setTotal] = useState<string>("");
    const [abonado, setAbonado] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [filteredData, setFilteredData] = useState<ProductoRow[]>([]);
    const [data, setData] = useState<ProductoRow[] | null>(null);
    const [options, setOptions] = useState<CuentaOption[]>([]);
    const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

    const handleCarritoUpdate = (nuevoCarrito: ItemCarrito[]) => {
        setCarrito(nuevoCarrito);
        console.log('Cart updated:', nuevoCarrito);
        
        // Calculate totals if needed
        const totalItems = nuevoCarrito.reduce((sum, item) => sum + item.cantidad, 0);
        const totalAmount = nuevoCarrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        
        console.log('Total items:', totalItems);
        console.log('Total amount:', totalAmount);
    };

    // Function to add product to cart from the product list
    const handleAddProduct = (producto: ProductoRow) => {
        if (!producto) return;

        console.log('Adding product to cart:', producto);

        // Check if product is already in cart
        const existingItem = carrito.find(item => item.id === producto.id);
        
        let nuevoCarrito: ItemCarrito[];
        
        if (existingItem) {
            // If product exists, increment quantity
            nuevoCarrito = carrito.map(item => 
                item.id === producto.id 
                    ? { ...item, cantidad: item.cantidad + 1 }
                    : item
            );
        } else {
            // If product doesn't exist, add new item
            const nuevoItem: ItemCarrito = {
                id: producto.id,
                nombre: producto.tipo_producto,
                precio: producto.precio_venta_unitario,
                cantidad: 1
            };
            nuevoCarrito = [...carrito, nuevoItem];
        }
        
        handleCarritoUpdate(nuevoCarrito);
    };

    // Create a wrapper component for ProductItem to pass the onAddProduct function
    const ProductItemWithAdd = (props) => (
        <ProductItem {...props} onAddProduct={handleAddProduct} />
    );

    // Fetch: Table Cuentas
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const responseAccounts = await fetch(`http://localhost:8000/api/cuentas`);
                const jsonAccounts = await responseAccounts.json();
                setOptions(jsonAccounts);
                console.log(jsonAccounts);
            } catch(err) {
                console.error(`Error al cargar cuentas:`, err);
                setError("Error al cargar cuentas");
            }
        };
        fetchAccounts();
    }, []);

    // Fetch: Table Productos
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/productos`);
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(`Error al cargar productos:`, err);
                setError("Error al cargar productos");
            }
        };
        fetchData();
    }, []);

    // Barra de Búsqueda
    useEffect(() => {
        if (data) {
            if (searchTerm.trim() === "") {
                setFilteredData(data);
            } else {
                const filtered = data.filter(producto => 
                    producto.tipo_producto.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setFilteredData(filtered);
            }
        }
    }, [searchTerm, data]);
    
    // handleSubmit with validation
    const handleSubmit = async () => {
        setError(""); 
        setIsSubmitting(true);

        try {
            // Create the enhanced submit handler
            const dataSubmitted = createHandleSubmit(
                {
                    fecha,
                    cuenta,
                    tipo,
                    descuento,
                    abonado,
                    concepto,
                    carrito // Include cart data in submission
                },
                () => {
                    // Success callback
                    setIsSubmitting(false);
                    onAccept();
                },
                (errorMessage: string) => {
                    // Error callback
                    setError(`Error en los campos ingresados: ${errorMessage}`);
                    setIsSubmitting(false);
                }
            );

            // Execute the enhanced submit
            await dataSubmitted();
        } catch (err) {
            setError("Error inesperado al procesar la transacción");
            setIsSubmitting(false);
        }
    };

    return(
        <div className="page">
            <div className="menu_newTransaction popup">
                <div className="menu_newTransaction_topBar">
                    <div className="text open-sans"> Agregando Movimiento </div>
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
                                <div className="text open-sans">Fecha</div>
                            </div>
                            <input 
                                type="date" 
                                className="custom_input" 
                                value={fecha} 
                                onChange={(e) => setFecha(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="entry">
                            <div className="entry_label">                                    
                                <div className="text open-sans">Cuenta</div>    
                            </div>
                            <select 
                                className="custom_input" 
                                value={cuenta} 
                                onChange={(e) => setCuenta(e.target.value)}
                                disabled={isSubmitting}
                            >
                                <option value="">-- Selecciona una cuenta --</option>
                                {options.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nombre} ({item.tipo_cuenta})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="entry">
                            <div className="entry_label">
                                <div className="text open-sans">Tipo</div>
                            </div>
                            <select 
                                className="custom_input" 
                                value={tipo} 
                                onChange={(e) => setTipo(e.target.value)}
                                disabled={isSubmitting}
                            >
                                <option value="">-- Selecciona un tipo de movimiento --</option>
                                <option value="factura venta">Factura Venta</option>
                                <option value="factura compra">Factura Compra</option>
                                <option value="pago">Pago</option>
                                <option value="cobranza">Cobranza</option>
                                <option value="factura c. varios">Factura C. Varios</option>
                            </select>
                        </div>

                        <div className="entry">
                            <div className="entry_label">
                                <div className="text open-sans">Detalle</div>
                            </div>
                            <input 
                                type="text" 
                                className="custom_input" 
                                placeholder="(OPCIONAL) Describir movimiento..."
                                value={concepto} 
                                onChange={(e) => setConcepto(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="entry">
                            <div className="entry_label">
                                <div className="text open-sans">Descuento (%)</div>
                            </div>
                            <input 
                                type="number" 
                                className="custom_input" 
                                placeholder="(OPCIONAL) Ingresar descuento..."
                                value={descuento} 
                                onChange={(e) => setDescuento(e.target.value)}
                                disabled={isSubmitting}
                                min="0"
                                max="100"
                                step="0.1"
                            />
                        </div>

                        <div className="entry">
                            <div className="entry_label">
                                <div className="text open-sans">Cantidad Abonada</div>
                            </div>
                            <input 
                                type="number" 
                                className="custom_input" 
                                placeholder="Ingresar total abonado al registrar..."
                                value={abonado} 
                                onChange={(e) => setAbonado(e.target.value)}
                                disabled={isSubmitting}
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    <div className='carrito'>
                        <div className="topbar">
                            <div className="text open-sans"> PRODUCTOS </div>
                        </div>

                        <div className="search">
                            <input 
                                type="text" 
                                className="searchTerm" 
                                placeholder="¿Qué producto estás buscando?"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={isSubmitting}
                            />
                            {searchTerm && (
                                <div className="search-results">
                                    {filteredData.length} producto{filteredData.length !== 1 ? 's' : ''} encontrado{filteredData.length !== 1 ? 's' : ''}
                                </div>
                            )}
                        </div>

                        <div className='container-box'>
                            <div className='borderless-header'>
                                <div><span>Stock</span></div>
                                <div><span>Nombre</span></div>
                                <div><span>Precio</span></div>
                            </div>

                            <div className="container-wrapper-nopad">
                                <AutoSizer>
                                    {({ height, width }) => (
                                        <List
                                            height={height}
                                            width={width}
                                            itemCount={filteredData?.length || 0}
                                            itemSize={60}
                                            itemData={filteredData}
                                            className="scroll-container"
                                        >
                                            {ProductItemWithAdd}
                                        </List>
                                    )}
                                </AutoSizer>
                            </div>
                        </div>
                    </div>
                    
                    <div className="carrito">
                        <div className="topbar">
                            <div className="text open-sans"> CARRITO </div>
                        </div>

                        {/* CARRITO */}
                        <div className="container">
                            <div className="container-wrapper">
                                <ProductGrid productos={data} carrito={carrito} onCarritoUpdate={handleCarritoUpdate}></ProductGrid>
                            </div>
                        </div>

                    </div>
                </div>
                
                <div className="menu_newTransaction_bottomBar">
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

            <div className="blur-layer"></div>
        </div>
    );
};

export default Transaction;