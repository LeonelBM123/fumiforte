import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import UserLayout from "./layouts/UserLayout";
import Register from './pages/Register';
import AdminLayout from "./layouts/AdminLayout";
import GestionarUsuario from "./pages/GestionarUsuario";
import GestionarProveedor from "./pages/GestionarProveedor";
import GestionarPlaga from "./pages/GestionarPlaga";
import GestionarBitacora from "./pages/GestionarBitacora";
import GestionarInventario from "./pages/GestionarInventario";
import SolicitarServicioFumigacion from "./pages/SolicitarServicioFumigacion";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rutas de inicio de sesion */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas dentro del diseño de usuario */}
        <Route path="/userlayout" element={<UserLayout />}>
          <Route path="solicitar-servicio-fumigacion" element={<SolicitarServicioFumigacion />} />
        </Route>

        {/* Rutas dentro del diseño de administrador */}
        <Route path="/adminlayout" element={<AdminLayout />}>
          <Route path="gestionar-usuario" element={<GestionarUsuario />} />
          <Route path="gestionar-plaga" element={<GestionarPlaga />} />
          <Route path="gestionar-proveedor" element={<GestionarProveedor/>} />
          <Route path="gestionar-inventario" element={<GestionarInventario />} />
          <Route path="gestionar-bitacora" element={<GestionarBitacora />} />
        </Route>        
      </Routes>
    </BrowserRouter>
  );
}

export default App;