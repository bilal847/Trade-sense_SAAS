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

  // Feature State
  const [showNews, setShowNews] = useState(false);
  const [newsData, setNewsData] = useState<any[]>([]);

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<number>(1); // Default EURUSD
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Reader State
  const [showReader, setShowReader] = useState(false);
  const [readingArticle, setReadingArticle] = useState<any>(null);

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
    router.push('/');
  };

  // Feature Handlers
  const handleNews = async () => {
    setShowNews(true);
    if (newsData.length === 0) {
      try {
        const res = await featuresAPI.getNews();
        setNewsData(res.data.news);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleReadArticle = async (url: string) => {
    setReadingArticle({ loading: true });
    setShowReader(true);
    try {
      const res = await featuresAPI.readArticle(url);
      if (res.data.status === 'success') {
        setReadingArticle(res.data.article);
      } else {
        setReadingArticle({ error: res.data.message || "Could not load content", url });
      }
    } catch (e) {
      setReadingArticle({ error: "Failed to load article.", url });
    }
  };

  const handleAnalysis = async () => {
    setAnalysisData(null);
    setShowBreakdown(false);
    try {
      const res = await featuresAPI.getEnsembleAnalysis(selectedAssetId);
      setAnalysisData(res.data.analysis);
    } catch (e) {
      setAnalysisData({ error: "Service Unavailable" });
    }
  };

  const openQuantModal = () => {
    setShowAnalysis(true);
    handleAnalysis();
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

              <button
                onClick={handleNews}
                className="flex items-center space-x-2 text-sm font-medium text-orange-500 hover:text-orange-400 transition-colors"
              >
                <Newspaper className="w-4 h-4" />
                <span>{t('nav_news')}</span>
              </button>
              <button
                onClick={openQuantModal}
                className="flex items-center space-x-2 text-sm font-medium text-purple-500 hover:text-purple-400 transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>{t('nav_quant')}</span>
              </button>
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
              <button
                onClick={() => { handleNews(); setIsMenuOpen(false); }}
                className="flex items-center space-x-3 text-lg font-semibold text-orange-500"
              >
                <Newspaper className="w-5 h-5" />
                <span>{t('nav_news')}</span>
              </button>
              <button
                onClick={() => { openQuantModal(); setIsMenuOpen(false); }}
                className="flex items-center space-x-3 text-lg font-semibold text-purple-500"
              >
                <Zap className="w-5 h-5" />
                <span>{t('nav_quant')}</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals are still here, but with updated design */}
      <AnimatePresence>
        {showNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={() => setShowNews(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-2xl font-bold flex items-center">
                  <Newspaper className="w-8 h-8 mr-3 text-orange-500" />
                  {t('modal_news_title')}
                </h3>
                <button onClick={() => setShowNews(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 p-2 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {newsData.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 flex flex-col items-center">
                    <div className="animate-spin h-10 w-10 border-4 border-orange-500 rounded-full border-t-transparent mb-4"></div>
                    <p className="font-bold">{t('news_loading')}</p>
                  </div>
                ) : (
                  newsData.map((item, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                          <h4 className="font-bold text-slate-900 dark:text-white text-xl group-hover:text-blue-600 transition-colors">{item.title}</h4>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest ${item.sentiment === 'Bullish' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : item.sentiment === 'Bearish' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                              {item.sentiment}
                            </span>
                            {item.impact && item.impact !== 'Global' && (
                              <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                {item.impact}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed line-clamp-2">{item.summary}</p>
                      <button
                        onClick={() => handleReadArticle(item.url)}
                        className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
                      >
                        {t('news_btn_read')}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reader Modal */}
      <AnimatePresence>
        {showReader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[300] flex items-center justify-center p-4"
            onClick={() => setShowReader(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowReader(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white z-10 bg-slate-100 dark:bg-slate-800 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>

              {!readingArticle || readingArticle.loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12">
                  <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
                  <p className="text-slate-500 font-medium">Fetching article...</p>
                </div>
              ) : readingArticle.error ? (
                <div className="p-12 text-center">
                  <X className="w-16 h-16 text-rose-500 mx-auto mb-6" />
                  <h3 className="text-xl font-bold mb-2">Content Unavailable</h3>
                  <p className="text-slate-500 mb-8">{readingArticle.error}</p>
                  <a href={readingArticle.url} target="_blank" rel="noreferrer" className="inline-flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-full">
                    <span>Read on Original Site</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <div className="relative h-72 bg-slate-200">
                    {readingArticle.image ? (
                      <img src={readingArticle.image} alt={readingArticle.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-300 text-slate-500">No Image</div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">{readingArticle.title}</h2>
                    </div>
                  </div>
                  <div className="p-8 max-w-2xl mx-auto">
                    {readingArticle.text.split('\n\n').map((paragraph: string, i: number) => (
                      <p key={i} className="mb-6 text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-serif">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quant Modal */}
      <AnimatePresence>
        {showAnalysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={() => setShowAnalysis(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowAnalysis(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-8 flex items-center">
                <Zap className="w-8 h-8 mr-3 text-purple-600" />
                {t('modal_quant_title')}
              </h3>

              <div className="mb-8 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-4">{t('quant_select_market')}</label>
                <div className="flex space-x-3">
                  <select
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(Number(e.target.value))}
                    className="flex-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-sm"
                  >
                    {ASSETS.map(a => (
                      <option key={a.id} value={a.id}>{a.symbol}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAnalysis}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 rounded-xl font-bold uppercase text-xs tracking-widest transition-all shadow-lg shadow-purple-500/20"
                  >
                    {t('quant_btn_analyze')}
                  </button>
                </div>
              </div>

              {!analysisData ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
                </div>
              ) : analysisData.error ? (
                <div className="text-rose-400 text-center py-4 bg-rose-900/20 rounded-xl border border-rose-900/50">{analysisData.error}</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border-l-4 border-purple-500">
                    <span className="text-slate-400 text-sm">Signal:</span>
                    <span className={`font-bold px-3 py-1 rounded text-sm ${analysisData.signal === 'BUY' ? 'bg-emerald-900 text-emerald-400' : analysisData.signal === 'SELL' ? 'bg-rose-900 text-rose-400' : 'bg-slate-700 text-slate-300'}`}>
                      {analysisData.signal}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl">
                    <span className="text-slate-400 text-sm">Confidence:</span>
                    <span className="text-white font-mono font-bold text-lg">{analysisData.confidence}</span>
                  </div>

                  <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
                  >
                    {showBreakdown ? 'Hide' : 'Show'} Breakdown
                  </button>

                  <AnimatePresence>
                    {showBreakdown && analysisData.ensemble_breakdown && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-3 overflow-hidden"
                      >
                        {analysisData.ensemble_breakdown.map((model: any, idx: number) => (
                          <div key={idx} className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-purple-300">{model.name}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${model.signal === 'BUY' ? 'bg-emerald-900 text-emerald-400' : model.signal === 'SELL' ? 'bg-rose-900 text-rose-400' : 'bg-slate-700 text-slate-300'}`}>
                                {model.signal}
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-purple-500 h-full" style={{ width: `${model.weight}%` }} />
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl text-sm text-purple-200 italic">
                    "{analysisData.reasoning}"
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
