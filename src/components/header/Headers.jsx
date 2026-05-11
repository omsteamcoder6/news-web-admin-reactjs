import React from 'react';
import { Search, User, LogOut, ChevronDown } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full bg-white font-sans text-gray-800">
      {/* Top Section: Search, Logo, User Actions */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Left: Search Icon */}
        <div className="w-1/3">
          <button className="hover:text-amber-600 transition-colors">
            <Search size={20} />
          </button>
        </div>

        {/* Center: Logo */}
        <div className="w-1/3 flex justify-center items-center gap-3">
          <div className="flex items-center">
             {/* Replace with your actual logo img tag */}
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-2">
                 <span className="text-amber-700 font-bold text-xl">RI</span>
            </div>
            <h1 className="text-2xl font-serif font-black tracking-widest uppercase">
              READERS INSPIRATION
            </h1>
          </div>
        </div>

        {/* Right: User and Subscribe */}
        <div className="w-1/3 flex justify-end items-center gap-4">
          <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-sm border border-gray-200">
            <User size={16} className="mr-2 text-gray-500" />
            <span className="text-sm font-medium mr-2">richardblesso</span>
            <LogOut size={16} className="text-gray-400 cursor-pointer hover:text-red-500" />
          </div>
          <button className="border border-amber-600 text-amber-600 px-6 py-2 text-xs font-bold tracking-widest uppercase hover:bg-amber-600 hover:text-white transition-all">
            Subscribe
          </button>
        </div>
      </div>

      {/* Middle Section: Navigation Menu */}
      <nav className="border-t border-b border-gray-100 py-2">
        <ul className="flex justify-center items-center gap-8 text-xs font-semibold uppercase tracking-tight text-gray-600">
          <li className="hover:text-amber-600 cursor-pointer">Home</li>
          <li className="flex items-center hover:text-amber-600 cursor-pointer gap-1">
            News <ChevronDown size={14} />
          </li>
          <li className="flex items-center hover:text-amber-600 cursor-pointer gap-1">
            Products <ChevronDown size={14} />
          </li>
          <li className="hover:text-amber-600 cursor-pointer">Awards</li>
          <li className="hover:text-amber-600 cursor-pointer">Events</li>
          <li className="hover:text-amber-600 cursor-pointer">Gallery</li>
          <li className="hover:text-amber-600 cursor-pointer">Contact Us</li>
        </ul>
      </nav>

      {/* Bottom Section: Trending Ticker */}
      <div className="flex items-center bg-gray-50 border-b border-gray-200 h-10 overflow-hidden">
        {/* Red Trending Badge */}
        <div className="bg-red-600 text-white px-4 h-full flex items-center text-[10px] font-bold whitespace-nowrap uppercase italic">
          <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
          Trending Now
        </div>

        {/* Black News Live Badge */}
        <div className="bg-[#1a1a1a] text-white px-4 h-full flex items-center text-[10px] font-bold whitespace-nowrap uppercase">
          <span className="mr-2">🗞️ Today News Live</span>
          <span className="bg-red-700 text-[8px] px-1.5 py-0.5 rounded ml-1">Live</span>
        </div>

        {/* Scrolling News Text */}
        <div className="flex-1 px-4 overflow-hidden">
          <div className="flex items-center gap-6 text-[11px] text-gray-500 font-medium animate-marquee whitespace-nowrap">
            <span>Election-2026</span>
            <span className="text-gray-300">|</span>
            <span className="font-tamil">"வெப்ப அலை"</span>
            <span className="text-gray-300">|</span>
            <span className="font-tamil">"ஹிட் பாடல்கள்"</span>
            <span className="text-gray-300">|</span>
            <span>New Updates Coming Soon...</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;