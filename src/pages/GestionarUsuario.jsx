import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/GestionarUsuario.css";

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
  });
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [usuarioEditado, setUsuarioEditado] = useState(null); 

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios = async () => {
    try {
      const response = await fetch("http://localhost:8081/gerente/usuarios", {
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

    for (let key in form) {
      if (form[key].trim() === "") {
        setError("Todos los campos son obligatorios.");
        return;
      }
    }

    try {
      const response = await fetch("http://localhost:8081/registro", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombreCompleto: form.nombreCompleto,
          contraseña: form.contraseña,
          telefono: form.telefono,
          direccion: form.direccion,
          correo: form.correo,
          rol: "Trabajador",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
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
      } else {
        setMensaje("¡Trabajador registrado exitosamente!");
        setError("");
        setForm({
          nombreCompleto: "",
          contraseña: "",
          confirmarContraseña: "",
          telefono: "",
          direccion: "",
          correo: "",
        });
        setModo("lista");
        obtenerUsuarios();
      }
    } catch (error) {
      console.error("Error de red:", error);
      setError("No se pudo conectar al servidor.");
    }
  };

  const handleEditar = (usuario) => {
    setUsuarioEditado(usuario);
    setModalVisible(true); // Mostrar el modal de edición
    setForm({
      idUsuario: usuario.idUsuario,
      nombreCompleto: usuario.nombreCompleto,
      contraseña: "", // No editable
      confirmarContraseña: "", // No editable
      telefono: usuario.telefono,
      direccion: usuario.direccion,
      correo: usuario.correo,
      rol: usuario.rol,
    });
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
  } = form;

  try {
    const response = await axios.put(
      `http://localhost:8081/usuarios/${idUsuario}`,
      {
        nombreCompleto,
        telefono,
        direccion,
        correo,
        contraseña, // Se manda aunque no se muestre en el formulario
        rol,        // Igual, se manda pero no se edita
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
    if (error.response) {
      console.error("Detalles del error del backend:", error.response.data);
      setError(error.response.data.message || "No se pudo actualizar el usuario.");
    } else {
      setError("No se pudo conectar al servidor.");
    }
  }
};

  return (
    <div className="gestionar-usuario-container">
      <h1 style={{ marginBottom: "10px" }}>Gestionar Usuario</h1>
      {modo === "lista" ? (
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
                    <td>
                      <button onClick={() => handleEditar(usuario)}>Editar</button>
                      <button>Eliminar</button>
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
            <button type="submit">Registrar</button>
            <button type="button" onClick={() => setModo("lista")}>
              Cancelar
            </button>
          </form>
          {error && <p className="error">{error}</p>}
          {mensaje && <p className="success">{mensaje}</p>}
        </div>
      )}

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
    </div>
  );
}

export default GestionarUsuario;