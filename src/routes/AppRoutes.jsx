import { Routes, Route } from 'react-router-dom';

// Pages (adjust paths if needed)
import AdminDashboard from '../pages/admin/Dashboard';
import Articles from '../pages/admin/Articles';
import Categories from '../pages/admin/Categories';
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
// Remove the Contact import from lucide-react

// Create a simple Home component if you don't have one
const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Application</h1>
        <p className="text-gray-600">Please <a href="/login" className="text-blue-500 hover:underline">login</a> to access the admin panel</p>
      </div>
    </div>
  );
};

const AppRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/articles" element={<Articles />} />
      <Route path="/admin/articles/new" element={<NewArticle />} />
      <Route path="/admin/categories" element={<Categories />} />
      <Route path="/admin/authors" element={<Authors />} />
      <Route path="/admin/multimedia" element={<Multimedia />} />
      <Route path="/admin/premium" element={<Premium />} />
      <Route path="/admin/seo" element={<SEO />} />
      <Route path="/admin/advertisements" element={<Advertisements />} />
      <Route path="/admin/comments" element={<Comments />} />
      <Route path="/admin/notifications" element={<Notifications />} />
      <Route path="/admin/homepage" element={<Homepage />} />
      <Route path="/admin/videos" element={<Videos />} />
      <Route path="/admin/analytics" element={<Analytics />} />
      <Route path="/admin/users" element={<Users />} />
      <Route path="/admin/magazines" element={<Magazines />} />
      <Route path="/admin/awards" element={<Awards />} />
      <Route path="/admin/gallery" element={<Gallery />} />
      <Route path="/admin/settings" element={<Settings />} />
      <Route path="/admin/inquiry" element={<Inquiry />} />
      <Route path="/admin/header" element={<HeaderManager />} />
      <Route path="/admin/contacts" element={<Contacts />} /> \
      <Route path="/admin/products" element={<Products />} /> 
    </Routes>
  );
};

export default AppRoute;