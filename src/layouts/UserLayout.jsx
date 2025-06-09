import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "../styles/UserLayout.css";
import logo from "../assets/fumiforte-logo.png";
import perfil from "../assets/perfil.png";

function UserLayout() {
  const [activeSection, setActiveSection] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // NUEVO
  const navigate = useNavigate();
  const location = useLocation();


  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null); // Ref para el botón de hamburguesa

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen); // NUEVO

  const handleMainView = () => {
    navigate("/userlayout");
    setActiveSection(null);
  };

  const handleNavigation = (section) => {
    navigate(`/userlayout/${section}`);
    setActiveSection(section);
    setSidebarOpen(false); // cerrar sidebar en móviles
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    // lógica de logout
    navigate("/");
  };

  const handleEditProfile = () => {
    alert("Función aún no implementada");
  };


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
        setSidebarOpen(false); // o el estado que uses para mostrar/ocultar
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <div className="user-container">
      {/* Barra superior */}
      <header className="topbar">
        <button ref={toggleButtonRef} className="hamburger" onClick={toggleSidebar}>
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

      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <img
          src={logo}
          alt="Logo"
          className="sidebar-logo"
          onClick={handleMainView}
        />
        <div className="menu-group">
          <details>
            <summary>Servicios de Fumigación</summary>
            <button onClick={() => handleNavigation("solicitar-servicio-fumigacion")}>
              Solicitar Servicio de Fumigación
            </button>
          </details>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="backdrop"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <main className="main-content">
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
}

export default UserLayout;