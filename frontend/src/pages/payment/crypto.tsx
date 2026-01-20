import React, { useState } from 'react';
import Layout from '@/components/Common/Layout';
import { useRouter } from 'next/router';
import { paymentAPI } from '@/services/api';

export default function CryptoPayment() {
    const router = useRouter();
    const { amount, plan } = router.query;
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            // Simulate blockchain confirmation mock (Fast for demo)
            await new Promise(resolve => setTimeout(resolve, 1000));

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
            console.error("Crypto payment failed:", error);
            alert(`Blockchain Protocol Error: ${error.response?.data?.error || error.message || 'Unknown Error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title="Crypto Payment | TradeSense">
            <div className="flex items-center justify-center min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
                <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl shadow-2xl border border-orange-500/50">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-orange-500">
                            Pay with Crypto
                        </h2>
                        <p className="mt-2 text-sm text-gray-400">
                            Send USDT (TRC20) to the address below
                        </p>
                    </div>

                    <div className="flex flex-col items-center space-y-6">
                        <div className="bg-white p-4 rounded-lg">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TRC20ExampleAddress123`} alt="QR Code" />
                        </div>

                        <div className="w-full bg-gray-700 p-3 rounded font-mono text-xs break-all text-center select-all cursor-pointer hover:bg-gray-600 transition-colors">
                            TRC20ExampleAddress123456789TradeSense
                        </div>

                        <div className="w-full flex justify-between items-center border-t border-gray-700 pt-4">
                            <span className="text-gray-400">Total Amount:</span>
                            <span className="text-2xl font-bold text-green-400">${amount} USDT</span>
                        </div>

                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold shadow-lg shadow-orange-500/20 disabled:opacity-50 flex justify-center items-center"
                        >
                            {loading ? 'Verifying Blockchain Transaction...' : 'I Have Sent The Funds'}
                        </button>
                        <p className="text-xs text-gray-500 text-center">
                            Please allow 1-3 minutes for network confirmation.
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
