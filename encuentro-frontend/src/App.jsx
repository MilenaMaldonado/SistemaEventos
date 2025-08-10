import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import EventoDetalle from './pages/EventoDetalle';
import Eventos from './pages/Eventos';
import Profile from './pages/Profile';
import { AuthProvider } from './contexts/AuthContext';
import useAuth from './hooks/useAuth';
import './App.css'

function PrivateRoute({ children, roles }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />;
  return children;
}
function App() {

  return (
    <>
      <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/evento-detalle/:id" element={<EventoDetalle />} />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/admin-dashboard" element={
            <PrivateRoute roles={["ROLE_ADMINISTRADOR"]}>
              <AdminDashboard />
            </PrivateRoute>
          } />
          {/* Legacy routes for compatibility */}
          <Route path="/evento/:id" element={<EventoDetalle />} />
          <Route path="/admin" element={
            <PrivateRoute roles={["ROLE_ADMINISTRADOR"]}>
              <AdminDashboard />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
    </>
  )
}

export default App
