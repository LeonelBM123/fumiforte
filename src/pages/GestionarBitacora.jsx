import React, { useState, useEffect } from "react";
import "../styles/GestionarLayout.css";
import "../styles/Loader.css";

function GestionarBitacora() {
  const [bitacoras, setBitacoras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerBitacoras();
  }, []);

  const obtenerBitacoras = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gestionar-layout-container">
      <h1 style={{ marginBottom: "10px" }}>Bitácora del Sistema</h1>

      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Cargando bitácoras...</p>
        </div>
      ) : (
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
                  <td>{b.idUsuario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default GestionarBitacora;
