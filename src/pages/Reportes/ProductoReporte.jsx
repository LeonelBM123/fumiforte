import React from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../../styles/ReportesLayout.css";
import "../../styles/Reportes.css";

function ProductoReporte() {
  const safeValue = (val) =>
    val === null || val === undefined || val === "" ? "Por Definir" : val;

  // Formatear fecha yyyy-mm-dd → dd/mm/yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return "Por Definir";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8081/reporte/producto", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Error al generar el reporte");

      const data = await response.json();

      if (!data || data.length === 0) {
        alert("No se encontraron productos.");
        return;
      }

      const doc = new jsPDF();
      doc.text("Reporte de Productos", 14, 20);
      const fechaGeneracion = new Date().toLocaleDateString();
      doc.text(`Fecha de generación: ${fechaGeneracion}`, 14, 27);

      const tableData = data.map((item) => [
        safeValue(item.idProducto),
        safeValue(item.nombre),
        formatDate(item.fechaVencimiento),
        safeValue(item.descripcion),
        safeValue(item.stock),
        safeValue(item.unidadMedida),
      ]);

      autoTable(doc, {
        startY: 35,
        head: [
          [
            "ID Producto",
            "Nombre",
            "Fecha Vencimiento",
            "Descripción",
            "Stock",
            "Unidad Medida",
          ],
        ],
        body: tableData,
      });

      doc.save("reporte_productos.pdf");
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      alert("No se pudo generar el reporte.");
    }
  };

  return (
    <div className="usuario-reporte-container">
      <h1>Generar Reporte de Productos</h1>
      <form className="reporte-form" onSubmit={handleSubmit}>
        <button type="submit" className="modern-btn">
          Generar Reporte
        </button>
      </form>
    </div>
  );
}

export default ProductoReporte;