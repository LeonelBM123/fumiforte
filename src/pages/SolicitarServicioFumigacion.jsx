import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/SolicitarServicioFumigacion.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

function LocationSelector({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
}


function SolicitarServicioFumigacion() {
  const [form, setForm] = useState({
    descripcion: "",
    direccion: "",
    requiere_certificado: "no"
  });
  const [gps, setGps] = useState(null);
  const [error, setError] = useState("");
  const [requiereCertificado, setRequiereCertificado] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.descripcion.trim() || !form.direccion.trim() || !gps) {
      setError("Todos los campos y ubicación son obligatorios.");
      return;
    }

    setError("");

    const datosSolicitud = {
      descripcion: form.descripcion,
      ubicacionGps: `${gps.lat},${gps.lng}`,
      direccionEscrita: form.direccion, 
      requiereCertificado: requiereCertificado ? "si" : "no",
    };

    try {
      const response = await fetch("http://localhost:8081/solicitud_servicio", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosSolicitud),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError(errorText || "Error al enviar la solicitud.");
      } else {
        alert("¡Solicitud enviada con éxito!");
        navigate("/userlayout");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("No se pudo conectar al servidor.");
    }
  };

  const handleCancel = () => {
    navigate("/userlayout");
  };

  return (
    <div className="solicitud-container">
      <div className="solicitud-content">
        <div className="solicitud-box">
          <h2>Solicitud de Servicio de Fumigación</h2>
          <form onSubmit={handleSubmit}>
            <textarea
              name="descripcion"
              placeholder="Descripción del problema"
              value={form.descripcion}
              onChange={handleChange}
              rows="4"
            />
            <input
              type="text"
              name="direccion"
              placeholder="Dirección escrita"
              value={form.direccion}
              onChange={handleChange}
            />

            <div className="checkbox-section">
              <label>
                <input
                  type="checkbox"
                  checked={form.requiere_certificado === "si"}
                  onChange={(e) =>
                    setForm({ ...form, requiere_certificado: e.target.checked ? "si" : "no" })
                  }
                />
                Requiere certificado
              </label>
            </div>

            <div className="map-section">
              <label>Selecciona tu ubicación en el mapa:</label>
              <MapContainer
                center={[-17.7833, -63.1821]} // Santa Cruz
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "300px", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationSelector position={gps} setPosition={setGps} />
              </MapContainer>
            </div>
            <button type="submit">Enviar Solicitud</button>
            <button type="button" onClick={handleCancel}>
              Cancelar
            </button>
          </form>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default SolicitarServicioFumigacion;