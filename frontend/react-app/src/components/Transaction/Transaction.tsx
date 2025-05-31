import React from 'react';
import './Transaction.css';
import { useEffect, useState } from 'react';

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
                            <input className="custom_input" />
                        </div>
                        <div className="entry">
                            <div className="entry_label">
                                <div className="text open-sans">Cuenta</div>    
                            </div>
                            <input className="custom_input" />
                        </div>
                        <div className="entry">
                            <div className="entry_label">
                                <div className="text open-sans">Tipo de Movimiento</div>
                            </div>
                            <input className="custom_input" />
                        </div>
                        <div className="entry">
                            <div className="entry_label">
                                <div className="text open-sans">Descuento</div>
                            </div>
                            <input className="custom_input" />
                        </div>
                        <div className="entry">
                            <div className="entry_label">
                                <div className="text open-sans">Abonado al registrar</div>
                            </div>
                            <input className="custom_input" />
                        </div>
                    </div>

                    <div className='carrito'>
                        <div className="topbar">
                            <div className="text open-sans"> PRODUCTOS </div>
                        </div>

                        <div className="search">
                            <input type="text" className="searchTerm" placeholder="¿Qué producto estás buscando?"></input>
                        </div>

                        <div className='container-box'>
                            <div className='borderless-header'>
                                <div><span>Stock</span></div>
                                <div><span>Nombre</span></div>
                                <div><span>Precio</span></div>
                            </div>
                            <div className="container-wrapper-nopad scroll-container">
                                {data?.map((producto, index) => (
                                    <div className="productDB" key={producto.id || index}>
                                        <div><span> {producto.cantidad} </span></div>
                                        <div><span> {producto.tipo_producto} </span></div>
                                        <div><span> ${producto.precio_venta_unitario} </span></div>
                                    </div>
                                ))}

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
                    <button className="bigButton button-shadow green" onClick={onAccept}>
                        <div className="text open-sans">ACEPTAR</div>
                    </button>
                </div>
            </div>

            <div className="blur-layer"></div>
        </div>
    );
};

export default Transaction;