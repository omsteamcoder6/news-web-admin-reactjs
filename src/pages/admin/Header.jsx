import { Search, User, ChevronDown, LogOut } from "lucide-react";
import { MainLayout } from "../../layout/MainLayout";
import { useState, useEffect } from "react";

// Use environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL ;
const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL ;

export default function Header() {
  const [headerData, setHeaderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navLinks, setNavLinks] = useState([]);
  const [logoUrl, setLogoUrl] = useState("/logo-icon.png");
  const [brandName, setBrandName] = useState("Readers Inspiration");

  // Fetch header settings from API
  useEffect(() => {
    const fetchHeaderSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/header`);
        const result = await response.json();
        
        if (result.success && result.data) {
          const data = result.data;
          setHeaderData(data);
          
          // Set navigation links from API
          if (data.navItems && Array.isArray(data.navItems)) {
            const activeNavItems = data.navItems.filter(item => item.isActive !== false);
            setNavLinks(activeNavItems);
          }
          
          // Set brand name from API
          if (data.brandName) {
            setBrandName(data.brandName);
          }
          
          // Set logo URL from API (prepend media base URL)
          if (data.logoUrl) {
            const cleanLogoUrl = data.logoUrl.startsWith('/') ? data.logoUrl : `/${data.logoUrl}`;
            setLogoUrl(`${MEDIA_BASE_URL}${cleanLogoUrl}`);
          }
        }
      } catch (error) {
        console.error("Error fetching header settings:", error);
        // Fallback to default values if API fails
        setNavLinks([
          { name: "Home", href: "/", hasDropdown: false },
          { name: "News", href: "/news", hasDropdown: true },
          { name: "Products", href: "/products", hasDropdown: true },
          { name: "Awards", href: "/awards", hasDropdown: false },
          { name: "Events", href: "/events", hasDropdown: false },
          { name: "Gallery", href: "/gallery", hasDropdown: false },
          { name: "Contact Us", href: "/contact", hasDropdown: false },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeaderSettings();
  }, []);

  // Show loading or minimal header while fetching
  if (loading) {
    return (
      <MainLayout>
        <header className="w-full bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="animate-pulse flex justify-center">
              <div className="h-8 w-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </header>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <header className="w-full bg-white border-b border-gray-100">
        {/* 1. TOP BAR: Search, Logo, Profile */}
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex-1">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="flex-[2] flex flex-col items-center">
            <div className="flex items-center gap-3">
              <img 
                src={logoUrl}
                alt="Logo" 
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.target.src = "/logo-icon.png";
                }}
              />
              <h1 className="text-3xl font-serif font-bold tracking-widest text-gray-900 uppercase">
                {brandName}
              </h1>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-end gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200">
              <div className="bg-gray-200 p-1 rounded-md">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">richardblesso</span>
              <LogOut className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500" />
            </div>
            <button className="px-6 py-2 border-2 border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-widest hover:bg-amber-50 transition-colors">
              Subscribe
            </button>
          </div>
        </div>

        {/* 2. NAVIGATION MENU - Dynamic from API */}
        <nav className="border-t border-gray-100">
          <ul className="flex items-center justify-center gap-8 py-3">
            {navLinks.map((link) => (
              <li key={link.label || link.name}>
                <a 
                  href={link.href} 
                  className="flex items-center gap-1 text-[13px] font-medium text-gray-700 hover:text-amber-600 transition-colors"
                >
                  {link.label || link.name}
                  {(link.hasDropdown) && <ChevronDown className="w-3 h-3" />}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* 3. TRENDING BAR - Keeping as is (already managed by TrendingBar component) */}
        <div className="w-full flex items-center bg-white border-t border-b border-gray-100 h-12 overflow-hidden">
          <div className="bg-red-600 text-white px-4 h-full flex items-center shrink-0">
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-tighter italic">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Trending Now
            </span>
          </div>
          
          <div className="bg-[#2a2a2a] text-white px-4 h-full flex items-center gap-2 shrink-0">
            <span className="text-lg">📰</span>
            <span className="text-xs font-bold uppercase tracking-tight">Today News Live</span>
            <span className="bg-red-600/20 text-red-500 text-[10px] px-1.5 py-0.5 rounded border border-red-500/30 font-bold leading-none">
              LIVE
            </span>
          </div>

          <div className="flex items-center gap-4 px-6 overflow-hidden">
            {/* Trending items will be handled by TrendingBar component */}
            <span className="text-sm font-medium text-gray-400">
              Loading trending...
            </span>
          </div>
        </div>
      </header>
    </MainLayout>
  );
}