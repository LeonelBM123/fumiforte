import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/GestionarLayout.css";

function GestionarPlaga() {
  const [modo, setModo] = useState("lista");
  const [plagas, setPlagas] = useState([]);
  const [form, setForm] = useState({
    idPlaga: "",
    nombre: "",
    descripcion: "",
    recomendaciones: "",
  });
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [plagaEditado, setPlagaEditado] = useState(null);
  const [plagaAEliminar, setPlagaAEliminar] = useState(null);
  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    obtenerPlagas();
  }, []);

  const obtenerPlagas = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8081/gerente/plagas", {
        withCredentials: true,
      });

      setPlagas(response.data);
    } catch (error) {
      console.error("Error al obtener plagas:", error);
      setError("No se pudieron cargar las plagas.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const limpiarCampos = (form) => ({
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim(),
    recomendaciones: form.recomendaciones.trim(),
  });

  const validarCampos = ({ nombre, descripcion, recomendaciones }) => {
    return nombre !== "" && descripcion !== "" && recomendaciones !== "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedForm = limpiarCampos(form);

    if (!validarCampos(cleanedForm)) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8081/nueva_plaga",
        cleanedForm,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      setMensaje("¡Plaga registrada exitosamente!");
      setError("");
      setForm({ idPlaga: "", nombre: "", descripcion: "", recomendaciones: "" });
      setModo("lista");
      obtenerPlagas();
    } catch (error) {
      console.error("Error al registrar plaga:", error);
      setError("No se pudo registrar la plaga.");
    }
  };

  const handleEditar = (plaga) => {
    setPlagaEditado(plaga);
    setModalVisible(true);
    setForm({
      idPlaga: plaga.idPlaga,
      nombre: plaga.nombre,
      descripcion: plaga.descripcion,
      recomendaciones: plaga.recomendaciones,
    });
  };

  const handleEliminar = (plaga) => {
    setPlagaAEliminar(plaga);
    setModalEliminarVisible(true);
  };

  const confirmarEliminarPlaga = async () => {
    if (!plagaAEliminar) return;

    try {
      await axios.delete(`http://localhost:8081/plagas/${plagaAEliminar.idPlaga}`, {
        withCredentials: true,
      });
      setMensaje("Plaga eliminada exitosamente.");
      setModalEliminarVisible(false);
      obtenerPlagas();
    } catch (error) {
      console.error("Error al eliminar plaga:", error);
      setError("No se pudo eliminar la plaga.");
    }
  };

  const handleConfirmarEdicion = async () => {
    const cleanedForm = {
      idPlaga: form.idPlaga,
      ...limpiarCampos(form),
    };

    if (!validarCampos(cleanedForm)) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8081/plagas/${cleanedForm.idPlaga}`,
        cleanedForm,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setMensaje("Plaga actualizada exitosamente.");
        setModalVisible(false);
        obtenerPlagas();
      } else {
        setError("Hubo un error al actualizar la plaga.");
      }
    } catch (error) {
      console.error("Error al actualizar la plaga:", error);
      setError("No se pudo actualizar la plaga.");
    }
  };

  return (
    <div className="gestionar-layout-container">
      <h1 style={{ marginBottom: "10px" }}>Gestionar Plaga</h1>

      {modo === "lista" ? (
        loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Cargando plagas...</p>
          </div>
        ) : (
          <>
            <button style={{ marginBottom: "20px" }} onClick={() => setModo("registrar")}>
              + Registrar Plaga
            </button>

            <div className="tabla-plagas" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Id Plaga</th>
                    <th>Nombre</th>
                    <th>Descripcion</th>
                    <th>Recomendaciones</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {plagas.map((plaga) => (
                    <tr key={plaga.idPlaga}>
                      <td>{plaga.idPlaga}</td>
                      <td>{plaga.nombre}</td>
                      <td>{plaga.descripcion}</td>
                      <td>{plaga.recomendaciones}</td>
                      <td>
                        <button onClick={() => handleEditar(plaga)}>Editar</button>
                        <button onClick={() => handleEliminar(plaga)}>Eliminar</button>
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
          <h2>Registrar nueva plaga</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre plaga"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="descripcion"
              placeholder="Descripcion"
              value={form.descripcion}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="recomendaciones"
              placeholder="Recomendaciones"
              value={form.recomendaciones}
              onChange={handleChange}
              required
            />
            <button type="submit">Registrar</button>
            <button type="button" onClick={() => setModo("lista")}>
              Cancelar
            </button>
          </form>
          {error && <p className="error">{error}</p>}
          {mensaje && <p className="success">{mensaje}</p>}
        </div>
      )}

      {/* Modal de edición */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>Editar Plaga</h2>
            <form className="formulario-registro">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre plaga"
                value={form.nombre}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="descripcion"
                placeholder="Descripcion"
                value={form.descripcion}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="recomendaciones"
                placeholder="Recomendaciones"
                value={form.recomendaciones}
                onChange={handleChange}
                required
              />
              <div className="modal-buttons">
                <button type="button" onClick={handleConfirmarEdicion}>
                  Confirmar
                </button>
                <button type="button" onClick={() => setModalVisible(false)}>
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
            <h2>¿Confirmar eliminar plaga?</h2>
            <div className="modal-buttons">
              <button onClick={confirmarEliminarPlaga}>Confirmar</button>
              <button onClick={() => setModalEliminarVisible(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionarPlaga;