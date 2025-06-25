import React, { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../../styles/ReportesLayout.css";
import "../../styles/Reportes.css";

function SolicitudServicioReporte() {
  const [formData, setFormData] = useState({
    estado: "",
    requiereCertificado: "",
    montoPendienteCotizacion: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const safeValue = (val) =>
    val === null || val === undefined || val === "" ? "Por Definir" : val;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      estado: formData.estado || null,
      requiereCertificado: formData.requiereCertificado || null,
      montoPendienteCotizacion:
        formData.montoPendienteCotizacion === "" ? null : formData.montoPendienteCotizacion
    };

    try {
      const response = await fetch("http://localhost:8081/reporte/solicitudes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error("Error al generar el reporte");

      const data = await response.json();

      if (!data || data.length === 0) {
        alert("No se encontraron solicitudes con los filtros seleccionados.");
        return;
      }

      const doc = new jsPDF();
      doc.text("Reporte de Solicitudes de Servicio", 14, 20);
      const fechaGeneracion = new Date().toLocaleDateString();
      doc.text(`Fecha de generación: ${fechaGeneracion}`, 14, 27);

      const tableData = data.map((item) => [
        safeValue(item.idSolicitudServicio),
        safeValue(item.estado),
        safeValue(item.requiereCertificado ? "Sí" : "No"),
        safeValue(item.montoPendienteCotizacion)
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["ID", "Estado", "Requiere Certificado", "Monto Pendiente"]],
        body: tableData
      });

      doc.save("reporte_solicitudes.pdf");
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      alert("No se pudo generar el reporte.");
    }
  };

  return (
    <div className="usuario-reporte-container">
      <form className="reporte-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Estado</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleInputChange}
          >
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>

        <div className="form-group">
          <label>Requiere Certificado</label>
          <select
            name="requiereCertificado"
            value={formData.requiereCertificado}
            onChange={handleInputChange}
          >
            <option value="">Todos</option>
            <option value="Si">Si</option>
            <option value="No">No</option>
          </select>
        </div>

        <div className="form-group">
          <label>Monto Pendiente Cotización</label>
          <select
            name="montoPendienteCotizacion"
            value={formData.montoPendienteCotizacion}
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

export default SolicitudServicioReporte;
