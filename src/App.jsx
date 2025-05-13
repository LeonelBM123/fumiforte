import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import UserHome from "./pages/UserHome";
import Register from './pages/Register';
import AdminHome from "./pages/AdminHome";
import GestionarUsuario from "./pages/GestionarUsuario";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/userhome" element={<UserHome />} />
        
        <Route path="/adminhome" element={<AdminHome />} />
        <Route path="/gestionar-usuario" element={<GestionarUsuario />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;