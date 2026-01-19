import React, { useState } from 'react';
import Layout from '@/components/Common/Layout';
import { useRouter } from 'next/router';
import { paymentAPI } from '@/services/api';
import { useTranslation } from '@/hooks/useTranslation';

export default function Checkout() {
    const { t } = useTranslation();
    const router = useRouter();
    const { plan, price } = router.query;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handlePayment = async (provider: 'CMI' | 'CRYPTO') => {
        setLoading(true);
        setError('');
        try {
            const amount = parseFloat(price as string) || 99;
            const startResponse = await paymentAPI.mockCheckout(
                (plan as any) || 'PRO',
                amount,
                'USD'
            );

            if (startResponse.data && startResponse.data.payment && startResponse.data.payment.id) {
                await paymentAPI.mockConfirm(startResponse.data.payment.id);
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        } catch (err) {
            console.error(err);
            setError('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Layout title={`${t('checkout_title')} | TradeSense`}>
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                    <div className="p-12 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-3xl border border-green-100 dark:border-green-800 text-center shadow-2xl max-w-lg w-full">
                        <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">{t('success')}!</h2>
                        <p className="font-bold text-lg mb-2">Your challenge account is being created...</p>
                        <p className="text-sm font-medium opacity-75">{t('loading').replace('...', '')} redirecting to dashboard</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title={`${t('checkout_title')} | TradeSense`}>
            <div className="container mx-auto px-4 py-16 max-w-2xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">{t('checkout_title')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Secure Transaction Interface</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 mb-8 shadow-xl">
                    <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm">Selected Plan</span>
                        <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{plan || 'PRO'} Challenge</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm">Amount Due</span>
                        <span className="text-4xl font-black text-green-600 dark:text-green-400 tracking-tighter">${price || '99'}</span>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-2xl mb-8 border border-red-100 dark:border-red-900/50 font-bold text-center">
                        {error}
                    </div>
                )}

                <div className="grid gap-6">
                    <button
                        disabled={loading}
                        onClick={() => router.push(`/payment/cmi?plan=${plan}&amount=${price}`)}
                        className="w-full py-5 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center space-x-3 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
                    >
                        {loading ? <span>{t('loading')}</span> : (
                            <>
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"></path></svg>
                                <span>Pay with Card (CMI)</span>
                            </>
                        )}
                    </button>

                    <button
                        disabled={loading}
                        onClick={() => router.push(`/payment/crypto?plan=${plan}&amount=${price}`)}
                        className="w-full py-5 px-8 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center space-x-3 transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50"
                    >
                        {loading ? <span>{t('loading')}</span> : (
                            <>
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.39 2.1-1.39 1.47 0 2.01.59 2.01.59l.39-1.59s-.81-.5-2.02-.5c-1.5 0-2.88.75-2.88 2.26 0 1.37 1.14 2.12 3.11 2.62 1.77.45 2.1.94 2.1 1.67 0 .84-.79 1.39-2.1 1.39-1.47 0-2.32-.59-2.32-.59l-.39 1.59s.81.5 2.02.5c1.5 0 2.88-.75 2.88-2.26 0-1.37-1.14-2.12-3.11-2.62z"></path></svg>
                                <span>Pay with Crypto</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-4">
                        Powered by TradeSense Global Payments
                    </p>
                    <div className="flex items-center justify-center space-x-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                        <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                        <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                        <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
