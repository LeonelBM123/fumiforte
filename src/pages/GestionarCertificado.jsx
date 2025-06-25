import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/GestionarLayout.css";
import "../styles/Loader.css";

function GestionarCertificado() {
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    idCertificado: "",
    fechaEmision: "",
    fechaVencimiento: "",
    estado: "",
  });
  const [modo, setModo] = useState("lista");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Actualiza el form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    obtenerCertificados();
  }, []);

  const obtenerCertificados = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://fumifortebe-gxhg.onrender.com/gerente/listar_certificados", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
      const data = await response.json();
      setCertificados(data);
    } catch (error) {
      console.error("Error al obtener certificados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de edición con datos cargados
  const handleEditar = (certificado) => {
    setForm({
      idCertificado: certificado.idCertificado,
      fechaEmision: certificado.fechaEmision,
      fechaVencimiento: certificado.fechaVencimiento,
      estado: certificado.estado,
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
        `https://fumifortebe-gxhg.onrender.com/gerente/actualizar_certificado/${form.idCertificado}`,
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
        `https://fumifortebe-gxhg.onrender.com/gerente/eliminar_certificado/${form.idCertificado}`,
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

      const response = await fetch("https://fumifortebe-gxhg.onrender.com/gerente/crear_certificado", {
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
      <h1 style={{ marginBottom: "10px" }}>Gestionar Certificados</h1>

      {modo === "lista" ? (
        loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Cargando certificados...</p>
          </div>
        ) : (
          <>
            <button style={{ marginBottom: "20px" }} onClick={() => setModo("registrar")}>
              + Registrar Certificado
            </button>

            <div className="tabla-certificado" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Id Certificado</th>
                    <th>Fecha Emisión</th>
                    <th>Fecha Vencimiento</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {certificados.map((certificado) => (
                    <tr key={certificado.idCertificado}>
                      <td>{certificado.idCertificado}</td>
                      <td>{certificado.fechaEmision ?? "Por definir..."}</td>
                      <td>{certificado.fechaVencimiento ?? "Por definir..."}</td>
                      <td>{certificado.estado}</td>
                      <td>
                        <button onClick={() => handleEditar(certificado)}>Editar</button>
                        <button onClick={() => handleEliminar(certificado)}>Eliminar</button>
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
            <h2>Editar Certificado</h2>
            <form className="formulario-registro">
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

export default GestionarCertificado;