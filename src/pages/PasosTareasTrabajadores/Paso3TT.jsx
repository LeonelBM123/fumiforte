import React, { useState, useEffect } from 'react';
import '../../styles/Paso3TT.css';
import EnviarPasos from './EnviarPasos'; // ¡Importante!

const Paso3TT = ({ datosFinales, cambiarPaso }) => {
  const { idSolicitudServicio, idCliente, requiereCertificado, sesiones = [] } = datosFinales;

  const [montoPendienteCotizacion, setMontoPendienteCotizacion] = useState(0);
  const [montoPendienteSesion, setMontoPendienteSesion] = useState({});
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [jsonFinal, setJsonFinal] = useState(null);

  useEffect(() => {
    const nuevosMontos = {};
    sesiones.forEach(({ sesion }) => {
      if (!(sesion in montoPendienteSesion)) {
        nuevosMontos[sesion] = 0;
      }
    });
    setMontoPendienteSesion((prev) => ({ ...nuevosMontos, ...prev }));
  }, [sesiones]);

  const handleMontoSesionChange = (sesion, valor) => {
    setMontoPendienteSesion((prev) => ({
      ...prev,
      [sesion]: parseFloat(valor) || 0,
    }));
  };

  const handleVerResumen = () => {
    let resumen = `Solicitud de Servicio #${idSolicitudServicio}\n`;
    resumen += `ID Cliente #${idCliente}\n`;
    resumen += `Requiere Certificado: ${requiereCertificado}\n`;
    resumen += `Monto Cotización: ${montoPendienteCotizacion}\n`;
    resumen += `Nro Sesiones: ${sesiones.length}\n`;

    sesiones.forEach(({ sesion, trabajadores, fecha, hora }) => {
      resumen += `\nSesión ${sesion}:\n`;
      resumen += `Fecha: ${fecha || "No asignada"}\n`;
      resumen += `Hora: ${hora || "No asignada"}\n`;
      trabajadores.forEach(idTrabajador => {
        resumen += `idTrabajador: ${idTrabajador}\n`;
      });
      resumen += `Monto Sesión: ${montoPendienteSesion[sesion] || 0}\n`;
    });

    alert(resumen);
  };

  const handleConfirmar = () => {
    // Muestra el mensaje de confirmación
    setMostrarConfirmacion(true);
  };

  const confirmarEnvioFinal = () => {
    const finalJson = {
      idSolicitudServicio,
      idCliente,
      requiereCertificado,
      montoPendienteCotizacion: parseFloat(montoPendienteCotizacion) || 0,
      sesiones: sesiones.map(({ sesion, trabajadores, fecha, hora }) => ({
        sesion,
        trabajadores,
        fecha,
        hora,
        monto: montoPendienteSesion[sesion] || 0,
      })),
    };

    setJsonFinal(finalJson);
    console.log(finalJson);
    setConfirmado(true);
    setMostrarConfirmacion(false); // ocultamos la confirmación
  };

  return (
    <div className="paso3-contenido">
      <h2 className="titulo">Resumen y Montos</h2>

      {!confirmado ? (
        <>
          <div className="campo">
            <label>Monto Cotización General:</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={montoPendienteCotizacion}
              onChange={(e) => setMontoPendienteCotizacion(e.target.value)}
            />
          </div>

          {sesiones.map(({ sesion }) => (
            <div key={sesion} className="campo">
              <label>Monto Sesión {sesion}:</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={montoPendienteSesion[sesion] ?? 0}
                onChange={(e) => handleMontoSesionChange(sesion, e.target.value)}
              />
            </div>
          ))}

          <div className="botones-finales">
            <button className="btn btn-atras" onClick={() => cambiarPaso(2)}>← Volver al paso anterior</button>
            <button className="btn btn-resumen" onClick={handleVerResumen}>📋 Ver Resumen</button>
            <button className="btn btn-confirmar" onClick={handleConfirmar}>✅ Confirmar</button>
          </div>

          {mostrarConfirmacion && (
            <div className="confirmacion-box">
              <h3>¿Estás seguro de enviar la solicitud?</h3>
              <button className="btn btn-resumen" onClick={handleVerResumen}>📋 Ver Resumen</button>
              <button className="btn btn-confirmar" onClick={confirmarEnvioFinal}>✅ Confirmar Envío</button>
            </div>
          )}
        </>
      ) : (
        <EnviarPasos datosFinales={jsonFinal} />
      )}
    </div>
  );
};

export default Paso3TT;
