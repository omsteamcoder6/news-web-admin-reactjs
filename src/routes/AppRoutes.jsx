import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Pages (adjust paths if needed)
import AdminDashboard from '../pages/admin/Dashboard';
import Articles from '../pages/admin/Articles';
import Categories from '../pages/admin/Categories';
import CategoryCustomize from '../pages/admin/CategoryCustomize';
import Authors from '../pages/admin/Authors';
import Multimedia from '../pages/admin/Multimedia';
import Premium from '../pages/admin/Premium';
import SEO from '../pages/admin/SEO';
import Advertisements from '../pages/admin/Advertisements';
import Comments from '../pages/admin/Comments';
import Notifications from '../pages/admin/Notifications';
import Homepage from '../pages/admin/Homepage';
import Analytics from '../pages/admin/Analytics';
import Users from '../pages/admin/Users';
import Magazines from '../pages/admin/Magazines';
import Settings from '../pages/admin/Settings';
import NewArticle from '../pages/admin/articles/New';
import Awards from '../pages/admin/Awards';
import LoginPage from '../pages/admin/LoginPage';
import Gallery from '../pages/admin/Gallery';
import Videos from '../pages/admin/Videos';
import Inquiry from '../pages/admin/Inquiry';
import Header from '../pages/admin/Header';
import HeaderManager from '../components/admin/HeaderManager';
import Contacts from '../pages/admin/Contacts'; 
import Products from '../pages/admin/Products';
import Events from '../pages/admin/Events';

const AppRoute = () => {
  return (
    <Routes>
      {/* Public route - Login page */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Admin Routes - Only accessible when logged in */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/articles" element={
        <ProtectedRoute requiredRole="admin">
          <Articles />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/articles/new" element={
        <ProtectedRoute requiredRole="admin">
          <NewArticle />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/categories" element={
        <ProtectedRoute requiredRole="admin">
          <Categories />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/categories/:id/customize" element={
        <ProtectedRoute requiredRole="admin">
          <CategoryCustomize />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/authors" element={
        <ProtectedRoute requiredRole="admin">
          <Authors />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/multimedia" element={
        <ProtectedRoute requiredRole="admin">
          <Multimedia />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/premium" element={
        <ProtectedRoute requiredRole="admin">
          <Premium />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/seo" element={
        <ProtectedRoute requiredRole="admin">
          <SEO />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/advertisements" element={
        <ProtectedRoute requiredRole="admin">
          <Advertisements />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/comments" element={
        <ProtectedRoute requiredRole="admin">
          <Comments />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/notifications" element={
        <ProtectedRoute requiredRole="admin">
          <Notifications />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/homepage" element={
        <ProtectedRoute requiredRole="admin">
          <Homepage />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/videos" element={
        <ProtectedRoute requiredRole="admin">
          <Videos />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/analytics" element={
        <ProtectedRoute requiredRole="admin">
          <Analytics />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/users" element={
        <ProtectedRoute requiredRole="admin">
          <Users />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/magazines" element={
        <ProtectedRoute requiredRole="admin">
          <Magazines />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/awards" element={
        <ProtectedRoute requiredRole="admin">
          <Awards />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/gallery" element={
        <ProtectedRoute requiredRole="admin">
          <Gallery />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/settings" element={
        <ProtectedRoute requiredRole="admin">
          <Settings />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/inquiry" element={
        <ProtectedRoute requiredRole="admin">
          <Inquiry />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/header" element={
        <ProtectedRoute requiredRole="admin">
          <HeaderManager />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/contacts" element={
        <ProtectedRoute requiredRole="admin">
          <Contacts />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/products" element={
        <ProtectedRoute requiredRole="admin">
          <Products />
        </ProtectedRoute>
      } />

      <Route path="/admin/events" element={
        <ProtectedRoute requiredRole="admin">
          <Events />
        </ProtectedRoute>
      } />
    </Routes>

    
  );
};

export default AppRoute;