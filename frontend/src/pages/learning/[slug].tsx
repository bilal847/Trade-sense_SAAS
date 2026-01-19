import Layout from '@/components/Common/Layout';
import { useRouter } from 'next/router';
import { getLessonBySlug } from '@/content/lessons';
import { QuizWidget } from '@/components/Learning/Widgets/QuizWidget';
import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';

export default function LessonView() {
    const router = useRouter();
    const { slug } = router.query;

    // In a real generic static site we'd use getStaticProps, 
    // but for this dynamic route in dev mode, handling undefined slug is easier this way
    if (!slug) return <Layout><div className="p-8 text-center text-white">Loading...</div></Layout>;

    const { locale, t } = useTranslation();
    const lesson = getLessonBySlug(slug as string, locale);

    if (!lesson) return (
        <Layout title="Lesson Not Found">
            <div className="text-center py-20">
                <h1 className="text-2xl text-white mb-4">Lesson Not Found</h1>
                <Link href="/learning" className="text-blue-500 hover:underline">Return to Hub</Link>
            </div>
        </Layout>
    );

    const WidgetComponent = lesson.widget;

    return (
        <Layout title={`${lesson.title} | Learning Hub`}>
            <div className="max-w-3xl mx-auto">
                {/* Breadcrumb */}
                <div className="mb-6 flex items-center text-sm text-gray-500">
                    <Link href="/learning" className="hover:text-white">Hub</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-300">{lesson.category}</span>
                </div>

                {/* Header */}
                <header className="mb-10">
                    <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">{lesson.title}</h1>
                    <div className="flex items-center space-x-4">
                        <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-sm border border-gray-700">
                            {lesson.readTime} min read
                        </span>
                        <span className={`px-3 py-1 bg-gray-800 rounded text-sm border border-gray-700 ${lesson.difficulty === 'Beginner' ? 'text-green-400' :
                            lesson.difficulty === 'Intermediate' ? 'text-orange-400' : 'text-red-400'
                            }`}>
                            {lesson.difficulty}
                        </span>
                    </div>
                </header>

                {/* content */}
                <article className="prose prose-invert prose-lg max-w-none text-gray-300">
                    {lesson.content.map((paragraph, idx) => (
                        <p key={idx} className="mb-6 leading-relaxed">
                            {paragraph}
                        </p>
                    ))}

                    {/* Formula Box */}
                    {lesson.formula && (
                        <div className="my-10 p-6 bg-gray-800/50 border-l-4 border-blue-500 rounded-r-lg">
                            <h3 className="text-lg font-bold text-white mb-2">{lesson.formula.title}</h3>
                            <div className="bg-gray-900 p-4 rounded text-center text-xl font-mono text-blue-300 mb-2 overflow-x-auto">
                                {lesson.formula.latex}
                            </div>
                            <p className="text-sm text-gray-400 italic">
                                {lesson.formula.description}
                            </p>
                        </div>
                    )}

                    {/* Interactive Widget Section */}
                    {WidgetComponent && (
                        <div className="my-12">
                            <div className="flex items-center mb-4">
                                <span className="w-8 h-1 bg-blue-500 mr-2 rounded"></span>
                                <h2 className="text-2xl font-bold text-white m-0">Interactive Simulator</h2>
                            </div>
                            <WidgetComponent />
                        </div>
                    )}

                    {/* Quiz Section */}
                    {lesson.quiz && (
                        <div className="my-12">
                            <div className="flex items-center mb-4">
                                <span className="w-8 h-1 bg-green-500 mr-2 rounded"></span>
                                <h2 className="text-2xl font-bold text-white m-0">Knowledge Check</h2>
                            </div>
                            <QuizWidget questions={lesson.quiz} />
                        </div>
                    )}

                </article>

                {/* Footer Navigation */}
                <div className="mt-16 pt-8 border-t border-gray-800 flex justify-between">
                    <Link href="/learning" className="text-gray-400 hover:text-white flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        Back to Catalog
                    </Link>
                </div>
            </div>
        </Layout>
    );
}
