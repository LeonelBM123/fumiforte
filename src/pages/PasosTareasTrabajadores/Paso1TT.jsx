import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/Paso1TT.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});



const Paso1TT = ({
  solicitud,
  requiereCertificado,
  setRequiereCertificado,
  avanzarPaso,
}) => {
  const {
    idSolicitudServicio,
    idCliente,
    nombre,
    tipoCliente,
    correo,
    telefono,
    estado,
    direccionEscrita,
    ubicacionGps,
  } = solicitud;

  const navigate = useNavigate();

  const salir = () => {
    navigate('/adminlayout')
  };

  const coords = React.useMemo(() => {
    if (!ubicacionGps) return null;
    const parts = ubicacionGps.split(',');
    if (parts.length !== 2) return null;
    const lat = parseFloat(parts[0].trim());
    const lng = parseFloat(parts[1].trim());
    if (isNaN(lat) || isNaN(lng)) return null;
    return [lat, lng];
  }, [ubicacionGps]);

  const handleContinuar = () => {
    avanzarPaso({
      idSolicitudServicio,
      idCliente,
      requiereCertificado,
    });
  };

  return (
    <div className="paso1-contenido">
      <div className="info-izquierda">
        <p><strong>ID Solicitud:</strong> {idSolicitudServicio}</p>
        <p><strong>ID Cliente:</strong> {idCliente}</p>
        <p><strong>Nombre Cliente:</strong> {nombre}</p>
        <p><strong>Tipo Cliente:</strong> {tipoCliente}</p>
        <p><strong>Correo:</strong> {correo}</p>
        <p><strong>Teléfono:</strong> {telefono}</p>
        <p><strong>Estado:</strong> {estado}</p>
        <p><strong>Dirección:</strong> {direccionEscrita}</p>
        <p><strong>Ubicación GPS:</strong> {ubicacionGps}</p>

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

      <div className="botones">
          <button className="btn-salir" onClick={salir}>Salir</button>
          <button className="btn-continuar" onClick={handleContinuar}>Continuar →</button>
      </div>
      
    </div>
  );
};

export default Paso1TT;
