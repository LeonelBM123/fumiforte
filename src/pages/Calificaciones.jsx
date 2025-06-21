import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const SolicitudCardCliente = ({ solicitud }) => {
  if (!solicitud) return null;

  const { idSolicitudServicio, estado, direccionEscrita, ubicacionGps, requiereCertificado } = solicitud;

  let lat = 0, lng = 0;
  try {
    [lat, lng] = ubicacionGps.trim().split(",").map(coord => parseFloat(coord.trim()));
  } catch (e) {
    return <div className="solicitud-card"><h2>Solicitud #{idSolicitudServicio}</h2><p className="text-red-500">Ubicación inválida</p></div>;
  }

  if (isNaN(lat) || isNaN(lng)) {
    return <div className="solicitud-card"><h2>Solicitud #{idSolicitudServicio}</h2><p className="text-red-500">Coordenadas inválidas</p></div>;
  }

  // Estado para mostrar el formulario de calificación
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // Solo mostrar botón si el estado es 'aprobado'
  const puedeCalificar = estado.toLowerCase() === "aprobado";

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitSuccess("");
    if (rating < 1 || rating > 5) {
      setSubmitError("La calificación debe ser entre 1 y 5.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/calificaciones/calificar/${idSolicitudServicio}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          idSolicitudServicio,
          puntuacion: rating,
          comentario: comment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al enviar la calificación.");
      }

      setSubmitSuccess("¡Calificación enviada correctamente!");
      setShowRatingForm(false);
      setRating(5);
      setComment("");
    } catch (error) {
      setSubmitError(error.message);
    }
  };

  return (
    <div className="solicitud-card" style={{ marginBottom: "20px" }}>
      <h2>Solicitud #{idSolicitudServicio}</h2>
      <p><strong>Estado:</strong> {estado}</p>
      <p><strong>Dirección:</strong> {direccionEscrita}</p>
      <div className="map-container" style={{ marginBottom: "10px" }}>
        <MapContainer center={[lat, lng]} zoom={13} scrollWheelZoom={false} style={{ height: "200px", width: "100%", borderRadius: "8px" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[lat, lng]}>
            <Popup>{direccionEscrita}<br />Estado: {estado}</Popup>
          </Marker>
        </MapContainer>
      </div>
      <p><strong>Certificado:</strong> {String(requiereCertificado).toLowerCase() === "si" ? "Sí" : "No"}</p>

      {puedeCalificar && !showRatingForm && (
        <button
          onClick={() => setShowRatingForm(true)}
          style={{ marginTop: "10px", padding: "8px 12px", backgroundColor: "#2563eb", color: "white", borderRadius: "5px", border: "none", cursor: "pointer" }}
        >
          Calificar Servicio
        </button>
      )}

      {showRatingForm && (
        <div style={{ marginTop: "10px", border: "1px solid #ccc", padding: "10px", borderRadius: "6px" }}>
          <label>
            Calificación (1-5):{" "}
            <select value={rating} onChange={e => setRating(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </label>
          <br />
          <label>
            Comentario:
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows="3"
              style={{ width: "100%", marginTop: "5px" }}
            />
          </label>
          <br />
          <button
            onClick={handleSubmit}
            style={{ marginRight: "10px", padding: "6px 10px", backgroundColor: "#16a34a", color: "white", borderRadius: "5px", border: "none", cursor: "pointer" }}
          >
            Enviar
          </button>
          <button
            onClick={() => setShowRatingForm(false)}
            style={{ padding: "6px 10px", backgroundColor: "#ef4444", color: "white", borderRadius: "5px", border: "none", cursor: "pointer" }}
          >
            Cancelar
          </button>
          {submitError && <p style={{ color: "red", marginTop: "5px" }}>{submitError}</p>}
          {submitSuccess && <p style={{ color: "green", marginTop: "5px" }}>{submitSuccess}</p>}
        </div>
      )}
    </div>
  );
};

const SolicitudesCliente = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const response = await fetch("http://localhost:8081/clienteSolicitudes", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) throw new Error("Error al obtener las solicitudes.");
        const data = await response.json();
        setSolicitudes(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchSolicitudes();
  }, []);

  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="solicitudes-grid">
      {solicitudes.map((sol) =>
        sol ? <SolicitudCardCliente key={sol.idSolicitudServicio} solicitud={sol} /> : null
      )}
    </div>
  );
};

export default SolicitudesCliente;
