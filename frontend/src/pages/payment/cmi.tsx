import React, { useState } from 'react';
import Layout from '@/components/Common/Layout';
import { useRouter } from 'next/router';
import { paymentAPI } from '@/services/api';

export default function CMIPayment() {
    const router = useRouter();
    const { amount, plan } = router.query;
    const [loading, setLoading] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Simulate CMI processing (Fast for demo)
            await new Promise(resolve => setTimeout(resolve, 800));

            const startResponse = await paymentAPI.mockCheckout(
                (plan as any) || 'STUDENT',
                parseFloat(amount as string) || 49,
                'USD'
            );

            if (startResponse.data?.payment?.id) {
                await paymentAPI.mockConfirm(startResponse.data.payment.id);
            }

            router.push('/dashboard?success=true');
        } catch (error: any) {
            console.error("Payment flow failed:", error);
            alert(`Payment System Error: ${error.response?.data?.error || error.message || 'Unknown Error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title="CMI Secure Payment | TradeSense">
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                            CMI Secure Payment
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Complete your purchase of the <span className="font-bold text-blue-500">{plan} Challenge</span>
                        </p>
                        <p className="text-2xl font-black text-green-600 mt-4">${amount}</p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handlePayment}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Number</label>
                                <input
                                    type="text"
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                    placeholder="0000 0000 0000 0000"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                />
                            </div>
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                                    <input
                                        type="text"
                                        required
                                        className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="MM/YY"
                                        value={expiry}
                                        onChange={(e) => setExpiry(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVV</label>
                                    <input
                                        type="text"
                                        required
                                        className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="123"
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                            >
                                {loading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                        <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                )}
                                Pay Now (Secure CMI)
                            </button>
                        </div>
                    </form>
                    <div className="flex justify-center space-x-2 grayscale opacity-50">
                        {/* Mock Logos */}
                        <div className="h-6 w-10 bg-gray-300 rounded"></div>
                        <div className="h-6 w-10 bg-gray-300 rounded"></div>
                        <div className="h-6 w-10 bg-gray-300 rounded"></div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
