import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../styles/CardsPruebas.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const PruebasSesion = () => {
  const [sesiones, setSesiones] = useState([]);
  const [modalSesion, setModalSesion] = useState(null);
  const [formulario, setFormulario] = useState({
    observaciones: "",
    pruebas: "",
  });

  useEffect(() => {
    
    const fetchSesiones = async () => {
      const idTrabajador = localStorage.getItem("id_usuario");
      try {
        const response = await fetch(`http://localhost:8081/buscar/${idTrabajador}`);
        const data = await response.json();
        console.log("Sesiones recibidas:", data);
        setSesiones(data);
      } catch (error) {
        console.error("Error al obtener sesiones:", error);
      }
    };
    fetchSesiones();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const idTrabajador = localStorage.getItem("id_usuario");
    const idSesion = modalSesion.idSesion;

    try {
      const response = await fetch(`http://localhost:8081/actualizar/${idTrabajador}/${idSesion}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formulario),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar la sesión");
      }

      alert("Prueba registrada con éxito");
      setModalSesion(null);
      setFormulario({ observaciones: "", pruebas: "" });

      // Recargar las sesiones para reflejar cambios
      const refrescar = await fetch(`http://localhost:8081/buscar?idTrabajador=${idTrabajador}`);
      const dataRefrescada = await refrescar.json();
      setSesiones(dataRefrescada);
    } catch (error) {
      console.error("Error al enviar prueba:", error);
      alert("Ocurrió un error al registrar la prueba");
    }
  };

  return (
    <div className="sesiones-grid">
      {sesiones.map((item, idx) => {
        const sesion = item.sesion;
        const { fechaHora, lugarGps, solicitud } = sesion;
        const [lat, lng] = lugarGps?.split(",").map(Number) || [0, 0];

        return (
          <div key={idx} className="sesion-card">
            <h2>Solicitud #{solicitud.idSolicitudServicio}</h2>
            <p><strong>Fecha y hora:</strong> {fechaHora}</p>

            <div className="map-container">
              <MapContainer center={[lat, lng]} zoom={13} style={{ height: "200px", width: "100%", borderRadius: "8px" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[lat, lng]}>
                  <Popup>
                    Solicitud #{solicitud.idSolicitudServicio}
                    <br />
                    Fecha: {fechaHora}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            <button onClick={() => setModalSesion(sesion)} className="action-button">
              Registrar Prueba
            </button>
          </div>
        );
      })}

      {/* Modal para registrar prueba */}
      {modalSesion && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Registrar Prueba para la Solicitud #{modalSesion.solicitud.idSolicitudServicio}</h2>

            <label>
              Observaciones:
              <textarea
                name="observaciones"
                value={formulario.observaciones}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Pruebas:
              <textarea
                name="pruebas"
                value={formulario.pruebas}
                onChange={handleInputChange}
              />
            </label>

            <button className="adjuntar-button">Adjuntar Pruebas</button>

            <div className="modal-buttons">
              <button onClick={handleSubmit} className="save-button">Confirmar</button>
              <button onClick={() => setModalSesion(null)} className="close-button">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PruebasSesion;
