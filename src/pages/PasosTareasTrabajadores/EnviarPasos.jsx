import React, { useEffect, useState } from "react";
import axios from "axios";

const EnviarPasos = ({ datosFinales }) => {
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const enviarDatos = async () => {
      try {
        const res = await axios.post("http://localhost:8081/enviar_datos_completos_SS", datosFinales, {
          withCredentials: true,
        });
        setMensaje("✅ Todos los pasos realizados con éxito.");
        setError(null);
      } catch (err) {
        console.error("❌ Error en el proceso:", err);
        setError(err.message || "Error desconocido");
        setMensaje("❌ Hubo un error al realizar los pasos.");
      }
    };

    enviarDatos();
  }, [datosFinales]);

  return (
    <div className="resultado-envio">
      <h2>{mensaje}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default EnviarPasos;