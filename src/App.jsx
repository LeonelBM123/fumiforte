import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import UserLayout from "./layouts/UserLayout";
import RegisterUser from './pages/RegisterUser';
import AdminLayout from "./layouts/AdminLayout";
import WorkerLayout from "./layouts/WorkerLayout";
import PruebasSesion from "./pages/PruebasSesion";
import GestionarUsuario from "./pages/GestionarUsuario";
import GestionarProveedor from "./pages/GestionarProveedor";
import GestionarPlaga from "./pages/GestionarPlaga";
import GestionarBitacora from "./pages/GestionarBitacora";
import GestionarInventario from "./pages/GestionarInventario";
import GestionarCertificado from "./pages/GestionarCertificado";
import SolicitarServicioFumigacion from "./pages/SolicitarServicioFumigacion";
import SolicitudesList from "./pages/GestionarSolicitudServicio";
import GestionarTareaTrabajadores from "./pages/GestionarTareaTrabajadores";
import PagoCotizacionSesionUser from "./pages/PagoCotizacionSesionUser";
import ListarPagosCotizacion from "./pages/ListaPagoCotizacion";
import ListarPagosSesion from "./pages/ListaPagoSesion";
import PagoSesionDirecto from "./pages/PagoSesionDirecto";
import PagoCotizacionDirecto from "./pages/PagoCotizacionDirecto";
import AdministrarPagos from "./pages/AdministrarPagos";
import UserDashboard from "./pages/UserDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import Calificaciones from "./pages/Calificaciones";
import GestionarHistorial from "./pages/GestionarHistorial";
import AdminCalendar from "./pages/AdminCalendar";
import ReportesLayout from "./pages/Reportes/ReportesLayout";
import UsuarioReporte from "./pages/Reportes/UsuarioReporte";
import CertificadoFumigacionReporte from "./pages/Reportes/CertificadoFumigacionReporte";
import BitacoraReporte from "./pages/Reportes/BitacoraReporte";
import SolicitudServicioReporte from "./pages/Reportes/SolicitudServicioReporte";
import SesionReporte from "./pages/Reportes/SesionReporte";
import PagoCotizacionReporte from "./pages/Reportes/PagoCotizacionReporte";
import PagoSesionReporte from "./pages/Reportes/PagoSesionReporte";
import PlagasInvolucradasReporte from "./pages/Reportes/PlagasInvolucradasReporte";
import ProductosUsadosReporte from "./pages/Reportes/ProductosUsadosReporte";
import DetalleCompraReporte from "./pages/Reportes/DetalleCompraReporte";
import ProductoReporte from "./pages/Reportes/ProductoReporte";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rutas de inicio de sesión */}
        <Route path="/" element={<Login />} />
        <Route path="/register_user" element={<RegisterUser />} />

        {/* Rutas de usuario */}
        <Route path="/userlayout" element={<UserLayout />}>
          <Route index element={<UserDashboard />} /> {/* Ruta por defecto */}
          <Route path="solicitar-servicio-fumigacion" element={<SolicitarServicioFumigacion />} />
          <Route path="pagar-cotizacion-sesion" element={<PagoCotizacionSesionUser />} />
          <Route path="listar-pagos-sesion" element={<ListarPagosSesion />} />
          <Route path="pago-sesion" element={<PagoSesionDirecto />} />
          <Route path="listar-pagos-cotizacion" element={<ListarPagosCotizacion />} />
          <Route path="pago-cotizacion" element={<PagoCotizacionDirecto />} />
          <Route path="Calificaciones" element={<Calificaciones />} />
        </Route>

        {/* Rutas de trabajador */}
        <Route path="/workerlayout" element={<WorkerLayout />}>
          <Route index element={<WorkerDashboard />} /> {/* Ruta por defecto */}
          <Route path="pruebas-sesion" element={<PruebasSesion />} />

        </Route>

        {/* Rutas de administrador */}
        <Route path="/adminlayout" element={<AdminLayout />}>
          <Route index element={<SolicitudesList />} /> {/* Ruta por defecto */}
          <Route path="gestionar-usuario" element={<GestionarUsuario />} />
          <Route path="gestionar-plaga" element={<GestionarPlaga />} />
          <Route path="gestionar-proveedor" element={<GestionarProveedor />} />
          <Route path="gestionar-inventario" element={<GestionarInventario />} />
          <Route path="gestionar-bitacora" element={<GestionarBitacora />} />
          <Route path="gestionar-certificado" element={<GestionarCertificado />} />
          <Route path="gestionar-historial" element={<GestionarHistorial />} />
          <Route path="solicitudes" element={<SolicitudesList />} />
          <Route path="gestionar-tarea-trabajadores/:idSolicitudServicio" element={<GestionarTareaTrabajadores />} />
          <Route path="administrar-pagos" element={<AdministrarPagos />} />
          <Route path="admin-calendar" element={<AdminCalendar />} />

          <Route path="generar-reporte-layout" element={<ReportesLayout />}>
            <Route path="usuario-reporte" element={<UsuarioReporte />} />
            <Route path="certificado_fumigacion-reporte" element={<CertificadoFumigacionReporte />} />
            <Route path="bitacora-reporte" element={<BitacoraReporte />} />
            <Route path="solicitud_servicio-reporte" element={<SolicitudServicioReporte />} />
            <Route path="sesion-reporte" element={<SesionReporte />} />
            <Route path="pago_cotizacion-reporte" element={<PagoCotizacionReporte />} />
            <Route path="pago_sesion-reporte" element={<PagoSesionReporte />} />
            <Route path="plagas_involucradas-reporte" element={<PlagasInvolucradasReporte />} />
            <Route path="productos_usados-reporte" element={<ProductosUsadosReporte />} />
            <Route path="detalle_compra-reporte" element={<DetalleCompraReporte />} />
            <Route path="producto-reporte" element={<ProductoReporte />} />
            {/* Aquí irían los demás reportes también */}
          </Route>

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
