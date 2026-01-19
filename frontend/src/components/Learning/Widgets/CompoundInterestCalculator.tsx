import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export const CompoundInterestCalculator = () => {
    const { t } = useTranslation();
    const [principal, setPrincipal] = useState(1000);
    const [rate, setRate] = useState(5);
    const [years, setYears] = useState(10);
    const [result, setResult] = useState(0);
    const [data, setData] = useState<{ year: number, value: number }[]>([]);

    useEffect(() => {
        // A = P(1 + r/100)^t
        const params = { principal, rate, years };
        let currentBalance = params.principal;
        const newData = [];

        for (let i = 0; i <= params.years; i++) {
            newData.push({ year: i, value: Math.round(currentBalance) });
            currentBalance = currentBalance * (1 + params.rate / 100);
        }

        setData(newData);
        setResult(Math.round(currentBalance));
    }, [principal, rate, years]);

    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 my-8 shadow-lg">
            <h3 className="text-xl font-bold text-blue-400 mb-4">Compound Interest Simulator</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">{t('widget_principal')} ($)</label>
                    <input
                        type="number"
                        value={principal}
                        onChange={(e) => setPrincipal(Number(e.target.value))}
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-white"
                    />
                    <input
                        type="range"
                        min="100" max="100000" step="100"
                        value={principal}
                        onChange={(e) => setPrincipal(Number(e.target.value))}
                        className="w-full mt-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">{t('widget_rate')} (%)</label>
                    <input
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-white"
                    />
                    <input
                        type="range"
                        min="1" max="50" step="0.5"
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                        className="w-full mt-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">{t('widget_years')}</label>
                    <input
                        type="number"
                        value={years}
                        onChange={(e) => setYears(Number(e.target.value))}
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-white"
                    />
                    <input
                        type="range"
                        min="1" max="50"
                        value={years}
                        onChange={(e) => setYears(Number(e.target.value))}
                        className="w-full mt-2"
                    />
                </div>
            </div>

            <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg flex justify-between items-center mb-6">
                <span className="text-gray-500 font-bold">{t('widget_result')} (FV):</span>
                <span className="text-3xl font-bold text-green-500">${result.toLocaleString()}</span>
            </div>

            {/* Simple Bar Chart Visualization */}
            <div className="h-40 flex items-end space-x-1 w-full overflow-hidden">
                {data.map((d, i) => (
                    <div
                        key={i}
                        style={{
                            height: `${(d.value / result) * 100}%`,
                            width: `${100 / (years + 1)}%`
                        }}
                        className="bg-blue-600 hover:bg-blue-500 rounded-t transition-all relative group"
                    >
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-xs px-2 py-1 rounded hidden group-hover:block whitespace-nowrap z-10 text-white">
                            {t('widget_years').replace(' (Years)', '')} {d.year}: ${d.value.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
