import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance with defaults
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh (simplified)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Remove token and redirect to login
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  register: (email: string, password: string, first_name?: string, last_name?: string) =>
    apiClient.post('/auth/register', { email, password, first_name, last_name }),

  getMe: () => apiClient.get('/auth/me'),
};

// Market API
export const marketAPI = {
  getInstruments: (params?: { asset_class?: string; exchange?: string; active?: boolean }) =>
    apiClient.get('/market/instruments', { params }),

  getQuote: (instrument_id: number) =>
    apiClient.get(`/market/quote?instrument_id=${instrument_id}`),

  getOHLCV: (instrument_id: number, timeframe: string = '1h', limit: number = 1000) =>
    apiClient.get(`/market/ohlcv?instrument_id=${instrument_id}&timeframe=${timeframe}&limit=${limit}`),

  getQuotes: (instrument_ids: number[]) =>
    apiClient.post('/market/quotes', { instrument_ids }),

  getMarketHealth: () => apiClient.get('/market/health'),
};

// Challenge API
export const challengeAPI = {
  getChallenges: () => apiClient.get('/challenges'),

  getMyChallenges: () => apiClient.get('/challenges/my'),

  startChallenge: (challenge_id: number) =>
    apiClient.post('/challenges/start', { challenge_id }),

  getUserChallenge: (user_challenge_id: number) =>
    apiClient.get(`/challenges/${user_challenge_id}`),

  executeTrade: (user_challenge_id: number, instrument_id: number, side: 'BUY' | 'SELL', qty: number) =>
    apiClient.post(`/challenges/${user_challenge_id}/trade`, {
      instrument_id,
      side,
      qty
    }),

  getPositions: (user_challenge_id: number) =>
    apiClient.get(`/challenges/${user_challenge_id}/positions`),

  getTrades: (user_challenge_id: number) =>
    apiClient.get(`/challenges/${user_challenge_id}/trades`),

  getEquityHistory: (user_challenge_id: number, range?: number) =>
    apiClient.get(`/challenges/${user_challenge_id}/equity`, {
      params: { range }
    }),

  evaluateChallenge: (user_challenge_id: number) =>
    apiClient.post(`/challenges/${user_challenge_id}/evaluate`),
};

// Leaderboard API
export const leaderboardAPI = {
  getMonthlyLeaderboard: (year?: number, month?: number) => {
    const params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;
    return apiClient.get('/leaderboard/monthly', { params });
  },

  getAllTimeLeaderboard: () => apiClient.get('/leaderboard/all-time'),
};

// Payment API
export const paymentAPI = {
  mockCheckout: (plan: 'BASIC' | 'PREMIUM' | 'PRO' | 'STUDENT' | 'ELITE' | 'MASTER', amount: number, currency: string = 'USD') =>
    apiClient.post('/payments/mock/checkout', { plan, amount, currency }),

  mockConfirm: (payment_id: string | number) =>
    apiClient.post(`/payments/mock/confirm/${payment_id}`),
  processPayment: (data: any) => apiClient.post('/payment/process', data),
};

// Features API (News & Quant)
export const featuresAPI = {
  getNews: () => apiClient.get('/news/'),
  getAnalysis: (instrumentId: number) => apiClient.get(`/quant/analyze/${instrumentId}`),
  getEnsembleAnalysis: (instrumentId: number) => apiClient.get(`/quant/analyze-ensemble/${instrumentId}`),
  readArticle: (url: string) => apiClient.post('/news/read', { url }),
};

// Admin API
export const adminAPI = {
  getUsers: () => apiClient.get('/admin/users'),
  getUserChallenges: (userId: number) => apiClient.get(`/admin/users/${userId}/challenges`),
  getMe: () => apiClient.get('/auth/me'),
  updateChallengeStatus: (ucId: number, status: string) =>
    apiClient.post(`/admin/user-challenges/${ucId}/status`, { status }),
  updateUserRole: (userId: number, role: string) =>
    apiClient.post(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId: number) => apiClient.delete(`/admin/users/${userId}`),
  toggleUserActive: (userId: number) => apiClient.post(`/admin/users/${userId}/active`),
  resetChallenge: (ucId: number) => apiClient.post(`/admin/user-challenges/${ucId}/reset`),
};

// Learning API
export const learningAPI = {
  getModules: () => apiClient.get('/learning/modules'),

  getModule: (module_id: number) => apiClient.get(`/learning/modules/${module_id}`),

  getLesson: (lesson_id: number) => apiClient.get(`/learning/lessons/${lesson_id}`),

  attemptQuiz: (quiz_id: number, answers: any[]) =>
    apiClient.post(`/learning/quizzes/${quiz_id}/attempt`, { answers }),

  getProgress: () => apiClient.get('/learning/progress'),
};

export default apiClient;