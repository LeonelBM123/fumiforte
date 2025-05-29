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
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ ...solicitud });
  const navigate = useNavigate();

  if (!solicitud) {
    return null;
  }

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

  // Maneja cambios en inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAsignarTareas = () => {
    navigate(`/adminlayout/gestionar-tarea-trabajadores/${idSolicitudServicio}`);
  };

  // Enviar PUT al backend
  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Verificamos si requiere certificado y si NO tiene id_certificado
    if (
      String(formData.requiereCertificado).toLowerCase() === "si" &&
      formData.idCertificado === null
    ) {
      const confirmCert = window.confirm(
        "Se creará un certificado ligado a esta solicitud. ¿Desea continuar?"
      );

      if (!confirmCert) {
        return; // Si cancela, no seguimos
      }

      // Crear el certificado
      const certResponse = await fetch("http://localhost:8081/gerente/crear_certificado", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fechaEmision: null,
          fechaVencimiento: null,
          estado: "Pendiente",
        }),
      });

      if (!certResponse.ok) {
        throw new Error("Error al crear el certificado");
      }

      const certData = await certResponse.json();

      formData.idCertificado = certData.idCertificado;
    }

    // Luego actualizamos la solicitud
    console.log(formData);
    const response = await fetch(`http://localhost:8081/solicitudes/${idSolicitudServicio}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) throw new Error("Error al actualizar la solicitud");
    alert("Solicitud actualizada correctamente");
    setShowModal(false);
  } catch (error) {
      console.error(error);
      alert("Ocurrió un error al guardar los cambios");
    }
  };


  return (
    <>
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
          <button className="action-button" onClick={() => setShowModal(true)}>
            Gestionar
          </button>
          <button
            className="action-button"
            style={{ marginLeft: "10px", backgroundColor: "#ffc107" }}
            onClick={handleAsignarTareas}
          >
            Asignar Tareas
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Editar Solicitud #{idSolicitudServicio}</h2>
            <form className="edit-form" onSubmit={handleSubmit}>
              <label>
                Descripción:
                <input
                  type="text"
                  name="descripcion"
                  value={formData.descripcion || ""}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Dirección Escrita:
                <input
                  type="text"
                  name="direccionEscrita"
                  value={formData.direccionEscrita || ""}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Ubicación GPS:
                <input
                  type="text"
                  name="ubicacionGps"
                  value={formData.ubicacionGps || ""}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Estado:
                <select
                  name="estado"
                  value={formData.estado || "Pendiente"}
                  onChange={handleChange}
                  required
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="Rechazado">Rechazado</option>
                </select>
              </label>

              <label>
                Monto Pendiente Cotización:
                <input
                  type="number"
                  name="montoPendienteCotizacion"
                  value={formData.montoPendienteCotizacion || ""}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Cantidad de Sesiones:
                <input
                  type="number"
                  name="cantidadSesiones"
                  value={formData.cantidadSesiones || ""}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                ¿Requiere Certificado?
                <select
                  name="requiereCertificado"
                  value={formData.requiereCertificado || "no"}
                  onChange={handleChange}
                >
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </label>

              <div className="modal-buttons">
                <button type="submit" className="save-button">
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="close-button"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const SolicitudesList = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const response = await fetch("http://localhost:8081/solicitudes", {
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

export default SolicitudesList;
