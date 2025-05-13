import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "../styles/AdminLayout.css";
import logo from "../assets/fumiforte-logo.png"; // asegurate que exista la imagen

function AdminLayout() {
  const [activeSection, setActiveSection] = useState(null);
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

  return (
    <div className="admin-container">
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
        {/* Usamos el Outlet con un 'key' dinámico para forzar el renderizado */}
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
}

export default AdminLayout;