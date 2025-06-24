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
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaTimes, FaDownload } from "react-icons/fa";

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

Modal.setAppElement("#root");

function WorkerDashboard() {
  const [idUsuario, setIdUsuario] = useState(null);
  const [datosSesiones, setDatosSesiones] = useState([]);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detalleSesion, setDetalleSesion] = useState(null);

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

        if (!response.ok) throw new Error("Error al obtener los datos de sesiones");

        const data = await response.json();
        setDatosSesiones(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchDatosSesiones();
  }, [idUsuario]);

  const eventos = useMemo(() => {
    return datosSesiones.map((sesion) => {
      const [hour, minute] = sesion.horaSesion.split(":");
      const [year, month, day] = sesion.fechaSesion.split("-");

      return {
        title: `id: ${sesion.idSesion}\nhora: ${sesion.horaSesion}`,
        start: new Date(year, month - 1, day, hour, minute),
        end: new Date(year, month - 1, day, hour, minute),
        estado: sesion.estadoSesion,
        idSesion: sesion.idSesion,
        fechaSesion: sesion.fechaSesion,
        horaSesion: sesion.horaSesion,
      };
    });
  }, [datosSesiones]);

  const eventStyleGetter = (event) => {
    let backgroundColor = "#3174ad";
    if (event.estado === "Realizado") backgroundColor = "#4caf50";
    else if (event.estado === "Pendiente") backgroundColor = "#ff9800";
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

  const handleEventClick = async (event) => {
    try {
      const res = await fetch(`http://localhost:8081/sesion/${event.idSesion}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setDetalleSesion(data);
      setModalOpen(true);
    } catch (err) {
      console.error("Error al obtener detalles:", err);
    }
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte mensual de sesiones", 14, 16);

    const sesionesDelMes = datosSesiones.filter((s) => {
      const fecha = new Date(s.fechaSesion);
      const hoy = new Date();
      return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
    });

    const rows = sesionesDelMes.map((s) => [
      s.idSesion,
      s.fechaSesion,
      s.horaSesion,
      s.estadoSesion,
    ]);

    autoTable(doc, {
      head: [["ID Sesión", "Fecha", "Hora", "Estado"]],
      body: rows,
      startY: 24,
    });

    doc.save("reporte_sesiones.pdf");
  };

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="calendario-container">
        <div className="titulo-bar">
          <h2 className="titulo-calendario">Sesiones Programadas:</h2>
          <button className="btn-exportar" onClick={exportarPDF}>
            <FaDownload style={{ marginRight: 6 }} /> Exportar PDF (mes)
          </button>
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
          tooltipAccessor={(event) => `ID: ${event.idSesion}`}
          onSelectEvent={handleEventClick}
          messages={{
            allDay: "Todo el día",
            previous: "Anterior",
            next: "Siguiente",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda",
            date: "Fecha",
            time: "Hora",
            event: "Evento",
            noEventsInRange: "No hay eventos en este rango.",
          }}
        />
      </div>

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
        {detalleSesion && (
          <div>
            <h2>Sesión #{detalleSesion.idSesion}</h2>
            <p><strong>Fecha:</strong> {detalleSesion.fecha}</p>
            <p><strong>Hora:</strong> {detalleSesion.hora}</p>
            <p><strong>Estado:</strong> {detalleSesion.estado}</p>
            <p><strong>Monto Pendiente:</strong> {detalleSesion.montoPendienteSesion}</p>
            <p><strong>Nro Sesión:</strong> {detalleSesion.nroSesion}</p>
            <hr />
            <h3>Solicitud #{detalleSesion.solicitudServicio.idSolicitudServicio}</h3>
            <p><strong>Descripción:</strong> {detalleSesion.solicitudServicio.descripcion}</p>
            <p><strong>Dirección:</strong> {detalleSesion.solicitudServicio.direccionEscrita}</p>
            <p><strong>Estado:</strong> {detalleSesion.solicitudServicio.estado}</p>
            <p><strong>Cantidad de Sesiones:</strong> {detalleSesion.solicitudServicio.cantidadSesiones}</p>

            {detalleSesion.solicitudServicio.ubicacionGps && (
              <div className="mapa">
                <MapContainer
                  center={detalleSesion.solicitudServicio.ubicacionGps.split(',').map(Number)}
                  zoom={17}
                  style={{ height: "300px", width: "100%" }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={detalleSesion.solicitudServicio.ubicacionGps.split(',').map(Number)}>
                    <Popup>Ubicación de la solicitud</Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default WorkerDashboard;
