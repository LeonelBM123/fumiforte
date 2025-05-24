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
          </details>
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

