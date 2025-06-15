import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import '../styles/TareaTrabajadores.css';
import '../styles/Loader.css';

import Paso1TT from './PasosTareasTrabajadores/Paso1TT';
import Paso2TT from './PasosTareasTrabajadores/Paso2TT';
import Paso3TT from './PasosTareasTrabajadores/Paso3TT';

const GestionarTareaTrabajadores = () => {
  const { idSolicitudServicio } = useParams();
  const [step, setStep] = useState(1);
  const [requiereCertificado, setRequiereCertificado] = useState("No");
  const [datosFormulario, setDatosFormulario] = useState({});
  const [solicitud, setSolicitud] = useState(null);

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

  const renderPaso = () => {
    switch (step) {
      case 1:
        return (
          <Paso1TT
            solicitud={solicitud}
            requiereCertificado={requiereCertificado}
            setRequiereCertificado={setRequiereCertificado}
            avanzarPaso={(datos) => {
              setDatosFormulario(datos);
              setStep(2);
            }}
          />
        );
      case 2:
        return (
          <Paso2TT
            datosPrevios={datosFormulario}
            setDatosCompletos={(datos) => setDatosFormulario(datos)}
            cambiarPaso={setStep}
          />
        );
      case 3:
        return (
          <Paso3TT datosFinales={datosFormulario} 
          cambiarPaso={setStep}
          />
          
        );
      default:
        return null;
    }
  };

  return (
    <div className="contenedor-principal">
      <h1>Solicitud de Servicio #{idSolicitudServicio}</h1>

      <div className="step-indicator">
        {[1, 2, 3].map((n) => (
          <div key={n} className={`circle ${step === n ? 'active' : ''}`}>{n}</div>
        ))}
      </div>

      <div className="step-content animate-step">
        {renderPaso()}
      </div>

      
    </div>
  );
};

export default GestionarTareaTrabajadores;
