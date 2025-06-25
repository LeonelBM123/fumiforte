import React, { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../../styles/ReportesLayout.css";
import "../../styles/Reportes.css";

function PagoSesionReporte() {
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

  // Formatear fecha para mejor legibilidad (yyyy-mm-dd → dd/mm/yyyy)
  const formatDate = (dateStr) => {
    if (!dateStr) return "Por Definir";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fecha) {
      alert("La fecha es obligatoria para generar el reporte.");
      return;
    }

    const body = {
      fecha: formData.fecha,
      tipo_pago: formData.tipoPago || ""
    };

    try {
      const response = await fetch("https://fumifortebe-gxhg.onrender.com/reporte/pago-sesion", {
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
      doc.text("Reporte de Pago de Sesión", 14, 20);
      const fechaGeneracion = new Date().toLocaleDateString();
      doc.text(`Fecha de generación: ${fechaGeneracion}`, 14, 27);

      const tableData = data.map((item) => [
        safeValue(item.idPago),
        formatDate(item.fecha),
        safeValue(item.tipoPago),
        safeValue(item.monto),
        safeValue(item.nroVoucher),
        safeValue(item.idCliente),
        safeValue(item.estado),
        safeValue(item.idPagoSesion),
        safeValue(item.idSesion)
      ]);

      autoTable(doc, {
        startY: 35,
        head: [
          [
            "ID Pago",
            "Fecha Pago",
            "Tipo de Pago",
            "Monto",
            "Nº Voucher",
            "ID Cliente",
            "Estado Pago",
            "ID Pago Sesión",
            "ID Sesión"
          ]
        ],
        body: tableData
      });

      doc.save("reporte_pago_sesion.pdf");
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      alert("No se pudo generar el reporte.");
    }
  };

  return (
    <div className="usuario-reporte-container">
      <h1>Generar Reporte de Pago Sesión</h1>
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

export default PagoSesionReporte;
