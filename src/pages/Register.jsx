import React, { useState } from "react";
import "./../styles/Register.css";

function Register() {
  const [form, setForm] = useState({
    nombre: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    direccion: "",
    correo: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
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
    console.log("Registro enviado:", form);
    // Aquí iría el fetch para registrar
  };

  return (
    <div className="register-container">
      <div className="register-content">
        <div className="register-box">
          <h2>Registro de Usuario</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" name="nombre" placeholder="Nombre completo" value={form.nombre} onChange={handleChange} />
            <input type="password" name="password" placeholder="Contraseña" value={form.password} onChange={handleChange} />
            <input type="password" name="confirmPassword" placeholder="Confirmar contraseña" value={form.confirmPassword} onChange={handleChange} />
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
