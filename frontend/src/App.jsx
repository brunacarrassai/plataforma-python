// App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ExercisesPage from './pages/ExercisesPage';
import SolvePage from './pages/SolvePage';
import DashboardPage from './pages/DashboardPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rotas protegidas */}
      <Route path="/" element={
        <PrivateRoute><ExercisesPage /></PrivateRoute>
      } />
      <Route path="/exercises/:id" element={
        <PrivateRoute><SolvePage /></PrivateRoute>
      } />
      <Route path="/dashboard" element={
        <PrivateRoute><DashboardPage /></PrivateRoute>
      } />

      {/* Rota desconhecida */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}