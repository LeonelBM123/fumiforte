import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/GestionarLayout.css";
import "../styles/Loader.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function GestionarHistorial() {
  const [historiales, setHistoriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    idSolicitudServicio: "",
    idSesion: "",
    nroSesion: "",
    trabajadores: "",
    fecha: "",
    hora: "",
    nombreCliente: "",
    telefono: "",
    direccionEscrita: "",
    tipoCliente: "",
    montoPendienteSesion: "",
    estadoPago: "",
    certificado: "",
    factura: "",
  });
  const [modo, setModo] = useState("lista");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [orden, setOrden] = useState({ columna: "", direccion: "asc" });
  const ordenarPor = (columna) => {
  const nuevaDireccion = orden.columna === columna && orden.direccion === "asc" ? "desc" : "asc";

  const historialesOrdenados = [...historiales].sort((a, b) => {
    if (a[columna] < b[columna]) return nuevaDireccion === "asc" ? -1 : 1;
    if (a[columna] > b[columna]) return nuevaDireccion === "asc" ? 1 : -1;
    return 0;
  });

  setOrden({ columna, direccion: nuevaDireccion });
  setHistoriales(historialesOrdenados);
};


  // Actualiza el form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  //Crear documento Pdf
  const exportarPDF = () => {
    const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    });
