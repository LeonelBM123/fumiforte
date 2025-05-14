import React, { useState, useEffect } from "react";
import "../styles/GestionarLayout.css";

function GestionarBitacora() {
  const [bitacoras, setBitacoras] = useState([]);

  useEffect(() => {
    obtenerBitacoras();
  }, []);

  const obtenerBitacoras = async () => {
    try {
      const response = await fetch("http://localhost:8081/gerente/bitacoras", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP status ${response.status}`);

      const data = await response.json();
      setBitacoras(data);
    } catch (error) {
      console.error("Error al obtener bitácoras:", error);
    }
  };

  return (
    <div className="gestionar-layout-container">
      <h1 style={{ marginBottom: "10px" }}>Gestionar Bitácora</h1>

      <div className="tabla-bitacoras" style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Id Bitácora</th>
              <th>Acción</th>
              <th>Fecha y Hora</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {bitacoras.map((bitacora) => (
              <tr key={bitacora.IdBitacora}>
                <td>{bitacora.IdBitacora}</td>
                <td>{bitacora.Accion}</td>
                <td>{bitacora.FechaHora}</td>
                <td>{bitacora.IP}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GestionarBitacora;

