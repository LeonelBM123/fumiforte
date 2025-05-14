import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "../styles/AdminLayout.css";
import logo from "../assets/fumiforte-logo.png";
import perfil from "../assets/perfil.png"; // Asegúrate de tener esta imagen

function AdminLayout() {
  const [activeSection, setActiveSection] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleMainView = () => {
    navigate("/adminlayout");
    setActiveSection(null);
  };

  const handleNavigation = (section) => {
    navigate(`/adminlayout/${section}`);
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
    <div className="admin-container">
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
            <summary>Autentificación y Seguridad</summary>
            <button onClick={() => handleNavigation("gestionar-bitacora")}>
              Gestionar Bitácora del sistema
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
        </div>
      </aside>

      <main className="main-content">
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
}

export default AdminLayout;
