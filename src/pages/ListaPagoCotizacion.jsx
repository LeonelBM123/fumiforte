import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ListaPagoSesion.css"; // Puedes usar los mismos estilos

const ListaPagoCotizacion = () => {
  const [userId, setUserId] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIdUsuario = async () => {
      try {
        const response = await fetch("https://fumifortebe-gxhg.onrender.com/get_iduser", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) throw new Error("Error al obtener el ID del usuario");

        const data = await response.json();
        setUserId(data.userId);
      } catch (err) {
        console.error(err.message);
        setError(err.message);
      }
    };

    fetchIdUsuario();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchSolicitudes = async () => {
      try {
        const response = await fetch(
          `https://fumifortebe-gxhg.onrender.com/solicitudes/monto_pendiente_cotizacion/${userId}`
        );

        if (!response.ok) throw new Error("Error al obtener solicitudes");

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
      <h2 className="titulo-pagos">Lista de Cotizaciones por Pagar</h2>
    
      {solicitudes.map((solicitud) => (
        <div key={solicitud.idSolicitudServicio} className="bloque-solicitud">
          <h3 className="titulo-solicitud">Solicitud #{solicitud.idSolicitudServicio}</h3>
          <table className="tabla-sesiones">
            <thead>
              <tr>
                <th>Monto Pendiente Cotización</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bs. {solicitud.montoPendienteCotizacion.toFixed(2)}</td>
                <td>
                  <button
                    className="btn-pagar"
                    onClick={() =>
                      navigate("/userlayout/pago-cotizacion", {
                        state: {
                          idSolicitudServicio: solicitud.idSolicitudServicio,
                          montoCotizacion: solicitud.montoPendienteCotizacion,
                          userId: userId,
                        }
                      })
                    }
                  >
                    Pagar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default ListaPagoCotizacion;
