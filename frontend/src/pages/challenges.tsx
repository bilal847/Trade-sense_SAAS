import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Shield, Target, ArrowRight, ChevronRight, Star, Activity, Lock, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';
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
          description: "Engineered for aspiring quants ready to bridge the gap from academy to market.",
          lore: "Our foundational infrastructure. Provides a structured environment for those executing their first institutional-grade models.",
          start_balance: 10000.00,
          price: 49,
          daily_max_loss: 0.05,
          total_max_loss: 0.10,
          profit_target: 0.08,
          rules: ["Max 5% Daily Drawdown", "Max 10% Total Drawdown", "Min 5 Trading Days", "News-Safe Environment"],
          color: "blue",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: "Elite Performance",
          tier_name: "ELITE",
          description: "Institutional capacity for disciplined traders who maintain consistency at scale.",
          lore: "The professional benchmark. Designed in collaboration with liquidity providers to identify high-capacity algorithmic and manual traders.",
          start_balance: 100000.00,
          price: 199,
          daily_max_loss: 0.04,
          total_max_loss: 0.08,
          profit_target: 0.10,
          rules: ["Max 4% Daily Drawdown", "Max 8% Total Drawdown", "Consistency Variance < 30%", "Full EA Support"],
          color: "purple",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          name: "Master Architect",
          tier_name: "MASTER",
          description: "Top 1% status. Unlimited scaling and the highest capital allocation available.",
          lore: "Reserved for market legends. This is the pinnacle of quantitative achievement, where absolute discipline meets high-frequency execution.",
          start_balance: 250000.00,
          price: 399,
          daily_max_loss: 0.03,
          total_max_loss: 0.06,
          profit_target: 0.12,
          rules: ["Max 3% Daily Drawdown", "Max 6% Total Drawdown", "Professional Verification", "Unlimited Scaling Access"],
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

  const startChallenge = (challenge: EnhancedChallenge) => {
    if (userRole === 'admin' || userRole === 'superadmin') {
      alert('Access Restricted: Administrators cannot participate in the prop-firm program.');
      return;
    }
    router.push(`/checkout?plan=${challenge.tier_name}&price=${challenge.price}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-[#030712]">
          <Activity className="w-12 h-12 text-blue-500 animate-pulse" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Evolution Pathways | TradeSense">
      <Head>
        <meta name="description" content="Choose your institutional funding path." />
      </Head>

      <main className="min-h-screen bg-[#030712] text-white pb-24 overflow-hidden relative">
        {/* Animated Orbs */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-6 pt-16 relative z-10">
          {/* Header */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest mb-8"
            >
              <Zap className="w-4 h-4" />
              <span>Capital Allocation Program</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black mb-6 tracking-tighter italic uppercase"
            >
              EVOLUTION <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">PATHWAYS</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-xl max-w-2xl mx-auto font-medium"
            >
              Select your architecture. Every legend starts with a single high-precision trade.
            </motion.p>
          </div>

          {/* Tier Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {challenges.map((challenge, idx) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedChallenge(challenge)}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-b from-${challenge.color === 'amber' ? 'yellow' : challenge.color}-600/20 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 group-hover:border-white/20 rounded-[3rem] p-10 h-full flex flex-col transition-all duration-500 relative z-10 cursor-pointer shadow-2xl overflow-hidden">
                  {/* Glass Header */}
                  <div className="flex justify-between items-start mb-10">
                    <div className={`w-14 h-14 rounded-2xl bg-${challenge.color === 'amber' ? 'yellow' : challenge.color}-500/10 border border-${challenge.color === 'amber' ? 'yellow' : challenge.color}-500/20 flex items-center justify-center text-${challenge.color === 'amber' ? 'yellow' : challenge.color}-400 group-hover:scale-110 transition-transform`}>
                      {challenge.tier_name === 'STUDENT' && <Shield className="w-7 h-7" />}
                      {challenge.tier_name === 'ELITE' && <Zap className="w-7 h-7" />}
                      {challenge.tier_name === 'MASTER' && <Trophy className="w-7 h-7" />}
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Entry Fee</span>
                      <span className="text-3xl font-black text-white">${challenge.price}</span>
                    </div>
                  </div>

                  <h2 className="text-3xl font-black mb-3 italic tracking-tight uppercase group-hover:text-blue-400 transition-colors">{challenge.name}</h2>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8 flex-1">
                    {challenge.description}
                  </p>

                  <div className="bg-[#030712]/50 rounded-3xl p-6 border border-white/5 mb-8">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Initial Allocation</span>
                      <span className="text-xl font-bold text-white font-mono">${challenge.start_balance.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-600 uppercase mb-1">Profit Goal</span>
                        <span className="text-green-500 font-bold">+{challenge.profit_target * 100}%</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] font-black text-slate-600 uppercase mb-1">Risk Limit</span>
                        <span className="text-red-500 font-bold">{challenge.total_max_loss * 100}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-blue-400 group-hover:text-white transition-colors">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">View Protocol Details</span>
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-500 group-hover:translate-x-1">
                      <ChevronRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Challenge Protocol Modal */}
        <AnimatePresence>
          {selectedChallenge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#030712]/90 backdrop-blur-xl"
              onClick={() => setSelectedChallenge(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white/[0.03] border border-white/10 rounded-[3.5rem] max-w-5xl w-full overflow-hidden flex flex-col md:flex-row relative shadow-[0_0_100px_rgba(37,99,235,0.1)]"
                onClick={e => e.stopPropagation()}
              >
                {/* Left Side: Lore */}
                <div className={`md:w-2/5 p-12 bg-gradient-to-br from-blue-600 to-indigo-900 text-white flex flex-col justify-between relative`}>
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_white_0%,_transparent_70%)]"></div>

                  <button
                    onClick={() => setSelectedChallenge(null)}
                    className="absolute top-8 left-8 p-3 bg-white/10 rounded-2xl md:hidden"
                  >
                    <Lock className="w-5 h-5" />
                  </button>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 block text-white/60">Tier Intelligence</span>
                    <h3 className="text-5xl font-black mb-8 italic tracking-tighter uppercase whitespace-pre-line leading-none">THE\n{selectedChallenge.tier_name}\nMISSIVE</h3>
                    <p className="text-xl font-medium italic leading-relaxed text-white/80">
                      "{selectedChallenge.lore}"
                    </p>
                  </div>

                  <div className="pt-12">
                    <div className="flex items-center space-x-4 opacity-50">
                      <Cpu className="w-6 h-6" />
                      <div className="h-0.5 flex-1 bg-white/20"></div>
                      <span className="text-xs font-black uppercase tracking-widest">Protocol 0{selectedChallenge.id}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Details & Action */}
                <div className="md:w-3/5 p-12 relative flex flex-col">
                  <div className="flex justify-between items-start mb-12">
                    <div>
                      <h4 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Technical Standards</h4>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Compliance & Risk Parameters</p>
                    </div>
                    <button
                      onClick={() => setSelectedChallenge(null)}
                      className="hidden md:flex p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all transform hover:rotate-90"
                    >
                      <Lock className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 mb-12">
                    {selectedChallenge.rules.map((rule, idx) => (
                      <div key={idx} className="flex items-center p-5 bg-white/5 border border-white/10 rounded-2xl group/rule hover:bg-white/[0.08] transition-colors">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 mr-4 shrink-0" />
                        <span className="text-sm font-black text-slate-200 uppercase tracking-tight">{rule}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center space-x-6">
                    <div className="flex-1">
                      <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Subscription</span>
                      <span className="text-3xl font-black text-white">${selectedChallenge.price}</span>
                    </div>

                    <button
                      onClick={() => startChallenge(selectedChallenge)}
                      disabled={userRole === 'admin' || userRole === 'superadmin'}
                      className="flex-[2] py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-blue-600/20 transition-all flex items-center justify-center space-x-3 active:scale-95"
                    >
                      {userRole === 'admin' || userRole === 'superadmin' ? (
                        <>
                          <ShieldCheck className="w-5 h-5" />
                          <span>Locked</span>
                        </>
                      ) : (
                        <>
                          <span>Initiate Evaluation</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </Layout>
  );
}