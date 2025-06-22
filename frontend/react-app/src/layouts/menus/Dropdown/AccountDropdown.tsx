import React, { useEffect, useState, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import './AccountDropdown.css';

const AccountItem = ({ index, style, data, onSelectAccount, selectedAccountId }) => {
    const account = data[index];
    const isSelected = selectedAccountId === account?.id;
    
    return (
        <div 
            style={style} 
            className={`account-item ${isSelected ? 'selected' : 'hoverable'}`}
            onClick={() => onSelectAccount(account)}
        >
            <div className='account-wrapper'>
                <div className='account-name'>
                    <span>{account?.nombre}</span>
                </div>
                <div className='account-type'>
                    <span>({account?.tipo_cuenta})</span>
                </div>
                <div className='account-amount'>
                    <span>${account?.monto}</span>
                </div>
            </div>
            <button 
                className={`account-button ${isSelected ? 'selected-button' : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelectAccount(account);
                }}
                disabled={!account || isSelected}
            > 
                <i className={`fas ${isSelected ? 'fa-check' : 'fa-plus'}`}></i> 
            </button>
        </div>
    );
};

const AccountDropdown = ({ options, selectedAccount, onSelectAccount, isSubmitting, placeholder = "-- Selecciona una cuenta --" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOptions, setFilteredOptions] = useState(options);
    const dropdownRef = useRef(null);

    // Find the selected account object from the options based on the selectedAccount (which could be string, number, or object)
    const selectedAccountObj = React.useMemo(() => {
        if (!selectedAccount || !options || options.length === 0) return null;
        
        // If selectedAccount is already an object with id, use it
        if (typeof selectedAccount === 'object' && selectedAccount.id) {
            return selectedAccount;
        }
        
        // If selectedAccount is a string or number (ID), find the matching account
        return options.find(account => 
            account.id === selectedAccount || 
            account.id === parseInt(selectedAccount) ||
            account.id === String(selectedAccount)
        ) || null;
    }, [selectedAccount, options]);

    // Filter accounts based on search term
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredOptions(options);
        } else {
            const filtered = options.filter(account => 
                account.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                account.tipo_cuenta.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredOptions(filtered);
        }
    }, [searchTerm, options]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelectAccount = (account) => {
        // Pass the account ID as string to maintain compatibility with existing state
        onSelectAccount(String(account.id));
        setIsOpen(false);
        setSearchTerm("");
    };

    const AccountItemWithSelect = (props) => (
        <AccountItem {...props} onSelectAccount={handleSelectAccount} selectedAccountId={selectedAccountObj?.id} />
    );

    return (
        <div className="account-dropdown" ref={dropdownRef}>
            <div 
                className={`account-selector ${isSubmitting ? 'disabled' : ''}`}
                onClick={() => !isSubmitting && setIsOpen(!isOpen)}
            >
                <span className="account-selector-text">
                    {selectedAccountObj 
                        ? `${selectedAccountObj.nombre} (${selectedAccountObj.tipo_cuenta})` 
                        : placeholder
                    }
                </span>
                <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} account-chevron`}></i>
            </div>

            {isOpen && (
                <div className="account-dropdown-menu">
                    <div className="account-search">
                        <input 
                            type="text" 
                            className="account-search-input" 
                            placeholder="¿Qué cuenta estás buscando?"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                        {searchTerm && (
                            <div className="account-search-results">
                                {filteredOptions.length} cuenta{filteredOptions.length !== 1 ? 's' : ''} encontrada{filteredOptions.length !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>

                    <div className='account-list-container'>
                        <div className='account-list-header'>
                            <div><span>Nombre</span></div>
                            <div><span>Tipo</span></div>
                            <div><span>Monto</span></div>
                        </div>

                        <div className="account-list-wrapper">
                            <AutoSizer>
                                {({ height, width }) => (
                                    <List
                                        height={height}
                                        width={width}
                                        itemCount={filteredOptions?.length || 0}
                                        itemSize={60}
                                        itemData={filteredOptions}
                                        className="account-scroll-content"
                                    >
                                        {AccountItemWithSelect}
                                    </List>
                                )}
                            </AutoSizer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountDropdown;