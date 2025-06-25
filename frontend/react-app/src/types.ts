// types.ts - Updated type definitions
export type ValidTabla = "movimientos" | "cuentas" | "productos" | "cajachica";
export type Tabla = ValidTabla | "" | null;
export type Menu = "transaction" | "account" | "product" | "confirmChanges" | "confirmDelete" | null;

// Add AdminView type for admin section navigation/views
export type AdminView =
  | "estadisticas"
  | "historial"
  | "movimientos"
  | "cuentas"
  | "productos"
  | "exportar"
  | "chat"
  | "linkDevice"
  | "cajachica";

// Component interface definitions
export interface TableBoxProps {
  activeView: ValidTabla; // More restrictive type for TableBox
  setActiveView: (view: ValidTabla) => void;
  isAdmin: boolean;
  refreshTrigger: number;
  onOpenMenu: () => void;
  onCellEdit?: (params: any) => void;
  onRowDelete?: (params: any) => void;
  onRefresh?: () => void;
}

export interface SideBarProps {
  activeView: Tabla;
  setActiveView: React.Dispatch<React.SetStateAction<Tabla>>;
  currentSection: "home" | "admin";
  currentAdminView?: string;
  setCurrentAdminView?: (view: string) => void;
}

export interface TopBarProps {
  activeView: Tabla;
  setActiveView: React.Dispatch<React.SetStateAction<Tabla>>;
  openMenu: Menu;
  setOpenMenu: React.Dispatch<React.SetStateAction<Menu>>;
}

export interface HomeProps {
  activeView: Tabla;
  setActiveView: React.Dispatch<React.SetStateAction<Tabla>>;
  openMenu: Menu;
  setOpenMenu: React.Dispatch<React.SetStateAction<Menu>>;
}

export interface AdminProps {
  activeView: Tabla;
  setActiveView: React.Dispatch<React.SetStateAction<Tabla>>;
  openMenu: Menu;
  setOpenMenu: React.Dispatch<React.SetStateAction<Menu>>;
}