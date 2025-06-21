import * as React from 'react';
import '../menus.css';
import { useEffect, useState } from 'react';

interface AccountProps {
    onClose: () => void;
    onAccept: () => void;
    editingAccount?: CuentaData | null; // Optional: for editing existing accounts
}

interface CuentaData {
    id?: number;
    nombre: string;
    contacto_mail: string;
    contacto_telefono: string;
    tipo_cuenta: string;
    monto: number;
}

const NewAccount: React.FC<AccountProps> = ({ onClose, onAccept, editingAccount }) => {
    const [nombre, setNombre] = useState<string>("");
    const [contactoMail, setContactoMail] = useState<string>("");
    const [contactoTelefono, setContactoTelefono] = useState<string>("");
    const [tipoCuenta, setTipoCuenta] = useState<string>("");
    const [monto, setMonto] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Load data if editing existing account
    useEffect(() => {
        if (editingAccount) {
            setNombre(editingAccount.nombre);
            setContactoMail(editingAccount.contacto_mail || "");
            setContactoTelefono(editingAccount.contacto_telefono || "");
            setTipoCuenta(editingAccount.tipo_cuenta);
            setMonto(editingAccount.monto.toString());
        }
    }, [editingAccount]);

    const handleSubmit = async () => {
        setError("");
        
        // Validation
        if (!nombre.trim()) {
            setError("El nombre es obligatorio");
            return;
        }
        
        if (!tipoCuenta) {
            setError("Debe seleccionar un tipo de cuenta");
            return;
        }

        if (!monto || isNaN(parseFloat(monto))) {
            setError("El monto debe ser un número válido");
            return;
        }

        // Email validation if provided
        if (contactoMail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactoMail)) {
            setError("El formato del email no es válido");
            return;
        }

        setIsSubmitting(true);

        try {
            const accountData: CuentaData = {
                nombre: nombre.trim(),
                contacto_mail: contactoMail.trim() || null,
                contacto_telefono: contactoTelefono.trim() || null,
                tipo_cuenta: tipoCuenta,
                monto: parseFloat(monto)
            };

            const url = editingAccount 
                ? `http://localhost:8000/api/cuentas/${editingAccount.id}`
                : `http://localhost:8000/api/cuentas/`;
            
            const method = editingAccount ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(accountData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar la cuenta');
            }

            onAccept(); // Call parent success handler
        } catch (err) {
            console.error('Error saving account:', err);
            setError(err instanceof Error ? err.message : 'Error al guardar la cuenta');
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
                                {editingAccount ? 'Editando Cuenta' : 'Nueva Cuenta'}
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
                                        <div className="text open-sans">Nombre *</div>
                                    </div>
                                    <input 
                                        type="text" 
                                        className="custom_input" 
                                        placeholder="Ingrese el nombre de la cuenta..."
                                        value={nombre} 
                                        onChange={(e) => setNombre(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="entry">
                                    <div className="entry_label">
                                        <div className="text open-sans">Tipo de Cuenta *</div>
                                    </div>
                                    <select 
                                        className="custom_input" 
                                        value={tipoCuenta} 
                                        onChange={(e) => setTipoCuenta(e.target.value)}
                                        disabled={isSubmitting}
                                    >
                                        <option value="">-- Selecciona un tipo de cuenta --</option>
                                        <option value="proveedor">Proveedor</option>
                                        <option value="cliente">Cliente</option>
                                        <option value="empleado">Empleado</option>
                                    </select>
                                </div>

                                <div className="entry">
                                    <div className="entry_label">
                                        <div className="text open-sans">Monto *</div>
                                    </div>
                                    <input 
                                        type="number" 
                                        className="custom_input" 
                                        placeholder="Ingrese el monto inicial..."
                                        value={monto} 
                                        onChange={(e) => setMonto(e.target.value)}
                                        disabled={isSubmitting}
                                        step="0.01"
                                    />
                                </div>

                                <div className="entry">
                                    <div className="entry_label">
                                        <div className="text open-sans">Email de Contacto</div>
                                    </div>
                                    <input 
                                        type="email" 
                                        className="custom_input" 
                                        placeholder="(OPCIONAL) Ingrese email de contacto..."
                                        value={contactoMail} 
                                        onChange={(e) => setContactoMail(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="entry">
                                    <div className="entry_label">
                                        <div className="text open-sans">Teléfono de Contacto</div>
                                    </div>
                                    <input 
                                        type="tel" 
                                        className="custom_input" 
                                        placeholder="(OPCIONAL) Ingrese teléfono de contacto..."
                                        value={contactoTelefono} 
                                        onChange={(e) => setContactoTelefono(e.target.value)}
                                        disabled={isSubmitting}
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

export default NewAccount;