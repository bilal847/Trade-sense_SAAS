import React, { useState } from 'react';
import Head from 'next/head';
import { Payment } from '@/types';
import { paymentAPI } from '@/services/api';

export default function Billing() {
  const [selectedPlan, setSelectedPlan] = useState<'BASIC' | 'PREMIUM' | 'PRO'>('PREMIUM');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'BASIC',
      name: 'Basic',
      price: 0,
      period: 'forever',
      features: [
        'Access to standard challenges',
        'Basic market data',
        '5 simultaneous positions',
        'Email support'
      ]
    },
    {
      id: 'PREMIUM',
      name: 'Premium',
      price: 29,
      period: 'month',
      features: [
        'All Basic features',
        'Advanced challenges',
        'Real-time market data',
        'Unlimited positions',
        'Priority support',
        'Learning modules'
      ]
    },
    {
      id: 'PRO',
      name: 'Pro',
      price: 99,
      period: 'month',
      features: [
        'All Premium features',
        'Professional challenges',
        'Premium market data',
        'Advanced analytics',
        'API access',
        '24/7 dedicated support'
      ]
    }
  ];

  const handlePayment = async () => {
    setLoading(true);
    try {
      // In a real app, we would call the API
      // const response = await paymentAPI.mockCheckout(selectedPlan, plans.find(p => p.id === selectedPlan)?.price || 0);
      // const paymentId = response.data.payment_id;
      
      // For demo, we'll just simulate the process
      setTimeout(() => {
        alert(`Payment for ${selectedPlan} plan would be processed in a real application.`);
        setLoading(false);
      }, 1500);
    } catch (err) {
      alert('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>TradeSense Quant - Billing</title>
        <meta name="description" content="Manage your subscription" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Subscription & Billing</h1>
          <p className="text-gray-400">Manage your TradeSense Quant subscription</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plan selection */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-6 rounded-xl border-2 ${
                      selectedPlan === plan.id
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-700 bg-gray-750 hover:border-gray-600 cursor-pointer'
                    }`}
                    onClick={() => setSelectedPlan(plan.id as any)}
                  >
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold mb-2">
                      ${plan.price}
                      {plan.price > 0 && <span className="text-lg font-normal">/{plan.period}</span>}
                    </div>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-400 mr-2">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`w-full py-2 rounded font-semibold ${
                        selectedPlan === plan.id
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment details */}
          <div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 sticky top-6">
              <h2 className="text-xl font-bold mb-4">Payment Details</h2>
              
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span>Plan:</span>
                  <span className="font-semibold">{plans.find(p => p.id === selectedPlan)?.name}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span>Price:</span>
                  <span className="font-semibold">
                    ${plans.find(p => p.id === selectedPlan)?.price}/{plans.find(p => p.id === selectedPlan)?.period}
                  </span>
                </div>
                <div className="h-px bg-gray-700 mb-4"></div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${plans.find(p => p.id === selectedPlan)?.price}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-3">Payment Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-600 rounded cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="mr-3"
                    />
                    <span>Credit/Debit Card</span>
                  </label>
                  <label className="flex items-center p-3 border border-gray-600 rounded cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="mr-3"
                    />
                    <span>PayPal</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-3 bg-green-600 rounded-lg hover:bg-green-700 font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Pay $${plans.find(p => p.id === selectedPlan)?.price}`}
              </button>

              <p className="text-xs text-gray-400 mt-4">
                By subscribing, you agree to our Terms of Service and Privacy Policy. 
                Your subscription will automatically renew until canceled.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}