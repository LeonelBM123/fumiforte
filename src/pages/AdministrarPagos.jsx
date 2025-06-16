import React, { useEffect, useState } from 'react';
import axios from 'axios';

const limpiarTexto = (texto) => {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const AdministrarPagos = () => {
  const [pagos, setPagos] = useState([]);
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    cargarPagos();
  }, []);

  const cargarPagos = () => {
    axios.get('https://fumifortebe-gxhg.onrender.com/pagar/listar_pagos_ext', { withCredentials: true })
      .then(res => setPagos(res.data))
      .catch(err => console.error(err));
  };

  const abrirModal = (pago) => {
    setPagoSeleccionado(pago);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setPagoSeleccionado(null);
  };

  const actualizarMontoCotizacion = async (idSolicitud) => {
    try {
      await axios.put(`https://fumifortebe-gxhg.onrender.com/solicitudes/actualizar_monto/${idSolicitud}`, {
        montoPendienteCotizacion: "0"
      });
    } catch (error) {
      console.error('Error actualizando monto cotización:', error);
      throw error;
    }
  };

  const actualizarMontoSesion = async (idSesion) => {
    try {
      await axios.put(`https://fumifortebe-gxhg.onrender.com/sesion/actualizar_monto/${idSesion}`, {
        monto: "0"
      });
    } catch (error) {
      console.error('Error actualizando monto sesión:', error);
      throw error;
    }
  };

  const actualizarPago = async (pagoActualizado) => {
    try {
      await axios.put(
        `https://fumifortebe-gxhg.onrender.com/pagar/actualizar_pago/${pagoSeleccionado.idPago}`,
        pagoActualizado,
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error actualizando pago:', error);
      throw error;
    }
  };

  const confirmarEdicion = async () => {
  if (!pagoSeleccionado) return;

  if (pagoSeleccionado.estado !== "Pagado") {
    alert("Debes cambiar el estado a 'Pagado' para confirmar el pago.");
    return;
  }

    const confirmar = window.confirm("¿Confirmar pago?");
        if (!confirmar) return;

        try {
            // Armar objeto solo con campos necesarios
            const pagoParaActualizar = {
            fecha: pagoSeleccionado.fecha,
            estado: "Pagado",
            tipoPago: pagoSeleccionado.tipoPago,
            monto: Number(pagoSeleccionado.monto) || 0,
            };

            // Solo incluir nroVoucher si no está vacío o solo espacios
            if (pagoSeleccionado.nroVoucher && pagoSeleccionado.nroVoucher.trim() !== '') {
            pagoParaActualizar.nroVoucher = pagoSeleccionado.nroVoucher.trim();
            }

            const tipoServicioLimpio = limpiarTexto(pagoSeleccionado.tipoServicio || '');

            if (tipoServicioLimpio === "cotizacion") {
            await actualizarMontoCotizacion(pagoSeleccionado.idSolicitudServicio);
            } else if (tipoServicioLimpio === "sesion") {
            await actualizarMontoSesion(pagoSeleccionado.idSesion);
            }

            await actualizarPago(pagoParaActualizar);

            alert("Pago actualizado correctamente.");
            cerrarModal();
            cargarPagos();
        } catch (error) {
            console.error(error);
            alert("Error al actualizar pago. Revisa la consola.");
        }
    };

  return (
    <div className="contenedor-pagos">
      <h2>Administrar Pagos</h2>
      <div className="tabla-scroll">
        <table className="tabla-pagos">
          <thead>
            <tr>
              <th>ID Pago</th>
              <th>ID Cliente</th>
              <th>Nombre Cliente</th>
              <th>Tipo Cliente</th>
              <th>Tipo Servicio</th>
              <th>ID Solicitud Servicio</th>
              <th>ID Sesión</th>
              <th>Fecha Pago</th>
              <th>Tipo Pago</th>
              <th>Nro Voucher</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((pago) => (
              <tr key={pago.idPago}>
                <td>{pago.idPago}</td>
                <td>{pago.idCliente}</td>
                <td>{pago.nombreCompleto || 'Por Definir'}</td>
                <td>{pago.tipoCliente || 'Por Definir'}</td>
                <td>{pago.tipoServicio || 'Por Definir'}</td>
                <td>{pago.idSolicitudServicio || '-'}</td>
                <td>{pago.idSesion || '-'}</td>
                <td>{pago.fecha ? pago.fecha.split('T')[0] : 'Por Definir'}</td>
                <td>{pago.tipoPago || 'Por Definir'}</td>
                <td>{pago.nroVoucher || 'Por Definir'}</td>
                <td>{pago.monto ? Number(pago.monto).toFixed(2) : '0.00'}</td>
                <td>{pago.estado || 'Por Definir'}</td>
                <td>
                  <button className="btn-editar" onClick={() => abrirModal(pago)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mostrarModal && pagoSeleccionado && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Editar Pago</h3>
            <ul>
              <li><strong>ID Pago:</strong> {pagoSeleccionado.idPago}</li>
              <li><strong>ID Cliente:</strong> {pagoSeleccionado.idCliente}</li>
              <li><strong>Nombre:</strong> {pagoSeleccionado.nombreCompleto || 'Por Definir'}</li>
              <li><strong>Tipo Cliente:</strong> {pagoSeleccionado.tipoCliente || 'Por Definir'}</li>
              <li><strong>Tipo Servicio:</strong> {pagoSeleccionado.tipoServicio || 'Por Definir'}</li>
              <li><strong>ID Solicitud Servicio:</strong> {pagoSeleccionado.idSolicitudServicio || '-'}</li>
              <li><strong>ID Sesión:</strong> {pagoSeleccionado.idSesion || '-'}</li>
            </ul>

            <label>
              Fecha de Pago:
              <input
                type="date"
                value={pagoSeleccionado.fecha ? pagoSeleccionado.fecha.split('T')[0] : ''}
                onChange={e => setPagoSeleccionado({ ...pagoSeleccionado, fecha: e.target.value })}
              />
            </label>

            <label>
              Tipo Pago:
              <select
                value={pagoSeleccionado.tipoPago || ''}
                onChange={e => setPagoSeleccionado({ ...pagoSeleccionado, tipoPago: e.target.value })}
              >
                <option value="">Seleccionar</option>
                <option value="QR">QR</option>
                <option value="Efectivo">Efectivo</option>
              </select>
            </label>

            <label>
              Nro Voucher:
              <input
                type="text"
                value={pagoSeleccionado.nroVoucher || ''}
                onChange={e => setPagoSeleccionado({ ...pagoSeleccionado, nroVoucher: e.target.value })}
              />
            </label>

            <label>
              Monto:
              <input
                type="number"
                step="0.01"
                value={pagoSeleccionado.monto || 0}
                onChange={e => setPagoSeleccionado({ ...pagoSeleccionado, monto: e.target.value })}
              />
            </label>

            <label>
              Estado:
              <select
                value={pagoSeleccionado.estado || ''}
                onChange={e => setPagoSeleccionado({ ...pagoSeleccionado, estado: e.target.value })}
              >
                <option value="">Seleccionar</option>
                <option value="Pagado">Pagado</option>
                <option value="Inpaga">Inpaga</option>
              </select>
            </label>

            <div style={{ marginTop: '15px' }}>
              <button onClick={confirmarEdicion} style={{ marginRight: '10px' }}>Confirmar</button>
              <button className="btn-cerrar" onClick={cerrarModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdministrarPagos;
