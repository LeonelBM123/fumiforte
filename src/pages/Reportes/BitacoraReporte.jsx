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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que si fechaInicio y fechaFin existen, fechaInicio <= fechaFin
    if (formData.fechaInicio && formData.fechaFin && formData.fechaInicio > formData.fechaFin) {
      alert("La fecha inicio no puede ser mayor a la fecha fin");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/reporte/bitacora", {
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
      doc.text("Reporte de Bitácora", 14, 20);

      // Ajusta las columnas según la data que recibas
      const tableData = data.map((item) => [
        item.idBitacora,
        item.fecha,
        item.descripcion,
        item.usuario,
      ]);

      autoTable(doc, {
        startY: 30,
        head: [["ID", "Fecha", "Descripción", "Usuario"]],
        body: tableData,
      });

      doc.save("reporte_bitacora.pdf");
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      alert("No se pudo generar el reporte.");
    }
  };

  return (
    <div className="usuario-reporte-container">
      <form className="reporte-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Fecha Inicio</label>
          <input
            type="date"
            name="fechaInicio"
            value={formData.fechaInicio}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Fecha Fin</label>
          <input
            type="date"
            name="fechaFin"
            value={formData.fechaFin}
            onChange={handleInputChange}
          />
        </div>

        <button type="submit" className="modern-btn">Generar Reporte</button>
      </form>
    </div>
  );
}

export default BitacoraReporte;
