import React, { useEffect, useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { parse, startOfWeek, format, getDay } from "date-fns";
import es from "date-fns/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/CalendarioWorker.css";
import Modal from "react-modal";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FaTimes } from "react-icons/fa";

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

Modal.setAppElement("#root");

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const AdminCalendar = () => {
  const [participaciones, setParticipaciones] = useState([]);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    const fetchParticipaciones = async () => {
      try {
        const response = await fetch("http://localhost:8081/participa/listar", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) throw new Error("Error al obtener los datos de participaciones");

        const data = await response.json();
        setParticipaciones(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchParticipaciones();
  }, []);

  const eventos = useMemo(() => {
    return participaciones.map(({ sesion, trabajadores }) => {
      const [hour, minute] = sesion.hora.split(":");
      const [year, month, day] = sesion.fecha.split("-");

      return {
        title: `idSolicitud: ${sesion.solicitudServicio.idSolicitudServicio}\nidSesion: ${sesion.idSesion}\nidCliente: ${sesion.solicitudServicio.idCliente}\nidTrabajador(es): ${trabajadores.map(t => t.idTrabajador).join(", ")}`,
        start: new Date(year, month - 1, day, hour, minute),
        end: new Date(year, month - 1, day, hour, minute),
        allDay: false,
        sesion,
        trabajadores,
      };
    });
  }, [participaciones]);

  const eventStyleGetter = (event) => {
    let backgroundColor = "#3174ad";
    if (event.sesion.estado === "Realizado") backgroundColor = "#4caf50";
    else if (event.sesion.estado === "Pendiente") backgroundColor = "#ff9800";
    else backgroundColor = "#9e9e9e";

    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        color: "white",
        fontSize: "0.75rem",
        padding: "2px 4px",
        whiteSpace: "pre-wrap",
        textAlign: "left",
        overflow: "hidden",
        textOverflow: "ellipsis",
        height: "100%",
      },
    };
  };

  const handleEventClick = (event) => {
    setDetalle(event);
    setModalOpen(true);
  };

  return (
    <div className="calendario-container">
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="titulo-bar">
        <h2 className="titulo-calendario">Calendario de Actividades</h2>
      </div>

      <div className="leyendas">
        <span><span className="cuadro verde"></span> Realizado</span>
        <span><span className="cuadro naranja"></span> Pendiente</span>
      </div>

      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        defaultView="month"
        defaultDate={new Date()}
        eventPropGetter={eventStyleGetter}
        tooltipAccessor={(event) => `ID: ${event.sesion.idSesion}`}
        onSelectEvent={handleEventClick}
      />

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Detalle de Sesión"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <button className="btn-cerrar" onClick={() => setModalOpen(false)}>
          <FaTimes />
        </button>
        {detalle && (
          <div>
            <h2>Sesión #{detalle.sesion.idSesion}</h2>
            <p><strong>Fecha:</strong> {detalle.sesion.fecha}</p>
            <p><strong>Hora:</strong> {detalle.sesion.hora}</p>
            <p><strong>Estado:</strong> {detalle.sesion.estado}</p>
            <p><strong>Monto Pendiente:</strong> {detalle.sesion.montoPendienteSesion}</p>
            <p><strong>Nro Sesión:</strong> {detalle.sesion.nroSesion}</p>
            <hr />
            <h3>Solicitud</h3>
            <p><strong>idSolicitud:</strong> {detalle.sesion.solicitudServicio.idSolicitudServicio}</p>
            <p><strong>Dirección:</strong> {detalle.sesion.solicitudServicio.direccionEscrita}</p>
            <p><strong>Cliente:</strong> {detalle.sesion.solicitudServicio.idCliente}</p>
            <p><strong>Descripción:</strong> {detalle.sesion.solicitudServicio.descripcion}</p>

            {detalle.sesion.solicitudServicio.ubicacionGps && (
              <div className="mapa">
                <MapContainer
                  center={detalle.sesion.solicitudServicio.ubicacionGps.split(',').map(Number)}
                  zoom={17}
                  style={{ height: "300px", width: "100%" }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={detalle.sesion.solicitudServicio.ubicacionGps.split(',').map(Number)}>
                    <Popup>Ubicación de la solicitud</Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}

            <hr />
            <h3>Trabajadores</h3>
            <ul>
              {detalle.trabajadores.map((t) => (
                <li key={t.idTrabajador}>
                  ID: {t.idTrabajador}, Nombre: {t.nombreCompleto}, Tel: {t.telefono}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminCalendar;
