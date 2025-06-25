import React, { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../../styles/ReportesLayout.css";
import "../../styles/Reportes.css";

function PagoCotizacionReporte() {
  const [formData, setFormData] = useState({
    fecha: "",
    tipoPago: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const safeValue = (val) =>
    val === null || val === undefined || val === "" ? "Por Definir" : val;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🚨 Validación obligatoria de fecha
    if (!formData.fecha) {
      alert("La fecha es obligatoria para generar el reporte.");
      return;
    }

    const body = {
      fecha: formData.fecha,
      tipo_pago: formData.tipoPago || ""
    };

    try {
      const response = await fetch("http://localhost:8081/reporte/pago-cotizacion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error("Error al generar el reporte");

      const data = await response.json();

      if (!data || data.length === 0) {
        alert("No se encontraron pagos con los filtros seleccionados.");
        return;
      }

      const doc = new jsPDF();
      doc.text("Reporte de Pago de Cotización", 14, 20);
      const fechaGeneracion = new Date().toLocaleDateString();
      doc.text(`Fecha de generación: ${fechaGeneracion}`, 14, 27);

      const tableData = data.map((item) => [
        safeValue(item.idPago),
        safeValue(item.fechaPago),
        safeValue(item.tipoPago),
        safeValue(item.monto)
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["ID Pago", "Fecha Pago", "Tipo de Pago", "Monto"]],
        body: tableData
      });

      doc.save("reporte_pago_cotizacion.pdf");
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      alert("No se pudo generar el reporte.");
    }
  };

  return (
    <div className="usuario-reporte-container">
      <h1>Generar Reporte de Pagos Cotización</h1>
      <form className="reporte-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Fecha</label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Tipo de Pago</label>
          <select
            name="tipoPago"
            value={formData.tipoPago}
            onChange={handleInputChange}
          >
            <option value="">Todos</option>
            <option value="QR">QR</option>
            <option value="Efectivo">Efectivo</option>
          </select>
        </div>

        <button type="submit" className="modern-btn">
          Generar Reporte
        </button>
      </form>
    </div>
  );
}

export default PagoCotizacionReporte;
