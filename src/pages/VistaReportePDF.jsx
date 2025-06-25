import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const VistaReportePDF = () => {
  const { idSolicitudServicio } = useParams();
  const [datos, setDatos] = useState([]);
  const [orden, setOrden] = useState("asc");
  const [columna, setColumna] = useState("fecha");

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const response = await fetch(
          `http://localhost:8081/gerente/reporte_servicio/${idSolicitudServicio}`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        setDatos(data);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };
    fetchDatos();
  }, [idSolicitudServicio]);

  const generarPDF = () => {
    const datosOrdenados = [...datos].sort((a, b) => {
      if (a[columna] < b[columna]) return orden === "asc" ? -1 : 1;
      if (a[columna] > b[columna]) return orden === "asc" ? 1 : -1;
      return 0;
    });

    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text(`Reporte PDF - Solicitud #${idSolicitudServicio}`, 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [["ID Sesión", "Fecha", "Hora", "Cliente", "Dirección", "Monto"]],
      body: datosOrdenados.map((d) => [
        d.idSesion,
        d.fecha,
        d.hora,
        d.nombreCliente,
        d.direccionEscrita,
        d.montoPendienteSesion,
      ]),
    });

    doc.save("reporte_servicio.pdf");
  };

  return (
    <div className="filtro-pdf-container">
      <h2>Seleccione la manera de filtrar</h2>
      <div>
        <label>
          <input
            type="radio"
            name="columna"
            value="fecha"
            checked={columna === "fecha"}
            onChange={(e) => setColumna(e.target.value)}
          />
          Fecha
        </label>
        <label>
          <input
            type="radio"
            name="columna"
            value="idSesion"
            checked={columna === "idSesion"}
            onChange={(e) => setColumna(e.target.value)}
          />
          ID Sesión
        </label>
      </div>
      <div>
        <label>
          <input
            type="radio"
            name="orden"
            value="asc"
            checked={orden === "asc"}
            onChange={(e) => setOrden(e.target.value)}
          />
          Ascendente
        </label>
        <label>
          <input
            type="radio"
            name="orden"
            value="desc"
            checked={orden === "desc"}
            onChange={(e) => setOrden(e.target.value)}
          />
          Descendente
        </label>
      </div>
      <button onClick={generarPDF}>Descargar PDF</button>
    </div>
  );
};

export default VistaReportePDF;
