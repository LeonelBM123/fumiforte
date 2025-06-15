import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/Paso2TT.css";

const Paso2TT = ({ datosPrevios, setDatosCompletos, cambiarPaso }) => {
  const [trabajadores, setTrabajadores] = useState([]);
  const [nroSesiones, setNroSesiones] = useState(1);
  const [sesionActual, setSesionActual] = useState(1);
  const [trabajadoresPorSesion, setTrabajadoresPorSesion] = useState({});
  const [fechasHorasPorSesion, setFechasHorasPorSesion] = useState({});

  useEffect(() => {
    axios
      .get("http://localhost:8081/listar_trabajadores_activos")
      .then((res) => setTrabajadores(res.data))
      .catch((err) => console.error("Error al obtener trabajadores:", err));
  }, []);

  useEffect(() => {
    const nuevasSesiones = {};
    const nuevasFechas = {};
    for (let i = 1; i <= nroSesiones; i++) {
      nuevasSesiones[i] = new Set();
      nuevasFechas[i] = { fecha: "", hora: "" };
    }
    setTrabajadoresPorSesion(nuevasSesiones);
    setFechasHorasPorSesion(nuevasFechas);
    setSesionActual(1);
  }, [nroSesiones]);

  const handleCheckboxChange = (idTrabajador) => {
    setTrabajadoresPorSesion((prev) => {
      const nuevaSesion = new Set(prev[sesionActual]);
      if (nuevaSesion.has(idTrabajador)) {
        nuevaSesion.delete(idTrabajador);
      } else {
        nuevaSesion.add(idTrabajador);
      }
      return { ...prev, [sesionActual]: nuevaSesion };
    });
  };

  const handleFechaHoraChange = (campo, valor) => {
    setFechasHorasPorSesion((prev) => ({
      ...prev,
      [sesionActual]: {
        ...prev[sesionActual],
        [campo]: valor,
      },
    }));
  };

  const pasoAnterior = () => {
    cambiarPaso(1);
  };

  const sesionAnterior = () => {
    if (sesionActual > 1) {
      setSesionActual(sesionActual - 1);
    }
  };

  const sesionSiguiente = () => {
    if (sesionActual < nroSesiones) {
      setSesionActual(sesionActual + 1);
    }
  };

  const puedeContinuar = () => {
    if (sesionActual !== nroSesiones) return false;

    for (let i = 1; i <= nroSesiones; i++) {
      if (
        !trabajadoresPorSesion[i] ||
        trabajadoresPorSesion[i].size === 0 ||
        !fechasHorasPorSesion[i]?.fecha ||
        !fechasHorasPorSesion[i]?.hora
      ) {
        return false;
      }
    }

    return true;
  };

  const continuar = () => {
    const sesiones = [];

    for (let i = 1; i <= nroSesiones; i++) {
      sesiones.push({
        sesion: i,
        trabajadores: Array.from(trabajadoresPorSesion[i] || []),
        fecha: fechasHorasPorSesion[i]?.fecha || "",
        hora: fechasHorasPorSesion[i]?.hora || ""
      });
    }

    const datosFinales = {
      ...datosPrevios,
      sesiones,
    };

    setDatosCompletos(datosFinales);
    cambiarPaso(3);
  };

  return (
    <div className="contenedor-paso2">
      <div className="header-sesiones">
        <label htmlFor="nroSesiones">Nro Sesiones:</label>
        <select
          id="nroSesiones"
          value={nroSesiones}
          onChange={(e) => setNroSesiones(parseInt(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <h2>Sesión {sesionActual}</h2>

      <div className="inputs-fecha-hora">
        <label>Fecha:</label>
        <input
          type="date"
          value={fechasHorasPorSesion[sesionActual]?.fecha || ""}
          onChange={(e) => handleFechaHoraChange("fecha", e.target.value)}
        />

        <label>Hora:</label>
        <input
          type="time"
          value={fechasHorasPorSesion[sesionActual]?.hora || ""}
          onChange={(e) => handleFechaHoraChange("hora", e.target.value)}
        />
      </div>

      <table className="tabla-trabajadores">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th>Especialidad</th>
            <th>Asignar</th>
          </tr>
        </thead>
        <tbody>
          {trabajadores.map((t) => (
            <tr key={t.idTrabajador}>
              <td>{t.idTrabajador}</td>
              <td>{t.nombreCompleto}</td>
              <td>{t.telefono}</td>
              <td>{t.correo}</td>
              <td>{t.especialidad}</td>
              <td>
                <input
                  type="checkbox"
                  checked={
                    trabajadoresPorSesion[sesionActual]?.has(t.idTrabajador) || false
                  }
                  onChange={() => handleCheckboxChange(t.idTrabajador)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="botones-paso2">
        <button className="btn" onClick={pasoAnterior}>
          ← Paso anterior
        </button>

        {nroSesiones > 1 && (
          <>
            <button
              className="btn"
              onClick={sesionAnterior}
              disabled={sesionActual === 1}
            >
              ← Sesión anterior
            </button>

            <button
              className="btn"
              onClick={sesionSiguiente}
              disabled={sesionActual === nroSesiones}
            >
              Siguiente sesión →
            </button>
          </>
        )}

        <button
          className="btn continuar"
          onClick={continuar}
          disabled={!puedeContinuar()}
        >
          ✅ Continuar →
        </button>
      </div>
    </div>
  );
};

export default Paso2TT;
