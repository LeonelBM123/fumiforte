import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dineroIcono from "../assets/dinero_icono.png";
import qrIcono from "../assets/QR_icono.png";
import qrPago from "../assets/QR_pago.jpg";
import "../styles/PagoUser.css";

const PagoCotizacion = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { idSolicitudServicio, montoCotizacion, userId } = location.state || {};

  const [vistaPago, setVistaPago] = useState("metodo");
  const [botonActivo, setBotonActivo] = useState(false);

  const generarMensaje = () => {
    return (
      `COMPROBANTE DE PAGO - COTIZACIÓN\n` +
      ` - ID Cliente: ${userId}\n` +
      ` - ID Solicitud: ${idSolicitudServicio}\n\n` +
      `Monto Cotización: Bs ${montoCotizacion}\n` +
      `---------------------------\n` +
      `TOTAL: Bs ${montoCotizacion}`
    );
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

  if (vistaPago === "metodo") {
    return (
      <div className="ventana-pago">
        <h2>Selecciona Método de Pago</h2>
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <img src={dineroIcono} alt="Efectivo" style={{ width: "120px" }} />
            <br />
            <button
              onClick={() =>
                alert("Gracias por solicitar nuestros servicios") || navigate("/userlayout")
              }
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
          <h3>Total: Bs {montoCotizacion}</h3>
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
            onClick={() =>
              alert("Gracias por solicitar nuestros servicios") || navigate("/userlayout")
            }
          >
            Ya realicé el pago
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default PagoCotizacion;
