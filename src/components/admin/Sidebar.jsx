import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { 
  BarChart3, BookOpen, Users, Settings, FileText, Images, 
  DollarSign, MessageSquare, Bell, LayoutDashboard, Tag, 
  ShoppingCart, Eye, LogOut, PlayCircle, PlusCircle, Tv, Film, Gamepad2, Trophy
} from 'lucide-react'
import { cn } from '../../lib/utils'

const menuItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, section: 'MENU' },
  { label: 'News Management', href: '/admin/articles', icon: FileText, section: 'MENU' },
  { label: 'Categories', href: '/admin/categories', icon: Tag, section: 'MENU' },
  { label: 'Authors', href: '/admin/authors', icon: Users, section: 'MENU' },
  { label: 'Multimedia', href: '/admin/multimedia', icon: Images, section: 'MENU' },
  { label: 'Inquiry', href: '/admin/inquiry', icon: Images, section: 'MENU' },
  { label: 'Premium Content', href: '/admin/premium', icon: ShoppingCart, section: 'MENU' },
  { label: 'SEO Management', href: '/admin/seo', icon: Eye, section: 'MENU' },
  { label: 'Advertisements', href: '/admin/advertisements', icon: DollarSign, section: 'DISCOVERY' },
  { label: 'Comments', href: '/admin/comments', icon: MessageSquare, section: 'DISCOVERY' },
  { label: 'Gallery', href: '/admin/gallery', icon: MessageSquare, section: 'DISCOVERY' },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell, section: 'DISCOVERY' },
  { label: 'Videos', href: '/admin/videos', icon: Bell, section: 'DISCOVERY' },
  { label: 'Homepage', href: '/admin/homepage', icon: LayoutDashboard, section: 'DISCOVERY' },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, section: 'GENERAL' },
  { label: 'Users & Roles', href: '/admin/users', icon: Users, section: 'GENERAL' },
  { label: 'Magazines', href: '/admin/magazines', icon: BookOpen, section: 'GENERAL' },
  { label: 'Awards', href: '/admin/awards', icon: Trophy, section: 'GENERAL' },
  { label: 'Settings', href: '/admin/settings', icon: Settings, section: 'GENERAL' },
]

export function Sidebar() {
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  // Helper to render sections
  const renderSection = (sectionName) => {
    const items = menuItems.filter(item => item.section === sectionName);
    if (items.length === 0) return null;

    return (
      <div key={sectionName} className="py-2">
        <h3 className="px-6 py-2 text-[11px] font-bold text-gray-400 tracking-widest uppercase">
          {sectionName}
        </h3>
        {items.map((item) => {
          const Icon = item.icon
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
              {/* Optional notification dot like in the image */}
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
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Header/Logo Section */}
        <div className="p-6 mb-2">
          <h1 className="text-2xl font-black text-white tracking-tighter italic">
            CMS<span className="text-red-600">.</span>
          </h1>
        </div>

        {/* Navigation Content */}
        <nav className="flex-1">
          {renderSection('MENU')}
          {renderSection('DISCOVERY')}
          {renderSection('GENERAL')}
        </nav>

        {/* Logout Section */}
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