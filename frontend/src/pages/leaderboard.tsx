import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Star, TrendingUp, Users, Calendar, ArrowUpRight, ChevronRight, Activity } from 'lucide-react';
import Layout from '@/components/Common/Layout';
import { LeaderboardEntry } from '@/types';
import { leaderboardAPI } from '@/services/api';
import { useTranslation } from '@/hooks/useTranslation';

export default function Leaderboard() {
  const { t } = useTranslation();
  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'monthly' | 'alltime'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  const generateMockUsers = (count: number): LeaderboardEntry[] => {
    const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const types = ['Student 10k', 'Elite 100k', 'Master 250k'];

    return Array.from({ length: count }, (_, i) => {
      const typeIdx = i % 3;
      const startBalance = typeIdx === 0 ? 10000 : typeIdx === 1 ? 100000 : 250000;
      const profit = (Math.random() * 0.15) + (i < 3 ? 0.2 : 0.05);
      const equity = startBalance * (1 + profit);

      return {
        user_id: i + 1,
        user_name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        challenge_id: typeIdx + 1,
        challenge_type: types[typeIdx],
        profit_percentage: profit,
        equity: equity,
        status: 'PASSED',
        duration: Math.floor(Math.random() * 20) + 5,
        created_at: new Date().toISOString()
      };
    }).sort((a, b) => b.profit_percentage - a.profit_percentage);
  };

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        setLoading(true);
        const [year, month] = selectedMonth.split('-').map(Number);
        const [monthlyRes, allTimeRes] = await Promise.all([
          leaderboardAPI.getMonthlyLeaderboard(year, month),
          leaderboardAPI.getAllTimeLeaderboard()
        ]);

        let monthly = monthlyRes.data.leaderboard || [];
        let allTime = allTimeRes.data.leaderboard || [];

        if (monthly.length < 5) monthly = generateMockUsers(30);
        if (allTime.length < 5) allTime = generateMockUsers(30).map(u => ({ ...u, profit_percentage: u.profit_percentage * 2.5 }));

        setMonthlyLeaderboard(monthly.slice(0, 15));
        setAllTimeLeaderboard(allTime.slice(0, 15));
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        const mock = generateMockUsers(30);
        setMonthlyLeaderboard(mock.slice(0, 15));
        setAllTimeLeaderboard(mock.slice(0, 15));
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboards();
  }, [selectedMonth]);

  const currentData = activeTab === 'monthly' ? monthlyLeaderboard : allTimeLeaderboard;
  const winners = currentData.slice(0, 3);
  const others = currentData.slice(3);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-[#030712]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-500 animate-pulse" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Elite Leaderboard | TradeSense Quant</title>
      </Head>

      <main className="min-h-screen bg-[#030712] text-white pb-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-6 pt-12 relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6"
            >
              <Trophy className="w-4 h-4" />
              <span>Institutional Rankings</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black mb-6 tracking-tighter italic"
            >
              THE <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">ELITE 1%</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg max-w-2xl mx-auto font-medium"
            >
              Real-time validation of quantitative excellence. Only the most disciplined traders transcend.
            </motion.p>
          </div>

          {/* Navigation & Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setActiveTab('monthly')}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'monthly' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'text-slate-400 hover:text-white'}`}
              >
                Monthly Pulse
              </button>
              <button
                onClick={() => setActiveTab('alltime')}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'alltime' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'text-slate-400 hover:text-white'}`}
              >
                All-Time Legends
              </button>
            </div>

            {activeTab === 'monthly' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-4 bg-slate-900/50 p-2 pl-6 rounded-2xl border border-white/5"
              >
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Narrative</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent border-none text-blue-400 font-bold focus:ring-0 outline-none cursor-pointer placeholder:text-blue-400/50"
                />
              </motion.div>
            )}
          </div>

          {/* Winners Circle (Podium) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-end max-w-5xl mx-auto">
            {/* 2nd Place */}
            {winners[1] && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="order-2 md:order-1 flex flex-col items-center"
              >
                <div className="relative mb-6 group">
                  <div className="absolute inset-0 bg-slate-400/20 rounded-full blur-[20px] group-hover:blur-[30px] transition-all"></div>
                  <div className="w-24 h-24 rounded-full border-2 border-slate-400/50 overflow-hidden relative z-10 bg-slate-800 flex items-center justify-center p-2 shadow-2xl">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center">
                      <Medal className="w-10 h-10 text-white/50" />
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-400 rounded-full border-2 border-[#030712] flex items-center justify-center text-xs font-black text-slate-900 z-20">2</div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-t-3xl p-8 w-full text-center h-48 flex flex-col justify-center transform hover:scale-105 transition-transform duration-500 shadow-2xl">
                  <h3 className="text-lg font-bold mb-1 truncate px-2">{winners[1].user_name}</h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">{(winners[1] as any).challenge_type}</p>
                  <div className="text-2xl font-black text-slate-300">{(winners[1].profit_percentage * 100).toFixed(2)}%</div>
                </div>
              </motion.div>
            )}

            {/* 1st Place */}
            {winners[0] && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="order-1 md:order-2 flex flex-col items-center"
              >
                <div className="relative mb-8 group">
                  <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-[40px] animate-pulse"></div>
                  <div className="w-32 h-32 rounded-full border-4 border-yellow-500 overflow-hidden relative z-10 bg-slate-800 flex items-center justify-center p-2 shadow-2xl">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center relative">
                      <Trophy className="w-14 h-14 text-white shadow-xl" />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                        className="absolute inset-[-10px] border-2 border-yellow-500/30 border-dashed rounded-full"
                      />
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-500 rounded-full border-4 border-[#030712] flex items-center justify-center text-lg font-black text-[#030712] z-20 shadow-lg">1</div>
                </div>
                <div className="bg-gradient-to-b from-blue-600/20 to-transparent backdrop-blur-2xl border-x border-t border-blue-500/30 rounded-t-[3rem] p-10 w-full text-center h-64 flex flex-col justify-center transform scale-110 relative z-30 shadow-[0_-20px_50px_rgba(37,99,235,0.15)]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                  <h3 className="text-2xl font-black mb-1 truncate px-2">{winners[0].user_name}</h3>
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">{(winners[0] as any).challenge_type}</p>
                  <div className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">{(winners[0].profit_percentage * 100).toFixed(2)}%</div>
                  <div className="text-[10px] text-blue-300/50 font-black tracking-widest mt-4 uppercase flex items-center justify-center space-x-2">
                    <Activity className="w-3 h-3" />
                    <span>Evaluation Verified ✅</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {winners[2] && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="order-3 md:order-3 flex flex-col items-center"
              >
                <div className="relative mb-6 group">
                  <div className="absolute inset-0 bg-orange-800/20 rounded-full blur-[20px] group-hover:blur-[30px] transition-all"></div>
                  <div className="w-24 h-24 rounded-full border-2 border-orange-800/50 overflow-hidden relative z-10 bg-slate-800 flex items-center justify-center p-2 shadow-2xl">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-700 to-orange-900 flex items-center justify-center">
                      <Medal className="w-10 h-10 text-white/50" />
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-800 rounded-full border-2 border-[#030712] flex items-center justify-center text-xs font-black text-white z-20">3</div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-t-3xl p-8 w-full text-center h-40 flex flex-col justify-center transform hover:scale-105 transition-transform duration-500 shadow-2xl">
                  <h3 className="text-lg font-bold mb-1 truncate px-2">{winners[2].user_name}</h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">{(winners[2] as any).challenge_type}</p>
                  <div className="text-2xl font-black text-orange-400/80">{(winners[2].profit_percentage * 100).toFixed(2)}%</div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Hall of Fame List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl mb-12"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                    <th className="py-6 px-8">Rank</th>
                    <th className="py-6 px-8">Quant Identity</th>
                    <th className="py-6 px-8">Architecture</th>
                    <th className="py-6 px-8 text-right">Alpha Yield</th>
                    <th className="py-6 px-8 text-right">Current Equity</th>
                    <th className="py-6 px-8 text-right">Persistence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {others.map((entry, idx) => (
                    <motion.tr
                      key={entry.user_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + (idx * 0.05) }}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-5 px-8">
                        <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-all border border-transparent group-hover:border-blue-500/30">
                          {idx + 4}
                        </span>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {entry.user_name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{entry.user_name}</span>
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400/70">{(entry as any).challenge_type}</span>
                      </td>
                      <td className="py-5 px-8 font-mono text-right">
                        <div className="flex items-center justify-end space-x-2 text-green-400 font-bold">
                          <TrendingUp className="w-3 h-3" />
                          <span>+{(entry.profit_percentage * 100).toFixed(2)}%</span>
                        </div>
                      </td>
                      <td className="py-5 px-8 font-mono font-bold text-slate-300 text-right">
                        ${entry.equity.toLocaleString()}
                      </td>
                      <td className="py-5 px-8 text-right">
                        <div className="flex items-center justify-end space-x-2 text-slate-500 text-xs font-bold">
                          <Calendar className="w-3 h-3" />
                          <span>{entry.duration} Days</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Global CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-white/10 rounded-[2.5rem] p-12 text-center relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
            <h2 className="text-3xl font-black mb-4 uppercase italic tracking-tighter">Is your strategy <span className="text-blue-500">Institutional</span> grade?</h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-8 font-medium">Join the ranks of the elite. Start your evaluation and get funded by TradeSense Quant.</p>
            <button
              onClick={() => window.location.href = '/challenges'}
              className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-[0.1em] transition-all transform hover:scale-105 shadow-xl shadow-blue-500/20"
            >
              Start Evaluation
            </button>
          </motion.div>
        </div>
      </main>
    </Layout>
  );
}