import React, { useState, useEffect } from 'react';
import {
  Home,
  Radio,
  CalendarDays,
  Trophy,
  Users,
  User,
  Newspaper,
  ArrowLeftRight,
  BarChart3,
  Star,
  Crown,
  Moon,
  Sun,
  Search,
  Bell,
  ChevronDown,
  Flame,
  Volume2,
  VolumeX,
  Code2,
} from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function MainLayout({
  children,
  activeNavItem = 'maclar',
  onSelectNavItem,
  activeSport = 'futbol',
  onSelectSport,
  searchQuery,
  onSearchChange,
  soundEnabled,
  onToggleSound,
  favCount = 0,
  isDark = true,
  onToggleTheme,
}) {
  const sidebarNavItems = [
    { id: 'home', label: 'Ana Sayfa', icon: Home, href: '/' },
    { id: 'canli', label: 'Canlı Skor', icon: Radio, badge: 'CANLI', href: '/' },
    { id: 'maclar', label: 'Maçlar', icon: CalendarDays, href: '/' },
    { id: 'ligler', label: 'Ligler', icon: Trophy, href: '/' },
    { id: 'takimlar', label: 'Takımlar', icon: Users, href: '/' },
    { id: 'oyuncular', label: 'Oyuncular', icon: User, href: '/' },
    { id: 'haberler', label: 'Haberler', icon: Newspaper, href: '/' },
    { id: 'transferler', label: 'Transferler', icon: ArrowLeftRight, href: '/' },
    { id: 'istatistikler', label: 'İstatistikler', icon: BarChart3, href: '/' },
    { id: 'favoriler', label: 'Favoriler', icon: Star, count: favCount, href: '/' },
    { id: 'api-docs', label: 'API Dokümanı', icon: Code2, href: '/apikullanimi' },
  ];

  const sports = [
    { id: 'futbol', label: 'Futbol', icon: '⚽' },
    { id: 'basketbol', label: 'Basketbol', icon: '🏀' },
    { id: 'tenis', label: 'Tenis', icon: '🎾' },
    { id: 'voleybol', label: 'Voleybol', icon: '🏐' },
    { id: 'diger', label: 'Diğer', icon: '🎯' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 flex font-['Inter',sans-serif] selection:bg-emerald-500 selection:text-black ${isDark ? 'bg-[#070D17] text-slate-200' : 'bg-slate-100 text-slate-900'
      }`}>
      {/* LEFT SIDEBAR */}
      <aside className={`w-64 border-r flex flex-col justify-between shrink-0 hidden lg:flex transition-colors duration-300 ${isDark ? 'bg-[#0B131F] border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
        }`}>
        <div>
          {/* Brand Logo */}
          <Link href="/" className={`h-16 px-6 flex items-center space-x-3 border-b transition-colors ${isDark ? 'border-slate-800/60 hover:bg-slate-800/20' : 'border-slate-200 hover:bg-slate-50'
            }`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isDark ? 'bg-[#0B131F]' : 'bg-white'}`}>
                <Flame className="w-5 h-5 text-emerald-500 fill-emerald-500 animate-pulse" />
              </div>
            </div>
            <div>
              <span className={`font-extrabold text-lg tracking-tight flex items-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Goal<span className="text-emerald-500">Pulse</span>
              </span>
              <span className={`text-[10px] block -mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Misli.com Canlı Skor
              </span>
            </div>
          </Link>

          {/* Navigation List */}
          <nav className="p-4 space-y-1.5">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNavItem === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => onSelectNavItem && onSelectNavItem(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${isActive
                    ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shadow-md shadow-emerald-500/10'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-red-500/20 text-red-500 border border-red-500/30 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {item.count > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-500">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Cards */}
        <div className={`p-4 space-y-3 border-t ${isDark ? 'border-slate-800/60' : 'border-slate-200'}`}>
          {/* Premium Banner */}
          <div className={`p-3.5 rounded-2xl border relative overflow-hidden ${isDark
            ? 'bg-gradient-to-b from-[#121E2F] to-[#0D1624] border-slate-800/90'
            : 'bg-gradient-to-b from-slate-50 to-slate-100 border-slate-200'
            }`}>
            <div className="flex items-center space-x-2 mb-1.5">
              <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Premium Üyelik</span>
            </div>
            <p className={`text-[11px] mb-3 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Reklamsız, detaylı istatistikler ve daha fazlası.
            </p>
            <button className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all duration-200">
              Hemen Yükselt
            </button>
          </div>

          {/* Theme & Sound Controls */}
          <div className={`flex items-center justify-between px-3 py-2 border rounded-xl text-xs ${isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
            }`}>
            <button
              onClick={onToggleSound}
              className={`flex items-center space-x-2 transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span className="text-[11px] font-semibold">{soundEnabled ? 'Ses Açık' : 'Sessiz'}</span>
            </button>

            {/* Dark / Light Mode Switcher */}
            <button
              onClick={onToggleTheme}
              className="flex items-center space-x-2 text-slate-400 hover:text-emerald-500 transition-colors"
              title="Temayı Değiştir (Açık/Koyu)"
            >
              {isDark ? (
                <Moon className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              )}
              <div className={`w-8 h-4 rounded-full relative p-0.5 transition-colors ${isDark ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <div className={`w-3 h-3 rounded-full transition-transform duration-200 ${isDark ? 'bg-black translate-x-4' : 'bg-white translate-x-0'
                  }`} />
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP NAVBAR */}
        <header className={`h-16 border-b px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md transition-colors duration-300 ${isDark ? 'bg-[#0B131F]/90 border-slate-800/80' : 'bg-white/90 border-slate-200'
          }`}>
          {/* Sports Categories Bar */}
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none py-2">
            {sports.map((sport) => {
              const isActive = activeSport === sport.id;
              return (
                <button
                  key={sport.id}
                  onClick={() => onSelectSport && onSelectSport(sport.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 whitespace-nowrap transition-all duration-200 ${isActive
                    ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                  <span className="text-sm">{sport.icon}</span>
                  <span>{sport.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Search Input */}
            <div className="relative hidden md:block w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                placeholder="Takım, lig ara..."
                className={`w-full pl-9 pr-10 py-1.5 border rounded-xl text-xs focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/80 transition-all duration-200 ${isDark
                  ? 'bg-[#070D17] border-slate-800 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
              />
              <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1 py-0.5 rounded border ${isDark ? 'bg-slate-900 text-slate-500 border-slate-800' : 'bg-slate-200 text-slate-600 border-slate-300'
                }`}>
                ⌘K
              </span>
            </div>

            {/* Theme Switcher Button (Top Bar) */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border transition-all duration-200 ${isDark
                ? 'bg-slate-900/80 border-slate-800 text-amber-400 hover:text-amber-300'
                : 'bg-slate-100 border-slate-200 text-indigo-600 hover:text-indigo-700'
                }`}
              title={isDark ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Sound Toggle Button */}
            <button
              onClick={onToggleSound}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all duration-200 ${soundEnabled
                ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                : isDark
                  ? 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              title="Gol Sesini Aç/Kapat"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <span className="hidden sm:inline">{soundEnabled ? 'Ses Açık' : 'Sessiz'}</span>
            </button>

            {/* Notification Bell */}
            <button className={`p-2 rounded-xl border relative ${isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}>
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 bg-emerald-500 rounded-full absolute top-1.5 right-1.5 animate-pulse" />
            </button>

            {/* Favorites Star */}
            <button
              onClick={() => onSelectNavItem && onSelectNavItem('favoriler')}
              className={`p-2 rounded-xl border relative ${isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-amber-500'
                }`}
            >
              <Star className={`w-4 h-4 ${favCount > 0 ? 'fill-amber-500 text-amber-500' : ''}`} />
              {favCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-500 text-black">
                  {favCount}
                </span>
              )}
            </button>

            {/* User Profile Avatar */}
            <div className={`flex items-center space-x-2 pl-2 border-l ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-green-400 p-0.5 cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 cursor-pointer hidden sm:block" />
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
