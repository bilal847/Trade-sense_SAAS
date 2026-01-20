import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Newspaper,
    Search,
    Filter,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Globe,
    ExternalLink,
    Clock,
    ChevronRight,
    X,
    LayoutGrid,
    MessageSquare,
    AlertCircle,
    Zap,
    ArrowUpRight,
    LucideIcon
} from 'lucide-react';
import Layout from '@/components/Common/Layout';
import { featuresAPI } from '@/services/api';
import { useTranslation } from '@/hooks/useTranslation';

const NewsHub: React.FC = () => {
    const { t } = useTranslation();
    const [newsData, setNewsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSentiment, setSelectedSentiment] = useState<string>('All');
    const [selectedImpact, setSelectedImpact] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Reader state
    const [showReader, setShowReader] = useState(false);
    const [readingArticle, setReadingArticle] = useState<any>(null);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const res = await featuresAPI.getNews();
            setNewsData(res.data.news);
        } catch (e) {
            console.error('Failed to fetch news:', e);
        } finally {
            setTimeout(() => setLoading(false), 800); // Smooth transition
        }
    };

    const handleReadArticle = async (url: string) => {
        setReadingArticle({ loading: true });
        setShowReader(true);
        try {
            const res = await featuresAPI.readArticle(url);
            if (res.data.status === 'success') {
                setReadingArticle(res.data.article);
            } else {
                setReadingArticle({ error: res.data.message || "Could not load content", url });
            }
        } catch (e) {
            setReadingArticle({ error: "Failed to load article.", url });
        }
    };

    // Filter news
    const filteredNews = newsData.filter(item => {
        const matchesSentiment = selectedSentiment === 'All' || item.sentiment === selectedSentiment;
        const matchesImpact = selectedImpact === 'All' || item.impact === selectedImpact;
        const matchesSearch = searchQuery === '' ||
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.summary.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSentiment && matchesImpact && matchesSearch;
    });

    // Get unique impacts for filter
    const uniqueImpacts = ['All', 'Global', ...Array.from(new Set(newsData.map(n => n.impact).filter(i => i && i !== 'Global')))];

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

    const getAssetIcon = (asset: string): React.ReactNode => {
        switch (asset) {
            case 'BTCUSDT': return <span className="text-orange-400">₿</span>;
            case 'ETHUSDT': return <span className="text-blue-400">Ξ</span>;
            case 'EURUSD': return <span className="text-blue-500">€</span>;
            case 'GBPUSD': return <span className="text-pink-500">£</span>;
            case 'NAS100': return <LayoutGrid className="w-3 h-3 text-cyan-400" />;
            case 'XAUUSD': return <span className="text-yellow-400">Au</span>;
            case 'USOIL': return <Zap className="w-3 h-3 text-orange-500" />;
            default: return <Globe className="w-3 h-3 text-slate-400" />;
        }
    };

    return (
        <Layout>
            <Head>
                <title>Global Intelligence Hub | TradeSense</title>
            </Head>

            <div className="min-h-screen bg-[#030712] text-slate-200 selection:bg-orange-500/30">
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden border-b border-white/5">
                    {/* Background Gradients */}
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] -z-10" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-[120px] -z-10" />

                    <div className="container mx-auto px-6 relative">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-4xl"
                        >
                            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-widest mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                </span>
                                <span>Real-Time Intelligence Pipeline</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tighter">
                                Market Narratives. <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-red-500 to-pink-500">
                                    Synthesized for Execution.
                                </span>
                            </h1>

                            <p className="text-xl text-slate-400 max-w-2xl font-medium leading-relaxed mb-10">
                                Advanced NLP engine processing thousands of global data points per second.
                                Detect sentiment shifts before they hit the tape.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Filter & Search Bar */}
                <section className="sticky top-0 z-40 bg-[#030712]/80 backdrop-blur-xl border-b border-white/5 py-6">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col lg:flex-row gap-6 items-center">
                            {/* Search */}
                            <div className="relative w-full lg:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search narratives..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-slate-600"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-4 w-full">
                                <div className="flex items-center space-x-2 bg-white/5 p-1 rounded-xl border border-white/10">
                                    {['All', 'Bullish', 'Neutral', 'Bearish'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setSelectedSentiment(s)}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedSentiment === s
                                                ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>

                                <div className="h-6 w-px bg-white/10 hidden md:block" />

                                <div className="flex items-center space-x-2">
                                    <Filter className="w-4 h-4 text-slate-500" />
                                    <select
                                        value={selectedImpact}
                                        onChange={(e) => setSelectedImpact(e.target.value)}
                                        className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer text-slate-300"
                                    >
                                        {uniqueImpacts.map(impact => (
                                            <option key={impact} value={impact} className="bg-[#030712]">{impact}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={fetchNews}
                                    className="ml-auto p-2 hover:bg-white/5 rounded-lg transition-colors group"
                                    title="Refresh Pipeline"
                                >
                                    <RefreshCw className={`w-4 h-4 text-slate-500 group-hover:text-orange-500 transition-all ${loading ? 'animate-spin text-orange-500' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* News Grid */}
                <section className="py-20">
                    <div className="container mx-auto px-6">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-[400px] bg-white/5 rounded-3xl animate-pulse border border-white/10" />
                                ))}
                            </div>
                        ) : filteredNews.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-40 bg-white/2 rounded-3xl border border-dashed border-white/10"
                            >
                                <AlertCircle className="w-16 h-16 text-slate-700 mb-6" />
                                <h3 className="text-2xl font-bold text-slate-400">Zero Signal Match</h3>
                                <p className="text-slate-500 mt-2">Adjust your filters to scan broader markets.</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            >
                                {filteredNews.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        variants={itemVariants}
                                        className="group relative flex flex-col bg-white/2 border border-white/5 rounded-3xl overflow-hidden hover:bg-white/5 hover:border-white/10 transition-all duration-500"
                                    >
                                        {/* Sentiment Glow */}
                                        <div className={`absolute top-0 left-0 w-full h-[2px] opacity-30 group-hover:opacity-100 transition-opacity ${item.sentiment === 'Bullish' ? 'bg-emerald-500' : item.sentiment === 'Bearish' ? 'bg-rose-500' : 'bg-blue-500'}`} />

                                        <div className="p-8 flex flex-col h-full">
                                            {/* Header Tags */}
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-sm">
                                                        {getAssetIcon(item.impact)}
                                                    </div>
                                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                                                        {item.impact || 'Global'}
                                                    </span>
                                                </div>

                                                <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest opacity-60">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{item.timestamp.split('T')[0] || item.timestamp}</span>
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-xl font-bold mb-4 leading-tight group-hover:text-white transition-colors">
                                                {item.title}
                                            </h3>

                                            {/* Sentiment Indicator */}
                                            <div className="flex items-center space-x-4 mb-6">
                                                <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${item.sentiment === 'Bullish' ? 'text-emerald-400 bg-emerald-500/10' :
                                                    item.sentiment === 'Bearish' ? 'text-rose-400 bg-rose-500/10' :
                                                        'text-blue-400 bg-blue-500/10'
                                                    }`}>
                                                    {item.sentiment === 'Bullish' ? <TrendingUp className="w-3 h-3" /> :
                                                        item.sentiment === 'Bearish' ? <TrendingDown className="w-3 h-3" /> :
                                                            <Globe className="w-3 h-3" />}
                                                    <span>{item.sentiment}</span>
                                                </div>

                                                <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: item.sentiment === 'Neutral' ? '50%' : '85%' }}
                                                        transition={{ duration: 1, delay: idx * 0.1 }}
                                                        className={`h-full ${item.sentiment === 'Bullish' ? 'bg-emerald-500' :
                                                            item.sentiment === 'Bearish' ? 'bg-rose-500' :
                                                                'bg-blue-500'
                                                            }`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Summary */}
                                            <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8 line-clamp-3">
                                                {item.summary}
                                            </p>

                                            {/* Footer */}
                                            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                    Source: {item.source}
                                                </span>

                                                <button
                                                    onClick={() => handleReadArticle(item.url)}
                                                    className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors"
                                                >
                                                    <span>Read Analysis</span>
                                                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Hover Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-transparent to-red-500/0 pointer-events-none group-hover:from-orange-500/5 group-hover:to-red-500/5 transition-all duration-700" />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </section>

                {/* Reader Modal */}
                <AnimatePresence>
                    {showReader && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
                            onClick={() => setShowReader(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                className="bg-[#0b0f1a] border border-white/10 rounded-[32px] max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden"
                                onClick={e => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setShowReader(false)}
                                    className="absolute top-6 right-6 text-slate-400 hover:text-white z-50 bg-white/5 border border-white/10 p-2 rounded-xl transition-all hover:rotate-90"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                {!readingArticle || readingArticle.loading ? (
                                    <div className="flex-1 flex flex-col items-center justify-center p-20">
                                        <div className="relative">
                                            <div className="w-20 h-20 border-4 border-orange-500/20 rounded-full animate-spin border-t-orange-500" />
                                            <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-orange-500 animate-pulse" />
                                        </div>
                                        <p className="mt-10 text-xl font-bold text-slate-400 animate-pulse tracking-tight">Accessing Narrative Protocol...</p>
                                    </div>
                                ) : readingArticle.error ? (
                                    <div className="p-20 text-center">
                                        <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
                                            <AlertCircle className="w-12 h-12 text-rose-500" />
                                        </div>
                                        <h3 className="text-3xl font-black mb-4">Encryption Blocked</h3>
                                        <p className="text-slate-400 mb-10 text-lg max-w-md mx-auto">{readingArticle.error}</p>
                                        <a
                                            href={readingArticle.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center space-x-3 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-900/40 transition-all"
                                        >
                                            <span>Read Original Stream</span>
                                            <ExternalLink className="w-5 h-5" />
                                        </a>
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                                        {/* Article Hero */}
                                        <div className="relative h-[450px]">
                                            {readingArticle.image ? (
                                                <img src={readingArticle.image} alt={readingArticle.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-[#0b0f1a] via-orange-900/20 to-red-900/20 flex items-center justify-center p-20">
                                                    <Newspaper className="w-32 h-32 text-white/5" />
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f1a] via-[#0b0f1a]/40 to-transparent p-12 md:p-20 flex flex-col justify-end">
                                                <div className="flex flex-wrap gap-4 mb-6">
                                                    <span className="px-3 py-1 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-md">
                                                        {readingArticle.publish_date ? new Date(readingArticle.publish_date).toLocaleDateString() : 'Active Narrative'}
                                                    </span>
                                                    {readingArticle.authors && readingArticle.authors.map((a: string) => (
                                                        <span key={a} className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-md border border-white/5">
                                                            {a}
                                                        </span>
                                                    ))}
                                                </div>
                                                <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter mb-4 uppercase">{readingArticle.title}</h2>
                                            </div>
                                        </div>

                                        {/* Article Content */}
                                        <div className="p-12 md:p-20 max-w-4xl mx-auto">
                                            <div className="space-y-10">
                                                {readingArticle.text.split('\n\n').map((paragraph: string, i: number) => (
                                                    <p key={i} className="text-xl leading-relaxed text-slate-300 font-medium selection:bg-orange-500/30">
                                                        {paragraph}
                                                    </p>
                                                ))}
                                            </div>

                                            <div className="mt-16 pt-16 border-t border-white/5 flex items-center justify-center">
                                                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">End of Intelligence Report</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </Layout>
    );
};

export default NewsHub;
