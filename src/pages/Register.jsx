import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/Register.css";

function Register() {
  const [form, setForm] = useState({
    nombreCompleto: "",
    contraseña: "",
    confirmarContraseña: "",
    telefono: "",
    direccion: "",
    correo: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

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
          rol: "Cliente",
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
            setError(errorData.message || "Error al registrar usuario.");
          }
        } catch {
          setError("Error al registrar usuario.");
        }
      } else {
        alert("Registro exitoso!");
        navigate("/");
      }
    } catch (error) {
      console.error("Error de red:", error);
      setError("No se pudo conectar al servidor.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-content">
        <div className="register-box">
          <h2>Registro de Usuario</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" name="nombreCompleto" placeholder="Nombre completo" value={form.nombreCompleto} onChange={handleChange} />
            <input type="password" name="contraseña" placeholder="Contraseña" value={form.contraseña} onChange={handleChange} />
            <input type="password" name="confirmarContraseña" placeholder="Confirmar contraseña" value={form.confirmarContraseña} onChange={handleChange} />
            <input type="text" name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} />
            <input type="text" name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} />
            <input type="email" name="correo" placeholder="Correo" value={form.correo} onChange={handleChange} />
            <button type="submit">Registrarse</button>
          </form>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default Register;