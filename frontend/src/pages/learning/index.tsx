import React, { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, ChevronRight, Search, Filter, Sparkles, GraduationCap, BarChart3, Binary, Globe2 } from 'lucide-react';
import Layout from '@/components/Common/Layout';
import Link from 'next/link';
import { getLessonsByLocale, getCategoriesByLocale, Lesson } from '@/content/lessons';
import { useTranslation } from '@/hooks/useTranslation';

export default function LearningCatalog() {
    const { t, locale } = useTranslation();
    const allLessons = getLessonsByLocale(locale);
    const categories = ['All', ...getCategoriesByLocale(locale)];
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLessons = allLessons
        .filter((l: Lesson) => selectedCategory === 'All' || l.category === selectedCategory)
        .filter((l: Lesson) =>
            l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <Layout title="Quant Academy | TradeSense">
            <main className="min-h-screen bg-[#030712] text-white pb-24 overflow-hidden">
                {/* Background Accents */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-[10%] right-[5%] w-[30%] h-[30%] bg-blue-600/5 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[10%] left-[5%] w-[30%] h-[30%] bg-purple-600/5 rounded-full blur-[120px]"></div>
                </div>

                <div className="container mx-auto px-6 pt-12 relative z-10">
                    {/* Hero Section */}
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Institutional Knowledge Hub</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl md:text-8xl font-black mb-6 tracking-tighter italic"
                        >
                            QUANT <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 font-black">ACADEMY</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-400 text-xl max-w-3xl mx-auto font-medium leading-relaxed"
                        >
                            Master the mechanics of high-frequency markets. Our curriculum is engineered for those who demand quantitative edge.
                        </motion.p>
                    </div>

                    {/* Filters & Search Bar */}
                    <div className="flex flex-col lg:flex-row justify-between items-center mb-16 gap-8 bg-white/5 p-4 rounded-[2rem] border border-white/10 backdrop-blur-xl">
                        <div className="flex flex-wrap gap-2 justify-center">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${selectedCategory === cat
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full lg:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search the repository..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#030712]/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    {/* Lessons Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {filteredLessons.map((lesson: Lesson, idx: number) => (
                                <motion.div
                                    key={lesson.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Link href={`/learning/${lesson.slug}`} className="group block h-full">
                                        <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] hover:from-white/[0.06] hover:to-white/[0.02] border border-white/5 group-hover:border-blue-500/30 rounded-[2rem] p-8 h-full flex flex-col transition-all duration-500 relative overflow-hidden shadow-2xl">
                                            {/* Glow Effect */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                            <div className="flex justify-between items-start mb-8 relative z-10">
                                                <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all duration-500`}>
                                                    {getCategoryIcon(lesson.category)}
                                                </div>
                                                <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{lesson.readTime} MIN</span>
                                                </div>
                                            </div>

                                            <div className="flex-1 relative z-10">
                                                <h3 className="text-2xl font-black mb-3 tracking-tight group-hover:text-blue-400 transition-colors uppercase italic">
                                                    {lesson.title}
                                                </h3>
                                                <p className="text-slate-400 text-sm leading-relaxed mb-10 font-medium">
                                                    {lesson.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto relative z-10">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 group-hover:text-white transition-colors">
                                                    Initiate Module
                                                </span>
                                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-500 group-hover:translate-x-1">
                                                    <ChevronRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredLessons.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-slate-500 font-bold uppercase tracking-widest">No modules found Matching your criteria</p>
                        </div>
                    )}
                </div>
            </main>
        </Layout>
    );
}

function getCategoryIcon(category: string) {
    switch (category) {
        case 'Finance': return <Globe2 className="w-6 h-6 text-green-400" />;
        case 'Trading': return <BarChart3 className="w-6 h-6 text-orange-400" />;
        case 'Math': return <Binary className="w-6 h-6 text-purple-400" />;
        case 'Coding': return <GraduationCap className="w-6 h-6 text-blue-400" />;
        default: return <BookOpen className="w-6 h-6 text-slate-400" />;
    }
}
