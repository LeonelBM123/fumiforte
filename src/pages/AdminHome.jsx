import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminHome.css";
import logo from "../assets/fumiforte-logo.png"; // asegurate que exista la imagen

function AdminHome() {
  const [activeSection, setActiveSection] = useState(null);
  const navigate = useNavigate();

  const handleMainView = () => {
    setActiveSection(null);
  };

  const handleNavigation = (section) => {
    navigate(section); // ejemplo: "/gestionar-usuario"
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
            <button onClick={() => handleNavigation("/gestionar-usuario")}>
              Registrar Trabajador
            </button>
            <button>Dar de baja Trabajador</button>
          </details>

          <details>
            <summary>Gestionar Proveedor</summary>
            <button>Registrar Proveedor</button>
            <button>Dar de baja Proveedor</button>
          </details>

          <details>
            <summary>Gestionar Plaga</summary>
            <button>Registrar Plaga</button>
            <button>Eliminar Plaga</button>
          </details>

          <details>
            <summary>Gestionar Inventario</summary>
            <button>Registrar Compra</button>
          </details>

          <details>
            <summary>Gestionar Bitacora</summary>
            <button>Ver Bitácora</button>
          </details>
        </div>
      </aside>

      <main className="main-content">
        {activeSection === null ? (
          <h2>Bienvenido al panel de administrador</h2>
        ) : (
          // Aquí se puede mostrar algo si querés en la vista principal
          <></>
        )}
      </main>
    </div>
  );
}

export default AdminHome;
