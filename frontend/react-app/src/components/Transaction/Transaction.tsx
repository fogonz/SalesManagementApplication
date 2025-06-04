import * as React from 'react';
import './Transaction.css';
import { useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { createHandleSubmit, validateTransaction } from '../../utils/validation/validate_insertTransaction';

const ProductItem = ({ index, style, data }) => (
    <div style={style} className="productDB">
        <div><span>{data[index]?.cantidad}</span></div>
        <div><span>{data[index]?.tipo_producto}</span></div>
        <div><span>${data[index]?.precio_venta_unitario}</span></div>
    </div>
);

interface TransactionProps {
    onClose: () => void;
    onAccept: () => void;
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
    const [total, setTotal] = useState<string>("");
    const [abonado, setAbonado] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [filteredData, setFilteredData] = useState<ProductoRow[]>([]);
    const [data, setData] = useState<ProductoRow[] | null>(null);
    const [options, setOptions] = useState<CuentaOption[]>([]);

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
                                <option value="">-Selecciona una cuenta-</option>
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
                                <option value="">Seleccionar...</option>
                                <option value="factura venta">Factura Venta</option>
                                <option value="factura compra">Factura Compra</option>
                                <option value="pago">Pago</option>
                                <option value="cobranza">Cobranza</option>
                                <option value="factura c. varios">Factura C. Varios</option>
                            </select>
                        </div>

                        <div className="entry">
                            <div className="entry_label">
                                <div className="text open-sans">Descuento (%)</div>
                            </div>
                            <input 
                                type="number" 
                                className="custom_input" 
                                value={descuento} 
                                onChange={(e) => setDescuento(e.target.value)}
                                disabled={isSubmitting}
                                min="0"
                                max="100"
                                step="0.01"
                            />
                        </div>
                        <div className="entry">
                            <div className="entry_label">
                                <div className="text open-sans">Abonado al registrar</div>
                            </div>
                            <input 
                                type="number" 
                                className="custom_input" 
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

                            <div className="container-wrapper-nopad" style={{ height: '400px' }}>
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
                                            {ProductItem}
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

                        <div className="container">
                            <div className="container-wrapper">
                                <div className="product">
                                    <p> x1 </p>
                                    <p> Producto A </p>
                                    <p> $200 </p>
                                </div>
                                <div className="product">
                                    <p> x2 </p>
                                    <p> Producto B </p>
                                    <p> $520 </p>
                                </div>
                                <div className="product">
                                    <p> x1 </p>
                                    <p> Producto A </p>
                                    <p> $125 </p>
                                </div>
                                <div className="product">
                                    <p> x1 </p>
                                    <p> Producto A </p>
                                    <p> $200 </p>
                                </div>
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