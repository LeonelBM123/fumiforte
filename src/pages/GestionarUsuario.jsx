import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/GestionarUsuario.css"; // Asegúrate de crear este CSS si quieres estilos personalizados

function GestionarUsuario() {
  const location = useLocation();

  // Aquí obtenemos el valor de "view" desde los parámetros de la URL
  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get("view") || "registrar"; // Por defecto es "registrar"

  const [modo, setModo] = useState(view); // Establecemos el estado inicial basado en la URL

  const [listaTrabajadores, setListaTrabajadores] = useState([
    { id: 1, nombre: "Carlos Perez" },
    { id: 2, nombre: "Lucia Gomez" },
    { id: 3, nombre: "Mario Rojas" },
  ]);
  
  const [seleccionados, setSeleccionados] = useState([]);

  const toggleSeleccion = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const darDeBaja = () => {
    alert("Trabajadores dados de baja: " + seleccionados.join(", "));
    // Aquí podrías enviar una petición al backend
  };

  useEffect(() => {
    // Actualizamos el modo si el parámetro de la URL cambia
    setModo(view);
  }, [view]);

  return (
    <div className="gestionar-usuario-container">
      {modo === "registrar" ? (
        <div className="formulario-registro">
          <h2>Registrar nuevo trabajador</h2>
          <form>
            <input type="text" placeholder="Nombre completo" required />
            <input type="text" placeholder="Teléfono" required />
            <input type="text" placeholder="Dirección" required />
            <input type="email" placeholder="Correo electrónico" required />
            <input type="password" placeholder="Contraseña" required />
            <input type="password" placeholder="Confirmar contraseña" required />
            <button type="submit">Registrar</button>
          </form>
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
