import * as React from 'react';
import '../menus.css';
import { useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { createHandleSubmit } from '../../../utils/validation/validate_insertTransaction';
import ProductGrid from '../../../components/Components/ShoppingCart/ShoppingCart'; 
import { AnimatePresence, motion } from "framer-motion";
import ShoppingCartTotal from '../../../components/Components/ShoppingCart/ShoppingCartTotal';
import AccountDropdown from '../Dropdown/AccountDropdown';

const ProductItem = ({ index, style, data, onAddProduct, carrito }) => {
    // Check if the current product is in the cart
    const isSelected = carrito.some(item => item.id === data[index]?.id);
    
    return (
        <div 
            style={style} 
            className={`productDB ${isSelected ? 'selected' : 'hoverable'}`}
        >
            <div className='wrapper'>
                <div className='hide'><span>{data[index]?.cantidad}</span></div>
                <div className='scroll_content'><span className='show'>{data[index]?.tipo_producto}</span></div>
                <div className='hide'><span>${data[index]?.precio_venta_unitario}</span></div>
            </div>
            <button 
                className={`add_button ${isSelected ? 'selected-button' : ''}`}
                onClick={() => onAddProduct(data[index])}
                disabled={!data[index] || isSelected}
            > 
                <i className={`fas ${isSelected ? 'fa-check' : 'fa-plus'}`}></i> 
            </button>
        </div>
    );
};

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
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [cuenta, setCuenta] = useState<string>("");
    const [tipo, setTipo] = useState<string>("");
    const [descuento, setDescuento] = useState<string>("");
    const [total, setTotal] = useState<string>("");
    const [concepto, setConcepto] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [filteredData, setFilteredData] = useState<ProductoRow[]>([]);
    const [data, setData] = useState<ProductoRow[] | null>(null);
    const [options, setOptions] = useState<CuentaOption[]>([]);
    const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
    const [estadoPago, setEstadoPago] = useState<string>("no"); // "no" | "si"

    // Calcula el precio total de los productos en el carrito
    const precioBrutoProductos = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

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

    // Remove unused declarations
    // Remove: interface Producto
    // Remove: const AccountItem

    // Create a wrapper component for ProductItem to pass the onAddProduct function
    const ProductItemWithAdd: React.FC<{
        index: number;
        style: React.CSSProperties;
        data: ProductoRow[];
        onAddProduct: (producto: ProductoRow) => void;
        carrito: ItemCarrito[];
    }> = (props) => (
        <ProductItem {...props} onAddProduct={handleAddProduct} carrito={carrito} />
    );

    // Function to check if current type requires cart
    const shouldShowCart = () => {
        return tipo === "factura_venta" || tipo === "factura_compra";
    };

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

    // Clear cart when type changes to non-invoice type
    useEffect(() => {
        if (!shouldShowCart() && carrito.length > 0) {
            setCarrito([]);
        }
    }, [tipo]);
    
    // handleSubmit with validation
    const handleSubmit = async () => {
        setError(""); 
        setIsSubmitting(true);

        try {
            // Calcula el total real del carrito si es factura_venta o factura_compra
            let totalFinal = total ? parseFloat(total) : 0;
            let carritoToSend: { id: number; cantidad: number }[] = [];

            if (tipo === "factura_venta" || tipo === "factura_compra") {
                // Toma la cantidad real de cada producto del carrito (que se actualiza desde ProductGrid)
                carritoToSend = carrito.map(item => ({
                    id: item.id,
                    cantidad: item.cantidad
                }));
                totalFinal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
            }

            const descuentoTotal = descuento.trim() === "" ? 0 : parseFloat(descuento.replace(",", "."));

            let dataToSend: any = {
                fecha,
                cuenta,
                tipo,
                descuento_total: isNaN(descuentoTotal) ? 0 : descuentoTotal,
                total: totalFinal,
                concepto
            };

            if (tipo === "factura_venta" || tipo === "factura_compra") {
                dataToSend.carrito = carritoToSend;
                // Elimina cualquier campo "productos" del payload si existe
                if ('productos' in dataToSend) {
                    delete dataToSend.productos;
                }
            }

            // DEBUG: muestra el payload real
            console.log("DEBUG - dataToSend:", JSON.stringify(dataToSend));

            await createHandleSubmit(
                dataToSend,
                async () => {
                    // 2. Si corresponde, crear el movimiento de cobranza/pago
                    if (
                        (tipo === "factura_venta" && estadoPago === "si") ||
                        (tipo === "factura_compra" && estadoPago === "si")
                    ) {
                        const tipoMovimiento = tipo === "factura_venta" ? "cobranza" : "pago";
                        // Mostrar la cantidad de productos diferentes, no la suma de cantidades
                        const cantidadProductos = carrito.length;
                        const movimientoPagoCobranza = {
                            fecha,
                            cuenta,
                            tipo: tipoMovimiento,
                            total: totalFinal,
                            concepto: `${
                                tipo === "factura_venta"
                                    ? `Cobranza de ${cantidadProductos} producto${cantidadProductos === 1 ? '' : 's'}`
                                    : `Pago de ${cantidadProductos} producto${cantidadProductos === 1 ? '' : 's'}`
                            }`,
                            descuento_total: 0,
                            carrito: []
                        };
                        await createHandleSubmit(
                            movimientoPagoCobranza,
                            () => {
                                setIsSubmitting(false);
                                onAccept();
                            },
                            (errorMessage: string) => {
                                setError(`Error al registrar pago/cobranza: ${errorMessage}`);
                                setIsSubmitting(false);
                            }
                        )();
                    } else {
                        setIsSubmitting(false);
                        onAccept();
                    }
                },
                (errorMessage: string) => {
                    setError(`Error en los campos ingresados: ${errorMessage}`);
                    setIsSubmitting(false);
                }
            )();
        } catch (err) {
            setError("Error inesperado al procesar la transacción");
            setIsSubmitting(false);
        }
    };

    // Helper para saber si mostrar el input de "Cantidad Abonada"
    const shouldShowCantidadAbonada = () => {
        return tipo !== "factura_venta" && tipo !== "factura_compra" && tipo !== "";
    };

    return(
        <div className="page">
            <div className='popup'>
                <div className='content'>
                    <motion.div
                        className="menu_newTransaction"
                        transition={{ 
                            duration: 0.3,
                            ease: "easeInOut"
                        }}
                    >
                        <div className="menu_topBar">
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
                                    <AccountDropdown 
                                        options={options}
                                        selectedAccount={cuenta}
                                        onSelectAccount={setCuenta}
                                        isSubmitting={isSubmitting}
                                        placeholder="-- Selecciona una cuenta --"
                                    />
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
                                        <option value="factura_venta">Factura Venta</option>
                                        <option value="factura_compra">Factura Compra</option>
                                        <option value="pago">Pago</option>
                                        <option value="cobranza">Cobranza</option>
                                        <option value="jornal">Jornal</option>
                                        <option value="alquiler">Alquiler</option>
                                        <option value="impuestos">Impuestos</option>
                                        <option value="sueldo">Sueldo</option>
                                        <option value="aguinaldo">Aguinaldo</option>
                                    </select>
                                </div>
    
                                {/* Detalle solo si NO es factura_venta ni factura_compra */}
                                {tipo !== "factura_venta" && tipo !== "factura_compra" && (
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
                                )}
    
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
    
                                {/* Cantidad Abonada solo para tipos distintos a factura_venta/factura_compra */}
                                {shouldShowCantidadAbonada() && (
                                    <div className="entry">
                                        <div className="entry_label">
                                            <div className="text open-sans">Cantidad Abonada</div>
                                        </div>
                                        <input 
                                            type="number" 
                                            className="custom_input" 
                                            placeholder="Ingresar total abonado al registrar..."
                                            value={total} 
                                            onChange={(e) => setTotal(e.target.value)}
                                            disabled={isSubmitting}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                )}
    
                                {/* Estado solo para factura_venta o factura_compra */}
                                {(tipo === "factura_venta" || tipo === "factura_compra") && (
                                    <div className="entry">
                                        <div className="entry_label">
                                            <div className="text open-sans">
                                                {tipo === "factura_venta" ? "Cobrado" : "Pagado"}
                                            </div>
                                        </div>
                                        <select
                                            className="custom_input"
                                            value={estadoPago}
                                            onChange={e => setEstadoPago(e.target.value)}
                                            disabled={isSubmitting}
                                        >
                                            <option value="no">{tipo === "factura_venta" ? "No cobrado" : "No pagado"}</option>
                                            <option value="si">{tipo === "factura_venta" ? "Cobrado" : "Pagado"}</option>
                                        </select>
                                    </div>
                                )}
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
                    </motion.div>
    
                    {/* SOLO PARA FACTURAS DE VENTA / FACTURAS DE COMPRA */}
                    <AnimatePresence>
                        {shouldShowCart() && (
                            <motion.div
                                initial={{ 
                                    opacity: 1, 
                                    x: "0",
                                    clipPath: "inset(0 0 0 0)"
                                }}
                                animate={{ 
                                    opacity: 1, 
                                    x: "0%",
                                    clipPath: "inset(0 0 0 0)"
                                }}
                                exit={{ 
                                    opacity: 1, 
                                    x: "-100%", 
                                    clipPath: "inset(0 0 0 100%)"
                                }}
                                transition={{ duration: 0.3 }}
                                className='motion'
                                >
                                <div className='productSection'>
                                    <div className="menu_topBar">
                                        <div className="text open-sans"> Seleccionar Items </div>
                                    </div>
                                    <div className='row'>
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
                                                                className="scroll-content"
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
                                            <ShoppingCartTotal total={precioBrutoProductos}></ShoppingCartTotal>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
    
            <div className="blur-layer"></div>
        </div>
    );
};

export default Transaction;

// NOTA IMPORTANTE:
// Asegúrate de que el componente <ProductGrid productos={data} carrito={carrito} onCarritoUpdate={handleCarritoUpdate} />
// realmente actualiza el array carrito con la cantidad correcta de cada producto.
// El submit toma la cantidad de cada producto directamente de carrito.
// Si la cantidad no se refleja correctamente en carrito, revisa la implementación de ProductGrid y onCarritoUpdate.