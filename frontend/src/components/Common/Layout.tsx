import React from 'react';
import Header from './Header';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
  user?: { email: string; role?: string } | null;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  const router = useRouter();
  const isHome = router.pathname === '/';

  return (
    <div className="min-h-screen bg-white dark:bg-[#030712] transition-colors duration-300">
      <Header user={user} />
      <main className={`${isHome ? '' : 'container mx-auto px-6 py-24'}`}>
        {children}
      </main>
      <footer className="relative py-20 border-t border-slate-200 dark:border-slate-800/50 mt-20 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="mb-8">
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-slate-400">
              TradeSense <span className="text-blue-600 dark:text-blue-400">Quant</span>
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">
            &copy; {new Date().getFullYear()} TradeSense Quant. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
            <a href="/careers" className="hover:text-blue-500 transition-colors">Careers</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Terms</a>
            <a href="/contact" className="hover:text-blue-500 transition-colors">Contact</a>
          </div>
          <p className="mt-8 text-slate-400 dark:text-slate-500 text-[10px] font-medium italic opacity-50 uppercase tracking-tighter">
            Simulated trading for educational purposes only. Past performance does not guarantee future results.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;