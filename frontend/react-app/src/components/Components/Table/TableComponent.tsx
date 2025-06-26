import React from "react";

// Ajusta las columnas para que coincidan con los campos actuales del backend
const columns = [
    { Header: 'ID', accessor: 'id' },
    { Header: 'Tipo', accessor: 'tipo' },
    { Header: 'Fecha', accessor: 'fecha' },
    { Header: 'Cuenta', accessor: 'cuenta' },
    { Header: 'Total', accessor: 'total' },
    { Header: 'Descuento', accessor: 'descuento_total' },
    { Header: 'Concepto', accessor: 'concepto' },
];

// Ejemplo de componente funcional para mostrar la tabla
const TableComponent = ({ data }) => {
    return (
        <table>
            <thead>
                <tr>
                    {columns.map(col => (
                        <th key={col.accessor}>{col.Header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data && data.length > 0 ? (
                    data.map((row, idx) => (
                        <tr key={row.id || idx}>
                            {columns.map(col => (
                                <td key={col.accessor}>
                                    {col.accessor === "cuenta"
                                        ? (typeof row.cuenta === "object" && row.cuenta !== null
                                            ? row.cuenta.nombre
                                            : row.cuenta)
                                        : row[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={columns.length}>No hay datos</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default TableComponent;