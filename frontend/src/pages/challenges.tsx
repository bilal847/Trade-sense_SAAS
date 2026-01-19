import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Common/Layout';
import { Challenge } from '@/types';
import { challengeAPI, authAPI } from '@/services/api';
import { useTranslation } from '@/hooks/useTranslation';

interface EnhancedChallenge extends Challenge {
  tier_name: string;
  lore: string;
  rules: string[];
  color: 'blue' | 'purple' | 'amber';
  price: number;
}

export default function Challenges() {
  const { t } = useTranslation();
  const router = useRouter();
  const [challenges, setChallenges] = useState<EnhancedChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<EnhancedChallenge | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndChallenges = async () => {
      try {
        const meRes = await authAPI.getMe();
        setUserRole(meRes.data.user?.role || 'user');
      } catch (err) {
        console.error('Failed to fetch user role:', err);
      }
      const tiers: EnhancedChallenge[] = [
        {
          id: 1,
          name: "Student Pathway",
          tier_name: "STUDENT",
          description: "Perfect for Academy graduates ready to test their first quant models.",
          lore: "Born from the TradeSense Academy, the Student Tier provides a controlled environment for aspiring quants to bridge the gap between backtesting and live market execution.",
          start_balance: 10000.00,
          price: 49,
          daily_max_loss: 0.05,
          total_max_loss: 0.10,
          profit_target: 0.08,
          rules: ["Max 5% Daily Drawdown", "Max 10% Total Drawdown", "Min 5 Trading Days", "No News Trading during high impact"],
          color: "blue",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: "Elite Performance",
          tier_name: "ELITE",
          description: "Institutional size for disciplined traders who demand excellence.",
          lore: "The Elite Tier was established through our partnerships with leading hedge funds. It is designed to identify and fund high-capacity traders capable of maintaining consistency at scale.",
          start_balance: 100000.00,
          price: 199,
          daily_max_loss: 0.04,
          total_max_loss: 0.08,
          profit_target: 0.10,
          rules: ["Max 4% Daily Drawdown", "Max 8% Total Drawdown", "Consistency Rule 30%", "EA & Manual allowed"],
          color: "purple",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          name: "Master Architect",
          tier_name: "MASTER",
          description: "Top 1% status. Highest capital for the ultimate market masters.",
          lore: "Master architectures are reserved for the legends of our community. This tier represents the pinnacle of quantitative achievement, where complex algorithms meet absolute emotional discipline.",
          start_balance: 250000.00,
          price: 399,
          daily_max_loss: 0.03,
          total_max_loss: 0.06,
          profit_target: 0.12,
          rules: ["Max 3% Daily Drawdown", "Max 6% Total Drawdown", "Professional Evaluation", "Unlimited Scaling available"],
          color: "amber",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setChallenges(tiers);
      setLoading(false);
    };

    fetchUserAndChallenges();
  }, []);

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border' | 'shadow' | 'hoverBg' | 'accent' | 'lightBg' | 'lightText') => {
    const mappings: Record<string, Record<string, string>> = {
      blue: {
        bg: 'bg-blue-600',
        text: 'text-blue-600',
        border: 'border-blue-200',
        shadow: 'shadow-blue-500/30',
        hoverBg: 'hover:bg-blue-700',
        lightBg: 'bg-blue-100',
        lightText: 'text-blue-700',
        accent: 'bg-blue-500'
      },
      purple: {
        bg: 'bg-purple-600',
        text: 'text-purple-600',
        border: 'border-purple-200',
        shadow: 'shadow-purple-500/30',
        hoverBg: 'hover:bg-purple-700',
        lightBg: 'bg-purple-100',
        lightText: 'text-purple-700',
        accent: 'bg-purple-500'
      },
      amber: {
        bg: 'bg-amber-600',
        text: 'text-amber-600',
        border: 'border-amber-200',
        shadow: 'shadow-amber-500/30',
        hoverBg: 'hover:bg-amber-700',
        lightBg: 'bg-amber-100',
        lightText: 'text-amber-700',
        accent: 'bg-amber-500'
      }
    };
    return mappings[color][type];
  };

  const startChallenge = (challenge: EnhancedChallenge) => {
    if (userRole === 'admin' || userRole === 'superadmin') {
      alert('Access Restricted: Challenges and payments are only available for regular users. Administrators cannot participate in the prop-firm program.');
      return;
    }
    router.push(`/checkout?plan=${challenge.tier_name}&price=${challenge.price}`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{t('challenges_title')} - TradeSense Quant</title>
      </Head>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter italic">
            Prop-Firm <span className="text-blue-600">Evolution</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto italic">
            Select your path. Every legend starts with a single trade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              onClick={() => setSelectedChallenge(challenge)}
              className="group relative bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all cursor-pointer overflow-hidden transform hover:-translate-y-2"
            >
              {/* Decorative accent */}
              <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 ${getColorClasses(challenge.color, 'accent')} blur-3xl -mr-10 -mt-10 group-hover:opacity-20 transition-opacity`}></div>

              <div className="relative z-10">
                <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 ${getColorClasses(challenge.color, 'lightBg')} ${getColorClasses(challenge.color, 'lightText')}`}>
                  {challenge.tier_name} Tier
                </span>

                <h2 className="text-2xl font-black mb-3 text-gray-900 dark:text-white uppercase tracking-tight">{challenge.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm font-medium line-clamp-2">{challenge.description}</p>

                <div className="space-y-4 mb-10 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Balance</span>
                    <span className="font-mono font-black text-xl text-gray-900 dark:text-white">${challenge.start_balance.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>
                  <div className="flex justify-between text-xs font-bold px-1">
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-[10px] uppercase">Drawdown</span>
                      <span className="text-red-500">{(challenge.total_max_loss * 100)}%</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-gray-400 text-[10px] uppercase">Goal</span>
                      <span className="text-green-500">+{(challenge.profit_target * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest flex items-center group">
                  View Detail & Rules
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Challenge Modal Window */}
        {selectedChallenge && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-900 rounded-[3rem] max-w-4xl w-full border border-gray-100 dark:border-gray-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>

              {/* Origin Section */}
              <div className={`md:w-2/5 p-12 ${getColorClasses(selectedChallenge.color, 'bg')} text-white flex flex-col justify-center relative`}>
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_white_0%,_transparent_70%)]"></div>
                <button
                  onClick={() => setSelectedChallenge(null)}
                  className="absolute top-8 left-8 text-white/50 hover:text-white md:hidden"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <span className="text-xs font-black uppercase tracking-[0.3em] mb-4 text-white/70">The Origins</span>
                <h3 className="text-4xl font-black mb-8 uppercase italic tracking-tighter">Why {selectedChallenge.tier_name}?</h3>
                <p className="text-lg font-medium leading-relaxed italic text-white/90">
                  "{selectedChallenge.lore}"
                </p>

                <div className="mt-auto pt-12">
                  <div className="text-6xl font-black opacity-20">0{selectedChallenge.id}</div>
                </div>
              </div>

              {/* Rules & Actions Section */}
              <div className="md:w-3/5 p-12 bg-white dark:bg-gray-900">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h4 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Technical Rules</h4>
                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Execution Compliance & Safety</p>
                  </div>
                  <button
                    onClick={() => setSelectedChallenge(null)}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all transform hover:rotate-90 hidden md:block"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-12">
                  {selectedChallenge.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                      <div className={`w-2 h-2 rounded-full ${getColorClasses(selectedChallenge.color, 'accent')} mr-4 shadow-[0_0_10px_rgba(0,0,0,0.2)]`}></div>
                      <span className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-tight">{rule}</span>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4 mt-auto">
                  <button
                    onClick={() => setSelectedChallenge(null)}
                    className="px-8 py-5 text-gray-400 font-black uppercase text-xs tracking-widest hover:text-gray-900 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={() => startChallenge(selectedChallenge)}
                    disabled={userRole === 'admin' || userRole === 'superadmin'}
                    className={`flex-1 py-5 ${userRole === 'admin' || userRole === 'superadmin'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : `${getColorClasses(selectedChallenge.color, 'bg')} ${getColorClasses(selectedChallenge.color, 'hoverBg')} shadow-xl ${getColorClasses(selectedChallenge.color, 'shadow')}`
                      } text-white text-sm font-black uppercase tracking-widest rounded-3xl transition-all transform active:scale-95`}
                  >
                    {userRole === 'admin' || userRole === 'superadmin'
                      ? 'Admin Restricted'
                      : `Accept ($ ${selectedChallenge.price}) & Start`
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}