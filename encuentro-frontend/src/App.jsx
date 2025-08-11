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
import MisCompras from './pages/MisCompras';
import GestionEventos from './pages/GestionEventos';
import GestionCategorias from './pages/GestionCategorias';
import GestionUsuarios from './pages/GestionUsuarios';
import TodasLasCompras from './pages/TodasLasCompras';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  console.log("App: Rendering Navbar"); // Verificar si Navbar se está renderizando

  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
                    <Route path="/evento/:id" element={<EventoDetallePublico />} />
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
          path="/admin/compras" 
          element={
            <ProtectedRoute roles={["ADMINISTRADOR"]}>
              <TodasLasCompras />
            </ProtectedRoute>
          }
        />

        {/* Ruta para manejar rutas no encontradas */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;