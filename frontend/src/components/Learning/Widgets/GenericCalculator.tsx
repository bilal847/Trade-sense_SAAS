import React, { useState, useEffect, useMemo } from 'react';

interface InputConfig {
    name: string;
    label: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
}

interface GenericCalculatorProps {
    title: string;
    inputs: InputConfig[];
    formula: (values: Record<string, number>) => number;
    resultLabel: string;
    resultPrefix?: string;
    resultSuffix?: string;
    description?: string;
}

export const GenericCalculator: React.FC<GenericCalculatorProps> = ({
    title,
    inputs,
    formula,
    resultLabel,
    resultPrefix = '',
    resultSuffix = '',
    description
}) => {
    const [values, setValues] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {};
        inputs.forEach(input => {
            initial[input.name] = input.defaultValue;
        });
        return initial;
    });

    const [result, setResult] = useState<number>(0);

    useEffect(() => {
        setResult(formula(values));
    }, [values, formula]);

    const handleChange = (name: string, value: number) => {
        setValues(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 my-8 shadow-lg">
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">{title}</h3>
            {description && <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">{description}</p>}

            <div className="space-y-6 mb-8">
                {inputs.map(input => (
                    <div key={input.name}>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{input.label}</label>
                            <span className="text-gray-900 dark:text-white font-mono">{values[input.name]}</span>
                        </div>
                        <input
                            type="range"
                            min={input.min}
                            max={input.max}
                            step={input.step}
                            value={values[input.name]}
                            onChange={(e) => handleChange(input.name, Number(e.target.value))}
                            className="w-full accent-blue-500"
                        />
                    </div>
                ))}
            </div>

            <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg flex justify-between items-center bg-gradient-to-r from-gray-100 dark:from-gray-900 to-blue-50 dark:to-blue-900/20">
                <span className="text-gray-600 dark:text-gray-400 font-medium">{resultLabel}:</span>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {resultPrefix}{result.toLocaleString(undefined, { maximumFractionDigits: 2 })}{resultSuffix}
                </span>
            </div>
        </div>
    );
};
