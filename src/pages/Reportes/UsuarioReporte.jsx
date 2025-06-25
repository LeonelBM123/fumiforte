import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../../styles/ReportesLayout.css";
import "../../styles/Reportes.css";

function UsuarioReporte() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    rol: "",
    estado: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://fumifortebe-gxhg.onrender.com/reporte/usuario", {
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
      doc.text("Reporte de Usuarios", 14, 20);

      const fechaGeneracion = new Date().toLocaleDateString();
      doc.text(`Fecha de generación: ${fechaGeneracion}`, 14, 27);

      const tableData = data.map((usuario) => [
        usuario.idUsuario,
        usuario.nombreCompleto,
        usuario.telefono,
        usuario.direccion,
        usuario.correo,
        usuario.rol,
        usuario.estado
      ]);

      autoTable(doc, {
        startY: 30,
        head: [["ID", "Nombre", "Teléfono", "Dirección", "Correo", "Rol", "Estado"]],
        body: tableData,
      });

      doc.save("reporte_usuarios.pdf");
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      alert("No se pudo generar el reporte.");
    }
  };

  return (
    <div className="usuario-reporte-container">
      <h1>Generar Reporte de Usuario</h1>
      <form className="reporte-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre Completo</label>
          <input
            type="text"
            name="nombre"
            maxLength={50}
            value={formData.nombre}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Rol</label>
          <select name="rol" value={formData.rol} onChange={handleInputChange}>
            <option value="">Todos</option>
            <option value="Cliente">Cliente</option>
            <option value="Trabajador">Trabajador</option>
            <option value="Gerente">Gerente</option>
          </select>
        </div>

        <div className="form-group">
          <label>Estado</label>
          <select name="estado" value={formData.estado} onChange={handleInputChange}>
            <option value="">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        <button type="submit" className="modern-btn">Generar Reporte</button>
      </form>
    </div>
  );
}

export default UsuarioReporte;