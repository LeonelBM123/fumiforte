import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/RegisterUser.css";

function RegisterUser() {
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
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trim a todos los campos necesarios
    const camposTrim = {
      nombreCompleto: form.nombreCompleto.trim(),
      contraseña: form.contraseña,
      confirmarContraseña: form.confirmarContraseña,
      telefono: form.telefono.trim(),
      direccion: form.direccion.trim(),
      correo: form.correo.trim(),
      tipoCliente: form.tipoCliente.trim(),
      razonSocial: form.razonSocial.trim(),
      nit: form.nit.trim(),
    };

    if (camposTrim.contraseña !== camposTrim.confirmarContraseña) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const camposRequeridos = ["nombreCompleto", "contraseña", "telefono", "direccion", "correo", "tipoCliente"];
    for (let campo of camposRequeridos) {
      if (camposTrim[campo] === "") {
        setError("Todos los campos obligatorios deben completarse.");
        return;
      }
    }

    setError("");

    const usuarioData = {
      nombreCompleto: camposTrim.nombreCompleto,
      contraseña: camposTrim.contraseña,
      telefono: camposTrim.telefono,
      direccion: camposTrim.direccion,
      correo: camposTrim.correo,
      rol: "Cliente",
      estado: "Activo",
      tipoCliente: camposTrim.tipoCliente,
      razonSocial: camposTrim.razonSocial === "" ? "N/A" : camposTrim.razonSocial,
      nit: camposTrim.nit === "" ? "N/A" : camposTrim.nit,
    };

    console.log(usuarioData);

    try {
      const response = await fetch("https://fumifortebe-gxhg.onrender.com/registrar_cliente", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuarioData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError(errorText || "Error al registrar usuario.");
        return;
      }

      // Redirige si fue exitoso
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

            <select name="tipoCliente" value={form.tipoCliente} onChange={handleChange}>
              <option value="" disabled hidden>Elija el tipo de cliente</option>
              <option value="Personal">Personal</option>
              <option value="Empresa">Empresa</option>
              <option value="Restaurante">Restaurante</option>
            </select>

            <input
              type="text"
              name="razonSocial"
              placeholder="Razón Social (opcional)"
              value={form.razonSocial}
              onChange={handleChange}
            />
            <input
              type="text"
              name="nit"
              placeholder="NIT (opcional)"
              value={form.nit}
              onChange={handleChange}
            />
            <button type="submit">Registrarse</button>
          </form>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default RegisterUser;