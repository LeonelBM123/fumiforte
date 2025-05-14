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
      <h1 style={{ marginBottom: "10px" }}>Bitácora del Sistema</h1>

      <div className="tabla-bitacoras" style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Acción</th>
              <th>Fecha y Hora</th>
              <th>IP</th>
              <th>ID Usuario</th>
            </tr>
          </thead>
          <tbody>
            {bitacoras.map((b) => (
              <tr key={b.idBitacora}>
                <td>{b.idBitacora}</td>
                <td>{b.accion}</td>
                <td>{new Date(b.fechaHora).toLocaleString()}</td>
                <td>{b.ip}</td>
                <td>{b.usuario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GestionarBitacora;
