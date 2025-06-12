import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/TareaTrabajadores.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import '../styles/Loader.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Paso1 = ({ solicitud, requiereCertificado, setRequiereCertificado }) => {
  const {
    idSolicitudServicio,
    nombre,
    tipoCliente,
    correo,
    telefono,
    estado,
    direccionEscrita,
    ubicacionGps,
  } = solicitud;

  const coords = React.useMemo(() => {
    if (!ubicacionGps) return null;
    const parts = ubicacionGps.split(',');
    if (parts.length !== 2) return null;
    const lat = parseFloat(parts[0].trim());
    const lng = parseFloat(parts[1].trim());
    if (isNaN(lat) || isNaN(lng)) return null;
    return [lat, lng];
  }, [ubicacionGps]);

  return (
    <>
      <h2 className="titulo-seccion">Paso 1: Información General</h2>
      <div className="paso1-contenido">
        <div className="info-izquierda">
          <p><strong>ID Solicitud:</strong> {idSolicitudServicio}</p>
          <p><strong>Nombre Cliente:</strong> {nombre}</p>
          <p><strong>Tipo Cliente:</strong> {tipoCliente}</p>
          <p><strong>Correo:</strong> {correo}</p>
          <p><strong>Telefono:</strong> {telefono}</p>
          <p><strong>Estado:</strong> {estado}</p>
          <p><strong>Dirección:</strong> {direccionEscrita}</p>
          <p><strong>Ubicación GPS:</strong> {ubicacionGps}</p>

          {/* Campo Requiere Certificado (agrupado correctamente) */}
          <div className="campo-certificado">
            <label htmlFor="requiereCertificado"><strong>¿Requiere Certificado?</strong></label>
            <select
              id="requiereCertificado"
              value={requiereCertificado}
              onChange={(e) => setRequiereCertificado(e.target.value)}
            >
              <option value="Sí">Sí</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>

        <div className="mapa-derecha">
          {coords ? (
            <MapContainer
              center={coords}
              zoom={16}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={coords}>
                <Popup>Ubicación del servicio</Popup>
              </Marker>
            </MapContainer>
          ) : (
            <p>No se pudo cargar la ubicación GPS válida.</p>
          )}
        </div>
      </div>
    </>
  );

};



const GestionarTareaTrabajadores = () => {
  const { idSolicitudServicio } = useParams();
  const [step, setStep] = useState(1);
  const [solicitud, setSolicitud] = useState(null);
  const [requiereCertificado, setRequiereCertificado] = useState('No');

  useEffect(() => {
    fetch(`http://localhost:8081/solicitud_servicio_detallado/${idSolicitudServicio}`)
      .then((r) => r.json())
      .then((data) => {
        setSolicitud(data);
        setRequiereCertificado(data.requiereCertificado ? 'Sí' : 'No');
      })
      .catch(console.error);
  }, [idSolicitudServicio]);

  if (!solicitud) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <p>Cargando solicitud...</p>
      </div>
    );
  }


  return (
    <div className="contenedor-principal">
      <h1>Solicitud de Sercivio #{idSolicitudServicio}</h1>
      <div className="step-indicator">
        {[1, 2, 3].map((n) => (
          <div key={n} className={`circle ${step === n ? 'active' : ''}`}>{n}</div>
        ))}
      </div>

      <div className="step-content animate-step">
        {step === 1 && (
          <Paso1
            solicitud={solicitud}
            requiereCertificado={requiereCertificado}
            setRequiereCertificado={setRequiereCertificado}
          />
        )}
        {step === 2 && <p>Paso 2: Detalles de la tarea.</p>}
        {step === 3 && <p>Paso 3: Confirmación Final.</p>}
      </div>

      <div className="navigation-buttons">
        <button disabled={step === 1} onClick={() => setStep(step - 1)}>
          <FaArrowLeft /> Anterior
        </button>
        <button disabled={step === 3} onClick={() => setStep(step + 1)}>
          Siguiente <FaArrowRight />
        </button>
      </div>

      <div className="action-buttons">
        <button
          onClick={() => console.log('Enviar certificado:', requiereCertificado)}
          disabled={step !== 3}
          className={`confirm-button ${step === 3 ? 'active' : 'disabled'}`}
        >
          Confirmar
        </button>
      </div>
    </div>
  );
};

export default GestionarTareaTrabajadores;
