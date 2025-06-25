import React, { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../../styles/ReportesLayout.css";
import "../../styles/Reportes.css";

function SesionReporte() {
  const [formData, setFormData] = useState({
    idSolicitud: "",
    fecha: "",
    estado: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const safeValue = (val) =>
    val === null || val === undefined || val === "" ? "Por Definir" : val;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fecha) {
      alert("La fecha es obligatoria para generar el reporte.");
      return;
    }

    if (formData.idSolicitud && isNaN(Number(formData.idSolicitud))) {
      alert("ID Solicitud debe ser un número válido");
      return;
    }

    const body = {
      id_solicitud: formData.idSolicitud ? Number(formData.idSolicitud) : null,
      fecha: formData.fecha,
      estado: formData.estado || null
    };

    try {
      const response = await fetch("http://localhost:8081/reporte/sesiones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error("Error al generar el reporte");

      const data = await response.json();

      if (!data || data.length === 0) {
        alert("No se encontraron sesiones con los filtros seleccionados.");
        return;
      }

      const doc = new jsPDF();
      doc.text("Reporte de Sesiones", 14, 20);
      const fechaGeneracion = new Date().toLocaleDateString();
      doc.text(`Fecha de generación: ${fechaGeneracion}`, 14, 27);

      const tableData = data.map((item) => [
        safeValue(item.idSesion),
        safeValue(item.idSolicitudServicio),
        safeValue(item.fecha),
        safeValue(item.hora),
        safeValue(item.estado),
        safeValue(item.montoPendienteSesion),
        safeValue(item.nroSesion)
      ]);

      autoTable(doc, {
  startY: 35,
  head: [
    [
      "ID Sesión",
      "ID Solicitud",
      "Fecha",
      "Hora",
      "Estado",
      "Monto Pendiente",
      "Nº Sesión"
    ]
  ],
  body: tableData
});

      doc.save("reporte_sesiones.pdf");
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      alert("No se pudo generar el reporte.");
    }
  };

  return (
    <div className="usuario-reporte-container">
      <h1>Generar Reporte de Sesiones</h1>
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

        <div className="form-group">
          <label>Fecha <span style={{ color: "red" }}>*</span></label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Estado</label>
          <select name="estado" value={formData.estado} onChange={handleInputChange}>
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Completada">Completada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>

        <button type="submit" className="modern-btn">
          Generar Reporte
        </button>
      </form>
    </div>
  );
}

export default SesionReporte;