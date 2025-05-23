import React from 'react';
import './Transaction.css';

interface TransactionProps {
    onClose: () => void;
    onAccept: () => void;
}

const Transaction: React.FC<TransactionProps> = ({ onClose, onAccept }) => {
    return(
        <div className="menu_newTransaction popup">
            <div className="menu_newTransaction_topBar">
                <div className="text open-sans"> Agregando Movimiento </div>
            </div>

            <div className="menu_newTransaction_main">
                <div className="entries">
                    <div className="entry">
                        <div className="container">
                            <div className="text open-sans">Fecha</div>
                        </div>
                        <input className="custom_input" />
                    </div>
                    <div className="entry">
                        <div className="container">
                            <div className="text open-sans">Cuenta</div>
                        </div>
                        <input className="custom_input" />
                    </div>
                    <div className="entry">
                        <div className="container">
                            <div className="text open-sans">Tipo de Movimiento</div>
                        </div>
                        <input className="custom_input" />
                    </div>
                    <div className="entry">
                        <div className="container">
                            <div className="text open-sans">Descuento</div>
                        </div>
                        <input className="custom_input" />
                    </div>
                    <div className="entry">
                        <div className="container">
                            <div className="text open-sans">Abonado al registrar</div>
                        </div>
                        <input className="custom_input" />
                    </div>
                </div>
                
                <div className="carrito">
                    <div className="topbar">
                        <div className="text open-sans"> CARRITO </div>
                    </div>

                    <div className="container">
                        <div className="container-wrapper">
                            <div className="product">
                                <div id="product_1"> x1 </div>
                                <div id="product_2"> Producto A </div>
                            </div>
                            <div className="product">
                                <div id="product_1"> x2 </div>
                                <div id="product_2"> Producto B </div>
                            </div>
                            <div className="product">
                                <div id="product_1"> x1 </div>
                                <div id="product_2"> Producto A </div>
                            </div>
                            <div className="product">
                                <div id="product_1"> x2 </div>
                                <div id="product_2"> Producto B </div>
                            </div>
                            <div className="product">
                                <div id="product_1"> x1 </div>
                                <div id="product_2"> Producto A </div>
                            </div>
                            <div className="product">
                                <div id="product_1"> x2 </div>
                                <div id="product_2"> Producto B </div>
                            </div>
                            <div className="product">
                                <div id="product_1"> x1 </div>
                                <div id="product_2"> Producto A </div>
                            </div>
                            <div className="product">
                                <div id="product_1"> x2 </div>
                                <div id="product_2"> Producto B </div>
                            </div>
                            <div className="product">
                                <div id="product_1"> x1 </div>
                                <div id="product_2"> Producto A </div>
                            </div>
                            <div className="product">
                                <div id="product_1"> x2 </div>
                                <div id="product_2"> Producto B </div>
                            </div>
                            <div className="product">
                                <div id="product_1"> x1 </div>
                                <div id="product_2"> Producto A </div>
                            </div>
                            <div className="product">
                                <div id="product_1"> x2 </div>
                                <div id="product_2"> Producto B </div>
                            </div>
                        </div>
                    </div>

                    <div className="bottombar">
                        <button className="smallButton button-shadow">
                            <div className="text open-sans"> Eliminar Elemento </div>
                        </button>
                        <button className="smallButton button-shadow">
                            <div className="text open-sans"> Añadir Elemento </div>
                        </button>
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
    );
};

export default Transaction;