import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/GestionarLayout.css";
import "../styles/Loader.css";

function GestionarProveedor() {
  const [modo, setModo] = useState("lista");
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    idProveedor: "",
    nombre: "",
    telefono: "",
    direccion: "",
    correo: "",
  });
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [proveedorEditado, setProveedorEditado] = useState(null);
  const [proveedorAEliminar, setProveedorAEliminar] = useState(null);
  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);

  useEffect(() => {
    obtenerProveedores();
  }, []);

  const obtenerProveedores = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8081/gerente/proveedores", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`HTTP status ${response.status}`);

      const data = await response.json();
      setProveedores(data);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const limpiarCampos = (form) => ({
    nombre: form.nombre.trim(),
    telefono: form.telefono.trim(),
    direccion: form.direccion.trim(),
    correo: form.correo.trim(),
  });

  const validarCampos = ({ nombre, telefono, direccion, correo }) => {
    return nombre && telefono && direccion && correo;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedForm = {
      ...limpiarCampos(form),
      estado: "Activo", // 👈 aquí se agrega el campo por defecto
    };

    if (!validarCampos(cleanedForm)) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/nueva_proveedor", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedForm),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData.message || "Error al registrar proveedor.");
        } catch {
          setError("Error al registrar proveedor.");
        }
      } else {
        setMensaje("¡Proveedor registrado exitosamente!");
        setError("");
        setForm({
          idProveedor: "",
          nombre: "",
          telefono: "",
          direccion: "",
          correo: "",
        });
        setModo("lista");
        obtenerProveedores();
      }
    } catch (error) {
      console.error("Error de red:", error);
      setError("No se pudo conectar al servidor.");
    }
  };

  const handleEditar = (proveedor) => {
    setProveedorEditado(proveedor);
    setModalVisible(true);
    setForm({ ...proveedor });
  };

  const handleEliminar = (proveedor) => {
    setProveedorAEliminar(proveedor);
    setModalEliminarVisible(true);
  };

  const confirmarEliminarProveedor = async () => {
    if (!proveedorAEliminar) return;

    try {
      await axios.delete(`http://localhost:8081/proveedores/${proveedorAEliminar.idProveedor}`, {
        withCredentials: true,
      });
      setMensaje("Proveedor eliminado exitosamente.");
      setModalEliminarVisible(false);
      obtenerProveedores();
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
      setError("No se pudo eliminar el proveedor.");
    }
  };

  const handleConfirmarEdicion = async () => {
    const cleanedForm = {
      idProveedor: form.idProveedor,
      ...limpiarCampos(form),
      estado: form.estado, // ya viene del modal
    };

    if (!validarCampos(cleanedForm)) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8081/proveedores/${cleanedForm.idProveedor}`,
        cleanedForm,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setMensaje("Proveedor actualizado exitosamente.");
        setModalVisible(false);
        obtenerProveedores();
      } else {
        setError("Hubo un error al actualizar el proveedor.");
      }
    } catch (error) {
      console.error("Error al actualizar proveedor:", error);
      setError("No se pudo actualizar el proveedor.");
    }
  };

  return (
    <div className="gestionar-layout-container">
      <h1 style={{ marginBottom: "10px" }}>Gestionar Proveedor</h1>

      {modo === "lista" ? (
        loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Cargando proveedores...</p>
          </div>
        ) : (
          <>
            <button style={{ marginBottom: "20px" }} onClick={() => setModo("registrar")}>
              + Registrar Proveedor
            </button>

            <div className="tabla-proveedores" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Nombre</th>
                    <th>Teléfono</th>
                    <th>Dirección</th>
                    <th>Correo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedores.map((prov) => (
                    <tr key={prov.idProveedor}>
                      <td>{prov.idProveedor}</td>
                      <td>{prov.nombre}</td>
                      <td>{prov.telefono}</td>
                      <td>{prov.direccion}</td>
                      <td>{prov.correo}</td>
                      <td>{prov.estado}</td>
                      <td>
                        <button onClick={() => handleEditar(prov)}>Editar</button>
                        <button onClick={() => handleEliminar(prov)}>Eliminar</button>
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
          <h2>Registrar nuevo proveedor</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
            <input type="text" name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} required />
            <input type="text" name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} required />
            <input type="email" name="correo" placeholder="Correo" value={form.correo} onChange={handleChange} required />
            <button type="submit">Registrar</button>
            <button type="button" onClick={() => setModo("lista")}>Cancelar</button>
          </form>
          {error && <p className="error">{error}</p>}
          {mensaje && <p className="success">{mensaje}</p>}
        </div>
      )}

      {/* Modal de edición */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>Editar Proveedor</h2>
            <form className="formulario-registro">
              <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
              <input type="text" name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} required />
              <input type="text" name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} required />
              <input type="email" name="correo" placeholder="Correo" value={form.correo} onChange={handleChange} required />
              <input type="text" name="estado" placeholder="Estado" value={form.estado} onChange={handleChange} required />
              <div className="modal-buttons">
                <button type="button" onClick={handleConfirmarEdicion}>Confirmar</button>
                <button type="button" onClick={() => setModalVisible(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {modalEliminarVisible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>¿Confirmar eliminar proveedor?</h2>
            <div className="modal-buttons">
              <button onClick={confirmarEliminarProveedor}>Confirmar</button>
              <button onClick={() => setModalEliminarVisible(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionarProveedor;
