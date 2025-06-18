// Types
export interface MovimientoRow {
	id: number;
	fecha: string;
	tipo: string;
	cuenta: number;
	total: string | number | null;
	descuento_total?: string | number | null;
	concepto?: string;
	cantidad_productos?: number;
	items?: { nombre_producto: string; precio_unitario: string; cantidad: string; descuento_item: string }[];
  }
  
  export interface CuentaRow {
	id: number;
	nombre: string;
	contacto_mail: string;
	contacto_telefono: string;
	tipo_cuenta: string;
	monto?: number | null;
  }
  
  export interface ProductoRow {
	id: number;
	descripcion: string;
	stock: number | null;
	precio: number | null;
  }
  
  export type Tabla = 'movimientos' | 'cuentas' | 'productos';
  
  // Utility functions
  export const normalizeText = (text: any): string => {
	if (text === null || text === undefined) return '';
	const str = String(text);
	return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };
  
  export const extractDatesFromSearchTerm = (term: string): string[] => {
	const datePattern = /\b\d{4}-\d{2}-\d{2}\b/g;
	const matches = term.match(datePattern);
	return matches || [];
  };
  
  export const getNonDateSearchTerm = (term: string): string => {
	return term.replace(/\b\d{4}-\d{2}-\d{2}\b/g, '').replace(/\s+/g, ' ').trim();
  };
  
  // Filter functions
  export const filterMovimientos = (item: MovimientoRow, normalizedSearchTerm: string, cuentas: CuentaRow[]): boolean => {
	const cuenta = cuentas.find(c => c.id === item.cuenta);
	const cuentaNombre = cuenta ? cuenta.nombre : '';
	
	return (
	  normalizeText(item.id).includes(normalizedSearchTerm) ||
	  normalizeText(item.fecha).includes(normalizedSearchTerm) ||
	  normalizeText(item.tipo).includes(normalizedSearchTerm) ||
	  normalizeText(item.cuenta).includes(normalizedSearchTerm) ||
	  normalizeText(cuentaNombre).includes(normalizedSearchTerm) ||
	  normalizeText(item.concepto).includes(normalizedSearchTerm) ||
	  normalizeText(item.total).includes(normalizedSearchTerm) ||
	  normalizeText(item.descuento_total).includes(normalizedSearchTerm)
	);
  };
  
  export const filterCuentas = (item: CuentaRow, normalizedSearchTerm: string): boolean => {
	return (
	  normalizeText(item.id).includes(normalizedSearchTerm) ||
	  normalizeText(item.nombre).includes(normalizedSearchTerm) ||
	  normalizeText(item.contacto_mail).includes(normalizedSearchTerm) ||
	  normalizeText(item.contacto_telefono).includes(normalizedSearchTerm) ||
	  normalizeText(item.tipo_cuenta).includes(normalizedSearchTerm) ||
	  normalizeText(item.monto).includes(normalizedSearchTerm)
	);
  };
  
  export const filterProductos = (item: ProductoRow, normalizedSearchTerm: string): boolean => {
	return (
	  normalizeText(item.id).includes(normalizedSearchTerm) ||
	  normalizeText(item.descripcion).includes(normalizedSearchTerm) ||
	  normalizeText(item.stock).includes(normalizedSearchTerm) ||
	  normalizeText(item.precio).includes(normalizedSearchTerm)
	);
  };
  
  export const filterData = (
	data: any[], 
	activeView: Tabla, 
	searchTerm: string, 
	selectedDates: string[], 
	cuentas: CuentaRow[]
  ): any[] => {
	return data.filter(item => {
	  const nonDateSearchTerm = getNonDateSearchTerm(searchTerm);
	  const datesInSearchTerm = extractDatesFromSearchTerm(searchTerm);
	  const normalizedSearchTerm = normalizeText(nonDateSearchTerm);
	  
	  // Date filter logic
	  const allDatesToFilter = [...selectedDates, ...datesInSearchTerm];
	  const dateMatch =
		allDatesToFilter.length === 0 ||
		(activeView === 'movimientos' && allDatesToFilter.includes(item.fecha));
  
	  if (!dateMatch) return false;
	  if (!nonDateSearchTerm) return true;
  
	  // Search logic based on active view
	  switch (activeView) {
		case 'movimientos':
		  return filterMovimientos(item, normalizedSearchTerm, cuentas);
		case 'cuentas':
		  return filterCuentas(item, normalizedSearchTerm);
		case 'productos':
		  return filterProductos(item, normalizedSearchTerm);
		default:
		  return false;
	  }
	});
  };

  