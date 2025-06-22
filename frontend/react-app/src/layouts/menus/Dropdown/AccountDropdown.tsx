import React, { useEffect, useState, useRef } from 'react';
import './AccountDropdown.css';

interface Account {
  id: string | number;
  nombre: string;
  tipo_cuenta: string;
  monto: string | number;
}

interface AccountItemProps {
  account: Account;
  onSelectAccount: (account: Account) => void;
  selectedAccountId?: string | number;
}

interface AccountDropdownProps {
  options?: Account[];
  selectedAccount?: string | number | Account | null;
  onSelectAccount: (accountId: string) => void;
  isSubmitting?: boolean;
  placeholder?: string;
}

const AccountItem: React.FC<AccountItemProps> = ({ 
  account, 
  onSelectAccount, 
  selectedAccountId 
}) => {
  const isSelected = selectedAccountId === account?.id;
  
  return (
    <div 
      className={`dropdown-item ${isSelected ? 'dropdown-item--selected' : 'dropdown-item--hoverable'}`}
      onClick={() => onSelectAccount(account)}
    >
      <div className='item-content'>
        <div className='item-name'>
          <span>{account?.nombre}</span>
        </div>
        <div className='item-type'>
          <span>({account?.tipo_cuenta})</span>
        </div>
        <div className='item-amount'>
          <span>${account?.monto}</span>
        </div>
      </div>
      <button 
        className={`item-action ${isSelected ? 'item-action--selected' : ''}`}
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

const AccountDropdown: React.FC<AccountDropdownProps> = ({ 
  options = [], 
  selectedAccount, 
  onSelectAccount, 
  isSubmitting = false, 
  placeholder = "-- Selecciona una cuenta --" 
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredOptions, setFilteredOptions] = useState<Account[]>(options);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find the selected account object from the options based on the selectedAccount
  const selectedAccountObj = React.useMemo((): Account | null => {
    if (!selectedAccount || !options || options.length === 0) return null;
    
    // If selectedAccount is already an object with id, use it
    if (typeof selectedAccount === 'object' && selectedAccount.id) {
      return selectedAccount;
    }
    
    // If selectedAccount is a string or number (ID), find the matching account
    return options.find(account => 
      account.id === selectedAccount || 
      account.id === parseInt(selectedAccount as string) ||
      account.id === String(selectedAccount)
    ) || null;
  }, [selectedAccount, options]);

  // Filter accounts based on search term
  useEffect(() => {
    if (!options || options.length === 0) {
      setFilteredOptions([]);
      return;
    }

    if (searchTerm.trim() === "") {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(account => 
        account?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account?.tipo_cuenta?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen]);

  const handleSelectAccount = (account: Account): void => {
    if (!account) return;
    
    // Pass the account ID as string to maintain compatibility with existing state
    onSelectAccount(String(account.id));
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggleDropdown = (): void => {
    if (!isSubmitting) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm("");
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  // Loading state
  if (!options) {
    return (
      <div className="dropdown">
        <div className="selector selector--disabled">
          <span className="selector__text">Cargando cuentas...</span>
          <i className="fas fa-spinner fa-spin"></i>
        </div>
      </div>
    );
  }

  return (
    <div className="dropdown" ref={dropdownRef}>
      <div 
        className={`selector ${isSubmitting ? 'selector--disabled' : ''}`}
        onClick={handleToggleDropdown}
      >
        <span className="selector__text">
          {selectedAccountObj 
            ? `${selectedAccountObj.nombre} (${selectedAccountObj.tipo_cuenta})` 
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
              placeholder="¿Qué cuenta estás buscando?"
              value={searchTerm}
              onChange={handleSearchChange}
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <div className="search__results">
                {filteredOptions.length} cuenta{filteredOptions.length !== 1 ? 's' : ''} encontrada{filteredOptions.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          <div className='list-container'>
            <div className='list-header'>
              <div><span>Nombre</span></div>
              <div><span>Tipo</span></div>
              <div><span>Monto</span></div>
            </div>

            <div className="list-wrapper">
              {filteredOptions.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-search"></i>
                  {searchTerm ? 'No se encontraron cuentas' : 'No hay cuentas disponibles'}
                </div>
              ) : (
                filteredOptions.map((account, index) => (
                  <AccountItem
                    key={account?.id || index}
                    account={account}
                    onSelectAccount={handleSelectAccount}
                    selectedAccountId={selectedAccountObj?.id}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDropdown;