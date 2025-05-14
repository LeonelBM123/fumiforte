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
    // lógica de editar perfil (puedes cambiar la ruta aquí)
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
            <summary>Gestionar Usuario</summary>
            <button onClick={() => handleNavigation("gestionar-usuario?view=registrar")}>
              Registrar Trabajador
            </button>
            <button onClick={() => handleNavigation("gestionar-usuario?view=baja")}>
              Dar de baja Trabajador
            </button>
          </details>

          <details>
            <summary>Gestionar Proveedor</summary>
            <button onClick={() => handleNavigation("gestionar-proveedor")}>
              Registrar Proveedor
            </button>
            <button>Dar de baja Proveedor</button>
          </details>

          <details>
            <summary>Gestionar Plaga</summary>
            <button onClick={() => handleNavigation("gestionar-plaga")}>
              Registrar Plaga
            </button>
            <button>Eliminar Plaga</button>
          </details>

          <details>
            <summary>Gestionar Inventario</summary>
            <button onClick={() => handleNavigation("gestionar-inventario")}>
              Registrar Compra
            </button>
          </details>

          <details>
            <summary>Gestionar Bitacora</summary>
            <button onClick={() => handleNavigation("gestionar-bitacora")}>
              Ver Bitácora
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