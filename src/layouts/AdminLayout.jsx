import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "../styles/AdminLayout.css";
import logo from "../assets/fumiforte-logo.png";
import perfil from "../assets/perfil.png";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null);

  const handleMainView = () => {
    navigate("/adminlayout");
    setActiveSection(null);
    setSidebarOpen(false);
  };

  const handleNavigation = (section) => {
    navigate(`/adminlayout/${section}`);
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    navigate("/");
  };

  const handleEditProfile = () => {
    alert("Función aún no implementada");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  //Boton de ia
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const handleSendMessage = async (e) => {
  e.preventDefault();

  const userMessage = chatInput.trim();
  if (!userMessage) return;

  // Agrega mensaje del usuario
  setChatMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
  setChatInput("");

  try {
    const response = await fetch("https://leonelbm123.app.n8n.cloud/webhook/376172fa-3eab-47b3-9404-5b56d5674550/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId: "8095d486346b4e618c5d72bad23a38e6",
        action: "sendMessage",
        chatInput: userMessage,
      }),
    });

    const data = await response.json();

    setChatMessages((prev) => [
      ...prev,
      { sender: "bot", text: data.output || "Sin respuesta" },
    ]);
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    setChatMessages((prev) => [
      ...prev,
      { sender: "bot", text: "Error al conectarse al servidor" },
    ]);
  }
};
  //Fin Boton de ia
  // Cierre automático al hacer clic fuera en móvil
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isSmallScreen = window.innerWidth <= 768;

      if (
        isSmallScreen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="admin-container">
      <header className="topbar">
        <button
          ref={toggleButtonRef}
          className="menu-toggle"
          onClick={toggleSidebar}
        >
          ☰
        </button>
        <div className="topbar-right">
          <img
            src={perfil}
            alt="Perfil"
            className="profile-pic"
            onClick={toggleDropdown}
          />
          {showDropdown && (
            <div className="dropdown-menu">
              <button onClick={handleEditProfile}>Editar Perfil</button>
              <button onClick={handleLogout}>Cerrar Sesión</button>
            </div>
          )}
        </div>
      </header>

      <aside
        ref={sidebarRef}
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
      >
        <img
          src={logo}
          alt="Logo"
          className="sidebar-logo"
          onClick={handleMainView}
        />
        <div className="menu-group">
          <details>
            <summary>Gestión de Servicios</summary>
            <button onClick={() => handleNavigation("solicitudes")}>
              Ver Solicitudes de Servicio
            </button>
            <button onClick={() => handleNavigation("gestionar-certificado")}>
              Gestionar Certificados
            </button>
            <button onClick={() => handleNavigation("gestionar-historial")}>
              Gestionar Historial de Sesiones
            </button>
            <button onClick={() => handleNavigation("reportes-solicitud")}>
              Generar Reportes de Servicio
            </button>
          </details>
          <details>
            <summary>Administrar Pagos</summary>
            <button onClick={() => handleNavigation("administrar-pagos")}>
              Administrar Pagos
            </button>
          </details>
          <details>
            <summary>Gestión de Clientes y Trabajadores</summary>
            <button onClick={() => handleNavigation("gestionar-usuario")}>
              Gestionar Usuario
            </button>
          </details>
          <details>
            <summary>Inventario y Proveedores</summary>
            <button onClick={() => handleNavigation("gestionar-proveedor")}>
              Gestionar Proveedor
            </button>
            <button onClick={() => handleNavigation("gestionar-plaga")}>
              Gestionar Plaga
            </button>
            <button onClick={() => handleNavigation("gestionar-inventario")}>
              Gestionar Inventario
            </button>
          </details>
          <details>
            <summary>Autentificación y Seguridad</summary>
            <button onClick={() => handleNavigation("gestionar-bitacora")}>
              Gestionar Bitácora del sistema
            </button>
          </details>
            <button className="modern-btn" onClick={() => handleNavigation("generar-reporte-layout")}>
              GENERAR REPORTES
            </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet key={location.pathname} />
      </main>
      {/* inicio foton ia */}
      <button
  className="chatbot-float-button"
  onClick={() => setShowChat(!showChat)}
>
  💬
</button>

{/* Ventana flotante de chat */}
{showChat && (
  <div className="chatbot-container">
    <div className="chatbot-header">
      <span>Asistente IA</span>
      <button onClick={() => setShowChat(false)}>✖</button>
    </div>
    <div className="chatbot-messages">
      {chatMessages.map((msg, idx) => (
        <div key={idx} className={`message ${msg.sender}`}>
          {msg.text}
        </div>
      ))}
    </div>
    <form onSubmit={handleSendMessage} className="chatbot-input-form">
      <input
        type="text"
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        placeholder="Escribe tu mensaje..."
      />
      <button type="submit">Enviar</button>
    </form>
  </div>
)}
      {/* Fin foton ia */}
    </div>
  );
}

export default AdminLayout;

