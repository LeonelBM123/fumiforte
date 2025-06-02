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
    tipoCliente: "",
    razonSocial: "",
    nit: "",
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
          estado: "Activo",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError(errorText || "Error al registrar usuario.");
        return;
      }

      const nuevoUsuario = await response.json();
      const idUsuario = nuevoUsuario.idUsuario;
    
      const clienteResponse = await fetch("http://localhost:8081/registro_cliente", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idCliente: idUsuario,
          tipoCliente: form.tipoCliente,
          razonSocial: form.razonSocial,
          nit: form.nit,
        }),
      });

      if (!clienteResponse.ok) {
        const errorText = await clienteResponse.text();
        setError(errorText || "Error al registrar cliente.");
        return;
      }

      alert("¡Registro exitoso!");
      navigate("/");

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
            <input type="text" name="tipoCliente" placeholder="Tipo de Cliente" value={form.tipoCliente} onChange={handleChange} />
            <input type="text" name="razonSocial" placeholder="Razón Social" value={form.razonSocial} onChange={handleChange} />
            <input type="text" name="nit" placeholder="NIT" value={form.nit} onChange={handleChange} />
            <button type="submit">Registrarse</button>
          </form>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default Register;