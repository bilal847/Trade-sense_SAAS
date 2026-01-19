import React, { useState, useEffect } from 'react';
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
            setLoading(false);
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
    const uniqueImpacts = ['All', ...Array.from(new Set(newsData.map(n => n.impact).filter(Boolean)))];

    return (
        <Layout title={`${t('news_title')} | TradeSense`}>
            <div className="min-h-screen">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 py-16 shadow-lg">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-center mb-6">
                            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md mr-6 shadow-xl border border-white/20">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                                </svg>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight uppercase">{t('news_title')}</h1>
                        </div>
                        <p className="text-center text-white/90 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                            {t('news_loading').replace('...', '')} {t('news_impact')} detection
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 mb-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Search */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Search</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search market news..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-10"
                                    />
                                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                            </div>

                            {/* Sentiment Filter */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">{t('news_sentiment')}</label>
                                <select
                                    value={selectedSentiment}
                                    onChange={(e) => setSelectedSentiment(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="All">All Sentiments</option>
                                    <option value="Bullish">Bullish</option>
                                    <option value="Bearish">Bearish</option>
                                    <option value="Neutral">Neutral</option>
                                </select>
                            </div>

                            {/* Impact Filter */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">{t('news_impact')}</label>
                                <select
                                    value={selectedImpact}
                                    onChange={(e) => setSelectedImpact(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    {uniqueImpacts.map(impact => (
                                        <option key={impact} value={impact}>{impact}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-6">
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Showing <span className="text-orange-600">{filteredNews.length}</span> of {newsData.length} articles
                            </p>
                            <button
                                onClick={fetchNews}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center shadow-lg shadow-orange-500/30"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* News Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="animate-spin h-16 w-16 border-4 border-orange-500 rounded-full border-t-transparent mb-6 shadow-2xl"></div>
                            <p className="text-gray-500 dark:text-gray-400 text-lg font-bold animate-pulse">{t('news_loading')}</p>
                        </div>
                    ) : filteredNews.length === 0 ? (
                        <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl">
                            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 dark:text-gray-600">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-xl font-bold">No news articles match your filters</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredNews.map((item, idx) => (
                                <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 flex flex-col group">
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight flex-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors uppercase tracking-tight">{item.title}</h3>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold shadow-sm ring-1 ${item.sentiment === 'Bullish' ? 'bg-green-100 text-green-700 ring-green-200 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-800' : item.sentiment === 'Bearish' ? 'bg-red-100 text-red-700 ring-red-200 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-800' : 'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600'}`}>
                                                {item.sentiment}
                                            </span>
                                            {item.impact && item.impact !== 'Global' && (
                                                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-100 shadow-sm dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 uppercase tracking-widest">
                                                    {item.impact}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed font-medium">{item.summary}</p>

                                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50 dark:border-gray-700/50">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                {item.source} • {item.timestamp}
                                            </div>
                                            <button
                                                onClick={() => handleReadArticle(item.url)}
                                                className="text-orange-600 dark:text-orange-400 font-bold text-sm flex items-center hover:underline"
                                            >
                                                {t('news_read_more')}
                                                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Reader Modal */}
                {showReader && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden border border-white/10">
                            <button
                                onClick={() => setShowReader(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white font-bold z-20 bg-gray-100 dark:bg-gray-800 rounded-full p-3 transition-all hover:rotate-90"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>

                            {!readingArticle || readingArticle.loading ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-12">
                                    <div className="animate-spin h-12 w-12 border-4 border-orange-500 rounded-full border-t-transparent mb-6"></div>
                                    <p className="text-gray-500 dark:text-gray-400 font-bold text-lg animate-pulse">Fetching global intelligence...</p>
                                </div>
                            ) : readingArticle.error ? (
                                <div className="p-16 text-center">
                                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">Content Unavailable</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-md mx-auto">{readingArticle.error}</p>
                                    <a
                                        href={readingArticle.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
                                    >
                                        Read on Original Site
                                    </a>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto">
                                    {/* Article Header */}
                                    <div className="relative h-80 bg-gray-200 dark:bg-gray-800">
                                        {readingArticle.image ? (
                                            <img src={readingArticle.image} alt={readingArticle.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 text-white text-3xl font-extrabold p-12 text-center uppercase tracking-tight">
                                                {readingArticle.title}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-8 md:p-12 flex flex-col justify-end">
                                            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight uppercase tracking-tight mb-4">{readingArticle.title}</h2>
                                            <div className="flex flex-wrap items-center text-gray-200 text-sm font-bold uppercase tracking-widest gap-6">
                                                <span className="bg-white/20 px-3 py-1 rounded-md backdrop-blur-md">{readingArticle.publish_date ? new Date(readingArticle.publish_date).toLocaleDateString() : 'Recent'}</span>
                                                {readingArticle.authors && readingArticle.authors.length > 0 && (
                                                    <span className="bg-white/20 px-3 py-1 rounded-md backdrop-blur-md">By {readingArticle.authors.join(', ')}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Article Body */}
                                    <div className="p-8 md:p-16 max-w-4xl mx-auto">
                                        {readingArticle.text.split('\n\n').map((paragraph: string, i: number) => (
                                            <p key={i} className="mb-10 text-xl leading-relaxed text-gray-700 dark:text-gray-300 font-medium font-serif first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-orange-600">
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default NewsHub;
