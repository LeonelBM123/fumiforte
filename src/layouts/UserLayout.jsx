import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "../styles/UserLayout.css";
import logo from "../assets/fumiforte-logo.png";
import perfil from "../assets/perfil.png";

function UserLayout() {
  const [activeSection, setActiveSection] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleMainView = () => {
    navigate("/userlayout");
    setActiveSection(null);
  };

  const handleNavigation = (section) => {
    navigate(`/userlayout/${section}`);
    setActiveSection(section);
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

  return (
    <div className="user-container">
      {/* Barra superior */}
      <header className="topbar">
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

      <aside className="sidebar">
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

      <main className="main-content">
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
}

export default UserLayout;
