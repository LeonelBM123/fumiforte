import React, { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../../styles/ReportesLayout.css";
import "../../styles/Reportes.css";

function BitacoraReporte() {
  const [formData, setFormData] = useState({
    fechaInicio: "",
    fechaFin: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const safeValue = (val) =>
    val === null || val === undefined || val === "" ? "Por Definir" : val;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { fechaInicio, fechaFin } = formData;

    // Validaciones obligatorias
    if (!fechaInicio || !fechaFin) {
      alert("Debes seleccionar ambas fechas: inicio y fin.");
      return;
    }

    if (fechaInicio > fechaFin) {
      alert("La fecha de inicio no puede ser mayor a la fecha de fin.");
      return;
    }

    const body = {
      desde: `${fechaInicio}T00:00:00`,
      hasta: `${fechaFin}T23:59:59`
    };

    try {
      const response = await fetch("https://fumifortebe-gxhg.onrender.com/reporte/bitacora", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error("Error al generar el reporte");

      const data = await response.json();

      if (!data || data.length === 0) {
        alert("No se encontraron registros para el rango de fechas seleccionado.");
        return;
      }

      // Crear PDF
      const doc = new jsPDF();
      doc.text("Reporte de Bitácora", 14, 20);

      const fechaGeneracion = new Date().toLocaleDateString();
      doc.text(`Fecha de generación: ${fechaGeneracion}`, 14, 27);

      const tableData = data.map((item) => [
        safeValue(item.idBitacora),
        safeValue(item.accion),
        safeValue(item.fechaHora),
        safeValue(item.ip),
        safeValue(item.idUsuario)
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["ID", "Acción", "Fecha/Hora", "IP", "Usuario"]],
        body: tableData
      });

      doc.save("reporte_bitacora.pdf");
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      alert("No se pudo generar el reporte.");
    }
  };

  return (
    <div className="usuario-reporte-container">
      <h1>Generar Reporte de Bitácora</h1>
      <form className="reporte-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Fecha Inicio</label>
          <input
            type="date"
            name="fechaInicio"
            value={formData.fechaInicio}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Fecha Fin</label>
          <input
            type="date"
            name="fechaFin"
            value={formData.fechaFin}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit" className="modern-btn">Generar Reporte</button>
      </form>
    </div>
  );
}

export default BitacoraReporte;
