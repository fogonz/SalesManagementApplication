import React from "react";
import TableComponent from "./TableComponent";

// ...existing code...

const TableBox = ({ data }) => {
    // Si necesitas transformar los datos, hazlo aquí
    // Por ejemplo, si antes calculabas precio_venta, ahora solo pasa total
    return (
        <div className="table-box">
            <TableComponent data={data} />
        </div>
    );
};

export default TableBox;