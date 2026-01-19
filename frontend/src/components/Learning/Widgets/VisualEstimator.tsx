import React, { useState } from 'react';

interface VisualEstimatorProps {
    title: string;
    leftLabel: string;
    rightLabel: string;
    explanation: (value: number) => string;
}

export const VisualEstimator: React.FC<VisualEstimatorProps> = ({
    title,
    leftLabel,
    rightLabel,
    explanation
}) => {
    const [value, setValue] = useState(50);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 my-8 shadow-lg">
            <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-6">{title}</h3>

            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2 px-1">
                <span>{leftLabel}</span>
                <span>{rightLabel}</span>
            </div>

            <div className="relative h-12 mb-8">
                <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full -translate-y-1/2 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${value}%` }}
                    />
                </div>
                <input
                    type="range"
                    min="0" max="100"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                    className="absolute top-1/2 w-6 h-6 bg-white border border-gray-300 dark:border-none rounded-full shadow-lg -translate-y-1/2 pointer-events-none transition-all duration-75"
                    style={{ left: `calc(${value}% - 12px)` }}
                />
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border-l-4 border-purple-500 animate-fade-in shadow-inner">
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed text-center font-medium">
                    {explanation(value)}
                </p>
            </div>
        </div>
    );
};
