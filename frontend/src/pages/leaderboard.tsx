import React, { useState, useEffect } from 'react';
import Head from 'next/head';
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
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM format

  // Mock Data Generator for 50 users
  const generateMockUsers = (count: number): LeaderboardEntry[] => {
    const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const types = ['Standard 10k', 'Pro 50k', 'Elite 100k', 'Masters 250k'];

    return Array.from({ length: count }, (_, i) => {
      const startBalance = i % 4 === 0 ? 10000 : i % 4 === 1 ? 50000 : i % 4 === 2 ? 100000 : 250000;
      const profit = (Math.random() * 0.15) - 0.02; // -2% to +13%
      const equity = startBalance * (1 + profit);

      return {
        user_id: i + 1,
        user_name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        challenge_id: (i % 4) + 1,
        challenge_type: types[i % 4], // Adding custom field for display
        profit_percentage: profit,
        equity: equity,
        status: profit > 0.08 ? 'PASSED' : profit < -0.05 ? 'FAILED' : 'IN_PROGRESS',
        duration: Math.floor(Math.random() * 30) + 1,
        created_at: new Date().toISOString()
      };
    }).sort((a, b) => b.equity - a.equity); // Sort by equity level
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

        let monthly = monthlyRes.data.leaderboard;
        let allTime = allTimeRes.data.leaderboard;

        // Populate with 50 mock users if empty or for demo purposes
        if (monthly.length < 10) {
          monthly = generateMockUsers(50);
        }

        if (allTime.length < 10) {
          allTime = generateMockUsers(50).map(u => ({ ...u, profit_percentage: u.profit_percentage * 2, equity: u.equity * 1.5 }));
        }

        // Only show top 10 as requested
        setMonthlyLeaderboard(monthly.slice(0, 10));
        setAllTimeLeaderboard(allTime.slice(0, 10));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        // Fallback to mock data on error for better UX during dev
        const mock = generateMockUsers(50);
        setMonthlyLeaderboard(mock.slice(0, 10));
        setAllTimeLeaderboard(mock.slice(0, 10));
        setLoading(false);
      }
    };

    fetchLeaderboards();
  }, [selectedMonth]);

  const formatProfit = (profit: number) => {
    return `${(profit * 100).toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{t('leaderboard_title')} - TradeSense Quant</title>
        <meta name="description" content="Top performers on the trading platform" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('leaderboard_title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">Top performers in prop-firm challenges</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
            <button
              className={`py-3 px-6 font-bold transition-all ${activeTab === 'monthly'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              onClick={() => setActiveTab('monthly')}
            >
              Monthly
            </button>
            <button
              className={`py-3 px-6 font-bold transition-all ${activeTab === 'alltime'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              onClick={() => setActiveTab('alltime')}
            >
              All-Time
            </button>
          </div>

          {/* Month selector for monthly tab */}
          {activeTab === 'monthly' && (
            <div className="mb-8 flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
              <label className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Select Month:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              />
            </div>
          )}

          {/* Leaderboard table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-widest font-bold">
                  <th className="py-4 px-4 text-left">{t('leaderboard_rank')}</th>
                  <th className="py-4 px-4 text-left">{t('leaderboard_trader')}</th>
                  <th className="py-4 px-4 text-left">Challenge</th>
                  <th className="py-4 px-4 text-left">Profit %</th>
                  <th className="py-4 px-4 text-left">Equity</th>
                  <th className="py-4 px-4 text-left font-bold">Status</th>
                  <th className="py-4 px-4 text-left">Duration (Days)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {(activeTab === 'monthly' ? monthlyLeaderboard : allTimeLeaderboard).map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        {index < 3 ? (
                          <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold shadow-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700 ring-4 ring-yellow-50 dark:ring-yellow-900/20' :
                            index === 1 ? 'bg-gray-100 text-gray-700 ring-4 ring-gray-50 dark:ring-gray-900/20' :
                              'bg-orange-100 text-orange-700 ring-4 ring-orange-50 dark:ring-orange-900/20'
                            } mr-3 text-sm`}>
                            {index + 1}
                          </span>
                        ) : (
                          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 mr-3 text-sm font-bold">
                            {index + 1}
                          </span>
                        )}
                        <span className="text-xl">
                          {index === 0 && '🏆'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-gray-900 dark:text-gray-100">{entry.user_name}</td>
                    <td className="py-4 px-4 font-medium text-blue-600 dark:text-blue-400 capitalize">{(entry as any).challenge_type || 'Standard'}</td>
                    <td className={`py-4 px-4 font-mono font-bold ${entry.profit_percentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                      {formatProfit(entry.profit_percentage)}
                    </td>
                    <td className="py-4 px-4 font-mono text-gray-600 dark:text-gray-300">${entry.equity.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ring-1 ${entry.status === 'PASSED'
                        ? 'bg-green-100 text-green-700 ring-green-200 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-800'
                        : entry.status === 'FAILED'
                          ? 'bg-red-100 text-red-700 ring-red-200 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-800'
                          : 'bg-yellow-100 text-yellow-700 ring-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:ring-yellow-800'
                        }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{entry.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}