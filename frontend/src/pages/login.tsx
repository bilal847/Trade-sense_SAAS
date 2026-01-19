import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Common/Layout';
import { authAPI } from '@/services/api';
import { useTranslation } from '@/hooks/useTranslation';

export default function Login() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authAPI.login(email, password);
      if (res.data.access_token) {
        localStorage.setItem('access_token', res.data.access_token);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={`${t('nav_login')} | TradeSense`}>
      <Head>
        <title>{t('nav_login')} - TradeSense Quant</title>
        <meta name="description" content="Login to your trading account" />
      </Head>

      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500">
              {t('home_hero_title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">{t('auth_login')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/50 text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">{t('auth_email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">{t('auth_password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
            >
              {loading ? t('loading') : t('nav_login')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t('auth_no_account')}{' '}
              <Link href="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                {t('nav_register')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}