import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface CodePlaygroundProps {
    initialCode: string;
    language?: string;
    outputDescription?: string;
    runAction?: (code: string) => string; // Mock run output
}

export const CodePlayground: React.FC<CodePlaygroundProps> = ({
    initialCode,
    language = 'python',
    outputDescription,
    runAction
}) => {
    const { t } = useTranslation();
    const [code, setCode] = useState(initialCode);
    const [output, setOutput] = useState<string>('');
    const [isRunning, setIsRunning] = useState(false);

    const handleRun = () => {
        setIsRunning(true);
        setOutput(t('dash_processing'));

        setTimeout(() => {
            if (runAction) {
                setOutput(runAction(code));
            } else {
                // Default mock run
                setOutput('Process finished with exit code 0');
            }
            setIsRunning(false);
        }, 800);
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 my-8 overflow-hidden shadow-xl">
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-gray-400 font-mono">main.{language === 'python' ? 'py' : 'js'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-0">
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full h-64 bg-[#0d1117] text-gray-300 font-mono text-sm p-4 focus:outline-none resize-none"
                        spellCheck={false}
                    />
                </div>
                <div className="border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0d1117] flex flex-col">
                    <div className="flex-1 p-4 font-mono text-sm text-gray-800 dark:text-green-400 whitespace-pre-wrap">
                        <div className="text-gray-400 dark:text-gray-500 mb-2 select-none">{outputDescription || 'Output >'}</div>
                        {output}
                    </div>
                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 transition-colors flex items-center justify-center space-x-2"
                    >
                        {isRunning ? (
                            <span>{t('dash_processing')}</span>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                                <span>{t('dashboard_btn_analyze') || 'Run Code'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
