import React from 'react';
import Layout from '@/components/Common/Layout';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

interface PricingCardProps {
    title: string;
    price: string;
    features: string[];
    recommended?: boolean;
    buttonLink?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({ title, price, features, recommended = false, buttonLink = '/register' }) => {
    const { t } = useTranslation();
    return (
        <div className={`flex flex-col p-8 mx-auto max-w-lg text-center rounded-3xl transition-all duration-300 ${recommended
            ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/30 scale-105 border-0 z-10'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 shadow-xl'
            }`}>
            <h3 className={`mb-4 text-2xl font-black uppercase tracking-widest ${recommended ? 'text-blue-100' : 'text-gray-900 dark:text-white'}`}>{title}</h3>
            <div className="flex justify-center items-baseline my-8">
                <span className={`text-6xl font-black tracking-tighter ${recommended ? 'text-white' : 'text-gray-900 dark:text-white'}`}>${price}</span>
                <span className={`ml-2 font-bold uppercase tracking-widest text-xs ${recommended ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>/month</span>
            </div>
            <ul role="list" className="mb-10 space-y-4 text-left">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                        <svg className={`flex-shrink-0 w-5 h-5 ${recommended ? 'text-blue-200' : 'text-green-500 dark:text-green-400'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                        <span className={`font-medium ${recommended ? 'text-blue-50' : 'text-gray-600 dark:text-gray-300'}`}>{feature}</span>
                    </li>
                ))}
            </ul>
            <Link
                href={buttonLink}
                className={`py-4 px-6 rounded-2xl font-black uppercase tracking-widest transition-all text-sm shadow-lg ${recommended
                    ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-white/20'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30'
                    }`}
            >
                {t('learning_start').split(' ')[0]} Now
            </Link>
        </div>
    );
};

export default function Pricing() {
    const { t } = useTranslation();
    return (
        <Layout title={`${t('pricing_title')} | TradeSense`}>
            <div className="min-h-screen">
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-20 shadow-lg text-white">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tight">{t('pricing_title')}</h1>
                        <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto font-medium leading-relaxed italic">
                            "{t('pricing_subtitle')}"
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-16 -mt-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        <PricingCard
                            title="Starter"
                            price="29"
                            buttonLink="/checkout?plan=STARTER&price=29"
                            features={[
                                '10k Challenge Account',
                                'Basic Market Data',
                                'Standard Support',
                                'Access to Learning Hub'
                            ]}
                        />
                        <PricingCard
                            title="Pro"
                            price="99"
                            recommended={true}
                            buttonLink="/checkout?plan=PRO&price=99"
                            features={[
                                '50k Challenge Account',
                                'Real-time Data (Binance/CSE)',
                                'Priority Support',
                                'Advanced Charts & Signals',
                                'Risk Analysis'
                            ]}
                        />
                        <PricingCard
                            title="Elite"
                            price="199"
                            buttonLink="/checkout?plan=ELITE&price=199"
                            features={[
                                '100k Challenge Account',
                                'Professional Data Feed',
                                'Dedicated Account Manager',
                                'Custom Risk Rules',
                                'API Access'
                            ]}
                        />
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">
                        All plans include 256-bit SSL encrypted payments and 24/7 reliability.
                    </p>
                </div>
            </div>
        </Layout>
    );
}
