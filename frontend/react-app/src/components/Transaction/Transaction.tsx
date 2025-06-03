import React from 'react';
import './Transaction.css';
import { useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

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

const Transaction: React.FC<TransactionProps> = ({ onClose, onAccept }) => {
    const [fecha, setFecha] = useState<string>("");
    const [cuenta, setCuenta] = useState<string>("");
    const [tipoMovimiento, setTipoMovimiento] = useState<string>("");
    const [descuento, setDescuento] = useState<string>("");
    const [total, setTotal] = useState<string>("");
    const [abonado, setAbonado] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredData, setFilteredData] = useState<ProductoRow[]>([]);
    
    const [data, setData] = useState<ProductoRow[] | null>(null)

    useEffect(() => {
        if (data) console.log(data);
    }, [data]);

    useEffect(() => {
        const fetchData = async () => {
            try {
            const res = await fetch(`http://localhost:8000/api/productos`);
            const json = await res.json();
            setData(json);
            } catch (err) {
            console.error(`Error al cargar :`, err);
            }
        };
        fetchData();
    }, []);

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
    
    // 🔹 AGREGAR ESTE useEffect PARA INICIALIZAR filteredData:
    useEffect(() => {
        if (data) {
            setFilteredData(data);
        }
    }, [data]);

    const handleSubmit = async () => {
        console.log([cuenta, abonado])

        {/*
        if (!fecha || !cuenta || !tipoMovimiento) {
          alert("Complete Fecha, Cuenta y Tipo de Movimiento.");
          return;
        }
        */}
      
        // 3.2) Construir el payload como objeto JavaScript
        const payload = {
          tipo_comprobante: tipoMovimiento,
          fecha: fecha,                          // e.g. "2025-06-03"
          cuenta: parseInt(cuenta, 10),       // convierte a número
          cantidad: descuento === "" ? null : parseFloat(descuento),
          precio_venta: abonado === "" ? null : parseFloat(abonado),
          total: abonado === "" ? null : parseFloat(abonado),
          producto_id: null,
          numero_comprobante: null,
          saldo_diferencia: null,
          concepto: null,
        };
      
        // 3.3) Enviar el POST con fetch
        try {
          const respuesta = await fetch("http://localhost:8000/api/movimientos/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
      
          // 3.4) Manejar respuesta no exitosa
          if (!respuesta.ok) {
            console.error("Status:", respuesta.status, respuesta.statusText);
            const textoError = await respuesta.text().catch(() => null);
            console.error("Error body:", textoError);
            alert("Error al crear la transacción. Revisa consola.");
            return;
          }
      
          // 3.5) Si fue 2xx, parsear JSON y llamar onAccept()
          const datos = await respuesta.json();
          console.log("Transacción creada:", datos);
          onAccept();
        } catch (err) {
          console.error("Error de red:", err);
          alert("No se pudo conectar al servidor");
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
                        <div className="entry">
                            <div className="entry_label">
                                <div className="text open-sans">Fecha</div>
                            </div>
                            <input type="date" className="custom_input" value={fecha} onChange={(e) => setFecha(e.target.value)}/>
                        </div>
                        <div className="entry">
                            <div className="entry_label">
                                <div className="text open-sans">Cuenta</div>    
                            </div>
                            <input type="text" className="custom_input" value={cuenta} onChange={(e) => setCuenta(e.target.value)} />
                        </div>
                        <div className="entry">
                            <div className="entry_label">
                                <div className="text open-sans">Tipo de Movimiento</div>
                            </div>
                            <input type="text" className="custom_input" value={tipoMovimiento} onChange={(e) => setTipoMovimiento(e.target.value)} />
                        </div>
                        <div className="entry">
                            <div className="entry_label">
                                <div className="text open-sans">Descuento</div>
                            </div>
                            <input type="number" className="custom_input" value={descuento} onChange={(e) => setDescuento(e.target.value)} />
                        </div>
                        <div className="entry">
                            <div className="entry_label">
                                <div className="text open-sans">Abonado al registrar</div>
                            </div>
                            <input type="number" className="custom_input" value={abonado} onChange={(e) => setAbonado(e.target.value)} />
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
                                            itemCount={filteredData?.length || 0}  // 🔹 CAMBIAR data por filteredData
                                            itemSize={60}
                                            itemData={filteredData}                // 🔹 CAMBIAR data por filteredData
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
                    <button className="bigButton button-shadow gray" onClick={onClose}>
                        <div className="text open-sans">CANCELAR</div>
                    </button>
                    <button className="bigButton button-shadow green" onClick={handleSubmit}>
                        <div className="text open-sans" onClick={handleSubmit}>ACEPTAR</div>
                    </button>
                </div>
            </div>

            <div className="blur-layer"></div>
        </div>
    );
};

export default Transaction;