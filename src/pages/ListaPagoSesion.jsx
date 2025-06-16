import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ListaPagoSesion.css"; 

const ListaPagoSesion = () => {
  const [userId, setUserId] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  // Obtener ID del usuario autenticado
  useEffect(() => {
    const fetchIdUsuario = async () => {
      try {
        const response = await fetch("https://fumifortebe-gxhg.onrender.com/get_iduser", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) throw new Error("Error al obtener el ID del usuario");

        const data = await response.json();
        if (!data || !data.userId) throw new Error("No se recibió un ID válido");

        setUserId(data.userId);
      } catch (err) {
        console.error(err.message);
        setError(err.message);
      }
    };

    fetchIdUsuario();
  }, []);

  // Obtener las solicitudes del usuario
  useEffect(() => {
    if (!userId) return;

    const fetchSolicitudes = async () => {
      try {
        const response = await fetch(
          `https://fumifortebe-gxhg.onrender.com/solicitudes/monto_pendiente_sesiones/${userId}`
        );
        if (!response.ok) throw new Error("Error al obtener las solicitudes");

        const data = await response.json();
        setSolicitudes(data);
      } catch (err) {
        console.error(err.message);
        setError(err.message);
      }
    };

    fetchSolicitudes();
  }, [userId]);

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="contenedor-pagos">
      <h2 className="titulo-pagos">Lista de Sesiones por Pagar</h2>

      {solicitudes.map((solicitud) => (
        <div key={solicitud.idSolicitudServicio} className="bloque-solicitud">
          <h3 className="titulo-solicitud">Solicitud #{solicitud.idSolicitudServicio}</h3>
          <table className="tabla-sesiones">
            <thead>
              <tr>
                <th>ID Sesión</th>
                <th>Estado Sesión</th>
                <th>Monto Sesión</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitud.sesiones
              .filter((sesion) => sesion.montoPendienteSesion > 0)
              .map((sesion) => (
                <tr key={sesion.idSesion}>
                  <td>{sesion.idSesion}</td>
                  <td>{sesion.estado}</td>
                  <td>Bs. {sesion.montoPendienteSesion.toFixed(2)}</td>
                  <td>
                    <button
                      className={`btn-pagar ${sesion.estado !== "Realizado" ? "btn-deshabilitado" : ""}`}
                      disabled={sesion.estado !== "Realizado"}
                      onClick={() =>
                        navigate("/userlayout/pago-sesion", {
                          state: {
                            idSesion: sesion.idSesion,
                            montoSesion: sesion.montoPendienteSesion,
                            idSolicitudServicio: solicitud.idSolicitudServicio,
                            userId: userId,
                          },
                        })
                      }
                    >
                      Pagar
                    </button>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default ListaPagoSesion;
