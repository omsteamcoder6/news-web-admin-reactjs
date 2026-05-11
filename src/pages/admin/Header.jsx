import { Search, User, ChevronDown, LogOut } from "lucide-react";
import { MainLayout } from "../../layout/MainLayout";

export default function Header() {
  const navLinks = [
    { name: "Home", href: "#" },
    { name: "News", href: "#", hasDropdown: true },
    { name: "Products", href: "#", hasDropdown: true },
    { name: "Awards", href: "#" },
    { name: "Events", href: "#" },
    { name: "Gallery", href: "#" },
    { name: "Contact Us", href: "#" },
  ];

  const trendingItems = [
    "Election-2026",
    "வெப்ப அலை",
    "ஹிட் பாடல்கள்",
  ];

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
                src="/logo-icon.png" // Replace with your actual logo icon path
                alt="Logo" 
                className="w-10 h-10 object-contain"
              />
              <h1 className="text-3xl font-serif font-bold tracking-widest text-gray-900 uppercase">
                Readers Inspiration
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

        {/* 2. NAVIGATION MENU */}
        <nav className="border-t border-gray-100">
          <ul className="flex items-center justify-center gap-8 py-3">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a 
                  href={link.href} 
                  className="flex items-center gap-1 text-[13px] font-medium text-gray-700 hover:text-amber-600 transition-colors"
                >
                  {link.name}
                  {link.hasDropdown && <ChevronDown className="w-3 h-3" />}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* 3. TRENDING BAR */}
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
            {trendingItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 shrink-0">
                <span className="text-sm font-medium text-gray-400 hover:text-gray-900 cursor-pointer transition-colors">
                  {item}
                </span>
                {idx !== trendingItems.length - 1 && (
                  <span className="text-gray-300">|</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </header>
    </MainLayout>
  );
}