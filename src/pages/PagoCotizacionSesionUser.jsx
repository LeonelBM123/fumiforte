import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dineroIcono from "../assets/dinero_icono.png";
import qrIcono from "../assets/QR_icono.png";
import qrPago from "../assets/QR_pago.jpg";
import "../styles/PagoUser.css";

const PagoCotizacionSesionUser = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { idSolicitudServicio, userId } = location.state || {};

  const [datos, setDatos] = useState(null);
  const [seleccionados, setSeleccionados] = useState({ cotizacion: false, sesiones: [] });
  const [vistaPago, setVistaPago] = useState("seleccion");
  const [botonActivo, setBotonActivo] = useState(false);

  useEffect(() => {
    const obtenerMontos = async () => {
      try {
        const res = await fetch(
          `http://localhost:8081/solicitudes/monto_pendiente/${userId}/${idSolicitudServicio}`
        );
        const data = await res.json();
        setDatos(data);
        setSeleccionados({
          cotizacion: false,
          sesiones: Array(data.montosPendientesSesion.length).fill(false),
        });
      } catch (err) {
        console.error("Error al obtener montos:", err);
      }
    };

    if (userId && idSolicitudServicio) {
      obtenerMontos();
    }
  }, [userId, idSolicitudServicio]);

  const toggleCotizacion = () => {
    setSeleccionados((prev) => ({ ...prev, cotizacion: !prev.cotizacion }));
  };

  const toggleSesion = (index) => {
    setSeleccionados((prev) => {
      const nuevasSesiones = [...prev.sesiones];
      nuevasSesiones[index] = !nuevasSesiones[index];
      return { ...prev, sesiones: nuevasSesiones };
    });
  };

  const calcularTotal = () => {
    if (!datos) return 0;
    let total = 0;
    if (seleccionados.cotizacion) total += datos.montoPendienteCotizacion;
    seleccionados.sesiones.forEach((sel, i) => {
      if (sel) total += datos.montosPendientesSesion[i];
    });
    return total.toFixed(2);
  };

  const generarMensaje = () => {
    let mensaje = "";
    if (seleccionados.cotizacion) mensaje += `Cotización - Bs ${datos.montoPendienteCotizacion}\n`;
    seleccionados.sesiones.forEach((sel, i) => {
      if (sel) mensaje += `Sesión ${i + 1} - Bs ${datos.montosPendientesSesion[i]}\n`;
    });
    mensaje += "---------------------------\n";
    mensaje += `TOTAL: Bs ${calcularTotal()}`;
    return mensaje;
  };

  const manejarPagoQR = () => {
    setVistaPago("qr");
    setTimeout(() => setBotonActivo(true), 20000);
  };

  const mandarWhatsapp = () => {
    const mensaje = encodeURIComponent(generarMensaje());
    window.open(`https://wa.me/59178130022?text=${mensaje}`, "_blank");
  };

  if (!idSolicitudServicio || !userId) {
    return <div className="ventana-pago">No se recibieron los datos necesarios para continuar.</div>;
  }

  if (!datos) return <div className="ventana-pago">Cargando montos...</div>;

  if (vistaPago === "seleccion") {
    return (
      <div className="ventana-pago">
        <h2>Pagos Pendientes - Solicitud #{idSolicitudServicio}</h2>
        <div className="lista-pagos">
          <label>
            <input
              type="checkbox"
              checked={seleccionados.cotizacion}
              onChange={toggleCotizacion}
            />
            Cotización - Bs {datos.montoPendienteCotizacion}
          </label>
          {datos.montosPendientesSesion.map((monto, index) => (
            <label key={index}>
              <input
                type="checkbox"
                checked={seleccionados.sesiones[index]}
                onChange={() => toggleSesion(index)}
              />
              Sesión {index + 1} - Bs {monto}
            </label>
          ))}
        </div>
        <hr />
        <h3>Total: Bs {calcularTotal()}</h3>
        <div className="acciones-pago">
          <button onClick={() => setVistaPago("metodo")} className="btn-pagar">Pagar</button>
          <button onClick={() => navigate("/userlayout")} className="btn-volver">Volver</button>
        </div>
      </div>
    );
  }

  if (vistaPago === "metodo") {
    return (
      <div className="ventana-pago">
        <h2>Selecciona Método de Pago</h2>
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <img src={dineroIcono} alt="Efectivo" style={{ width: "120px" }} />
            <br />
            <button
              onClick={() => alert("Gracias por solicitar nuestros servicios") || navigate("/userlayout")}
              className="btn-pagar"
            >
              Pagar Efectivo
            </button>
          </div>
          <div style={{ textAlign: "center" }}>
            <img src={qrIcono} alt="QR" style={{ width: "120px", height: "120px" }} />
            <br />
            <button onClick={manejarPagoQR} className="btn-volver">Pagar QR</button>
          </div>
        </div>
      </div>
    );
  }

  if (vistaPago === "qr") {
    return (
      <div className="ventana-pago">
        <h2>Escanea el código QR</h2>
        <div style={{ textAlign: "center" }}>
          <img src={qrPago} alt="QR de pago" style={{ width: "400px", margin: "20px 0" }} />
          <h3>Total: Bs {calcularTotal()}</h3>
          <button
            className="btn-pagar"
            onClick={() => {
              const link = document.createElement("a");
              link.href = qrPago;
              link.download = "QR_pago.png";
              link.click();
            }}
          >
            Descargar Imagen
          </button>
          <br /><br />
          <button className="btn-volver" onClick={mandarWhatsapp}>Mandar Comprobante</button>
          <br /><br />
          <button
            className="btn-pagar"
            disabled={!botonActivo}
            onClick={() => alert("Gracias por solicitar nuestros servicios") || navigate("/userlayout")}
          >
            Ya realicé el pago
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default PagoCotizacionSesionUser;