//   const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Historial de Sesiones", 14, 15);

  const columnas = [
    "ID Solicitud",
    "ID Sesión",
    "Nro Sesión",
    "Trabajadores",
    "Fecha",
    "Hora",
    "Cliente",
    "Teléfono",
    "Dirección",
    "Tipo Cliente",
    "Monto Pendiente",
    "Estado de Pago",
  ];

  const filas = historiales.map((h) => [
    h.idSolicitudServicio,
    h.idSesion,
    h.nroSesion,
    h.trabajadores,
    h.fecha,
    h.hora,
    h.nombreCliente,
    h.telefono,
    h.direccionEscrita,
    h.tipoCliente,
    h.montoPendienteSesion,
    h.estadoPago,
  ]);

  // Usa el plugin aquí
  autoTable(doc, {
    startY: 20,
    head: [columnas],
    body: filas,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [22, 160, 133] },
  });

  doc.save("historial_sesiones.pdf");
};

  useEffect(() => {
    obtenerHistoriales();
  }, []);

  const obtenerHistoriales = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8081/gerente/hitorial_sesiones", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
      const data = await response.json();
      console.log(data);
      setHistoriales(data);
    } catch (error) {
      console.error("Error al obtener el Historial:", error);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de edición con datos cargados
  const handleEditar = (certificado) => {
    setForm({
      id_sesion: certificado.idSesion,
      factura: certificado.factura,
      certificado: certificado.certificado
    });
    setModalVisible(true);
  };

  // Abrir modal de confirmación para eliminar
  const handleEliminar = (certificado) => {
    setForm({
      idCertificado: certificado.idCertificado,
    });
    setModalEliminarVisible(true);
  };

  // Confirmar edición (PUT)
  const handleConfirmarEdicion = async () => {
    try {
      await axios.put(
        `http://localhost:8081/gerente/actualizar_certificado/${form.idCertificado}`,
        {
          fechaEmision: form.fechaEmision,
          fechaVencimiento: form.fechaVencimiento,
          estado: form.estado,
        },
        { withCredentials: true }
      );
      setMensaje("Certificado actualizado correctamente");
      setError("");
      setModalVisible(false);
      obtenerCertificados();
    } catch (err) {
      setError("Error al actualizar certificado");
      console.error(err);
    }
  };

  // Confirmar eliminación (DELETE)
  const confirmarEliminarCertificado = async () => {
    try {
      await axios.delete(
        `http://localhost:8081/gerente/eliminar_certificado/${form.idCertificado}`,
        { withCredentials: true }
      );
      setMensaje("Certificado eliminado correctamente");
      setError("");
      setModalEliminarVisible(false);
      obtenerCertificados();
    } catch (err) {
      setError("Error al eliminar certificado");
      console.error(err);
    }
  };

  // Crear certificado (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fechaEmision || !form.fechaVencimiento || !form.estado) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      setError("");
      setMensaje("");
      setLoading(true);

      const response = await fetch("http://localhost:8081/gerente/crear_certificado", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fechaEmision: form.fechaEmision,
          fechaVencimiento: form.fechaVencimiento,
          estado: form.estado,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error al crear certificado: ${response.statusText}`);
      }

      const nuevoCertificado = await response.json();

      setCertificados((prev) => [...prev, nuevoCertificado]);
      setMensaje("Certificado creado correctamente.");
      setForm({ idCertificado: "", fechaEmision: "", fechaVencimiento: "", estado: "" });
      setModo("lista");
    } catch (error) {
      console.error(error);
      setError("Error al crear el certificado. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="gestionar-layout-container">
      <h1 style={{ marginBottom: "10px" }}>Historial de Sesiones</h1>

      {modo === "lista" ? (
        loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Cargando historial...</p>
          </div>
        ) : (
          <>
            <button style={{ marginBottom: "20px" }} onClick={exportarPDF}>
              Descagar Historial
            </button>

            <div className="tabla-certificado" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th onClick={() => ordenarPor("idSolicitudServicio")}>ID Solicitud</th>
                    <th onClick={() => ordenarPor("idSesion")}>ID Sesión</th>
                    <th onClick={() => ordenarPor("nroSesion")}>Nro Sesión</th>
                    <th onClick={() => ordenarPor("trabajadores")}>Trabajadores</th>
                    <th onClick={() => ordenarPor("fecha")}>Fecha</th>
                    <th onClick={() => ordenarPor("hora")}>Hora</th>
                    <th onClick={() => ordenarPor("nombreCliente")}>Nombre Cliente</th>
                    <th onClick={() => ordenarPor("telefono")}>Teléfono</th>
                    <th onClick={() => ordenarPor("direccionEscrita")}>Dirección</th>
                    <th onClick={() => ordenarPor("tipoCliente")}>Tipo Cliente</th>
                    <th onClick={() => ordenarPor("montoPendienteSesion")}>Monto Pendiente</th>
                    <th onClick={() => ordenarPor("estadoPago")}>Estado de Pago</th>
                    {/* <th>Certificado</th>
                    <th>Factura</th> */}
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {historiales.map((sesion) => (
                    <tr >
                      <td>{sesion.idSolicitudServicio}</td>
                        <td>{sesion.idSesion}</td>
                        <td>{sesion.nroSesion}</td>
                        <td>{sesion.trabajadores}</td>
                        <td>{sesion.fecha}</td>
                        <td>{sesion.hora}</td>
                        <td>{sesion.nombreCliente}</td>
                        <td>{sesion.telefono}</td>
                        <td>{sesion.direccionEscrita}</td>
                        <td>{sesion.tipoCliente}</td>
                        <td>{sesion.montoPendienteSesion}</td>
                        <td>{sesion.estadoPago}</td>
                        {/* <td>{sesion.factura}</td>
                        <td>{sesion.certificado}</td> */}
                        <td>
                        <button onClick={() => handleEditar(sesion)}>Editar</button>
                        {/* <button onClick={() => handleEliminar(sesion)}>Eliminar</button> */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      ) : (
        <div className="formulario-registro">
          <h2>Registrar Nuevo Certificado</h2>
          <form onSubmit={handleSubmit}>
            <label>Fecha Emisión:</label>
            <input
              type="date"
              name="fechaEmision"
              value={form.fechaEmision}
              onChange={handleChange}
              required
            />

            <label>Fecha Vencimiento:</label>
            <input
              type="date"
              name="fechaVencimiento"
              value={form.fechaVencimiento}
              onChange={handleChange}
              required
            />

            <label>Estado:</label>
            <select name="estado" value={form.estado} onChange={handleChange} required>
              <option value="">Seleccione estado</option>
              <option value="Vigente">Vigente</option>
              <option value="Vencido">Vencido</option>
            </select>

            <div style={{ marginTop: "15px" }}>
              <button type="submit">Registrar</button>
              <button type="button" onClick={() => setModo("lista")} style={{ marginLeft: "10px" }}>
                Cancelar
              </button>
            </div>
          </form>
          {error && <p className="error">{error}</p>}
          {mensaje && <p className="success">{mensaje}</p>}
        </div>
      )}

      {/* Modal de edición */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>Editar Historial</h2>
            <form className="formulario-registro">
              <label>Certificado Entregado:</label>
              <select name="certificado" value={form.certificado} onChange={handleChange} required>
                <option value="Si">Si</option>
                <option value="No">No</option>
              </select>
              <label>Factura Entregada:</label>
              <select name="factura" value={form.factura} onChange={handleChange} required>
                <option value="Si">Si</option>
                <option value="No">No</option>
              </select>

              <div className="modal-buttons" style={{ marginTop: "15px" }}>
                <button type="button" onClick={handleConfirmarEdicion}>
                  Confirmar
                </button>
                <button type="button" onClick={() => setModalVisible(false)} style={{ marginLeft: "10px" }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {modalEliminarVisible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>¿Confirmar eliminar certificado?</h2>
            <div className="modal-buttons" style={{ marginTop: "15px" }}>
              <button onClick={confirmarEliminarCertificado}>Confirmar</button>
              <button onClick={() => setModalEliminarVisible(false)} style={{ marginLeft: "10px" }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionarHistorial;