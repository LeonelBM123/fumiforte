import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const VistaReporteExcel = () => {
  const { idSolicitudServicio } = useParams();
  const [datos, setDatos] = useState([]);
  const [orden, setOrden] = useState("asc");
  const [columna, setColumna] = useState("fecha");

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const response = await fetch(
          `https://fumifortebe-gxhg.onrender.com/gerente/reporte_servicio/${idSolicitudServicio}`,
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

  const generarExcel = () => {
    const datosOrdenados = [...datos].sort((a, b) => {
      if (a[columna] < b[columna]) return orden === "asc" ? -1 : 1;
      if (a[columna] > b[columna]) return orden === "asc" ? 1 : -1;
      return 0;
    });

    const hoja = datosOrdenados.map((d) => ({
      "ID Sesión": d.idSesion,
      "Fecha": d.fecha,
      "Hora": d.hora,
      "Cliente": d.nombreCliente,
      "Dirección": d.direccionEscrita,
      "Monto": d.montoPendienteSesion,
    }));

    const libro = XLSX.utils.book_new();
    const hojaExcel = XLSX.utils.json_to_sheet(hoja);
    XLSX.utils.book_append_sheet(libro, hojaExcel, "ReporteServicio");

    const archivo = XLSX.write(libro, { bookType: "xlsx", type: "array" });
    const blob = new Blob([archivo], { type: "application/octet-stream" });
    saveAs(blob, "reporte_servicio.xlsx");
  };

  return (
    <div className="filtro-excel-container">
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
      <button onClick={generarExcel}>Descargar Excel</button>
    </div>
  );
};

export default VistaReporteExcel;
