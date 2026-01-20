import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { ChevronLeft, Clock, BarChart, BookOpen, GraduationCap, ArrowRight, Sparkles, Activity } from 'lucide-react';
import Layout from '@/components/Common/Layout';
import { useRouter } from 'next/router';
import { getLessonBySlug } from '@/content/lessons';
import { QuizWidget } from '@/components/Learning/Widgets/QuizWidget';
import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';

export default function LessonView() {
    const router = useRouter();
    const { slug } = router.query;

    if (!slug) return (
        <Layout>
            <div className="min-h-screen bg-[#030712] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <Activity className="w-8 h-8 text-blue-500 mb-4" />
                    <span className="text-slate-500 font-bold tracking-widest uppercase text-xs">Initializing Module...</span>
                </div>
            </div>
        </Layout>
    );

    const { locale, t } = useTranslation();
    const lesson = getLessonBySlug(slug as string, locale);

    if (!lesson) return (
        <Layout title="Narrative Missing">
            <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-4xl font-black text-white mb-4 uppercase italic">Module Not Found</h1>
                <p className="text-slate-500 mb-8 max-w-md">The requested quantitative narrative does not exist in the current repository.</p>
                <Link href="/learning" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-blue-500 transition-all">
                    Return to Academy
                </Link>
            </div>
        </Layout>
    );

    const WidgetComponent = lesson.widget;

    return (
        <Layout title={`${lesson.title} | Quant Academy`}>
            <main className="min-h-screen bg-[#030712] text-white pt-12 pb-24 relative overflow-hidden">
                {/* Background Accents */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 left-[-10%] w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[120px]"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    {/* Header Section */}
                    <div className="max-w-4xl mx-auto mb-16">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center space-x-2 text-slate-500 mb-8 group"
                        >
                            <Link href="/learning" className="flex items-center space-x-2 hover:text-blue-400 transition-colors">
                                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-xs font-black uppercase tracking-widest">Back to Repository</span>
                            </Link>
                            <span className="text-slate-800">/</span>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{lesson.category}</span>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                                <Sparkles className="w-3 h-3" />
                                <span>Advanced Module</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter italic leading-none uppercase">
                                {lesson.title}
                            </h1>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-wrap items-center gap-6"
                        >
                            <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-300">{lesson.readTime} MIN READ</span>
                            </div>
                            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border ${lesson.difficulty === 'Beginner' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                    lesson.difficulty === 'Intermediate' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                                        'bg-red-500/10 border-red-500/20 text-red-400'
                                }`}>
                                <BarChart className="w-4 h-4" />
                                <span className="text-xs font-black uppercase tracking-widest">{lesson.difficulty} Level</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Content Section */}
                    <div className="max-w-4xl mx-auto bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 md:p-16 shadow-2xl relative">
                        {/* Decorative Line */}
                        <div className="absolute top-12 left-0 w-1 h-32 bg-gradient-to-b from-blue-600 to-transparent"></div>

                        <article className="prose prose-invert prose-xl max-w-none text-slate-300">
                            {lesson.content.map((paragraph, idx) => (
                                <motion.p
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="mb-8 leading-relaxed font-medium"
                                >
                                    {paragraph}
                                </motion.p>
                            ))}

                            {/* Formula Box */}
                            {lesson.formula && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="my-16 p-8 bg-[#030712] border border-blue-500/30 rounded-3xl relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[40px]"></div>
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-8 h-1 bg-blue-500 rounded-full"></div>
                                        <h3 className="text-lg font-black text-white italic uppercase m-0">{lesson.formula.title}</h3>
                                    </div>
                                    <div className="bg-white/5 p-8 rounded-2xl text-center mb-6 overflow-x-auto">
                                        <code className="text-2xl font-black text-blue-400 tracking-wider">
                                            {lesson.formula.latex}
                                        </code>
                                    </div>
                                    <p className="text-slate-500 text-sm italic font-medium m-0 leading-relaxed text-center">
                                        {lesson.formula.description}
                                    </p>
                                </motion.div>
                            )}

                            {/* Simulation Area */}
                            {WidgetComponent && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    className="my-20"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                <Activity className="w-6 h-6" />
                                            </div>
                                            <h2 className="text-3xl font-black text-white uppercase italic m-0 tracking-tight">Interactive Lab</h2>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-[2.5rem] border border-white/10 p-2 overflow-hidden shadow-2xl">
                                        <WidgetComponent />
                                    </div>
                                </motion.div>
                            )}

                            {/* Knowledge Check Area */}
                            {lesson.quiz && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    className="my-20"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                                                <GraduationCap className="w-6 h-6" />
                                            </div>
                                            <h2 className="text-3xl font-black text-white uppercase italic m-0 tracking-tight">Knowledge Check</h2>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-[2.5rem] border border-white/10 p-8 md:p-12 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-transparent"></div>
                                        <QuizWidget questions={lesson.quiz} />
                                    </div>
                                </motion.div>
                            )}
                        </article>

                        {/* Module Footer Navigation */}
                        <div className="mt-20 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                            <Link href="/learning" className="flex items-center space-x-3 text-slate-500 hover:text-white transition-all group">
                                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white transition-colors">
                                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                </div>
                                <span className="text-sm font-black uppercase tracking-widest">Return to Repository</span>
                            </Link>

                            <button
                                onClick={() => alert('Module Complete! Proceeding to next level...')}
                                className="w-full md:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-[0.1em] transition-all transform hover:scale-105 shadow-xl shadow-blue-600/20 flex items-center justify-center space-x-3"
                            >
                                <span>Complete Module</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </Layout>
    );
}
