import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../styles/CardsSolicitudes.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const SolicitudCard = ({ solicitud }) => {
  const navigate = useNavigate();

  if (!solicitud) return null;

  const {
    idSolicitudServicio,
    estado,
    direccionEscrita,
    ubicacionGps,
    requiereCertificado,
  } = solicitud;

  let lat = 0;
  let lng = 0;

  try {
    [lat, lng] = ubicacionGps
      .trim()
      .split(",")
      .map((coord) => parseFloat(coord.trim()));
  } catch (e) {
    return (
      <div className="solicitud-card">
        <h2>Solicitud #{idSolicitudServicio}</h2>
        <p className="text-red-500">Ubicación inválida</p>
      </div>
    );
  }

  if (isNaN(lat) || isNaN(lng)) {
    return (
      <div className="solicitud-card">
        <h2>Solicitud #{idSolicitudServicio}</h2>
        <p className="text-red-500">Coordenadas inválidas</p>
      </div>
    );
  }

  const handleGenerarPDF = () => {
    navigate(`/adminlayout/reportes/pdf/${idSolicitudServicio}`);
  };

  const handleGenerarExcel = () => {
    navigate(`/adminlayout/reportes/excel/${idSolicitudServicio}`);
  };

  return (
    <div className="solicitud-card">
      <h2>Solicitud #{idSolicitudServicio}</h2>
      <p className="estado">
        <strong>Estado:</strong> {estado}
      </p>
      <p>
        <strong>Dirección:</strong> {direccionEscrita}
      </p>
      <div className="map-container">
        <MapContainer
          center={[lat, lng]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: "200px", width: "100%", borderRadius: "8px" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[lat, lng]}>
            <Popup>
              {direccionEscrita} <br /> Estado: {estado}
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <p className="mt-2">
        <strong>Certificado:</strong>{" "}
        {String(requiereCertificado).toLowerCase() === "si" ? "Sí" : "No"}
      </p>

      <div className="actions">
        <button
          className="action-button"
          style={{ backgroundColor: "#007bff" }}
          onClick={handleGenerarPDF}
        >
          Generar PDF
        </button>
        <button
          className="action-button"
          style={{ marginLeft: "10px", backgroundColor: "#28a745" }}
          onClick={handleGenerarExcel}
        >
          Generar Excel
        </button>
      </div>
    </div>
  );
};

const ReportesSolicitud = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const response = await fetch("https://fumifortebe-gxhg.onrender.com/solicitudes", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Error al obtener las solicitudes.");
        }
        const data = await response.json();
        setSolicitudes(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchSolicitudes();
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="solicitudes-grid">
      {Array.isArray(solicitudes) &&
        solicitudes.map((solicitud) =>
          solicitud ? (
            <SolicitudCard
              key={solicitud.idSolicitudServicio}
              solicitud={solicitud}
            />
          ) : null
        )}
    </div>
  );
};

export default ReportesSolicitud;
