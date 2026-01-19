import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export const RiskRewardSlider = () => {
    const { t } = useTranslation();
    const [risk, setRisk] = useState(100);
    const [rewardRatio, setRewardRatio] = useState(2);
    const [winRate, setWinRate] = useState(50);

    const reward = risk * rewardRatio;
    const expectedValue = (winRate / 100 * reward) - ((100 - winRate) / 100 * risk);

    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 my-8 shadow-lg">
            <h3 className="text-xl font-bold text-orange-400 mb-4">Risk/Reward Simulator</h3>

            <div className="space-y-6 mb-6">
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-400">{t('widget_risk')} ($)</label>
                        <span className="text-gray-900 dark:text-white font-mono">${risk}</span>
                    </div>
                    <input
                        type="range"
                        min="10" max="1000" step="10"
                        value={risk}
                        onChange={(e) => setRisk(Number(e.target.value))}
                        className="w-full accent-red-500"
                    />
                </div>

                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-400">{t('widget_reward')} (1:X)</label>
                        <span className="text-gray-900 dark:text-white font-mono">1:{rewardRatio}</span>
                    </div>
                    <input
                        type="range"
                        min="0.5" max="10" step="0.5"
                        value={rewardRatio}
                        onChange={(e) => setRewardRatio(Number(e.target.value))}
                        className="w-full accent-green-500"
                    />
                </div>

                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-400">{t('widget_win_rate')} (%)</label>
                        <span className="text-gray-900 dark:text-white font-mono">{winRate}%</span>
                    </div>
                    <input
                        type="range"
                        min="10" max="90" step="5"
                        value={winRate}
                        onChange={(e) => setWinRate(Number(e.target.value))}
                        className="w-full accent-blue-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded border border-red-300 dark:border-red-900/50">
                    <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Max Loss</div>
                    <div className="text-xl font-bold text-red-500">-${risk}</div>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded border border-green-300 dark:border-green-900/50">
                    <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Target Profit</div>
                    <div className="text-xl font-bold text-green-500">+${reward}</div>
                </div>
            </div>

            <div className={`mt-4 p-4 rounded border flex justify-between items-center ${expectedValue > 0 ? 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-800'}`}>
                <span className="text-gray-700 dark:text-gray-300">EV:</span>
                <span className={`text-2xl font-bold ${expectedValue > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {expectedValue > 0 ? '+' : ''}{expectedValue.toFixed(2)}
                </span>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
                (Win Rate × Reward) - (Loss Rate × Risk) = EV
            </p>
        </div>
    );
};
