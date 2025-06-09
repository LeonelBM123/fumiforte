import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/GestionarLayout.css";
import "../styles/Loader.css";

function GestionarUsuario() {
  const [modo, setModo] = useState("lista");
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({
    idUsuario: "",
    nombreCompleto: "",
    contraseña: "",
    confirmarContraseña: "",
    telefono: "",
    direccion: "",
    correo: "",
    especialidad: "",
  });

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [usuarioEditado, setUsuarioEditado] = useState(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios = async () => {
  try {
    setLoading(true);
    const response = await fetch("http://localhost:8081/listar_usuarios", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}`);
    }

    const data = await response.json();
    setUsuarios(data);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.contraseña !== form.confirmarContraseña) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const camposObligatorios = [
      "nombreCompleto",
      "contraseña",
      "confirmarContraseña",
      "telefono",
      "direccion",
      "correo",
      "especialidad"
    ];

    for (let campo of camposObligatorios) {
      if (!form[campo] || form[campo].trim() === "") {
        setError("Todos los campos son obligatorios.");
        return;
      }
    }

    try {
    // Paso 1: Registrar usuario
    const responseUsuario = await fetch("http://localhost:8081/registro", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombreCompleto: form.nombreCompleto,
        contraseña: form.contraseña,
        telefono: form.telefono,
        direccion: form.direccion,
        correo: form.correo,
        especialidad: form.especialidad,
        rol: "Trabajador",
        estado: "Activo",
      }),
    });

    if (!responseUsuario.ok) {
      const errorText = await responseUsuario.text();
      try {
        const errorData = JSON.parse(errorText);
        if (
          errorData.message?.toLowerCase().includes("correo") ||
          errorData.message?.toLowerCase().includes("duplicate")
        ) {
          setError("El correo ya está registrado.");
        } else {
          setError(errorData.message || "Error al registrar trabajador.");
        }
      } catch {
        setError("Error al registrar trabajador.");
      }
      return; // Salimos porque hubo error
    }

    const nuevoUsuario = await responseUsuario.json();

    // Paso 2: Registrar trabajador (la especialidad es un campo extra que asumimos en el form)
    const responseTrabajador = await fetch("http://localhost:8081/registro_trabajador", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idTrabajador: nuevoUsuario.idUsuario,
        especialidad: form.especialidad,      
      }),
    });

    if (!responseTrabajador.ok) {
      const errorText = await responseTrabajador.text();
      setError(errorText || "Error al registrar trabajador.");
      return;
    }

    setMensaje("¡Trabajador registrado exitosamente!");
    setError("");
    setForm({
      nombreCompleto: "",
      contraseña: "",
      confirmarContraseña: "",
      telefono: "",
      direccion: "",
      correo: "",
      especialidad: "",
    });
    setModo("lista");
    obtenerUsuarios();

  } catch (error) {
    console.error("Error de red:", error);
    setError("No se pudo conectar al servidor.");
  }
};

  const handleEditar = (usuario) => {
    setUsuarioEditado(usuario);
    setModalVisible(true);
    setForm({
      idUsuario: usuario.idUsuario,
      nombreCompleto: usuario.nombreCompleto,
      contraseña: "",
      confirmarContraseña: "",
      telefono: usuario.telefono,
      direccion: usuario.direccion,
      correo: usuario.correo,
      rol: usuario.rol,
      estado: usuario.estado,
    });
  };

  const handleEliminar = (usuario) => {
    setUsuarioAEliminar(usuario);
    setModalEliminarVisible(true);
  };

  const confirmarEliminarUsuario = async () => {
    if (!usuarioAEliminar) return;

      try {
      await axios.delete(`http://localhost:8081/eliminar_usuario/${usuarioAEliminar.idUsuario}`, {
        withCredentials: true,
      });
      setMensaje("Usuario eliminado exitosamente.");
      setModalEliminarVisible(false);
      obtenerUsuarios();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      setError("No se pudo eliminar el usuario.");
    }
  };

  const handleConfirmarEdicion = async () => {
    const {
      idUsuario,
      nombreCompleto,
      telefono,
      direccion,
      correo,
      contraseña,
      rol,
      estado,
    } = form;

    try {
      const response = await axios.put(
        `http://localhost:8081/usuarios/${idUsuario}`,
        {
          nombreCompleto,
          telefono,
          direccion,
          correo,
          contraseña,
          rol,
          estado,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setMensaje("Usuario actualizado exitosamente.");
        setModalVisible(false);
        obtenerUsuarios();
      } else {
        setError("Hubo un error al actualizar el usuario.");
      }
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      setError("No se pudo actualizar el usuario.");
    }
  };

  return (
    <div className="gestionar-layout-container">
      <h1 style={{ marginBottom: "10px" }}>Gestionar Usuario</h1>
      {loading ? (
  <div className="loader-container">
    <div className="spinner"></div>
    <p>Cargando usuarios...</p>
  </div>
) : modo === "lista" ? (
  <>
    <button
      style={{ marginBottom: "20px" }}
      onClick={() => setModo("registrar")}
    >
      + Registrar Trabajador
    </button>

    <div className="tabla-usuarios" style={{ maxHeight: "70vh", overflowY: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>Id Usuario</th>
            <th>Nombre Completo</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.idUsuario}>
              <td>{usuario.idUsuario}</td>
              <td>{usuario.nombreCompleto}</td>
              <td>{usuario.telefono}</td>
              <td>{usuario.direccion}</td>
              <td>{usuario.correo}</td>
              <td>{usuario.rol}</td>
              <td>{usuario.estado}</td>
              <td>
                <button onClick={() => handleEditar(usuario)}>Editar</button>
                <button onClick={() => handleEliminar(usuario)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
) : (
          <div className="formulario-registro">
            <h2>Registrar nuevo trabajador</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="nombreCompleto"
                placeholder="Nombre completo"
                value={form.nombreCompleto}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="contraseña"
                placeholder="Contraseña"
                value={form.contraseña}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="confirmarContraseña"
                placeholder="Confirmar contraseña"
                value={form.confirmarContraseña}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="telefono"
                placeholder="Teléfono"
                value={form.telefono}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="direccion"
                placeholder="Dirección"
                value={form.direccion}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="correo"
                placeholder="Correo electrónico"
                value={form.correo}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="especialidad"
                placeholder="Especialidad"
                value={form.especialidad}
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
            <h2>Editar Usuario</h2>
            <form className="formulario-registro">
              <input
                type="text"
                name="nombreCompleto"
                placeholder="Nombre completo"
                value={form.nombreCompleto}
                onChange={handleChange}
              />
              <input
                type="text"
                name="telefono"
                placeholder="Teléfono"
                value={form.telefono}
                onChange={handleChange}
              />
              <input
                type="text"
                name="direccion"
                placeholder="Dirección"
                value={form.direccion}
                onChange={handleChange}
              />
              <input
                type="email"
                name="correo"
                placeholder="Correo electrónico"
                value={form.correo}
                onChange={handleChange}
              />
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                required
              >
                <option value="">-- Selecciona un estado --</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
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
            <h2>¿Confirmar eliminar usuario?</h2>
            <div className="modal-buttons">
              <button onClick={confirmarEliminarUsuario}>Confirmar</button>
              <button onClick={() => setModalEliminarVisible(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionarUsuario;