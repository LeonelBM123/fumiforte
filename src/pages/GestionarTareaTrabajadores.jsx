import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/TareaTrabajadores.css";
import L from "leaflet";

// Fix icon issue with React-Leaflet in some setups
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const GestionarTareaTrabajadores = () => {
  const { idSolicitudServicio } = useParams();

  // Estados para solicitud, trabajadores, checkbox y formulario
  const [solicitud, setSolicitud] = useState(null);
  const [trabajadores, setTrabajadores] = useState([]);
  const [participa, setParticipa] = useState({}); // idUsuario: boolean
  const [formSesion, setFormSesion] = useState({
    fecha: "",
    hora: "",
    montoPendienteSesion: "",
    estado: "",
    nroSesion: 1,
  });
  const [idSesionCreada, setIdSesionCreada] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar solicitud por id con credentials incluido
  useEffect(() => {
    axios
      .get(`http://localhost:8081/solicitudes/${idSolicitudServicio}`, {
        withCredentials: true,
      })
      .then((res) => {
        setSolicitud(res.data);
      })
      .catch((err) => console.error("Error al cargar solicitud:", err));
  }, [idSolicitudServicio]);

  // Cargar lista trabajadores con credentials incluido
  useEffect(() => {
    axios
      .get("http://localhost:8081/gerente/trabajadores", {
        withCredentials: true,
      })
      .then((res) => {
        setTrabajadores(res.data);
      })
      .catch((err) => console.error("Error al cargar trabajadores:", err));
  }, []);

  // Manejar checkbox "participa"
  const handleCheckboxChange = (idUsuario) => {
    setParticipa((prev) => ({
      ...prev,
      [idUsuario]: !prev[idUsuario],
    }));
  };

  // Manejar inputs del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormSesion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Enviar POST para crear sesión y luego insertar participa, con credentials
  const handleCrearSesion = async () => {
    if (
      !formSesion.fecha ||
      !formSesion.hora ||
      !formSesion.montoPendienteSesion ||
      !formSesion.estado
    ) {
      alert("Por favor completa todos los campos del formulario.");
      return;
    }

    setLoading(true);

    try {
        // 1. Crear sesión
        const sesionData = {
        fecha: formSesion.fecha,
        hora: formSesion.hora,
        montoPendienteSesion: parseFloat(formSesion.montoPendienteSesion),
        estado: formSesion.estado,
        nroSesion: parseInt(formSesion.nroSesion),
        solicitudServicio: {
            idSolicitudServicio: solicitud.idSolicitudServicio,     
        },
        };

      
      const resSesion = await axios.post(
        "http://localhost:8081/sesion/crear",
        sesionData,
        { withCredentials: true }
      );
     
      const idSesion = resSesion.data.idSesion; // Asumiendo que devuelve idSesion
        console.log("Objeto sesión a enviar:", resSesion.data);
      setIdSesionCreada(idSesion);

        // 2. Insertar en tabla participa para cada trabajador seleccionado
        const participantes = Object.entries(participa)
        .filter(([_, seleccionado]) => seleccionado)
        .map(([idTrabajador]) => {
            const idTrab = parseInt(idTrabajador);
            return {
            id: {
                idTrabajador: idTrab,
                idSesion: idSesion
            },
            trabajador: {
                idTrabajador: idTrab
            },
            sesion: {
                idSesion: idSesion
            },
            observaciones: "",
            pruebas: ""
            };
        });

        // Hacer los POST uno por uno
        for (const p of participantes) {
        console.log("Enviando participante:", p); // DEBUG 🔍
        await axios.post("http://localhost:8081/participa/crear", p, {
            withCredentials: true,
        });
        }

      alert("Sesión creada y participantes asignados correctamente.");
      // Limpiar form y checkboxes
      setFormSesion({
        fecha: "",
        hora: "",
        montoPendienteSesion: "",
        estado: "",
        nroSesion: 1,
      });
      setParticipa({});
      setLoading(false);
    } catch (error) {
      console.error("Error al crear sesión o asignar participantes:", error);
      alert("Ocurrió un error. Revisa la consola.");
      setLoading(false);
    }
  };

  if (!solicitud) return <p>Cargando solicitud...</p>;

  // Parsear coordenadas GPS
  const [lat, lng] = solicitud.ubicacionGps
    .split(",")
    .map((c) => parseFloat(c.trim()));

  return (
    <div className="contenedor">
      {/* Izquierda: datos + mapa */}
      <div className="izquierda">
        <h2>Solicitud #{solicitud.idSolicitudServicio}</h2>
        <p>
          <b>Descripción:</b> {solicitud.descripcion}
        </p>
        <p>
          <b>Dirección:</b> {solicitud.direccionEscrita}
        </p>
        <p>
          <b>Estado:</b> {solicitud.estado}
        </p>
        <p>
          <b>Monto pendiente cotización:</b> Bs.{" "}
          {solicitud.montoPendienteCotizacion.toFixed(2)}
        </p>
        <p>
          <b>Cantidad de sesiones:</b> {solicitud.cantidadSesiones}
        </p>
        <p>
          <b>Requiere certificado:</b> {solicitud.requiereCertificado}
        </p>

        <h3>Ubicación GPS</h3>
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          scrollWheelZoom={false}
          style={{ height: "200px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]}>
            <Popup>{solicitud.direccionEscrita}</Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Derecha: tabla y form */}
      <div className="derecha">
        <div>
          <h2>Trabajadores</h2>
          <table className="tabla-trabajadores">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Participa</th>
              </tr>
            </thead>
            <tbody>
              {trabajadores.map((t) => (
                <tr key={t.idUsuario}>
                  <td>{t.nombreCompleto}</td>
                  <td>{t.telefono}</td>
                  <td>{t.direccion}</td>
                  <td>{t.correo}</td>
                  <td>{t.estado}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={participa[t.idUsuario] || false}
                      onChange={() => handleCheckboxChange(t.idUsuario)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: "30px" }}>
          <h2>Creación de una nueva sesión</h2>
          <form
            className="form-sesion"
            onSubmit={(e) => {
              e.preventDefault();
              handleCrearSesion();
            }}
          >
            <label>Fecha</label>
            <input
              type="date"
              name="fecha"
              value={formSesion.fecha}
              onChange={handleInputChange}
              required
            />

            <label>Hora</label>
            <input
              type="time"
              name="hora"
              value={formSesion.hora}
              onChange={handleInputChange}
              required
            />

            <label>Monto Pendiente Sesión (Bs.)</label>
            <input
              type="number"
              step="0.01"
              name="montoPendienteSesion"
              value={formSesion.montoPendienteSesion}
              onChange={handleInputChange}
              required
            />

            <label>Estado</label>
            <input
              type="text"
              name="estado"
              value={formSesion.estado}
              onChange={handleInputChange}
              required
              placeholder="Ej: Realizado"
            />

            <label>Nro Sesión</label>
            <input
              type="number"
              name="nroSesion"
              value={formSesion.nroSesion}
              onChange={handleInputChange}
              min="1"
              required
            />

            <button disabled={loading} className="boton-crear" type="submit">
              {loading ? "Creando..." : "Crear Sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GestionarTareaTrabajadores;
