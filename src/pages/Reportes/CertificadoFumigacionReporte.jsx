import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../../styles/ReportesLayout.css";
import "../../styles/Reportes.css";

function CertificadoFumigacionReporte() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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

    try {
      const response = await fetch("http://localhost:8081/reporte/certificados", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Error al generar el reporte");

      const data = await response.json();

      // Crear PDF
      const doc = new jsPDF();
      doc.text("Reporte de Certificados de Fumigación", 14, 20);

      const fechaGeneracion = new Date().toLocaleDateString();
      doc.text(`Fecha de generación: ${fechaGeneracion}`, 14, 27);

      const tableData = data.map((item) => [
        safeValue(item.idCertificado),
        safeValue(item.fechaEmision),
        safeValue(item.fechaVencimiento),
        safeValue(item.estado)
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["ID", "Fecha Emisión", "Fecha Vencimiento", "Estado"]],
        body: tableData
      });

      doc.save("reporte_certificados.pdf");
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      alert("No se pudo generar el reporte.");
    }
  };

  return (
    <div className="usuario-reporte-container">
      <h1>Generar Reporte de Certificados</h1>
      <form className="reporte-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Estado</label>
          <select name="estado" value={formData.estado} onChange={handleInputChange}>
            <option value="">Todos</option>
            <option value="Vigente">Vigente</option>
            <option value="Vencido">Vencido</option>
            <option value="Pendiente">Pendiente</option>
          </select>
        </div>

        <button type="submit" className="modern-btn">Generar Reporte</button>
      </form>
    </div>
  );
}

export default CertificadoFumigacionReporte;
