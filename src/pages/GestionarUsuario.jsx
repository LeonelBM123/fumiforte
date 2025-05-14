import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/GestionarUsuario.css";

function GestionarUsuario() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get("view") || "registrar";

  const [modo, setModo] = useState(view);
  const [listaTrabajadores, setListaTrabajadores] = useState([
    { id: 1, nombre: "Carlos Perez" },
    { id: 2, nombre: "Lucia Gomez" },
    { id: 3, nombre: "Mario Rojas" },
  ]);

  const [seleccionados, setSeleccionados] = useState([]);
  const [form, setForm] = useState({
    nombreCompleto: "",
    contraseña: "",
    confirmarContraseña: "",
    telefono: "",
    direccion: "",
    correo: "",
  });

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    setModo(view);
  }, [view]);

  const toggleSeleccion = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const darDeBaja = () => {
    alert("Trabajadores dados de baja: " + seleccionados.join(", "));
    // Aquí podrías enviar una petición al backend
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.contraseña !== form.confirmarContraseña) {
      setError("Las contraseñas no coinciden.");
      setMensaje("");
      return;
    }

    for (let key in form) {
      if (form[key].trim() === "") {
        setError("Todos los campos son obligatorios.");
        setMensaje("");
        return;
      }
    }

    setError("");

    try {
      const response = await fetch("http://localhost:8081/registro", {
        method: "POST",
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
          setMensaje("");
        } catch {
          setError("Error al registrar trabajador.");
          setMensaje("");
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
      }
    } catch (error) {
      console.error("Error de red:", error);
      setError("No se pudo conectar al servidor.");
      setMensaje("");
    }
  };

  return (
    <div className="gestionar-usuario-container">
      {modo === "registrar" ? (
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
          </form>
          {error && <p className="error">{error}</p>}
          {mensaje && <p className="success">{mensaje}</p>}
        </div>
      ) : (
        <div className="lista-trabajadores">
          <h2>Lista de trabajadores</h2>
          <ul>
            {listaTrabajadores.map((t) => (
              <li key={t.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={seleccionados.includes(t.id)}
                    onChange={() => toggleSeleccion(t.id)}
                  />
                  {t.nombre}
                </label>
              </li>
            ))}
          </ul>
          <button onClick={darDeBaja}>Dar de baja seleccionados</button>
        </div>
      )}
    </div>
  );
}

export default GestionarUsuario;