import React, { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../../styles/ReportesLayout.css";
import "../../styles/Reportes.css";

function ProductoReporte() {
  const [formData, setFormData] = useState({
    stock: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value });
  };

  const safeValue = (val) =>
    val === null || val === undefined || val === "" ? "Por Definir" : val;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      stock:
        formData.stock === "" ? null :
        formData.stock === "constock" ? "constock" :
        formData.stock === "sinstock" ? "sinstock" : null
    };

    try {
      const response = await fetch("http://localhost:8081/reporte/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error("Error al generar el reporte");

      const data = await response.json();

      if (!data || data.length === 0) {
        alert("No se encontraron productos con los filtros seleccionados.");
        return;
      }

      const doc = new jsPDF();
      doc.text("Reporte de Productos", 14, 20);
      const fechaGeneracion = new Date().toLocaleDateString();
      doc.text(`Fecha de generación: ${fechaGeneracion}`, 14, 27);

      const tableData = data.map((item) => [
        safeValue(item.idProducto),
        safeValue(item.nombreProducto),
        safeValue(item.stock),
        safeValue(item.precio)
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["ID Producto", "Nombre", "Stock", "Precio"]],
        body: tableData
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
        <div className="form-group">
          <label>Stock</label>
          <select name="stock" value={formData.stock} onChange={handleInputChange}>
            <option value="">Todos</option>
            <option value="constock">Con Stock</option>
            <option value="sinstock">Sin Stock</option>
          </select>
        </div>

        <button type="submit" className="modern-btn">Generar Reporte</button>
      </form>
    </div>
  );
}

export default ProductoReporte;
