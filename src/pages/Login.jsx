import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import logo from "../assets/fumiforte-logo.png"; // asegúrate de tener esta imagen

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8081/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        
        /*
            //verificar si el usuario es gerente, si es gerente mandar a AdminHome
            //sino, mandar al userHome  

            if (data.rol === "Gerente") {
                navigate("/adminhome");
            } else {
                navigate("/userhome");
            }
        */ 
        navigate("/adminhome");
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.error || "Credenciales inválidas");
      }
    } catch (error) {
      console.error("Error en login:", error);
      setErrorMsg("Error de conexión con el servidor");
    }
  };

  return (
    <div className="login-container">
      <img src={logo} alt="Fumiforte Logo" className="logo" />

      <div className="login-content">
        <div className="carousel">
          {/* Aquí va el carrusel, por ahora dejamos imagen o texto estático */}
          <p className="carousel-placeholder">Aquí va el carrusel de imágenes 🍃</p>
        </div>

        <div className="login-box">
          <h2>Iniciar Sesión</h2>
          <form onSubmit={handleLogin}>
            <label>Usuario:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Ingresar</button>
          </form>
          {errorMsg && <p className="error">{errorMsg}</p>}

          <p className="register-link">
            ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
