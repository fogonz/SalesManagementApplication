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

// Nuevo componente: FacturaDropdown
const FacturaDropdown: React.FC<{
    facturas: any[];
    selectedFactura: any;
    onSelectFactura: (factura: any) => void;
    isSubmitting?: boolean;
    placeholder?: string;
    tipo?: string;
}> = ({ facturas, selectedFactura, onSelectFactura, isSubmitting = false, placeholder = "-- Selecciona una factura --", tipo }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredFacturas, setFilteredFacturas] = useState<any[]>(facturas);

    useEffect(() => {
        if (!facturas || facturas.length === 0) {
            setFilteredFacturas([]);
            return;
        }
        if (searchTerm.trim() === "") {
            setFilteredFacturas(facturas);
        } else {
            const filtered = facturas.filter(f =>
                (f.numero_comprobante && f.numero_comprobante.toString().includes(searchTerm)) ||
                (f.concepto && f.concepto.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredFacturas(filtered);
        }
    }, [searchTerm, facturas]);

    const selectedFacturaObj = React.useMemo(() => {
        if (!selectedFactura) return null;
        return facturas.find(f => f.id === selectedFactura?.id || f.id === selectedFactura) || null;
    }, [selectedFactura, facturas]);

    return (
        <div className="dropdown">
            <div
                className={`selector ${isSubmitting ? 'selector--disabled' : ''}`}
                onClick={() => { if (!isSubmitting) setIsOpen(!isOpen); }}
            >
                <span className="selector__text">
                    {selectedFacturaObj
                        ? `N° ${selectedFacturaObj.numero_comprobante || "-"} | ${selectedFacturaObj.fecha} | $${selectedFacturaObj.total} | ${selectedFacturaObj.concepto || ""}`
                        : placeholder
                    }
                </span>
                <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} selector__chevron`}></i>
            </div>
            {isOpen && (
                <div className="dropdown__menu">
                    <div className="search">
                        <input
                            type="text"
                            className="search__input"
                            placeholder="¿Qué factura buscas?"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onClick={e => e.stopPropagation()}
                        />
                        {searchTerm && (
                            <div className="search__results">
                                {filteredFacturas.length} factura{filteredFacturas.length !== 1 ? 's' : ''} encontrada{filteredFacturas.length !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                    <div className="list-container">
                        <div className="list-header">
                            <div><span>N°</span></div>
                            <div><span>Fecha</span></div>
                            <div><span>Total</span></div>
                            <div><span>Detalle</span></div>
                        </div>
                        <div className="list-wrapper">
                            {filteredFacturas.length === 0 ? (
                                <div className="empty-state">
                                    <i className="fas fa-search"></i>
                                    {searchTerm ? 'No se encontraron facturas' : 'No hay facturas disponibles'}
                                </div>
                            ) : (
                                filteredFacturas.map((f, idx) => (
                                    <div
                                        key={f.id || idx}
                                        className={`dropdown-item ${selectedFacturaObj?.id === f.id ? 'dropdown-item--selected' : 'dropdown-item--hoverable'}`}
                                        onClick={() => { onSelectFactura(f); setIsOpen(false); setSearchTerm(""); }}
                                    >
                                        <div className="item-content">
                                            <div className="item-nro"><span>{f.numero_comprobante || "-"}</span></div>
                                            <div className="item-fecha"><span>{f.fecha}</span></div>
                                            <div className="item-total"><span>${f.total}</span></div>
                                            <div className="item-detalle"><span>{f.concepto || ""}</span></div>
                                        </div>
                                        <button
                                            className={`item-action ${selectedFacturaObj?.id === f.id ? 'item-action--selected' : ''}`}
                                            onClick={e => { e.stopPropagation(); onSelectFactura(f); setIsOpen(false); setSearchTerm(""); }}
                                            disabled={selectedFacturaObj?.id === f.id}
                                        >
                                            <i className={`fas ${selectedFacturaObj?.id === f.id ? 'fa-check' : 'fa-plus'}`}></i>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

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
    const [numeroComprobante, setNumeroComprobante] = useState<string>("");
    // Nuevos estados para facturas pendientes
    const [facturasPendientes, setFacturasPendientes] = useState<any[]>([]);
    const [facturaSeleccionada, setFacturaSeleccionada] = useState<any>(null);

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
    
    // Buscar facturas pendientes cuando tipo/cuenta cambian
    useEffect(() => {
        // Solo buscar si es pago/cobranza y hay cuenta seleccionada
        if ((tipo === "pago" || tipo === "cobranza") && cuenta) {
            // SOLO permitir pagos de facturas de compra y cobranzas de facturas de venta
            const tipoFactura = tipo === "pago" ? "factura_compra" : "factura_venta";
            fetch(`http://localhost:8000/api/movimientos/?tipo=${tipoFactura}&cuenta=${cuenta}`)
                .then(res => res.json())
                .then(data => {
                    // Filtrar SOLO facturas (no pagos/cobranzas) y con total > 0
                    const soloFacturas = data.filter(f =>
                        (f.tipo === "factura_compra" || f.tipo === "factura_venta") && f.total > 0
                    );
                    setFacturasPendientes(soloFacturas);
                })
                .catch(() => setFacturasPendientes([]));
        } else {
            setFacturasPendientes([]);
            setFacturaSeleccionada(null);
        }
    }, [tipo, cuenta]);

    // Cuando se selecciona una factura, setear numero_comprobante y total
    useEffect(() => {
        if (facturaSeleccionada) {
            // Si la factura tiene numero_comprobante, usarlo; si no, sugerir el siguiente número
            if (facturaSeleccionada.numero_comprobante !== undefined && facturaSeleccionada.numero_comprobante !== null && facturaSeleccionada.numero_comprobante !== "") {
                setNumeroComprobante(facturaSeleccionada.numero_comprobante.toString());
            } else {
                // Buscar el mayor numero_comprobante para ese tipo/cuenta y sugerir el siguiente
                const sugerirNumero = async () => {
                    let maxNumero = 0;
                    try {
                        const res = await fetch(
                            `http://localhost:8000/api/movimientos/?tipo=${facturaSeleccionada.tipo}&cuenta=${facturaSeleccionada.cuenta}`
                        );
                        if (res.ok) {
                            const movimientos = await res.json();
                            movimientos.forEach((mov: any) => {
                                if (
                                    mov.numero_comprobante !== undefined &&
                                    mov.numero_comprobante !== null &&
                                    !isNaN(Number(mov.numero_comprobante))
                                ) {
                                    maxNumero = Math.max(maxNumero, Number(mov.numero_comprobante));
                                }
                            });
                        }
                    } catch (e) {}
                    setNumeroComprobante((maxNumero + 1).toString());
                };
                sugerirNumero();
            }
            setTotal(facturaSeleccionada.total?.toString() || "");
        }
    }, [facturaSeleccionada]);

    // handleSubmit with validation
    const handleSubmit = async () => {
        setError(""); 
        setIsSubmitting(true);

        let reintentos = 0;
        let ultimoError = "";

        const submitWithAutoComprobante = async () => {
            try {
                // Calcula el total real del carrito si es factura_venta o factura_compra
                let totalFinal = total ? parseFloat(total) : 0;
                let carritoToSend: { id: number; cantidad: number }[] = [];

                if (tipo === "factura_venta" || tipo === "factura_compra") {
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
                    // Si es pago/cobranza y hay factura seleccionada, enviar concepto automático
                    concepto: ( (tipo === "pago" || tipo === "cobranza") && facturaSeleccionada )
                        ? (
                            tipo === "pago"
                                ? `Pago de ${facturaSeleccionada.carrito?.length || 1} producto${(facturaSeleccionada.carrito?.length === 1) ? '' : 's'}`
                                : `Cobranza de ${facturaSeleccionada.carrito?.length || 1} producto${(facturaSeleccionada.carrito?.length === 1) ? '' : 's'}`
                        )
                        : concepto
                };

                if (tipo === "factura_venta" || tipo === "factura_compra") {
                    dataToSend.carrito = carritoToSend;

                    // Si está pagado/cobrado, asignar número automáticamente si está vacío
                    let numeroComprobanteFinal = numeroComprobante;
                    if (
                        (estadoPago === "si" || estadoPago === "cobrado" || estadoPago === "pagado") &&
                        (!numeroComprobante || isNaN(Number(numeroComprobante)))
                    ) {
                        // Buscar el mayor numero_comprobante existente para este tipo y cuenta
                        let maxNumero = 0;
                        try {
                            const res = await fetch(
                                `http://localhost:8000/api/movimientos/?tipo=${tipo}&cuenta=${cuenta}`
                            );
                            if (res.ok) {
                                const movimientos = await res.json();
                                movimientos.forEach((mov: any) => {
                                    if (
                                        mov.numero_comprobante !== undefined &&
                                        mov.numero_comprobante !== null &&
                                        !isNaN(Number(mov.numero_comprobante))
                                    ) {
                                        maxNumero = Math.max(maxNumero, Number(mov.numero_comprobante));
                                    }
                                });
                            }
                        } catch (e) {
                            // Si falla, dejar maxNumero en 0
                        }
                        numeroComprobanteFinal = (maxNumero + 1).toString();
                        setNumeroComprobante(numeroComprobanteFinal);
                    }

                    // SOLO obligatorio si NO está pagado/cobrado
                    if (
                        (estadoPago === "no" || estadoPago === "no pagado" || estadoPago === "no cobrado") &&
                        (!numeroComprobante || isNaN(Number(numeroComprobante)))
                    ) {
                        setError("Debes ingresar el número de comprobante.");
                        setIsSubmitting(false);
                        return;
                    }
                    if (numeroComprobanteFinal && !isNaN(Number(numeroComprobanteFinal))) {
                        dataToSend.numero_comprobante = parseInt(numeroComprobanteFinal, 10);
                    }
                    // Elimina cualquier campo "productos" del payload si existe
                    if ('productos' in dataToSend) {
                        delete dataToSend.productos;
                    }
                }

                if ((tipo === "pago" || tipo === "cobranza") && numeroComprobante) {
                    dataToSend.numero_comprobante = parseInt(numeroComprobante, 10);
                }

                // --- AGREGADO: LOG para depuración ---
                console.log("DEBUG - dataToSend antes de validación:", dataToSend);

                await createHandleSubmit(
                    dataToSend,
                    async () => {
                        // 2. Si corresponde, crear el movimiento de cobranza/pago
                        if (
                            (tipo === "factura_venta" && estadoPago === "si") ||
                            (tipo === "factura_compra" && estadoPago === "si")
                        ) {
                            const tipoMovimiento = tipo === "factura_venta" ? "cobranza" : "pago";
                            const cantidadProductos = carrito.length;
                            const movimientoPagoCobranza = {
                                fecha,
                                cuenta,
                                tipo: tipoMovimiento,
                                total: totalFinal,
                                // Mantener el mismo número de comprobante
                                numero_comprobante: numeroComprobante ? parseInt(numeroComprobante, 10) : undefined,
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
                    async (errorMessage: string) => {
                        // Si el error es por comprobante duplicado, sugerir y reintentar una vez
                        if (
                            errorMessage &&
                            errorMessage.toLowerCase().includes("comprobante") &&
                            errorMessage.toLowerCase().includes("existe") &&
                            reintentos < 1
                        ) {
                            // Buscar el siguiente número disponible
                            let maxNumero = 0;
                            try {
                                const res = await fetch(
                                    `http://localhost:8000/api/movimientos/?tipo=${tipo}&cuenta=${cuenta}`
                            );
                            if (res.ok) {
                                const movimientos = await res.json();
                                movimientos.forEach((mov: any) => {
                                    if (
                                        mov.numero_comprobante !== undefined &&
                                        mov.numero_comprobante !== null &&
                                        !isNaN(Number(mov.numero_comprobante))
                                    ) {
                                        maxNumero = Math.max(maxNumero, Number(mov.numero_comprobante));
                                    }
                                });
                            }
                        } catch (e) {}
                        const nuevoNumero = (maxNumero + 1).toString();
                        setNumeroComprobante(nuevoNumero);
                        reintentos++;
                        // Espera a que el estado se actualice antes de reintentar
                        setTimeout(submitWithAutoComprobante, 100);
                        return;
                        } else {
                            setError(errorMessage || "Error en los campos ingresados");
                            setIsSubmitting(false);
                        }
                    }
                )();
            } catch (err) {
                setError("Error inesperado al procesar la transacción");
                setIsSubmitting(false);
            }
        };

        submitWithAutoComprobante();
    };

    // Helper para saber si mostrar el input de "Cantidad Abonada"
    const shouldShowCantidadAbonada = () => {
        return tipo !== "factura_venta" && tipo !== "factura_compra" && tipo !== "";
    };

    // Sugerir número de comprobante cuando cambia tipo o cuenta (para factura_venta/factura_compra)
    useEffect(() => {
        // Si la cuenta cambia a vacío, limpiar el número
        if (!cuenta) {
            setNumeroComprobante("");
            return;
        }
        const sugerirNumeroComprobante = async () => {
            if ((tipo === "factura_venta" || tipo === "factura_compra") && cuenta) {
                let maxNumero = 0;
                try {
                    const res = await fetch(
                        `http://localhost:8000/api/movimientos/?tipo=${tipo}&cuenta=${cuenta}`
                    );
                    if (res.ok) {
                        const movimientos = await res.json();
                        movimientos.forEach((mov: any) => {
                            if (
                                mov.numero_comprobante !== undefined &&
                                mov.numero_comprobante !== null &&
                                !isNaN(Number(mov.numero_comprobante))
                            ) {
                                maxNumero = Math.max(maxNumero, Number(mov.numero_comprobante));
                            }
                        });
                    }
                } catch (e) {}
                setNumeroComprobante((maxNumero + 1).toString());
            } else if (!(tipo === "factura_venta" || tipo === "factura_compra")) {
                setNumeroComprobante(""); // Limpiar si no corresponde
            }
        };
        sugerirNumeroComprobante();
    }, [tipo, cuenta]);

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
                                        onSelectAccount={acc => {
                                            setCuenta(acc);
                                            setFacturaSeleccionada(null); // Limpiar selección de factura al cambiar cuenta
                                            // Sugerir número de comprobante si corresponde
                                            if ((tipo === "factura_venta" || tipo === "factura_compra") && acc) {
                                                (async () => {
                                                    let maxNumero = 0;
                                                    try {
                                                        const res = await fetch(
                                                            `http://localhost:8000/api/movimientos/?tipo=${tipo}&cuenta=${acc}`
                                                        );
                                                        if (res.ok) {
                                                            const movimientos = await res.json();
                                                            movimientos.forEach((mov: any) => {
                                                                if (
                                                                    mov.numero_comprobante !== undefined &&
                                                                    mov.numero_comprobante !== null &&
                                                                    !isNaN(Number(mov.numero_comprobante))
                                                                ) {
                                                                    maxNumero = Math.max(maxNumero, Number(mov.numero_comprobante));
                                                                }
                                                            });
                                                        }
                                                    } catch (e) {}
                                                    setNumeroComprobante((maxNumero + 1).toString());
                                                })();
                                            } else if (!(tipo === "factura_venta" || tipo === "factura_compra")) {
                                                setNumeroComprobante("");
                                            }
                                        }}
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
                                        onChange={e => setTipo(e.target.value)}
                                        disabled={isSubmitting}
                                    >
                                        <option value="">-- Selecciona un tipo de movimiento --</option>
                                        <option value="factura_venta">Factura Venta</option>
                                        <option value="factura_compra">Factura Compra</option>
                                        <option value="factura_c_varios">Factura Compra Varios</option>
                                        <option value="servicio_cepillado">Servicio Cepillado</option>
                                        <option value="pago">Pago</option>
                                        <option value="cobranza">Cobranza</option>
                                        <option value="jornal">Jornal</option>
                                        <option value="alquiler">Alquiler</option>
                                        <option value="impuestos">Impuestos</option>
                                        <option value="sueldo">Sueldo</option>
                                        <option value="aguinaldo">Aguinaldo</option>
                                    </select>
                                </div>

                                {/* Mostrar input para número de comprobante SOLO para factura_venta y factura_compra */}
                                {(tipo === "factura_venta" || tipo === "factura_compra") && (
                                    <div className="entry">
                                        <div className="entry_label">
                                            <div className="text open-sans">Número de Comprobante</div>
                                        </div>
                                        <input
                                            type="number"
                                            className="custom_input"
                                            placeholder="Ingresar número de comprobante"
                                            value={numeroComprobante}
                                            onChange={e => setNumeroComprobante(e.target.value)}
                                            disabled={isSubmitting}
                                            min="1"
                                            step="1"
                                        />
                                    </div>
                                )}

                                {/* Dropdown para seleccionar factura a abonar/cobrar */}
                                {(tipo === "pago" || tipo === "cobranza") && (
                                    <div className="entry">
                                        <div className="entry_label">
                                            <div className="text open-sans">
                                                Seleccionar factura {tipo === "pago" ? "de compra" : "de venta"}
                                            </div>
                                        </div>
                                        <FacturaDropdown
                                            facturas={facturasPendientes
                                                .filter(f =>
                                                    // Solo mostrar facturas de la cuenta seleccionada
                                                    f.cuenta == cuenta &&
                                                    (
                                                        (tipo === "pago" && f.tipo === "factura_compra") ||
                                                        (tipo === "cobranza" && f.tipo === "factura_venta")
                                                    )
                                                )}
                                            selectedFactura={facturaSeleccionada}
                                            onSelectFactura={f => {
                                                setFacturaSeleccionada(f);
                                                if (f && f.numero_comprobante) {
                                                    setNumeroComprobante(f.numero_comprobante.toString());
                                                } else {
                                                    setNumeroComprobante("");
                                                }
                                            }}
                                            isSubmitting={isSubmitting}
                                            placeholder="-- Selecciona una factura --"
                                            tipo={tipo}
                                        />
                                    </div>
                                )}

                                {/* Mostrar el número de comprobante como solo lectura para pago/cobranza */}
                                {(tipo === "pago" || tipo === "cobranza") && facturaSeleccionada && (
                                    <div className="entry">
                                        <div className="entry_label">
                                            <div className="text open-sans">Número de Comprobante</div>
                                        </div>
                                        <input
                                            type="number"
                                            className="custom_input"
                                            value={numeroComprobante}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                )}

                                {/* Detalle solo si NO es factura_venta ni factura_compra */}
                                {tipo !== "factura_venta" && tipo !== "factura_compra" && (
                                    <>
                                        {/* Si es pago/cobranza y hay factura seleccionada, mostrar texto automático */}
                                        {( (tipo === "pago" || tipo === "cobranza") && facturaSeleccionada ) ? (
                                            // NO mostrar input de detalle, solo mostrar el texto
                                            <div className="entry">
                                                <div className="entry_label">
                                                    <div className="text open-sans">
                                                        {tipo === "pago"
                                                            ? `Pago de ${facturaSeleccionada.carrito?.length || 1} producto${(facturaSeleccionada.carrito?.length === 1) ? '' : 's'}`
                                                            : `Cobranza de ${facturaSeleccionada.carrito?.length || 1} producto${(facturaSeleccionada.carrito?.length === 1) ? '' : 's'}`
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            // Si no, mostrar input editable de detalle
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
                                    </>
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