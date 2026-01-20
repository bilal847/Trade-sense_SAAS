import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Cpu,
    Zap,
    LineChart,
    ShieldCheck,
    Search,
    Terminal,
    ChevronRight,
    BrainCircuit,
    BarChart3,
    Dna,
    Workflow,
    Sparkles,
    Globe2
} from 'lucide-react';
import Layout from '@/components/Common/Layout';
import { featuresAPI } from '@/services/api';
import { useTranslation } from '@/hooks/useTranslation';

const AIQuantAssistant: React.FC = () => {
    const { t } = useTranslation();
    const [selectedAssets, setSelectedAssets] = useState<number[]>([1]);
    const [analysisResults, setAnalysisResults] = useState<{ [key: number]: any }>({});
    const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
    const [showBreakdown, setShowBreakdown] = useState<{ [key: number]: boolean }>({});

    const ASSETS = [
        { id: 1, symbol: 'EURUSD', name: 'Euro / US Dollar', icon: '💶', category: 'Forex' },
        { id: 2, symbol: 'GBPUSD', name: 'British Pound / US Dollar', icon: '💷', category: 'Forex' },
        { id: 3, symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', icon: '💴', category: 'Forex' },
        { id: 4, symbol: 'BTCUSDT', name: 'Bitcoin / Tether', icon: '₿', category: 'Crypto' },
        { id: 5, symbol: 'ETHUSDT', name: 'Ethereum / Tether', icon: 'Ξ', category: 'Crypto' },
        { id: 6, symbol: 'XAUUSD', name: 'Gold / US Dollar', icon: '🥇', category: 'Commodities' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    } as const;

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    } as const;

    const toggleAsset = (assetId: number) => {
        if (selectedAssets.includes(assetId)) {
            setSelectedAssets(selectedAssets.filter(id => id !== assetId));
        } else {
            setSelectedAssets([...selectedAssets, assetId]);
        }
    };

    const analyzeAsset = async (assetId: number) => {
        setLoading({ ...loading, [assetId]: true });
        try {
            const res = await featuresAPI.getEnsembleAnalysis(assetId);
            setAnalysisResults({ ...analysisResults, [assetId]: res.data.analysis });
        } catch (e) {
            setAnalysisResults({ ...analysisResults, [assetId]: { error: t('error') } });
        } finally {
            setLoading({ ...loading, [assetId]: false });
        }
    };

    const analyzeAll = () => {
        selectedAssets.forEach(assetId => analyzeAsset(assetId));
    };

    return (
        <Layout title={`${t('quant_title')} | TradeSense intelligence`}>
            <div className="min-h-screen bg-[#030712] text-slate-100">
                {/* Premium Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden border-b border-slate-800/50">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
                        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                    </div>

                    <div className="container mx-auto px-6 relative z-10">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            className="max-w-4xl mx-auto text-center"
                        >
                            <motion.div
                                variants={itemVariants}
                                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8"
                            >
                                <BrainCircuit className="w-4 h-4" />
                                <span>Quantum Neural Engine v4.2</span>
                            </motion.div>

                            <motion.h1
                                variants={itemVariants}
                                className="text-5xl lg:text-7xl font-bold mb-8 tracking-tight leading-[1.1]"
                            >
                                Institutional Intelligence. <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400">
                                    Powered by AI Ensemble.
                                </span>
                            </motion.h1>

                            <motion.p
                                variants={itemVariants}
                                className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                            >
                                {t('quant_signal')} leveraged across 4 specialized neural architectures for institutional-grade predictive accuracy.
                            </motion.p>

                            <motion.div variants={itemVariants}>
                                <button
                                    onClick={() => document.getElementById('terminal')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all mx-auto shadow-xl shadow-blue-500/20 active:scale-95"
                                >
                                    <Terminal className="w-5 h-5" />
                                    <span>Initialize Intelligence Pipeline</span>
                                </button>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-24 container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Ensemble Architecture",
                                desc: "Four independent AI models correlating technicals, sentiment, and macro data to filter out market noise.",
                                icon: Workflow,
                                color: "blue"
                            },
                            {
                                title: "Risk-Aware Execution",
                                desc: "Proprietary algorithms that assign confidence scores and volatility filters to every predictive output.",
                                icon: ShieldCheck,
                                color: "purple"
                            },
                            {
                                title: "Sub-Millisecond Engine",
                                desc: "Processing massive market datasets in real-time to provide high-frequency actionable insights.",
                                icon: Zap,
                                color: "cyan"
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 transition-all group"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/10 flex items-center justify-center mb-6 border border-${feature.color}-500/20 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <div id="terminal" className="container mx-auto px-6 py-20">
                    <div className="max-w-6xl mx-auto">
                        {/* Intelligence Terminal Section */}
                        <div className="mb-20">
                            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                                <div className="max-w-xl">
                                    <h2 className="text-3xl lg:text-4xl font-bold mb-4">Intelligence Terminal</h2>
                                    <p className="text-slate-400">Select the assets you wish to scan for institutional signals. Your current plan allows for simultaneous ensemble analysis across 6 instruments.</p>
                                </div>
                                <button
                                    onClick={analyzeAll}
                                    disabled={selectedAssets.length === 0}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-30 text-white rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                                >
                                    <Cpu className="w-5 h-5" />
                                    <span>Scan Asset Universe ({selectedAssets.length})</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {ASSETS.map(asset => (
                                    <motion.button
                                        key={asset.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => toggleAsset(asset.id)}
                                        className={`p-6 rounded-[2rem] border transition-all flex flex-col items-center text-center relative overflow-hidden group ${selectedAssets.includes(asset.id)
                                            ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10'
                                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                                            }`}
                                    >
                                        <div className="text-3xl mb-4 grayscale group-hover:grayscale-0 transition-all">{asset.icon}</div>
                                        <div className="text-slate-100 font-bold text-sm tracking-wider uppercase mb-1">{asset.symbol}</div>
                                        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-tight">{asset.category}</div>
                                        {selectedAssets.includes(asset.id) && (
                                            <div className="absolute top-3 right-3">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                            </div>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Quantum Analysis Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <AnimatePresence mode="popLayout">
                                {selectedAssets.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="lg:col-span-2 py-32 flex flex-col items-center justify-center bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-800/50"
                                    >
                                        <Search className="w-16 h-16 text-slate-800 mb-6" />
                                        <p className="text-slate-500 font-bold uppercase tracking-widest">Select target assets to begin intelligence protocol</p>
                                    </motion.div>
                                ) : (
                                    selectedAssets.map(assetId => {
                                        const asset = ASSETS.find(a => a.id === assetId);
                                        const analysis = analysisResults[assetId];
                                        const isLoading = loading[assetId];
                                        const breakdown = showBreakdown[assetId];

                                        return (
                                            <motion.div
                                                key={assetId}
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="bg-slate-900/80 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-3xl group"
                                            >
                                                {/* Card Header */}
                                                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl">
                                                            {asset?.icon}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-2xl font-bold tracking-tight">{asset?.symbol}</h3>
                                                            <div className="flex items-center text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                                                                <Globe2 className="w-3 h-3 mr-1" />
                                                                {asset?.category} | Global Data Feed
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => analyzeAsset(assetId)}
                                                        disabled={isLoading}
                                                        className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center text-slate-400 hover:text-white active:scale-95 disabled:opacity-50"
                                                    >
                                                        <Zap className={`w-5 h-5 ${isLoading ? 'animate-pulse text-yellow-400' : ''}`} />
                                                    </button>
                                                </div>

                                                <div className="p-8">
                                                    {isLoading ? (
                                                        <div className="py-20 flex flex-col items-center justify-center">
                                                            <div className="relative w-20 h-20 mb-8">
                                                                <div className="absolute inset-0 rounded-full border-4 border-blue-600/20" />
                                                                <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin" />
                                                                <div className="absolute inset-4 rounded-full border-4 border-b-purple-500 animate-[spin_1.5s_linear_infinite]" />
                                                            </div>
                                                            <p className="text-slate-400 font-bold uppercase tracking-wider animate-pulse">Running Neural Simulation...</p>
                                                        </div>
                                                    ) : !analysis ? (
                                                        <div className="py-20 text-center">
                                                            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-600">
                                                                <Dna className="w-10 h-10" />
                                                            </div>
                                                            <button
                                                                onClick={() => analyzeAsset(assetId)}
                                                                className="px-8 py-3 bg-blue-600/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl font-bold transition-all"
                                                            >
                                                                Initialize Ensemble Report
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-8">
                                                            {/* Result Badges */}
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center">
                                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Ensemble Signal</span>
                                                                    <span className={`text-3xl font-black px-6 py-1 rounded-xl shadow-inner border-2 ${analysis.signal === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                                                        analysis.signal === 'SELL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                                                                            'bg-slate-800 text-slate-400 border-slate-700'
                                                                        }`}>
                                                                        {analysis.signal}
                                                                    </span>
                                                                </div>
                                                                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center">
                                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Confidence Score</span>
                                                                    <span className="text-4xl font-black text-white tracking-tighter">{analysis.confidence}%</span>
                                                                </div>
                                                            </div>

                                                            {/* Report Summary */}
                                                            <div className="relative">
                                                                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full opacity-50" />
                                                                <h4 className="flex items-center text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3">
                                                                    <Sparkles className="w-3 h-3 mr-2" />
                                                                    Synthesized Reasoning
                                                                </h4>
                                                                <p className="text-slate-300 font-serif italic text-lg leading-relaxed antialiased">
                                                                    "{analysis.reasoning}"
                                                                </p>
                                                            </div>

                                                            {/* Detailed Breakdown Toggle */}
                                                            <button
                                                                onClick={() => setShowBreakdown({ ...showBreakdown, [assetId]: !breakdown })}
                                                                className="w-full flex items-center justify-between p-4 bg-slate-800/30 hover:bg-slate-800/50 rounded-2xl border border-slate-800 transition-all text-slate-400 hover:text-white"
                                                            >
                                                                <span className="text-sm font-bold uppercase tracking-widest ml-2">Neural Components</span>
                                                                <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${breakdown ? 'rotate-90' : ''}`} />
                                                            </button>

                                                            {breakdown && analysis.ensemble_breakdown && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    className="space-y-4 pt-2 overflow-hidden"
                                                                >
                                                                    {analysis.ensemble_breakdown.map((model: any, idx: number) => (
                                                                        <div key={idx} className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800/50 hover:bg-slate-950 transition-colors">
                                                                            <div className="flex justify-between items-center mb-4">
                                                                                <span className="text-xs font-black text-blue-400 uppercase tracking-widest">{model.name}</span>
                                                                                <div className="flex items-center space-x-3">
                                                                                    <span className={`text-[10px] px-3 py-0.5 rounded-full font-black tracking-widest border ${model.signal === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                                                                        model.signal === 'SELL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                                                                                            'bg-slate-800 text-slate-500'
                                                                                        }`}>
                                                                                        {model.signal}
                                                                                    </span>
                                                                                    <span className="text-xs text-white font-black font-mono">{model.confidence}%</span>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex items-center mb-3">
                                                                                <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                                                                                    <motion.div
                                                                                        initial={{ width: 0 }}
                                                                                        animate={{ width: `${model.weight}%` }}
                                                                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <p className="text-[11px] text-slate-500 italic leading-relaxed">"{model.reasoning}"</p>
                                                                        </div>
                                                                    ))}
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Performance Stats */}
                <section className="py-24 border-t border-slate-800/50 bg-slate-900/10">
                    <div className="container mx-auto px-6 text-center">
                        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
                            <div>
                                <div className="text-4xl font-bold mb-2">99.8%</div>
                                <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Data Integrity</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2">1.4ms</div>
                                <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Inference Speed</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2">42B+</div>
                                <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Data Points/Sec</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2">0.05%</div>
                                <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Latency Buffer</div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default AIQuantAssistant;
