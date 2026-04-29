// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import authApi from '../lib/authorApi';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  const isAuth = isAuthenticated || authApi.isAuthenticated();
  
  if (!isAuth) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}