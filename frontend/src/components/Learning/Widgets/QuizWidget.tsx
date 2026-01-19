import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

interface QuizWidgetProps {
    questions: QuizQuestion[];
}

export const QuizWidget: React.FC<QuizWidgetProps> = ({ questions }) => {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);

    const handleOptionClick = (index: number) => {
        if (showResult) return;
        setSelectedOption(index);
        setShowResult(true);

        if (index === questions[currentIndex].correctIndex) {
            setScore(s => s + 1);
        }
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(c => c + 1);
            setSelectedOption(null);
            setShowResult(false);
        } else {
            setQuizCompleted(true);
        }
    };

    const restartQuiz = () => {
        setCurrentIndex(0);
        setSelectedOption(null);
        setShowResult(false);
        setScore(0);
        setQuizCompleted(false);
    };

    if (quizCompleted) {
        return (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 my-8 text-center shadow-xl">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('quiz_completed')}</h3>
                <div className="text-6xl font-extrabold text-blue-600 dark:text-blue-500 mb-6">
                    {Math.round((score / questions.length) * 100)}%
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    {t('quiz_got')} {score} {t('quiz_out_of')} {questions.length} {t('quiz_correct')}
                </p>
                <button
                    onClick={restartQuiz}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                    {t('quiz_retake')}
                </button>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 my-8 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {t('quiz_question')} {currentIndex + 1} {t('quiz_of')} {questions.length}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                    {t('quiz_score')}: {score}
                </span>
            </div>

            <h4 className="text-xl text-gray-900 dark:text-white font-medium mb-6">
                {currentQuestion.question}
            </h4>

            <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                    let optionClass = "w-full text-left p-4 rounded-lg border transition-all ";

                    if (showResult) {
                        if (index === currentQuestion.correctIndex) {
                            optionClass += "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300";
                        } else if (index === selectedOption) {
                            optionClass += "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300";
                        } else {
                            optionClass += "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 opacity-50";
                        }
                    } else {
                        optionClass += "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-blue-500 dark:hover:border-gray-500";
                    }

                    return (
                        <button
                            key={index}
                            disabled={showResult}
                            onClick={() => handleOptionClick(index)}
                            className={optionClass}
                        >
                            <div className="flex items-center">
                                <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full mr-3 text-sm font-bold ${showResult && index === currentQuestion.correctIndex ? 'bg-green-500 text-white' :
                                    showResult && index === selectedOption ? 'bg-red-500 text-white' :
                                        'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {String.fromCharCode(65 + index)}
                                </span>
                                {option}
                            </div>
                        </button>
                    );
                })}
            </div>

            {showResult && (
                <div className="mt-6 animate-fade-in">
                    <div className={`p-4 rounded mb-4 ${selectedOption === currentQuestion.correctIndex
                        ? 'bg-green-100 dark:bg-green-900/20 border-l-4 border-green-500'
                        : 'bg-blue-100 dark:bg-blue-900/20 border-l-4 border-blue-500'
                        }`}>
                        <h5 className="font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">{t('quiz_explanation')}:</h5>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{currentQuestion.explanation}</p>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={nextQuestion}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
                        >
                            {currentIndex === questions.length - 1 ? t('quiz_finish') : t('quiz_next')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
