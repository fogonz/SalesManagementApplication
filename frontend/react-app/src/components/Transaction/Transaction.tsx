import React from 'react';
import './Transaction.css';

interface TransactionProps {
    onClose: () => void;
    onAccept: () => void;
}

const Transaction: React.FC<TransactionProps> = ({ onClose, onAccept }) => {
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

                        <div className='borderless-header'>
                            <div><text>Quedan</text></div>
                            <div><text>Nombre</text></div>
                            <div><text>Precio</text></div>
                        </div>

                        <div className="container">
                            <div className="container-wrapper-nopad">
                                <div className="productDB">
                                    <div><text> 10</text></div>
                                    <div><text> Producto A </text></div>
                                    <div><text> $200 </text></div>
                                </div>
                                <div className="productDB">
                                    <div><text> 24</text></div>
                                    <div><text> Producto B </text></div>
                                    <div><text> $320 </text></div>
                                </div>
                                <div className="productDB">
                                    <div><text> 1</text></div>
                                    <div><text> Producto C </text></div>
                                    <div><text> $500 </text></div>
                                </div>
                                <div className="productDB">
                                    <div><text> 10</text></div>
                                    <div><text> Producto A </text></div>
                                    <div><text> $200 </text></div>
                                </div>
                                <div className="productDB">
                                    <div><text> 24</text></div>
                                    <div><text> Producto B </text></div>
                                    <div><text> $320 </text></div>
                                </div>
                                <div className="productDB">
                                    <div><text> 1</text></div>
                                    <div><text> Producto C </text></div>
                                    <div><text> $500 </text></div>
                                </div>
                                <div className="productDB">
                                    <div><text> 10</text></div>
                                    <div><text> Producto A </text></div>
                                    <div><text> $200 </text></div>
                                </div>
                                <div className="productDB">
                                    <div><text> 24</text></div>
                                    <div><text> Producto B </text></div>
                                    <div><text> $320 </text></div>
                                </div>
                                <div className="productDB">
                                    <div><text> 1</text></div>
                                    <div><text> Producto C </text></div>
                                    <div><text> $500 </text></div>
                                </div>
                                <div className="productDB">
                                    <div><text> 10</text></div>
                                    <div><text> Producto A </text></div>
                                    <div><text> $200 </text></div>
                                </div>
                                <div className="productDB">
                                    <div><text> 24</text></div>
                                    <div><text> Producto B </text></div>
                                    <div><text> $320 </text></div>
                                </div>
                                <div className="productDB">
                                    <div><text> 1</text></div>
                                    <div><text> Producto C </text></div>
                                    <div><text> $500 </text></div>
                                </div>
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