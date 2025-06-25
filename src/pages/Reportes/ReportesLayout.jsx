import React from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import "../../styles/ReportesLayout.css"; // opcional para estilos

function ReportesLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const opciones = [
    "USUARIO",
    "CERTIFICADO_FUMIGACION",
    "BITACORA",
    "SOLICITUD_SERVICIO",
    "SESION",
    "PAGO_COTIZACION",
    "PAGO_SESION",
    "PRODUCTO"
  ];

    const handleSelectChange = (e) => {
        const valor = e.target.value;
        if (valor !== "") {
            navigate(`/adminlayout/generar-reporte-layout/${valor.toLowerCase()}-reporte`);
        }
    };

  return (
    <div className="reportes-layout-container">
      <div className="select-bar">
        <select onChange={handleSelectChange} defaultValue="">
          <option value="" disabled>Seleccionar tipo de reporte</option>
          {opciones.map((op, index) => (
            <option key={index} value={op}>{op}</option>
          ))}
        </select>
      </div>

      <div className="report-content">
        <Outlet key={location.pathname} />
      </div>
    </div>
  );
}

export default ReportesLayout;
