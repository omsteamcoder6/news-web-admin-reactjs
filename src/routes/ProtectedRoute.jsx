// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import authApi from '../lib/authorApi';

export default function ProtectedRoute({ children, requiredRole = null }) {
  // Check authentication from multiple sources
  const { isAuthenticated } = useAuthStore();
  
  // Function to check if user is authenticated from localStorage
  const checkLocalStorageAuth = () => {
    try {
      // Check auth-storage first
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        if (authData.state?.isAuthenticated && authData.state?.token) {
          return true;
        }
      }
      
      // Check accessToken
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        return true;
      }
      
      // Check token
      const token = localStorage.getItem('token');
      if (token) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking localStorage auth:', error);
      return false;
    }
  };
  
  // Function to get user role from localStorage
  const getUserRole = () => {
    try {
      // Check auth-storage first
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        if (authData.state?.user?.role) {
          return authData.state.user.role;
        }
      }
      
      // Check userRole
      const userRole = localStorage.getItem('userRole');
      if (userRole) {
        return userRole.toLowerCase();
      }
      
      // Check if user object exists
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        if (userData.role) {
          return userData.role;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  };
  
  // Check if authenticated
  const isAuth = isAuthenticated || authApi.isAuthenticated() || checkLocalStorageAuth();
  
  // If not authenticated, redirect to home
  if (!isAuth) {
    return <Navigate to="/" replace />;
  }
  
  // If role is required, check if user has the correct role
  if (requiredRole) {
    const userRole = getUserRole();
    
    // Admin has access to everything
    if (userRole === 'admin') {
      return children;
    }
    
    // Check if user role matches required role
    if (userRole !== requiredRole) {
      // Redirect to unauthorized page or dashboard based on role
      if (userRole === 'admin') {
        return <Navigate to="/admin" replace />;
      } else if (userRole === 'user') {
        return <Navigate to="/dashboard" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }
  
  return children;
}