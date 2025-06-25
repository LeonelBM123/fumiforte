import React, { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../../styles/ReportesLayout.css";
import "../../styles/Reportes.css";

function DetalleCompraReporte() {
  const [formData, setFormData] = useState({
    fecha: "",
    idProveedor: "",
    idProducto: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value });
  };

  const safeValue = (val) =>
    val === null || val === undefined || val === "" ? "Por Definir" : val;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones para IDs numéricos si hay valor
    if (formData.idProveedor && isNaN(Number(formData.idProveedor))) {
      alert("ID Proveedor debe ser un número válido");
      return;
    }
    if (formData.idProducto && isNaN(Number(formData.idProducto))) {
      alert("ID Producto debe ser un número válido");
      return;
    }

    const body = {
      fecha: formData.fecha ? `${formData.fecha}T00:00:00` : null,
      idProveedor: formData.idProveedor ? Number(formData.idProveedor) : null,
      idProducto: formData.idProducto ? Number(formData.idProducto) : null
    };

    try {
      const response = await fetch("http://localhost:8081/reporte/detallecompra", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error("Error al generar el reporte");

      const data = await response.json();

      if (!data || data.length === 0) {
        alert("No se encontraron compras con los filtros seleccionados.");
        return;
      }

      const doc = new jsPDF();
      doc.text("Reporte Detalle de Compras", 14, 20);
      const fechaGeneracion = new Date().toLocaleDateString();
      doc.text(`Fecha de generación: ${fechaGeneracion}`, 14, 27);

      const tableData = data.map((item) => [
        safeValue(item.idCompra),
        safeValue(item.fechaCompra),
        safeValue(item.idProveedor),
        safeValue(item.nombreProveedor),
        safeValue(item.idProducto),
        safeValue(item.nombreProducto),
        safeValue(item.cantidad),
        safeValue(item.precioUnitario),
        safeValue(item.total)
      ]);

      autoTable(doc, {
        startY: 35,
        head: [
          [
            "ID Compra",
            "Fecha Compra",
            "ID Proveedor",
            "Proveedor",
            "ID Producto",
            "Producto",
            "Cantidad",
            "Precio Unitario",
            "Total"
          ]
        ],
        body: tableData
      });

      doc.save("reporte_detalle_compra.pdf");
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      alert("No se pudo generar el reporte.");
    }
  };

  return (
    <div className="usuario-reporte-container">
      <h1>Generar Reporte de Detalles de Compra</h1>
      <form className="reporte-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Fecha</label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>ID Proveedor</label>
          <input
            type="number"
            name="idProveedor"
            value={formData.idProveedor}
            onChange={handleInputChange}
            placeholder="Ej: 456"
          />
        </div>

        <div className="form-group">
          <label>ID Producto</label>
          <input
            type="number"
            name="idProducto"
            value={formData.idProducto}
            onChange={handleInputChange}
            placeholder="Ej: 789"
          />
        </div>

        <button type="submit" className="modern-btn">
          Generar Reporte
        </button>
      </form>
    </div>
  );
}

export default DetalleCompraReporte;
