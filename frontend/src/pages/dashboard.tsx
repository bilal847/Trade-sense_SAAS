import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck } from 'lucide-react';
import Layout from '@/components/Common/Layout';
import { UserChallenge, Instrument, Quote, OHLCV, Signal } from '@/types';
import { challengeAPI, marketAPI } from '@/services/api';
import TradingDashboard from '@/components/Dashboard/TradingDashboard';
import { useTranslation } from '@/hooks/useTranslation';

const DASHBOARD_USER = { first_name: 'Bilal', email: 'bilaldebbar002@gmail.com' };

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
        // Fetch real challenges
        const response = await challengeAPI.getMyChallenges();
        console.log('API Response:', response); // DEBUG

        const activeChallenges = response.data.active_challenges;
        const allChallenges = response.data.all_challenges;
        console.log('Active:', activeChallenges, 'All:', allChallenges); // DEBUG

        if (activeChallenges && activeChallenges.length > 0) {
          const challenge = activeChallenges[0];
          setUserChallenge(challenge);
          setActiveChallenge(challenge);
        } else if (allChallenges && allChallenges.length > 0) {
          // If no active but has recent challenges, show the most recent one
          // (it might be FAILED, which we want to show the overlay for)
          const challenge = allChallenges[0];
          setUserChallenge(challenge);
          setActiveChallenge(challenge);
        } else {
          setUserChallenge(null);
          setActiveChallenge(null);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching challenges:', err); // DEBUG
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
        <div className="mb-8 text-center md:text-left pb-6 relative">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl -z-10"></div>

          <div className="relative p-6">
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">{
              t('dashboard_title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 font-semibold">Real-time trading with multi-asset support</p>
          </div>
        </div>

        {activeChallenge ? (
          <div className="space-y-6">
            {/* Premium Institutional Header */}
            <div className="bg-white dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-gray-200 dark:border-white/5 p-10 flex flex-col md:flex-row justify-between items-center gap-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>

              <div className="space-y-6 relative z-10 w-full">
                <div className="flex items-center space-x-4">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border-2 transition-all duration-300 ${activeChallenge.status === 'IN_PROGRESS'
                    ? 'bg-blue-600/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                    : 'bg-green-600/10 border-green-500/30 text-green-600 dark:text-green-400'
                    }`}>
                    {activeChallenge.status} ARCHITECTURE
                  </span>
                  <div className="h-px flex-1 bg-gray-200 dark:bg-white/5"></div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-end gap-12">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xl">
                      <Activity className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter mb-1">
                        {activeChallenge.challenge?.name || "QUANT ACCOUNT"}
                      </h2>
                      <p className="text-[10px] font-bold text-gray-500 dark:text-slate-500 uppercase tracking-[0.2em]">ID: <span className="text-blue-600 dark:text-blue-400">#TSQ-{activeChallenge.id}</span> • {new Date(activeChallenge.start_time).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 w-full md:w-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-500 dark:text-slate-600 uppercase tracking-widest mb-1">Allocation</span>
                      <span className="text-2xl font-mono font-black text-gray-900 dark:text-white">${activeChallenge.start_balance.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-500 dark:text-slate-600 uppercase tracking-widest mb-1">Live Equity</span>
                      <span className="text-2xl font-mono font-black text-blue-600 dark:text-blue-400">${activeChallenge.current_equity.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-white/5 pt-4 sm:pt-0 sm:pl-12">
                      <span className="text-[10px] font-black text-gray-500 dark:text-slate-600 uppercase tracking-widest mb-1">Alpha Yield</span>
                      <span className={`text-2xl font-mono font-black ${(activeChallenge.current_equity - activeChallenge.start_balance) >= 0
                        ? 'text-green-600 dark:text-green-500'
                        : 'text-red-600 dark:text-red-500'
                        }`}>
                        {(activeChallenge.current_equity - activeChallenge.start_balance) >= 0 ? '+' : ''}${(activeChallenge.current_equity - activeChallenge.start_balance).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <TradingDashboard
              userChallenge={activeChallenge}
              user={DASHBOARD_USER}
            />
          </div>
        ) : (
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-16 text-center shadow-2xl max-w-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all"></div>

              <div className="w-24 h-24 bg-blue-600/10 border border-blue-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-blue-500 shadow-xl group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-12 h-12" />
              </div>

              <h2 className="text-4xl font-black mb-4 text-white uppercase italic tracking-tighter">Repository Inactive</h2>
              <p className="text-slate-400 mb-10 font-medium text-lg leading-relaxed">
                No active institutional accounts detected. Initiate an evaluation architecture to begin quantitative execution.
              </p>

              <button
                className="px-10 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 transform hover:scale-105 active:scale-95"
                onClick={() => router.push('/challenges')}
              >
                Initiate Evaluation
              </button>
            </motion.div>
          </div>
        )}
      </main>
    </>
  );
}
