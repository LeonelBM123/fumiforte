import React, { useEffect, useState } from "react";
import axios from "axios";

const EnviarPasos = ({ datosFinales }) => {
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const enviarDatos = async () => {
      try {
        // 1. Obtener ID del usuario (Gerente)
        const userRes = await fetch("http://localhost:8081/get_iduser", {
          method: "GET",
          credentials: "include",
        });

        if (!userRes.ok) throw new Error("Error al obtener el ID del usuario");
        const userData = await userRes.json();
        const idGerenteObtenido = userData.userId;
        if (!idGerenteObtenido) throw new Error("ID del gerente inválido");


        // 2. Crear Cotización
        const cotizacionPayload = {
          fecha: new Date().toISOString().split("T")[0],
          costoCotizacion: datosFinales.montoPendienteCotizacion,
          solicitudServicio: { idSolicitudServicio: datosFinales.idSolicitudServicio },
          gerente: { idGerente: idGerenteObtenido },
        };

        await axios.post("http://localhost:8081/cotizar/crear_cotizacion", cotizacionPayload, {
        withCredentials: true
        });

        // 3. Crear sesiones y asignar trabajadores
        for (const sesionData of datosFinales.sesiones) {
          const sesionPayload = {
            fecha: sesionData.fecha,
            hora: sesionData.hora,
            montoPendienteSesion: sesionData.monto,
            estado: "Pendiente",
            nroSesion: sesionData.sesion,
            solicitudServicio: { idSolicitudServicio: datosFinales.idSolicitudServicio },
          };

          const resSesion = await axios.post("http://localhost:8081/sesion/crear", sesionPayload, {
            withCredentials: true
            });
          const idSesion = resSesion.data.idSesion;

          // Guardar el idSesion para usos futuros si quieres
          sesionData.idSesion = idSesion;

          // 4. Asignar trabajadores a la sesión
          for (const idTrabajador of sesionData.trabajadores) {
            const participaPayload = {
                idSesion: idSesion,
                idTrabajador: idTrabajador,
            };

            await axios.post("http://localhost:8081/participa/crear", participaPayload, {
            withCredentials: true
            });
          }
        }

        // 5. Crear pagos
        const pagosCreados = []; // { idPago, tipo }

        // Pago cotización si montoPendienteCotizacion > 0
        if (datosFinales.montoPendienteCotizacion > 0) {
          const pagoCotizacionPayload = {
            fecha: null,
            monto: datosFinales.montoPendienteCotizacion,
            tipoPago: null,
            nroVoucher: null,
            cliente: {
                idCliente: datosFinales.idCliente
            },
            estado: "Inpaga",
          };

          const resPagoCotizacion = await axios.post("http://localhost:8081/pagar/crear_pago", pagoCotizacionPayload, {
            withCredentials: true
            });
          pagosCreados.push({
            idPago: resPagoCotizacion.data.idPago,
            tipo: "cotizacion",
          });
        }

        // Pago por cada sesión
        for (const sesionData of datosFinales.sesiones) {
          if (sesionData.monto > 0) {
            const pagoSesionPayload = {
              fecha: null,
              monto: sesionData.monto,
              tipoPago: null,
              nroVoucher: null,
              cliente: {
                idCliente: datosFinales.idCliente
              },
              estado: "Inpaga",
            };

            const resPagoSesion = await axios.post("http://localhost:8081/pagar/crear_pago", pagoSesionPayload, {
            withCredentials: true
            });
            pagosCreados.push({
              idPago: resPagoSesion.data.idPago,
              tipo: "sesion",
              idSesion: sesionData.idSesion || null,
            });
          }
        }

        // 6. Crear las tuplas en pagoCotizacion o pagoSesion
        for (const pago of pagosCreados) {
            if (pago.tipo === "cotizacion") {
                const payloadCotizacion = {
                    pago: { idPago: pago.idPago },
                    idSolicitudServicio: datosFinales.idSolicitudServicio,
                };
                await axios.post("http://localhost:8081/pagar_cotizacion/crear_pago_cotizacion", payloadCotizacion, {
                    withCredentials: true,
                });
            } else if (pago.tipo === "sesion") {
                const payloadSesion = {
                    pago: { idPago: pago.idPago },
                    idSesion: pago.idSesion,
                };
                await axios.post("http://localhost:8081/pagar_sesion/crear_pago_sesion", payloadSesion, {
                    withCredentials: true,
                });
            }
        }



        // 7. Chequear y crear certificado si no existe, luego ligar a la solicitud
        // Obtener la solicitud para chequear idCertificado
        const solicitudRes = await fetch(
          `http://localhost:8081/solicitudes/${datosFinales.idSolicitudServicio}`
        , {
        withCredentials: true
        });
        if (!solicitudRes.ok) throw new Error("Error al obtener la solicitud de servicio");
        const solicitudData = await solicitudRes.json();

        if (!solicitudData.idCertificado) {
          // Crear certificado nuevo
          const certResponse = await fetch("http://localhost:8081/gerente/crear_certificado", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fechaEmision: null,
              fechaVencimiento: null,
              estado: "Pendiente",
            }),
          });
          if (!certResponse.ok) throw new Error("Error al crear certificado");
          const certData = await certResponse.json();

          // Ahora hacer PUT para ligar el certificado a la solicitud
          const updateSolicitudPayload = {
            ...solicitudData,
            idCertificado: certData.idCertificado,
          };

          const putRes = await fetch(
            `http://localhost:8081/solicitudes/${datosFinales.idSolicitudServicio}`,
            {
              method: "PUT",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updateSolicitudPayload),
            }
          );
          if (!putRes.ok) throw new Error("Error al actualizar la solicitud con certificado");
        }

        setMensaje("✅ Todos los pasos realizados con éxito.");
      } catch (err) {
        console.error("❌ Error en el proceso:", err);
        setError(err.message);
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
