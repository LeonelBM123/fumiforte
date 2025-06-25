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
          `https://fumifortebe-gxhg.onrender.com/solicitudes/monto_pendiente/${userId}/${idSolicitudServicio}`
        );
        const data = await res.json();
        console.log("DATA RECIBIDA DEL BACKEND:", data);

        // Mapear sesiones con monto y estado
        const sesionesValidas = data.montosPendientesSesion
        .map((monto, index) => ({
          monto,
          estado: data.estadosSesiones[index],
          idSesion: index + 1, // simulación
          sesion: index + 1    // número de sesión
        }))
        .filter(sesion => sesion.estado === "Realizado" && sesion.monto > 0);
        // Chequear si hay cotizacion con monto > 0
        const montoCotizacion = parseFloat(data.montoPendienteCotizacion);
        const hayCotizacion = parseFloat(data.montoPendienteCotizacion) > 0;
        const haySesionesConMonto = sesionesValidas.some(sesion => sesion.monto > 0);

        if (!hayCotizacion && !haySesionesConMonto) {
          setVistaPago("nada");
          return;
        }

        // Guardamos datos para mostrar en UI
        setDatos({
          idCliente: data.idCliente,
          idSolicitudServicio: data.idSolicitudServicio,
          montoPendienteCotizacion: montoCotizacion,
          sesionesValidas,
        });


        setSeleccionados({
          cotizacion: false,
          sesiones: Array(sesionesValidas.length).fill(false),
        });
      } catch (err) {
        console.error("Error al obtener montos:", err);
      }
    };

    if (userId && idSolicitudServicio) {
      obtenerMontos();
    }
  }, [userId, idSolicitudServicio]);

  // Cambiar selección de cotización solo si hay monto > 0
  const toggleCotizacion = () => {
    if (datos.montoPendienteCotizacion <= 0) return; // nada que seleccionar
    setSeleccionados(prev => ({ ...prev, cotizacion: !prev.cotizacion }));
  };

  // Cambiar selección de sesión
  const toggleSesion = index => {
    setSeleccionados(prev => {
      const nuevasSesiones = [...prev.sesiones];
      nuevasSesiones[index] = !nuevasSesiones[index];
      return { ...prev, sesiones: nuevasSesiones };
    });
  };

  // Calcular total según selección
  const calcularTotal = () => {
    if (!datos) return 0;
    let total = 0;
    if (seleccionados.cotizacion) total += datos.montoPendienteCotizacion;
    seleccionados.sesiones.forEach((sel, i) => {
      if (sel) total += datos.sesionesValidas[i].monto;
    });
    return total.toFixed(2);
  };

  // Generar mensaje para WhatsApp
  const generarMensaje = () => {
  let mensaje = `COMPROBANTE DE PAGO\n` +
                ` - ID Cliente: ${datos.idCliente}\n` +
                ` - ID Solicitud: ${datos.idSolicitudServicio}\n`;

  if (seleccionados.cotizacion) {
    mensaje += `Cotización - Bs ${datos.montoPendienteCotizacion}\n`;
  }

  seleccionados.sesiones.forEach((sel, i) => {
    if (sel) {
      const sesion = datos.sesionesValidas[i];
      mensaje += ` - ID Sesión: ${sesion.idSesion}\n`;
      mensaje += `Sesión #${sesion.sesion} - Bs ${sesion.monto}\n`;
    }
  });

  mensaje += "---------------------------\n";
  mensaje += `TOTAL: Bs ${calcularTotal()}`;

  return mensaje;
};

  // Manejar click en pago QR
  const manejarPagoQR = () => {
    setVistaPago("qr");
    setBotonActivo(false);
    setTimeout(() => setBotonActivo(true), 20000); // Botón activo después de 20 seg
  };

  // Mandar mensaje por WhatsApp con comprobante
  const mandarWhatsapp = () => {
    const mensaje = encodeURIComponent(generarMensaje());
    window.open(`https://wa.me/59178130022?text=${mensaje}`, "_blank");
  };

  // Validaciones y renders
  if (!idSolicitudServicio || !userId) {
    return <div className="ventana-pago">No se recibieron los datos necesarios para continuar.</div>;
  }

  if (!datos) return <div className="ventana-pago">Cargando montos...</div>;

  if (vistaPago === "nada") {
    return (
      <div className="ventana-pago">
        <h2>Pagos Pendientes - Solicitud #{idSolicitudServicio}</h2>
        <p>No tienes nada pendiente por pagar.</p>
        <button onClick={() => navigate("/userlayout")} className="btn-volver">
          Volver
        </button>
      </div>
    );
  }

  if (vistaPago === "seleccion") {
    return (
      <div className="ventana-pago">
        <h2>Pagos Pendientes - Solicitud #{idSolicitudServicio}</h2>
        <div className="lista-pagos">
          {parseFloat(datos.montoPendienteCotizacion) > 0 && (
            <label>
              <input
                type="checkbox"
                checked={seleccionados.cotizacion}
                onChange={toggleCotizacion}
              />
              Cotización - Bs {datos.montoPendienteCotizacion}
            </label>
          )}
          {datos.sesionesValidas.map((sesion, index) => (
            <label key={index}>
              <input
                type="checkbox"
                checked={seleccionados.sesiones[index]}
                onChange={() => toggleSesion(index)}
              />
              Sesión {index + 1} - Bs {sesion.monto}
            </label>
          ))}
        </div>
        <hr />
        <h3>Total: Bs {calcularTotal()}</h3>
        <div className="acciones-pago">
          <button
            onClick={() => {
              if (calcularTotal() === "0.00") {
                alert("Debes seleccionar al menos un ítem para pagar.");
                return;
              }
              setVistaPago("metodo");
            }}
            className="btn-pagar"
          >
            Pagar
          </button>
          <button onClick={() => navigate("/userlayout")} className="btn-volver">
            Volver
          </button>
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
            <button onClick={manejarPagoQR} className="btn-volver">
              Pagar QR
            </button>
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
          <br />
          <br />
          <button className="btn-volver" onClick={mandarWhatsapp}>
            Mandar Comprobante
          </button>
          <br />
          <br />
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
