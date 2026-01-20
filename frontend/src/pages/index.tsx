import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Shield,
  BarChart3,
  Globe2,
  Zap,
  ArrowRight,
  Cpu,
  LineChart,
  ChevronRight,
  Target
} from 'lucide-react';
import Layout from '@/components/Common/Layout';
import { useTranslation } from '@/hooks/useTranslation';
import dynamic from 'next/dynamic';

const Hero3D = dynamic(() => import('@/components/Landing/Hero3D'), { ssr: false });

export default function Home() {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  } as const;

  const marketData = [
    { symbol: 'BTC/USDT', price: '45,231.50', change: '+1.25%', trend: 'up' },
    { symbol: 'ETH/USDT', price: '2,845.20', change: '+0.78%', trend: 'up' },
    { symbol: 'EUR/USD', price: '1.0852', change: '-0.12%', trend: 'down' },
    { symbol: 'GBP/USD', price: '1.2642', change: '+0.15%', trend: 'up' },
    { symbol: 'IAM (MASI)', price: '85.10', change: '+0.23%', trend: 'up' },
    { symbol: 'BCP (MASI)', price: '284.50', change: '-0.45%', trend: 'down' },
    { symbol: 'SOL/USDT', price: '98.20', change: '+3.42%', trend: 'up' },
  ];

  return (
    <>
      <Head>
        <title>{t('home_hero_title')} - TradeSense Quant</title>
        <meta name="description" content={t('home_hero_subtitle')} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative min-h-screen overflow-hidden bg-[#030712] text-slate-100 pb-20">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-[1000px] pointer-events-none z-0">
          <Hero3D />
        </div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] overflow-hidden pointer-events-none z-0 opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse-glow" />
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse-glow" style={{ animationDelay: '2s' }} />
        </div>

        {/* Hero Section */}
        <section className="relative z-10 pt-32 lg:pt-48 pb-16 lg:pb-32 container mx-auto px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8"
            >
              <Zap className="w-3 h-3 fill-blue-400" />
              <span>{t('nav_quant')} Engine v2.0 Live</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl lg:text-7xl font-bold mb-8 tracking-tight leading-[1.1]"
            >
              The Future of <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400">
                Quantitative Trading
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              {t('home_hero_subtitle')}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <Link href="/dashboard" className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all shadow-xl shadow-blue-500/20 group active:scale-95">
                <span>{t('home_cta_dashboard')}</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/challenges" className="w-full sm:w-auto px-10 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all active:scale-95">
                {t('home_cta_challenges')}
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Market Ticker (Marquee) */}
        <div className="relative border-y border-slate-800/50 bg-slate-900/30 backdrop-blur-sm overflow-hidden py-4 z-10">
          <div className="flex animate-shimmer absolute inset-0 pointer-events-none" />
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: '-50%' }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="flex whitespace-nowrap space-x-12"
          >
            {[...marketData, ...marketData].map((item, idx) => (
              <div key={idx} className="flex items-center space-x-3 group cursor-default">
                <span className="text-sm font-bold text-slate-500 group-hover:text-slate-300 transition-colors">{item.symbol}</span>
                <span className="text-sm font-mono font-bold">{item.price}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {item.change}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Features Section */}
        <section className="relative z-10 py-32 container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">{t('home_feature_trading_title')}</h2>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: t('home_feature_trading_title'),
                desc: t('home_feature_trading_desc'),
                icon: LineChart,
                color: 'blue'
              },
              {
                title: t('home_feature_challenges_title'),
                desc: t('home_feature_challenges_desc'),
                icon: Target,
                color: 'emerald'
              },
              {
                title: t('home_feature_analytics_title'),
                desc: t('home_feature_analytics_desc'),
                icon: Cpu,
                color: 'purple'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="glass-morphism p-10 rounded-3xl group border-white/5"
              >
                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-500/10 flex items-center justify-center mb-8 border border-${feature.color}-500/20 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 text-${feature.color}-400`} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed mb-6">
                  {feature.desc}
                </p>
                <Link href="/learning" className="inline-flex items-center text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Global Multi-Asset Section */}
        <section className="relative z-10 py-24 bg-blue-600/5 backdrop-blur-3xl overflow-hidden border-y border-blue-500/10">
          <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-8">
                <Globe2 className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight">
                Global Markets, <br />
                <span className="text-blue-400">One Terminal.</span>
              </h2>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                Connect to premium liquidity sources across the globe. From Casablanca to Wall Street, trade assets with institutional speed and precision.
              </p>

              <ul className="grid grid-cols-2 gap-6 mb-12">
                {[
                  { name: 'Binance Crypto', active: true },
                  { name: 'MASI (Morocco)', active: true },
                  { name: 'Forex Majors', active: true },
                  { name: 'Global Commodities', active: true },
                ].map((market, idx) => (
                  <li key={idx} className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-slate-300 font-medium">{market.name}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center space-x-8">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold">150+</span>
                  <span className="text-sm text-slate-500 font-medium uppercase tracking-widest">Instruments</span>
                </div>
                <div className="w-px h-10 bg-slate-800" />
                <div className="flex flex-col">
                  <span className="text-3xl font-bold">1.2ms</span>
                  <span className="text-sm text-slate-500 font-medium uppercase tracking-widest">Execution</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="relative z-10 p-4 lg:p-8 glass rounded-[40px] border-white/10"
              >
                <div className="bg-slate-900 rounded-[28px] overflow-hidden shadow-2xl">
                  {/* Simplified Trade Ticket Preview */}
                  <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">B</div>
                      <span className="font-bold">BTCUSDT</span>
                    </div>
                    <span className="text-emerald-400 font-mono text-xl">45,231.50</span>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Buy Price</span>
                        <span className="text-xl font-bold">45,231.50</span>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Sell Price</span>
                        <span className="text-xl font-bold">45,229.10</span>
                      </div>
                    </div>
                    <div className="h-[200px] flex items-end space-x-1">
                      {[40, 60, 45, 80, 55, 90, 70, 100, 85, 110].map((h, idx) => (
                        <div key={idx} className="flex-1 bg-blue-600/20 rounded-t-lg transition-all hover:bg-blue-600/40" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    <div className="flex space-x-4">
                      <div className="flex-1 py-4 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-2xl font-bold text-center">Buy</div>
                      <div className="flex-1 py-4 bg-rose-600/20 border border-rose-500/30 text-rose-400 rounded-2xl font-bold text-center">Sell</div>
                    </div>
                  </div>
                </div>
              </motion.div>
              {/* Decorative Glow */}
              <div className="absolute -inset-4 bg-blue-600/20 blur-[60px] rounded-[60px] pointer-events-none" />
            </div>
          </div>
        </section>

        {/* CTA Footer Section */}
        <section className="relative z-10 py-32 text-center container mx-auto px-6">
          <div className="glass-morphism py-24 px-8 rounded-[40px] max-w-5xl mx-auto border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none" />

            <h2 className="text-4xl lg:text-6xl font-bold mb-8">{t('home_cta_challenges')}</h2>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
              Join thousands of traders and prove your skills in our proprietary evaluation program.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/register" className="w-full sm:w-auto px-12 py-5 bg-white text-slate-950 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all active:scale-95">
                Start Challenge Now
              </Link>
              <Link href="/learning" className="w-full sm:w-auto px-12 py-5 bg-slate-900 border border-slate-700 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all active:scale-95">
                Explore Learning Hub
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}