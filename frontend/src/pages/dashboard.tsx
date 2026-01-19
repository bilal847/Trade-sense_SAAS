import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Common/Layout';
import { UserChallenge, Instrument, Quote, OHLCV, Signal } from '@/types';
import { challengeAPI, marketAPI } from '@/services/api';
import TradingDashboard from '@/components/Dashboard/TradingDashboard';
import { useTranslation } from '@/hooks/useTranslation';

export default function Dashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [userChallenge, setUserChallenge] = useState<UserChallenge | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<UserChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has an active challenge
  useEffect(() => {
    const fetchActiveChallenge = async () => {
      try {
        setIsLoading(true);
        // Mock challenge for demo
        const mockChallenge: UserChallenge = {
          id: 1,
          user_id: 1,
          challenge_id: 1,
          status: 'IN_PROGRESS',
          start_balance: 10000,
          start_time: new Date().toISOString(),
          daily_start_equity: 10000,
          current_equity: 10050.25,
          max_equity: 10100,
          min_equity: 9950,
          min_equity_all_time: 9950,
          min_equity_today: 9980,
          daily_drawdown: 0.005,
          total_drawdown: 0.007,
          profit_percentage: 0.005,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setUserChallenge(mockChallenge);
        setActiveChallenge(mockChallenge);
        setIsLoading(false);
      } catch (err) {
        setError(t('error'));
        setIsLoading(false);
      }
    };

    fetchActiveChallenge();
  }, [t]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-500">{t('error')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={() => router.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{t('dashboard_title')} - TradeSense Quant</title>
        <meta name="description" content="Professional trading dashboard" />
      </Head>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-8 text-center md:text-left border-b border-gray-100 dark:border-gray-800 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('dashboard_title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Real-time trading with multi-asset support</p>
        </div>

        {activeChallenge ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-sm border ${activeChallenge.status === 'IN_PROGRESS'
                    ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                    : 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                    }`}>
                    {activeChallenge.status}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Challenge Account</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('dashboard_balance')}</p>
                    <p className="text-xl font-mono font-bold text-gray-900 dark:text-white">${activeChallenge.start_balance.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('dashboard_equity')}</p>
                    <p className="text-xl font-mono font-bold text-gray-900 dark:text-white">${activeChallenge.current_equity.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('dashboard_profit')}</p>
                    <p className={`text-xl font-mono font-bold ${(activeChallenge.current_equity - activeChallenge.start_balance) >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                      }`}>
                      ${(activeChallenge.current_equity - activeChallenge.start_balance).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-left md:text-right space-y-2 border-l border-gray-200 dark:border-gray-700 pl-6 hidden md:block">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account Details</p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">ID: <span className="text-blue-600 dark:text-blue-400">#TSQ-{activeChallenge.id}</span></p>
                <p className="text-xs text-gray-500 font-medium">
                  {t('view')} {new Date(activeChallenge.start_time).toLocaleDateString()}
                </p>
              </div>
            </div>

            <TradingDashboard userChallenge={activeChallenge} />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700 shadow-xl max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">No Active Challenge</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
              You don't have an active trading challenge. Start a challenge to begin trading with real-time data.
            </p>
            <button
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-500/30"
              onClick={() => router.push('/challenges')}
            >
              Browse Challenges
            </button>
          </div>
        )}
      </main>
    </>
  );
}
