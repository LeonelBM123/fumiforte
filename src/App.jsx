import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'



function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Función para manejar el login
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8081/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMsg(`Bienvenido, ${data.message}`);
        setErrorMsg("");
        setIsLoggedIn(true); // Establecemos que el usuario ha iniciado sesión correctamente
        console.log("Login exitoso:", data);
        fetchUsuarios(); // Traemos la lista de usuarios
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.error || "Credenciales inválidas");
        setSuccessMsg("");
      }
    } catch (error) {
      console.error("Error en login:", error);
      setErrorMsg("Error de conexión con el servidor");
    }
  };

  // Función para traer la lista de usuarios
  const fetchUsuarios = async () => {
    try {
      const response = await fetch("http://localhost:8081/gerente/usuarios", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          // Si utilizas un token de autenticación, se agregaría aquí
          // "Authorization": `Bearer ${token}`,
        },
        
      });

      if (response.ok) {
        const data = await response.json();
        setUsuarios(data); // Establecemos la lista de usuarios
      } else {
        setErrorMsg("No se pudieron obtener los usuarios.");
      }
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      setErrorMsg("Error al obtener usuarios.");
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "50px auto" }}>
      {!isLoggedIn ? (
        <>
          <h2>Iniciar Sesión</h2>
          <form onSubmit={handleLogin}>
            <div>
              <label>Usuario:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Contraseña:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">Ingresar</button>
          </form>

          {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
          {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
        </>
      ) : (
        <>
          <h2>Lista de Usuarios</h2>
          {usuarios.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>Teléfono</th>
                  <th>Dirección</th>
                  <th>Correo</th>
                  <th>Rol</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.idUsuario}>
                    <td>{usuario.nombreCompleto}</td>
                    <td>{usuario.telefono}</td>
                    <td>{usuario.direccion}</td>
                    <td>{usuario.correo}</td>
                    <td>{usuario.rol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay usuarios disponibles.</p>
          )}
        </>
      )}
    </div>
  );
}

export default App;

