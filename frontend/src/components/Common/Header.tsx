import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  GraduationCap,
  Trophy,
  Newspaper,
  Zap,
  User,
  LogOut,
  Languages,
  Sun,
  Moon,
  Menu,
  X,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { featuresAPI } from '@/services/api';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';

interface HeaderProps {
  user?: { email: string; role?: string } | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  // Navigation State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Theme and Translation
  const router = useRouter();
  const { t, locale, setLocale } = useTranslation();
  const { theme, toggleTheme } = useTheme();


  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hardcoded assets for the Header Quant Tool
  const ASSETS = [
    { id: 1, symbol: 'EURUSD' },
    { id: 2, symbol: 'GBPUSD' },
    { id: 4, symbol: 'BTCUSDT' },
    { id: 5, symbol: 'ETHUSDT' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    // Force a hard reload to ensure all application state (especially admin roles) is cleared
    window.location.href = '/';
  };



  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
        ? 'py-3 bg-white/80 dark:bg-[#030712]/80 backdrop-blur-lg border-b border-white/20 dark:border-slate-800/50 shadow-lg'
        : 'py-5 bg-transparent'
        }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-12">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-white fill-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-slate-400">
                TradeSense <span className="text-blue-600 dark:text-blue-400">Quant</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-8">
              {[
                { name: t('nav_dashboard'), href: '/dashboard', icon: LayoutDashboard },
                { name: t('nav_learning'), href: '/learning', icon: GraduationCap },
                { name: t('nav_challenges'), href: '/challenges', icon: Trophy },
                { name: t('nav_leaderboard'), href: '/leaderboard', icon: Trophy },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}

              <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-2" />

              <Link
                href="/news"
                className="flex items-center space-x-2 text-sm font-medium text-orange-500 hover:text-orange-400 transition-colors"
              >
                <Newspaper className="w-4 h-4" />
                <span>{t('nav_news')}</span>
              </Link>
              <Link
                href="/quant"
                className="flex items-center space-x-2 text-sm font-medium text-purple-500 hover:text-purple-400 transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>{t('nav_quant')}</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-900 rounded-full p-1 border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setLocale('fr')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${locale === 'fr' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
              >
                <span>FR</span>
              </button>
              <button
                onClick={() => setLocale('en')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${locale === 'en' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
              >
                <span>EN</span>
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{user.role}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white max-w-[120px] truncate">{user.email}</span>
                </div>
                {(user.role === 'admin' || user.role === 'superadmin') && (
                  <Link
                    href="/admin"
                    className="p-2.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all"
                    title={t('admin_title')}
                  >
                    <ShieldCheck className="w-5 h-5" />
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-black/10 dark:shadow-white/5"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('auth_logout')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors">
                  {t('nav_login')}
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                >
                  {t('nav_register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-[#030712] border-b border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <nav className="flex flex-col p-6 space-y-4">
              {[
                { name: t('nav_dashboard'), href: '/dashboard', icon: LayoutDashboard },
                { name: t('nav_learning'), href: '/learning', icon: GraduationCap },
                { name: t('nav_challenges'), href: '/challenges', icon: Trophy },
                { name: t('nav_leaderboard'), href: '/leaderboard', icon: Trophy },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 text-lg font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full my-2" />
              <Link
                href="/news"
                className="flex items-center space-x-3 text-lg font-semibold text-orange-500"
                onClick={() => setIsMenuOpen(false)}
              >
                <Newspaper className="w-5 h-5" />
                <span>{t('nav_news')}</span>
              </Link>
              <Link
                href="/quant"
                className="flex items-center space-x-3 text-lg font-semibold text-purple-500"
                onClick={() => setIsMenuOpen(false)}
              >
                <Zap className="w-5 h-5" />
                <span>{t('nav_quant')}</span>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
};

export default Header;
