import React, { useState } from 'react';
import Layout from '@/components/Common/Layout';
import { featuresAPI } from '@/services/api';
import { useTranslation } from '@/hooks/useTranslation';

const AIQuantAssistant: React.FC = () => {
    const { t } = useTranslation();
    const [selectedAssets, setSelectedAssets] = useState<number[]>([1]); // Default EURUSD
    const [analysisResults, setAnalysisResults] = useState<{ [key: number]: any }>({});
    const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
    const [showBreakdown, setShowBreakdown] = useState<{ [key: number]: boolean }>({});

    const ASSETS = [
        { id: 1, symbol: 'EURUSD', name: 'Euro / US Dollar', icon: '💶' },
        { id: 2, symbol: 'GBPUSD', name: 'British Pound / US Dollar', icon: '💷' },
        { id: 3, symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', icon: '💴' },
        { id: 4, symbol: 'BTCUSDT', name: 'Bitcoin / Tether', icon: '₿' },
        { id: 5, symbol: 'ETHUSDT', name: 'Ethereum / Tether', icon: 'Ξ' },
        { id: 6, symbol: 'XAUUSD', name: 'Gold / US Dollar', icon: '🥇' },
    ];

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
        <Layout title={`${t('quant_title')} | TradeSense`}>
            <div className="min-h-screen">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 py-16 shadow-lg">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-center mb-6">
                            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md mr-6 shadow-xl border border-white/20">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                                </svg>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight uppercase">{t('quant_title')}</h1>
                        </div>
                        <p className="text-center text-white/90 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                            {t('quant_signal')} powered by 4 independent AI models
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    {/* Asset Selector */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 mb-10">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Select Assets to Analyze</h2>
                            <button
                                onClick={analyzeAll}
                                disabled={selectedAssets.length === 0}
                                className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center shadow-lg shadow-purple-500/30"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                                {t('quant_analyze')} ({selectedAssets.length})
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {ASSETS.map(asset => (
                                <button
                                    key={asset.id}
                                    onClick={() => toggleAsset(asset.id)}
                                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center text-center group ${selectedAssets.includes(asset.id)
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-500/10'
                                        : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-purple-200 dark:hover:border-purple-800'
                                        }`}
                                >
                                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{asset.icon}</div>
                                    <div className="text-gray-900 dark:text-white font-bold text-sm tracking-widest">{asset.symbol}</div>
                                    <div className="text-gray-400 dark:text-gray-500 text-xs mt-1 font-medium">{asset.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Analysis Results */}
                    {selectedAssets.length === 0 ? (
                        <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl max-w-2xl mx-auto">
                            <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-600 dark:text-purple-400">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-xl font-bold">Select at least one asset to begin analysis</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {selectedAssets.map(assetId => {
                                const asset = ASSETS.find(a => a.id === assetId);
                                const analysis = analysisResults[assetId];
                                const isLoading = loading[assetId];
                                const breakdown = showBreakdown[assetId];

                                return (
                                    <div key={assetId} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-xl transition-all hover:shadow-2xl hover:shadow-purple-500/5">
                                        {/* Asset Header */}
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-b border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <span className="text-4xl mr-4">{asset?.icon}</span>
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{asset?.symbol}</h3>
                                                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{asset?.name}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => analyzeAsset(assetId)}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 text-sm"
                                                >
                                                    {isLoading ? t('loading') : t('nav_news').split(' ')[0]}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Analysis Content */}
                                        <div className="p-8">
                                            {isLoading ? (
                                                <div className="flex flex-col items-center justify-center py-16">
                                                    <div className="animate-spin h-14 w-14 border-4 border-purple-500 rounded-full border-t-transparent mb-6 shadow-2xl"></div>
                                                    <p className="text-gray-500 dark:text-gray-400 font-bold animate-pulse">Running ensemble analysis...</p>
                                                </div>
                                            ) : !analysis ? (
                                                <div className="text-center py-16">
                                                    <p className="text-gray-400 dark:text-gray-500 mb-6 font-bold uppercase tracking-widest text-sm">No recent analysis data</p>
                                                    <button
                                                        onClick={() => analyzeAsset(assetId)}
                                                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/30"
                                                    >
                                                        Run Intelligence Analysis
                                                    </button>
                                                </div>
                                            ) : analysis.error ? (
                                                <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/50 text-center font-bold">
                                                    {analysis.error}
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {/* Signal & Confidence */}
                                                    <div className="flex flex-col sm:flex-row gap-4">
                                                        <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('quant_signal')}</span>
                                                            <span className={`font-black px-6 py-2 rounded-xl text-2xl shadow-sm border ${analysis.signal === 'BUY' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                                                                analysis.signal === 'SELL' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                                                                    'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                                                                }`}>
                                                                {analysis.signal}
                                                            </span>
                                                        </div>

                                                        <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('quant_confidence')}</span>
                                                            <span className="text-gray-900 dark:text-white font-black text-4xl tracking-tighter">{analysis.confidence}%</span>
                                                        </div>
                                                    </div>

                                                    {/* Reasoning */}
                                                    <div className="p-6 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/50 rounded-2xl">
                                                        <div className="flex items-center text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-widest mb-3">
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                            {t('quant_reasoning')}
                                                        </div>
                                                        <p className="text-gray-700 dark:text-gray-300 font-serif italic text-lg leading-relaxed">
                                                            "{analysis.reasoning}"
                                                        </p>
                                                    </div>

                                                    {/* Model Breakdown Toggle */}
                                                    <button
                                                        onClick={() => setShowBreakdown({ ...showBreakdown, [assetId]: !breakdown })}
                                                        className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white py-4 px-6 rounded-2xl font-bold transition-all flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm"
                                                    >
                                                        <svg className={`w-5 h-5 mr-3 transition-transform ${breakdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                        </svg>
                                                        {breakdown ? 'Hide' : 'Show'} {t('quant_breakdown')}
                                                    </button>

                                                    {/* Model Breakdown */}
                                                    {breakdown && analysis.ensemble_breakdown && (
                                                        <div className="space-y-4 pt-2">
                                                            {analysis.ensemble_breakdown.map((model: any, idx: number) => (
                                                                <div key={idx} className="bg-gray-50 dark:bg-gray-900/80 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all hover:border-purple-200 dark:hover:border-purple-800">
                                                                    <div className="flex justify-between items-center mb-4">
                                                                        <span className="text-sm font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">{model.name}</span>
                                                                        <div className="flex items-center space-x-3">
                                                                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black tracking-widest ${model.signal === 'BUY' ? 'bg-green-100 text-green-700' :
                                                                                model.signal === 'SELL' ? 'bg-red-100 text-red-700' :
                                                                                    'bg-gray-100 text-gray-600'
                                                                                }`}>
                                                                                {model.signal}
                                                                            </span>
                                                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-black font-mono">{model.confidence}%</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center mb-3">
                                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-3 w-12 text-right">Weight:</span>
                                                                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 shadow-inner">
                                                                            <div
                                                                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 shadow-sm"
                                                                                style={{ width: `${model.weight}%` }}
                                                                            ></div>
                                                                        </div>
                                                                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 ml-3 w-10">{model.weight}%</span>
                                                                    </div>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-400 italic font-medium">"{model.reasoning}"</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default AIQuantAssistant;
