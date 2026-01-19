import React, { useState } from 'react';
import Layout from '@/components/Common/Layout';
import Link from 'next/link';
import { getLessonsByLocale, getCategoriesByLocale, Lesson } from '@/content/lessons';
import { useTranslation } from '@/hooks/useTranslation';

export default function LearningCatalog() {
    const { t, locale } = useTranslation();
    const allLessons = getLessonsByLocale(locale);
    const categories = ['All', ...getCategoriesByLocale(locale)];
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredLessons = selectedCategory === 'All'
        ? allLessons
        : allLessons.filter((l: Lesson) => l.category === selectedCategory);

    return (
        <Layout title={`${t('learning_title')} | TradeSense`}>
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">{t('learning_title')}</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">{t('learning_subtitle')}</p>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            {cat === 'All' ? t('view') + ' ' + t('learning_lessons') : cat}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredLessons.map((lesson: Lesson) => (
                        <Link key={lesson.id} href={`/learning/${lesson.slug}`} className="group">
                            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-900/10 dark:hover:shadow-blue-900/20 h-full flex flex-col">
                                <div className={`h-2 w-full ${getCategoryColor(lesson.category)}`} />
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${getCategoryBadgeColor(lesson.category)}`}>
                                            {lesson.category}
                                        </span>
                                        <span className="text-xs text-gray-500 flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            {lesson.readTime} min
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                                        {lesson.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-1">
                                        {lesson.description}
                                    </p>

                                    <div className="flex items-center text-blue-600 dark:text-blue-500 font-semibold text-sm">
                                        {t('learning_start')}
                                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </Layout>
    );
}

function getCategoryColor(category: string) {
    switch (category) {
        case 'Finance': return 'bg-green-500';
        case 'Trading': return 'bg-orange-500';
        case 'Math': return 'bg-purple-500';
        case 'Coding': return 'bg-blue-500';
        default: return 'bg-gray-500';
    }
}

function getCategoryBadgeColor(category: string) {
    switch (category) {
        case 'Finance': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
        case 'Trading': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
        case 'Math': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
        case 'Coding': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
        default: return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-400';
    }
}
