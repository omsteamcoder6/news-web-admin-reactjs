import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { 
  BarChart3, BookOpen, Users, Settings, FileText, Images, 
  DollarSign, MessageSquare, Bell, LayoutDashboard, Tag, 
  ShoppingCart, Eye, LogOut, PlayCircle, PlusCircle, Tv, Film, Gamepad2, Trophy,
  Mail, Home, Video, Image, Award, UserCog, Newspaper, TrendingUp, 
  Calendar, Star, FolderTree, Headphones, HelpCircle, Shield, Palette, Camera
} from 'lucide-react'
import { cn } from '../../lib/utils'

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getIconForLabel = (label) => {
  const iconMap = {
    'Dashboard': LayoutDashboard,
    'News Management': Newspaper,
    'Header': LayoutDashboard,
    'Categories': FolderTree,
    'Authors': Users,
    'Multimedia': Images,
    'Inquiry': HelpCircle,
    'Premium Content': Star,
    'SEO Management': TrendingUp,
    'Products': ShoppingCart,
    'Advertisements': DollarSign,
    'Comments': MessageSquare,
    'Gallery': Camera,
    'Notifications': Bell,
    'Videos': Video,
    'Contact': Mail,
    'Homepage': Home,
    'Analytics': BarChart3,
    'Users & Roles': UserCog,
    'Magazines': BookOpen,
    'Awards': Trophy,
    'Settings': Settings,
  }
  
  return iconMap[label] || LayoutDashboard
}

const menuItems = [
  { label: 'Dashboard', href: '/admin', section: 'MENU' },
  { label: 'News Management', href: '/admin/articles', section: 'MENU' },
  { label: 'Products', href: '/admin/products', section: 'MENU' },
  { label: 'Header', href: '/admin/header', section: 'MENU' },
  { label: 'Categories', href: '/admin/categories', section: 'MENU' },
  { label: 'Authors', href: '/admin/authors', section: 'MENU' },
  { label: 'Multimedia', href: '/admin/multimedia', section: 'MENU' },
  { label: 'Inquiry', href: '/admin/inquiry', section: 'MENU' },
  { label: 'Premium Content', href: '/admin/premium', section: 'MENU' },
  { label: 'SEO Management', href: '/admin/seo', section: 'MENU' },
  { label: 'Advertisements', href: '/admin/advertisements', section: 'DISCOVERY' },
  { label: 'Comments', href: '/admin/comments', section: 'DISCOVERY' },
  { label: 'Gallery', href: '/admin/gallery', section: 'DISCOVERY' },
  { label: 'Notifications', href: '/admin/notifications', section: 'DISCOVERY' },
  { label: 'Videos', href: '/admin/videos', section: 'DISCOVERY' },
  { label: 'Contact', href: '/admin/contacts', section: 'DISCOVERY' },
  { label: 'Homepage', href: '/admin/homepage', section: 'DISCOVERY' },
  { label: 'Analytics', href: '/admin/analytics', section: 'GENERAL' },
  { label: 'Users & Roles', href: '/admin/users', section: 'GENERAL' },
  { label: 'Magazines', href: '/admin/magazines', section: 'GENERAL' },
  { label: 'Awards', href: '/admin/awards', section: 'GENERAL' },
  { label: 'Settings', href: '/admin/settings', section: 'GENERAL' },
]

export function Sidebar() {
  const location = useLocation()

  const handleLogout = async () => {
    try {
      // Try to get token from auth-storage first
      let token = null;
      const authStorage = localStorage.getItem('auth-storage');
      
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        token = authData.state?.token;
      }
      
      // If not found, try accessToken
      if (!token) {
        token = localStorage.getItem('accessToken');
      }
      
      if (token) {
        // Call logout API to blacklist the token
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(err => console.error('Logout API error:', err));
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear ALL authentication-related items from localStorage
      const authKeys = [
        'token',
        'user', 
        'accessToken',
        'refreshToken',
        'tokenExpiry',
        'userRole',
        'username',
        'auth-storage'
      ];
      
      authKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Also clear any items that start with 'category_layout_' or other app-specific items if needed
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('category_layout_') || 
                    key.startsWith('tinymce-') ||
                    key === 'theme' ||
                    key === 'language')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Clear sessionStorage if used
      sessionStorage.clear();
      
      // Redirect to home page
      window.location.href = '/';
    }
  }

  const renderSection = (sectionName) => {
    const items = menuItems.filter(item => item.section === sectionName);
    if (items.length === 0) return null;

    return (
      <div key={sectionName} className="py-2">
        <h3 className="px-6 py-2 text-[11px] font-bold text-gray-400 tracking-widest uppercase">
          {sectionName}
        </h3>
        {items.map((item) => {
          const Icon = getIconForLabel(item.label)
          const isActive = location.pathname === item.href

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-4 px-6 py-3 transition-all duration-200 relative group',
                isActive
                  ? 'bg-red-600 text-white'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-400")} />
              <span className="text-sm font-medium">{item.label}</span>
              {item.label === 'Notifications' && (
                <span className="ml-auto bg-red-500 text-[10px] w-4 h-4 flex items-center justify-center rounded-full">7</span>
              )}
            </Link>
          )
        })}
        <div className="mx-6 border-b border-gray-700/50 my-2" />
      </div>
    )
  }

  return (
    <aside className="w-64 bg-[#1a1a1a] text-white h-screen fixed left-0 top-0 overflow-y-auto flex flex-col border-r border-white/10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-2xl">
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="p-6 mb-2">
          <h1 className="text-2xl font-black text-white tracking-tighter italic">
            CMS<span className="text-red-600">.</span>
          </h1>
        </div>

        <nav className="flex-1">
          {renderSection('MENU')}
          {renderSection('DISCOVERY')}
          {renderSection('GENERAL')}
        </nav>

        <div className="p-4 bg-black/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 text-gray-400 hover:bg-red-600 hover:text-white group"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-semibold">LOGOUT</span>
          </button>
        </div>
      </div>
    </aside>
  )
}