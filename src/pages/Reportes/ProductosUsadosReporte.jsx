import React, { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../../styles/ReportesLayout.css";
import "../../styles/Reportes.css";

function ProductosUsadosReporte() {
  const [formData, setFormData] = useState({
    idSolicitud: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const safeValue = (val) =>
    val === null || val === undefined || val === "" ? "Por Definir" : val;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.idSolicitud && isNaN(Number(formData.idSolicitud))) {
      alert("ID Solicitud debe ser un número válido");
      return;
    }

    const body = {
      idSolicitud: formData.idSolicitud ? Number(formData.idSolicitud) : null
    };

    try {
      const response = await fetch("http://localhost:8081/reporte/productosusados", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error("Error al generar el reporte");

      const data = await response.json();

      if (!data || data.length === 0) {
        alert("No se encontraron productos usados para la solicitud indicada.");
        return;
      }

      const doc = new jsPDF();
      doc.text("Reporte de Productos Usados", 14, 20);
      const fechaGeneracion = new Date().toLocaleDateString();
      doc.text(`Fecha de generación: ${fechaGeneracion}`, 14, 27);

      const tableData = data.map((item) => [
        safeValue(item.idProducto),
        safeValue(item.nombreProducto),
        safeValue(item.cantidad),
        safeValue(item.unidadMedida)
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["ID Producto", "Nombre", "Cantidad", "Unidad Medida"]],
        body: tableData
      });

      doc.save("reporte_productos_usados.pdf");
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      alert("No se pudo generar el reporte.");
    }
  };

  return (
    <div className="usuario-reporte-container">
      <h1>Generar Reporte de Productos Usados</h1>
      <form className="reporte-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ID Solicitud</label>
          <input
            type="number"
            name="idSolicitud"
            value={formData.idSolicitud}
            onChange={handleInputChange}
            placeholder="Ej: 123"
          />
        </div>

        <button type="submit" className="modern-btn">
          Generar Reporte
        </button>
      </form>
    </div>
  );
}

export default ProductosUsadosReporte;
