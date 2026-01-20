import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '@/components/Common/Layout';
import { ThemeProvider } from '@/context/ThemeContext';
import { TranslationProvider } from '@/context/TranslationContext';
import { authAPI } from '@/services/api';
import React, { useState, useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Fetch user profile if token exists
    const token = localStorage.getItem('access_token');
    if (token) {
      authAPI.getMe()
        .then(res => {
          setUser(res.data.user);
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          setUser(null);
        });
    }

    // 2. Apply saved locale on mount (SSR-safe)
    const savedLocale = localStorage.getItem('locale') as 'en' | 'fr' | null;
    if (savedLocale && ['en', 'fr'].includes(savedLocale)) {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = savedLocale;
    } else {
      // Default to English
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  }, []);

  return (
    <ThemeProvider>
      <TranslationProvider>
        <Layout user={user}>
          <Component {...pageProps} />
        </Layout>
      </TranslationProvider>
    </ThemeProvider>
  );
}

export default MyApp;