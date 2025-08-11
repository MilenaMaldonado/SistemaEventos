import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import EventoDetallePublico from './pages/EventoDetallePublico';
import Eventos from './pages/Eventos';
import Profile from './pages/Profile';
import ComprarEvento from './pages/ComprarEvento';
import ComprarBoletos from './pages/ComprarBoletos';
import MisCompras from './pages/MisCompras';
import GestionEventos from './pages/GestionEventos';
import GestionCategorias from './pages/GestionCategorias';
import GestionUsuarios from './pages/GestionUsuarios';
import TodasLasCompras from './pages/TodasLasCompras';
import NoAutorizado from './pages/NoAutorizado';
import Navbar from './components/Navbar';
import GestionCiudades from './pages/GestionCiudades';
import AdminReportes from './pages/AdminReportes';
import './App.css';

function App() {
  console.log("App: Rendering Navbar"); // Verificar si Navbar se está renderizando

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <Navbar />
        <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/no-autorizado" element={<NoAutorizado />} />
        <Route path="/evento/:id" element={<EventoDetallePublico />} />
        <Route 
          path="/comprar-boletos/:id" 
          element={
            <ProtectedRoute roles={["CLIENTE", "ADMINISTRADOR"]}>
              <ComprarBoletos />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/comprar-evento/:id" 
          element={
            <ProtectedRoute roles={["CLIENTE", "ADMINISTRADOR"]}>
              <ComprarEvento />
            </ProtectedRoute>
          }
        />
        
        {/* Rutas para Clientes y Administradores */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute roles={["CLIENTE", "ADMINISTRADOR"]}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/mis-compras" 
          element={
            <ProtectedRoute roles={["CLIENTE", "ADMINISTRADOR"]}>
              <MisCompras />
            </ProtectedRoute>
          }
        />

        {/* Rutas exclusivas para Administrador */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute roles={["ADMINISTRADOR"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/eventos" 
          element={
            <ProtectedRoute roles={["ADMINISTRADOR"]}>
              <GestionEventos />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/categorias" 
          element={
            <ProtectedRoute roles={["ADMINISTRADOR"]}>
              <GestionCategorias />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/usuarios" 
          element={
            <ProtectedRoute roles={["ADMINISTRADOR"]}>
              <GestionUsuarios />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/ciudades" 
          element={
            <ProtectedRoute roles={["ADMINISTRADOR"]}>
              <GestionCiudades />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute roles={["ADMINISTRADOR"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/compras" 
          element={
            <ProtectedRoute roles={["ADMINISTRADOR"]}>
              <TodasLasCompras />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/tickets" 
          element={
            <ProtectedRoute roles={["ADMINISTRADOR"]}>
              <TodasLasCompras />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/reportes" 
          element={
            <ProtectedRoute roles={["ADMINISTRADOR"]}>
              <AdminReportes />
            </ProtectedRoute>
          }
        />

        {/* Ruta para manejar rutas no encontradas */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;