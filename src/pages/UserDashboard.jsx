import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- IMPORTANTE
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import '../styles/CardsSolicitudes.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const SolicitudCard = ({ solicitud, userId, onPagarClick }) => {
  const {
    idSolicitudServicio,
    estado,
    direccionEscrita,
    requiereCertificado,
    ubicacionGps,
  } = solicitud;

  let lat = 0;
  let lng = 0;

  try {
    [lat, lng] = ubicacionGps
      .trim()
      .split(",")
      .map((coord) => parseFloat(coord.trim()));

    if (isNaN(lat) || isNaN(lng)) throw new Error("Coords inválidas");
  } catch (e) {
    return (
      <div className="solicitud-card">
        <h2>Solicitud #{idSolicitudServicio}</h2>
        <p className="text-red-500">Ubicación inválida</p>
        <p><strong>Estado:</strong> {estado}</p>
        <p><strong>Dirección:</strong> {direccionEscrita}</p>
        <p><strong>Certificado:</strong> {requiereCertificado}</p>
      </div>
    );
  }

  const handleVerDetalle = () => {
    alert(`Ver detalle de solicitud #${idSolicitudServicio}`);
  };

  return (
    <div className="solicitud-card">
      <h2>Solicitud #{idSolicitudServicio}</h2>
      <p><strong>Estado:</strong> {estado}</p>
      <p><strong>Dirección:</strong> {direccionEscrita}</p>
      <p><strong>Certificado:</strong> {requiereCertificado}</p>

      <div className="mapa-solicitud" style={{ height: "200px", marginBottom: "10px" }}>
        <MapContainer
          center={[lat, lng]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]}>
            <Popup>{direccionEscrita}</Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="actions">
        <button className="action-button primary" onClick={handleVerDetalle}>Ver Detalles</button>
        <button
          className="action-button secondary"
          onClick={() => onPagarClick(userId, idSolicitudServicio)}
        >
          Pagar
        </button>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const [userId, setUserId] = useState(null);
  const [solicitudes, setSolicitudes] = useState(null);
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
        if (!data || !data.userId) throw new Error("No se recibió un ID válido");

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
        const response = await fetch(`https://fumifortebe-gxhg.onrender.com/solicitudes/cliente/${userId}`, {
          credentials: "include",
        });

        if (!response.ok) throw new Error("Error al obtener las solicitudes");

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("La respuesta no es un array");

        setSolicitudes(data);
      } catch (error) {
        console.error("Error al obtener solicitudes:", error);
        setError("No se pudieron obtener las solicitudes");
      }
    };

    fetchSolicitudes();
  }, [userId]);

  const handlePagarClick = (userId, idSolicitudServicio) => {
    navigate("/userlayout/pagar-cotizacion-sesion", {
      state: { userId, idSolicitudServicio }
    });
  };

  if (error) return <p className="error">{error}</p>;
  if (!userId) return <p className="loading">Cargando usuario...</p>;
  if (!solicitudes) return <p className="loading">Cargando solicitudes...</p>;

  return (
    <div className="user-dashboard">
      <h2>Mis Solicitudes</h2>
      {solicitudes.length === 0 ? (
        <p>No tenés solicitudes registradas.</p>
      ) : (
        <div className="solicitudes-lista">
          {solicitudes.map((soli) => (
            <SolicitudCard
              key={soli.idSolicitudServicio}
              solicitud={soli}
              userId={userId}
              onPagarClick={handlePagarClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;