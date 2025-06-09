import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/SolicitarServicioFumigacion.css";

// Icono personalizado (ya lo tienes)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const PruebasSesion = () => {
  const [idUsuario, setIdUsuario] = useState(null);
  const [datosSesiones, setDatosSesiones] = useState([]);
  const [error, setError] = useState(null);

  // Modal y detalle
  const [modalOpen, setModalOpen] = useState(false);
  const [detalleSolicitud, setDetalleSolicitud] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState(null);

  // Estados para el modal "Agregar +"
  const [modalAgregarOpen, setModalAgregarOpen] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const [pruebas, setPruebas] = useState("");
  const [errorAgregar, setErrorAgregar] = useState(null);
  const [cargandoAgregar, setCargandoAgregar] = useState(false);
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);


  // Estos dos estados para enviar el idTrabajador y idSesion
  const [idTrabajadorSeleccionado, setIdTrabajadorSeleccionado] = useState(null);
  const [idSesionSeleccionada, setIdSesionSeleccionada] = useState(null);

  // Función para abrir el modal "Agregar +"
  const abrirModalAgregar = (idTrabajador, idSesion) => {
    setIdTrabajadorSeleccionado(idTrabajador);
    setIdSesionSeleccionada(idSesion);
    setObservaciones("");
    setPruebas("");
    setErrorAgregar(null);
    setModalAgregarOpen(true);
  };

  const cerrarModalAgregar = () => {
    setModalAgregarOpen(false);
    setErrorAgregar(null);
  };

  // Función para enviar el formulario al backend
  const enviarDatosAgregar = async () => {
    if (!observaciones.trim() || !pruebas.trim()) {
      setErrorAgregar("Por favor llena ambos campos.");
      return;
    }

    setCargandoAgregar(true);
    setErrorAgregar(null);

    try {
      const url = `http://localhost:8081/participa/actualizar/${idTrabajadorSeleccionado}/${idSesionSeleccionada}`;

      const body = {
        observaciones,
        pruebas,
      };

      const response = await fetch(url, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Error al enviar los datos");
      }

      // Si quieres podrías refrescar datos o cerrar modal
      setModalAgregarOpen(false);
      alert("Datos enviados correctamente!");
    } catch (error) {
      setErrorAgregar(error.message);
    } finally {
      setCargandoAgregar(false);
    }
  };

  useEffect(() => {
    const fetchIdUsuario = async () => {
      try {
        const response = await fetch("http://localhost:8081/get_iduser", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) throw new Error("Error al obtener el ID del usuario");

        const data = await response.json();

        if (!data || !data.userId) throw new Error("No se recibió un ID válido");

        setIdUsuario(data.userId);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchIdUsuario();
  }, []);

  useEffect(() => {
    const fetchDatosSesiones = async () => {
      if (!idUsuario) return;

      try {
        const response = await fetch(
          `http://localhost:8081/sesion/datos/${idUsuario}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok)
          throw new Error("Error al obtener los datos de sesiones");

        const data = await response.json();
        setDatosSesiones(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchDatosSesiones();
  }, [idUsuario]);

  const parseCoords = (coordStr) => {
    const parts = coordStr.split(",");
    return [parseFloat(parts[0]), parseFloat(parts[1])];
  };

  const abrirModalConDetalle = async (idSolicitudServicio) => {
    if (!idSolicitudServicio) {
      alert("No se encontró el ID de solicitud para esta sesión.");
      return;
    }

    setModalOpen(true);
    setCargandoDetalle(true);
    setErrorDetalle(null);
    setDetalleSolicitud(null);

    try {
      const resp = await fetch(
        `http://localhost:8081/solicitudes/${idSolicitudServicio}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!resp.ok) throw new Error("No se encontró la solicitud");

      const datasoli = await resp.json();
      setDetalleSolicitud(datasoli);
    } catch (err) {
      setErrorDetalle(err.message);
    } finally {
      setCargandoDetalle(false);
    }
  };
  
  const cerrarModal = () => {
    setModalOpen(false);
    setDetalleSolicitud(null);
    setErrorDetalle(null);
  };

  if (error) return <div>Error: {error}</div>;
  if (idUsuario === null) return <div>Cargando ID de usuario...</div>;

  return (
    <div>
      <h1>ID del usuario: {idUsuario}</h1>
      <h2>Sesiones encontradas:</h2>

      {datosSesiones.length === 0 ? (
        <p>No se encontraron sesiones.</p>
      ) : (
        <div className="solicitudes-grid">
          {datosSesiones.map((sesion, i) => {
            const coords = parseCoords(sesion.ubicacionGps);
            const idSolicitud = sesion.idSolicitudServicio;

            return (
              <div className="solicitud-card" key={i}>
                <h2>Sesión #{sesion.idSesion}</h2>

                <div className="map-container">
                  <MapContainer
                    center={coords}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={{ height: "180px", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={coords}>
                      <Popup>
                        <strong>ID Sesión:</strong> {sesion.idSesion} <br />
                        <strong>Fecha:</strong> {sesion.fechaSesion} <br />
                        <strong>Hora:</strong> {sesion.horaSesion} <br />
                        <strong>Estado:</strong> {sesion.estadoSesion}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>

                <p>
                  <strong>Fecha:</strong> {sesion.fechaSesion} |{" "}
                  <strong>Hora:</strong> {sesion.horaSesion}
                </p>
                <p className="estado">{sesion.estadoSesion}</p>

                <div className="actions">
                  <button
                    className="action-button"
                    onClick={() => abrirModalConDetalle(idSolicitud)}
                  >
                    Detalles
                  </button>
                  <button
                    className="action-button agregar-button"
                    onClick={() => abrirModalAgregar(idUsuario, sesion.idSesion)}
                  >
                    Agregar +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para agregar observaciones y pruebas */}
      {modalAgregarOpen && (
        <div className="modal-overlay" onClick={cerrarModalAgregar}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Agregar Observaciones y Pruebas</h2>

            <label>
              Observaciones:
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={4}
              />
            </label>

            <label>
              Pruebas:
              <textarea
                value={pruebas}
                onChange={(e) => setPruebas(e.target.value)}
                rows={4}
              />
            </label>

            {errorAgregar && <p className="error">{errorAgregar}</p>}

            <div className="modal-buttons">
              <button onClick={cerrarModalAgregar}>Cancelar</button>
              <button onClick={enviarDatosAgregar} disabled={cargandoAgregar}>
                {cargandoAgregar ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para detalles */}
      {modalOpen && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Detalles de la solicitud</h2>
            {cargandoDetalle && <p>Cargando...</p>}
            {errorDetalle && <p className="error">{errorDetalle}</p>}
            {detalleSolicitud && (
              <div>
                <p><strong>ID:</strong> {detalleSolicitud.idSolicitudServicio}</p>
                <p><strong>Direccion:</strong> {detalleSolicitud.direccionEscrita}</p>
                <p><strong>Estado:</strong> {detalleSolicitud.estado}</p>
                <p><strong>Descripción:</strong> {detalleSolicitud.descripcion}</p>
              </div>
            )}
            <button onClick={cerrarModal}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PruebasSesion;