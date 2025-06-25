import React, { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../../styles/ReportesLayout.css";
import "../../styles/Reportes.css";

function SesionReporte() {
  const [formData, setFormData] = useState({
    idSolicitud: "",
    fecha: "",
    estado: "",
    montoPendienteSesion: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const safeValue = (val) =>
    val === null || val === undefined || val === "" ? "Por Definir" : val;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica: si idSolicitud no es número válido, alertar
    if (formData.idSolicitud && isNaN(Number(formData.idSolicitud))) {
      alert("ID Solicitud debe ser un número válido");
      return;
    }

    // Formatear fecha para backend (si viene)
    const fechaFormateada = formData.fecha
      ? `${formData.fecha}`
      : null;

    const body = {
      idSolicitud: formData.idSolicitud
        ? Number(formData.idSolicitud)
        : null,
      fecha: fechaFormateada || null,
      estado: formData.estado || null,
      montoPendienteSesion:
        formData.montoPendienteSesion === ""
          ? null
          : formData.montoPendienteSesion
    };

    try {
      const response = await fetch("http://localhost:8081/reporte/sesiones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
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
        safeValue(item.idSolicitud),
        safeValue(item.fechaSesion),
        safeValue(item.estado),
        // Para monto pendiente mostrar texto si quieres:
        item.montoPendienteSesion === "pagado"
          ? "Pagado"
          : item.montoPendienteSesion === "impaga"
          ? "Impaga"
          : safeValue(item.montoPendienteSesion)
      ]);

      autoTable(doc, {
        startY: 35,
        head: [
          ["ID Sesión", "ID Solicitud", "Fecha Sesión", "Estado", "Monto Pendiente"]
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
      <h1>Generar Reporte de Sesión</h1>
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
          <label>Fecha</label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Estado</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleInputChange}
          >
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Completada">Completada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>

        <div className="form-group">
          <label>Monto Pendiente Sesión</label>
          <select
            name="montoPendienteSesion"
            value={formData.montoPendienteSesion}
            onChange={handleInputChange}
          >
            <option value="">Todos</option>
            <option value="pagado">Pagado</option>
            <option value="impaga">Impaga</option>
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
