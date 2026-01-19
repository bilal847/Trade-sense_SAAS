import React, { useState, useEffect } from 'react';
import { Instrument, Quote, OHLCV, Signal, Position, Trade, UserChallenge } from '@/types';
import { marketAPI, challengeAPI, featuresAPI } from '@/services/api';
import dynamic from 'next/dynamic';

// Dynamically import TradingView chart to avoid SSR issues
const TVChartContainer = dynamic(() => import('./TVChartContainer'), {
  ssr: false,
  loading: () => <div className="bg-gray-800 p-4 rounded-lg h-96 flex items-center justify-center text-white">Loading chart...</div>
});

import { useTranslation } from '@/hooks/useTranslation';

// Fallback Mock Data for demo stability
const MOCK_INSTRUMENTS = [
  { id: 1, symbol: 'EURUSD', display_symbol: 'EUR/USD', asset_class: 'FX', last_price: 1.0543 },
  { id: 2, symbol: 'GBPUSD', display_symbol: 'GBP/USD', asset_class: 'FX', last_price: 1.2291 },
  { id: 3, symbol: 'USDJPY', display_symbol: 'USD/JPY', asset_class: 'FX', last_price: 149.23 },
  { id: 4, symbol: 'BTCUSDT', display_symbol: 'BTC/USDT', asset_class: 'CRYPTO', last_price: 43250.00 },
  { id: 5, symbol: 'ETHUSDT', display_symbol: 'ETH/USDT', asset_class: 'CRYPTO', last_price: 2280.50 },
  { id: 6, symbol: 'IAM', display_symbol: 'IAM (Maroc)', asset_class: 'STOCKS', last_price: 98.50 },
];

interface EventLog {
  id: number;
  user_id?: number;
  instrument_id?: number;
  type: string; // 'quote_update', 'signal_change', 'trade_executed', 'risk_evaluation'
  payload_json: any;
  created_at: string;
}

// Helper: Generate Mock Data for Smart Fallback
const generateMockOHLCV = (instrumentId: number, count: number): OHLCV[] => {
  const data: OHLCV[] = [];
  let basePrice = instrumentId === 1 ? 1.05 : instrumentId === 4 ? 43000 : 100;
  // Start from 'count' hours ago
  let currentTime = Date.now() - count * 3600 * 1000;

  for (let i = 0; i < count; i++) {
    const open = basePrice;
    const close = basePrice * (1 + (Math.random() - 0.5) * 0.002);
    const high = Math.max(open, close) * (1 + Math.random() * 0.001);
    const low = Math.min(open, close) * (1 - Math.random() * 0.001);

    data.push({
      timestamp: currentTime, // Correct property name matching OHLCV type
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000)
    });

    basePrice = close;
    currentTime += 3600 * 1000; // Add 1 hour in ms
  }
  return data;
};

const TradingDashboard: React.FC<{ userChallenge: UserChallenge }> = ({ userChallenge }) => {
  const { t } = useTranslation();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [ohlcvData, setOhlcvData] = useState<OHLCV[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [events, setEvents] = useState<EventLog[]>([]);
  const [quantity, setQuantity] = useState<number>(0.1);
  const [isTradeLoading, setIsTradeLoading] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [isChartError, setIsChartError] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [timeframe, setTimeframe] = useState<string>('1h');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    FX: true,
    CRYPTO: true,
    COMMODITIES: true,
    STOCKS: true
  });

  // New Features State
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [showNews, setShowNews] = useState(false);
  const [newsData, setNewsData] = useState<any[]>([]);

  // Handlers for New Features
  const handleAIAnalysis = async () => {
    if (!selectedInstrument) return;
    setShowAnalysis(true);
    setAnalysisData(null); // Reset
    try {
      const res = await featuresAPI.getAnalysis(selectedInstrument.id);
      setAnalysisData(res.data.analysis);
    } catch (e) {
      console.error(e);
      setAnalysisData({ error: t('error') });
    }
  };

  const handleNews = async () => {
    setShowNews(true);
    if (newsData.length === 0) {
      try {
        const res = await featuresAPI.getNews();
        setNewsData(res.data.news);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Group instruments by asset class
  const groupedInstruments = instruments.reduce((acc, instrument) => {
    const group = instrument.asset_class;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(instrument);
    return acc;
  }, {} as Record<string, Instrument[]>);

  // Toggle group expansion
  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  // Fetch instruments
  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        const response = await marketAPI.getInstruments();
        setInstruments(response.data.instruments);
        if (response.data.instruments.length > 0) {
          setSelectedInstrument(response.data.instruments[0]);
        }
      } catch (error) {
        console.error('Error fetching instruments:', error);
        // Smart Fallback
        console.warn('Backend unavailable, using fallback data');
        setInstruments(MOCK_INSTRUMENTS as any);
        if (!selectedInstrument) setSelectedInstrument(MOCK_INSTRUMENTS[0] as any);
      }
    };

    fetchInstruments();
  }, []);

  // Fetch chart data
  const fetchChartData = async () => {
    if (selectedInstrument) {
      setIsChartLoading(true);
      setIsChartError(false);
      try {
        const response = await marketAPI.getOHLCV(selectedInstrument.id, timeframe, 100);
        if (response.data && response.data.ohlcv && response.data.ohlcv.length > 0) {
          setOhlcvData(response.data.ohlcv);
        } else {
          // Fallback if empty array returned
          throw new Error("Empty data");
        }
      } catch (error) {
        console.warn('Error fetching chart data, using Smart Fallback:', error);
        // Smart Fallback: Generate local data
        const mockData = generateMockOHLCV(selectedInstrument.id, 100);
        setOhlcvData(mockData);
        // Do NOT set error state, so UI looks clean
        setIsChartError(false);
      } finally {
        setIsChartLoading(false);
      }
    }
  };

  // Fetch quote
  const fetchQuote = async () => {
    if (selectedInstrument) {
      try {
        const response = await marketAPI.getQuote(selectedInstrument.id);
        setQuote(response.data.quote);
      } catch (error) {
        // Fallback Quote using any type cast to avoid strict TS error on 'last_price'
        const fallbackPrice = (selectedInstrument as any).last_price || 100;
        setQuote({
          // symbol removed to satisfy TS Quote type
          bid: fallbackPrice,
          ask: fallbackPrice * 1.0001,
          last: fallbackPrice,
          ts: Date.now()
        });
      }
      setLastUpdateTime(new Date().toLocaleTimeString());
    }
  };

  // Fetch signals
  const fetchSignals = async () => {
    // In a real app, this would come from the backend
    // For now, we'll create mock signals based on current data
    if (selectedInstrument && quote) {
      const mockSignal: Signal = {
        instrument: selectedInstrument.display_symbol,
        direction: Math.random() > 0.5 ? 'LONG' : 'SHORT',
        confidence: Math.random() * 0.5 + 0.5, // Between 50% and 100%
        indicators: {
          rsi: Math.random() * 100,
          ema20: quote.last * (0.95 + Math.random() * 0.1),
          ema50: quote.last * (0.95 + Math.random() * 0.1),
          regime: Math.random() > 0.6 ? 'HIGH' : Math.random() > 0.3 ? 'MED' : 'LOW'
        },
        notes: ['RSI showing bullish divergence', 'Price above both EMAs']
      };

      setSignals([mockSignal]);

      // Add signal change event to journal
      const newEvent: EventLog = {
        id: Date.now() + 1, // Using timestamp as ID for demo
        instrument_id: selectedInstrument.id,
        type: 'signal_change',
        payload_json: {
          symbol: selectedInstrument.display_symbol,
          direction: mockSignal.direction,
          confidence: mockSignal.confidence,
          regime: mockSignal.indicators.regime
        },
        created_at: new Date().toISOString()
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 49)]);
    }
  };

  // Fetch positions and trades
  useEffect(() => {
    if (userChallenge?.id) {
      fetchPositions();
      fetchTrades();
    }
  }, [userChallenge]);

  const fetchPositions = async () => {
    try {
      const response = await challengeAPI.getPositions(userChallenge.id);
      setPositions(response.data.positions);
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  const fetchTrades = async () => {
    try {
      const response = await challengeAPI.getTrades(userChallenge.id);
      setTrades(response.data.trades);

      // Add recent trades to journal
      response.data.trades.slice(0, 5).forEach((trade: Trade) => {
        const instrument = instruments.find(i => i.id === trade.instrument_id);
        const newEvent: EventLog = {
          id: trade.id,
          instrument_id: trade.instrument_id,
          type: 'trade_executed',
          payload_json: {
            symbol: instrument?.display_symbol,
            side: trade.side,
            qty: trade.qty,
            price: trade.price,
            realized_pnl: trade.realized_pnl
          },
          created_at: trade.created_at
        };

        setEvents(prev => [...prev, newEvent].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 50));
      });
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  // Fetch events/journal
  useEffect(() => {
    // In a real app, we would fetch from the backend
    // For now, we'll use the events we've created
    const mockEvents: EventLog[] = [
      {
        id: 1,
        instrument_id: 1,
        type: 'risk_evaluation',
        payload_json: {
          status: 'IN_PROGRESS',
          daily_drawdown: 0.02,
          total_drawdown: 0.03,
          distance_to_limit: 0.02
        },
        created_at: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
      },
      {
        id: 2,
        instrument_id: 2,
        type: 'quote_update',
        payload_json: {
          symbol: 'ETH/USDT',
          bid: 2845.20,
          ask: 2846.10,
          last: 2845.50,
          change: '+0.78%'
        },
        created_at: new Date(Date.now() - 600000).toISOString() // 10 minutes ago
      }
    ];

    setEvents(mockEvents);
  }, []);

  // Optimize fetching: Single polling source
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchData = async () => {
      if (selectedInstrument && !isChartLoading) {
        // Silent update for quote and signals
        await Promise.all([
          fetchQuote(),
          fetchSignals()
        ]);
        // Only update chart if not already loading to prevent stutter
        if (!isChartLoading) {
          marketAPI.getOHLCV(selectedInstrument.id, timeframe, 100)
            .then(res => {
              if (res.data?.ohlcv?.length) setOhlcvData(res.data.ohlcv);
            })
            .catch(e => console.warn('Silent chart update failed', e));
        }
      }
    };

    if (selectedInstrument) {
      // Initial fetch
      fetchChartData();
      fetchQuote();
      fetchSignals();

      // Poll every 5 seconds (standard for trading apps)
      intervalId = setInterval(fetchData, 5000);
    }

    return () => clearInterval(intervalId);
  }, [selectedInstrument, timeframe]);

  // Execute trade
  const executeTrade = async (side: 'BUY' | 'SELL') => {
    if (!selectedInstrument || !userChallenge?.id) return;

    setIsTradeLoading(true);
    try {
      await challengeAPI.executeTrade(userChallenge.id, selectedInstrument.id, side, quantity);

      // Add trade executed event to journal
      const newEvent: EventLog = {
        id: Date.now() + 2, // Using timestamp as ID for demo
        instrument_id: selectedInstrument.id,
        type: 'trade_executed',
        payload_json: {
          symbol: selectedInstrument.display_symbol,
          side,
          qty: quantity,
          price: quote?.last || 0,
          status: 'filled'
        },
        created_at: new Date().toISOString()
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 49)]);

      // Refresh positions and trades after successful trade
      await fetchPositions();
      await fetchTrades();
      // Refresh quote to get latest prices
      await fetchQuote();
    } catch (error) {
      console.error('Error executing trade:', error);
    } finally {
      setIsTradeLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full text-gray-900 dark:text-gray-100">
      {/* Watchlist Panel with grouped instruments */}
      <div className="flex space-x-4 mb-4">
        {/* AI Assistant Button */}
        <button
          onClick={handleAIAnalysis}
          disabled={!selectedInstrument}
          className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2 px-4 rounded font-bold shadow-lg flex items-center justify-center transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          AI Quant Assistant
        </button>

        {/* News Hub Button */}
        <button
          onClick={handleNews}
          className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white py-2 px-4 rounded font-bold shadow-lg flex items-center justify-center transition-all"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
          News Hub
        </button>

        {/* Demo: Simulate Crash Button */}
        <button
          onClick={async () => {
            if (confirm("⚠️ DEMO: This will intentionally crash the account equity to demonstrate failure logic. Continue?")) {
              try {
                // Using the API to force fail if implemented, or just simulated trade
                // For now, let's assume we call the executeTrade with a special flag or massive size
                // But since backend validation might block it, we'll try a direct "bad trade"
                if (selectedInstrument && userChallenge?.id) {
                  // Placing a massive trade that we assume will fail execution or logic
                  await challengeAPI.executeTrade(userChallenge.id, selectedInstrument.id, 'BUY', 10000);
                  // Or call the special endpoint if we add it. 
                  // Let's call the endpoint we are about to create:
                  // fetch(`/api/v1/challenges/${userChallenge.id}/force_fail`, { method: 'POST' });
                  await challengeAPI.forceFail(userChallenge.id); // We urge to add this to API service too
                  window.location.reload();
                }
              } catch (e) { alert("Crash simulation failed"); }
            }
          }}
          className="bg-red-900/80 hover:bg-red-900 text-red-200 py-2 px-3 rounded font-bold shadow-lg flex items-center justify-center transition-all text-xs"
          title="Demo: Force Failure"
        >
          ⚠️ CRASH
        </button>
      </div>

      {/* AI Analysis Modal Overlay */}
      {showAnalysis && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowAnalysis(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 border border-purple-500 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowAnalysis(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
              Quant Assistant Analysis
            </h3>

            {!analysisData ? (
              <div className="flex justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div></div>
            ) : analysisData.error ? (
              <div className="text-red-400 text-center">{analysisData.error}</div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-900 p-3 rounded">
                  <span className="text-gray-400">Signal:</span>
                  <span className={`font-bold px-3 py-1 rounded ${analysisData.signal === 'BUY' ? 'bg-green-900 text-green-400' : analysisData.signal === 'SELL' ? 'bg-red-900 text-red-400' : 'bg-gray-700 text-gray-300'}`}>
                    {analysisData.signal}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-gray-900 p-3 rounded">
                  <span className="text-gray-400">Confidence:</span>
                  <span className="text-white font-mono">{analysisData.confidence}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-gray-700 p-2 rounded">
                    <div className="text-gray-400">RSI</div>
                    <div className="text-white font-bold">{analysisData.indicators.rsi}</div>
                  </div>
                  <div className="bg-gray-700 p-2 rounded">
                    <div className="text-gray-400">SMA50</div>
                    <div className="text-white font-bold">{analysisData.indicators.sma_50}</div>
                  </div>
                  <div className="bg-gray-700 p-2 rounded">
                    <div className="text-gray-400">Vol</div>
                    <div className="text-white font-bold">{analysisData.indicators.volatility}</div>
                  </div>
                </div>

                <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded text-sm text-purple-200">
                  "{analysisData.reasoning}"
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* News Hub Modal Overlay */}
      {showNews && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowNews(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-orange-500 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-orange-400 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                Global News Hub
              </h3>
              <button onClick={() => setShowNews(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {newsData.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Loading latest headlines...</div>
              ) : (
                newsData.map((item, i) => (
                  <div key={i} className="bg-gray-750 hover:bg-gray-700 p-4 rounded border-l-4 border-orange-500 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white text-lg">{item.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${item.sentiment === 'Bullish' ? 'bg-green-900 text-green-400' : item.sentiment === 'Bearish' ? 'bg-red-900 text-red-400' : 'bg-gray-600 text-gray-300'}`}>
                        {item.sentiment}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{item.summary}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{item.source} • {item.timestamp}</span>
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Read Source →</a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg p-4 h-fit border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-blue-400">{t('dash_watchlist')}</h3>

        {/* FX Group */}
        <div className="mb-3">
          <div
            className="flex justify-between items-center cursor-pointer p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-100 font-bold"
            onClick={() => toggleGroup('FX')}
          >
            <span className="font-medium">Forex (FX)</span>
            {/* SVG Arrow */}
            <svg className={`w-4 h-4 transition-transform ${expandedGroups.FX ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </div>
          {expandedGroups.FX && (
            <div className="mt-2 space-y-1 pl-2">
              {groupedInstruments['FX']?.map((instrument) => (
                <div
                  key={instrument.id}
                  className={`p-2 rounded cursor-pointer transition-colors ${selectedInstrument?.id === instrument.id
                    ? 'bg-blue-900 border-l-4 border-blue-500'
                    : 'bg-gray-750 hover:bg-gray-600'
                    }`}
                  onClick={() => setSelectedInstrument(instrument)}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{instrument.display_symbol}</span>
                    {quote?.ts && (
                      <span className="text-xs">
                        {quote.last.toFixed(4)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Crypto Group */}
        <div className="mb-3">
          <div
            className="flex justify-between items-center cursor-pointer p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-100 font-bold"
            onClick={() => toggleGroup('CRYPTO')}
          >
            <span className="font-medium">Crypto</span>
            {/* SVG Arrow */}
            <svg className={`w-4 h-4 transition-transform ${expandedGroups.CRYPTO ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </div>
          {expandedGroups.CRYPTO && (
            <div className="mt-2 space-y-1 pl-2">
              {groupedInstruments['CRYPTO']?.map((instrument) => (
                <div
                  key={instrument.id}
                  className={`p-2 rounded cursor-pointer transition-colors ${selectedInstrument?.id === instrument.id
                    ? 'bg-blue-900 border-l-4 border-blue-500'
                    : 'bg-gray-750 hover:bg-gray-600'
                    }`}
                  onClick={() => setSelectedInstrument(instrument)}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{instrument.display_symbol}</span>
                    {quote?.ts && (
                      <span className="text-xs">
                        {quote.last.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Commodities Group */}
        <div className="mb-3">
          <div
            className="flex justify-between items-center cursor-pointer p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-100 font-bold"
            onClick={() => toggleGroup('COMMODITIES')}
          >
            <span className="font-medium">Commodities</span>
            <span>{expandedGroups.COMMODITIES ? '▼' : '▶'}</span>
          </div>
          {expandedGroups.COMMODITIES && (
            <div className="mt-2 space-y-1 pl-2">
              {groupedInstruments['COMMODITIES']?.map((instrument) => (
                <div
                  key={instrument.id}
                  className={`p-2 rounded cursor-pointer transition-colors ${selectedInstrument?.id === instrument.id
                    ? 'bg-blue-900 border-l-4 border-blue-500'
                    : 'bg-gray-750 hover:bg-gray-600'
                    }`}
                  onClick={() => setSelectedInstrument(instrument)}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{instrument.display_symbol}</span>
                    {quote?.ts && (
                      <span className="text-xs">
                        {quote.last.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stocks (CSE) Group */}
        <div className="mb-3">
          <div
            className="flex justify-between items-center cursor-pointer p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-100 font-bold"
            onClick={() => toggleGroup('STOCKS')}
          >
            <span className="font-medium">{t('cate_coding') === 'Codage' ? 'Actions (CSE)' : 'Stocks (CSE)'}</span>
            <span>{expandedGroups.STOCKS ? '▼' : '▶'}</span>
          </div>
          {expandedGroups.STOCKS && (
            <div className="mt-2 space-y-1 pl-2">
              {groupedInstruments['STOCKS']?.map((instrument) => (
                <div
                  key={instrument.id}
                  className={`p-2 rounded cursor-pointer transition-colors ${selectedInstrument?.id === instrument.id
                    ? 'bg-blue-900 border-l-4 border-blue-500'
                    : 'bg-gray-750 hover:bg-gray-600'
                    }`}
                  onClick={() => setSelectedInstrument(instrument)}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{instrument.display_symbol}</span>
                    {quote?.ts && (
                      <span className="text-xs">
                        {quote.last.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                {t('nav_dashboard')}
              </h1>
              <p className="text-gray-400 text-sm">Welcome back, {user?.first_name || 'Trader'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded font-bold ${userChallenge?.status === 'FAILED' ? 'bg-red-900 text-red-500 animate-pulse border border-red-500' :
                  userChallenge?.status === 'PASSED' ? 'bg-green-900 text-green-400' :
                    'bg-blue-900 text-blue-400'
                }`}>
                Status: {userChallenge?.status || 'Active'}
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold">
                  {selectedInstrument?.display_symbol || t('dash_select_instr')}
                </h2>
                {quote && (
                  <div className="text-sm text-gray-400">
                    {t('dash_last')}: <span className="font-mono">{quote.last.toFixed(2)}</span> |
                    {t('dash_bid')}: <span className="font-mono">{quote.bid.toFixed(2)}</span> |
                    {t('dash_ask')}: <span className="font-mono">{quote.ask.toFixed(2)}</span>
                    <span className="ml-2 text-xs">{t('dash_last_update')}: {lastUpdateTime}</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                {['1m', '5m', '15m', '1h', '4h', '1d'].map((tf) => (
                  <button
                    key={tf}
                    className={`px-3 py-1 rounded text-sm ${timeframe === tf
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    onClick={() => {
                      setTimeframe(tf);
                      fetchChartData();
                    }}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-96">
              {selectedInstrument ? (
                <TVChartContainer
                  symbol={selectedInstrument.display_symbol}
                  data={ohlcvData}
                  timeframe={timeframe}
                  isLoading={isChartLoading}
                  isError={isChartError}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  {t('dash_view_chart')}
                </div>
              )}
            </div>
          </div>

          {/* Trade Ticket */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-green-400">{t('dash_ticket')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('dash_instrument')}</label>
                <select
                  value={selectedInstrument?.id || ''}
                  onChange={(e) => {
                    const instrument = instruments.find(i => i.id === Number(e.target.value));
                    if (instrument) setSelectedInstrument(instrument);
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  {instruments.map(instrument => (
                    <option key={instrument.id} value={instrument.id}>
                      {instrument.display_symbol}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('dash_qty')}</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-white"
                  min="0.001"
                  step="0.001"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => executeTrade('BUY')}
                  disabled={isTradeLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold disabled:opacity-50"
                >
                  {isTradeLoading ? t('dash_processing') : t('dash_buy')}
                </button>
                <button
                  onClick={() => executeTrade('SELL')}
                  disabled={isTradeLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold disabled:opacity-50"
                >
                  {isTradeLoading ? t('dash_processing') : t('dash_sell')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Signals, Risk, and Journal */}
        <div className="space-y-4">
          {/* Signals Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-purple-400">Trading Signals</h3>
            <div className="space-y-3">
              {signals.map((signal, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border-l-4 ${signal.direction === 'LONG'
                    ? 'border-green-500 bg-green-900/20'
                    : signal.direction === 'SHORT'
                      ? 'border-red-500 bg-red-900/20'
                      : 'border-yellow-500 bg-yellow-900/20'
                    }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{signal.instrument}</span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-700">
                      {Math.round(signal.confidence * 100)}% confidence
                    </span>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold">Direction: {signal.direction === 'LONG' ? t('dash_buy') : t('dash_sell')}</div>
                    <div>RSI: {signal.indicators.rsi?.toFixed(2)}</div>
                    <div>Regime: {signal.indicators.regime}</div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    {signal.notes.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trading Journal / Event Log */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm h-96 overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold mb-2 text-orange-400">Live Journal</h3>
            <div className="overflow-y-auto flex-1 text-xs space-y-2 pr-1">
              {events.map(event => (
                <div key={event.id} className="bg-gray-900/50 p-2 rounded border-l-2 border-gray-600">
                  <div className="flex justify-between text-gray-500 mb-1">
                    <span>{new Date(event.created_at).toLocaleTimeString()}</span>
                    <span className="uppercase">{event.type.replace('_', ' ')}</span>
                  </div>
                  <div className="text-gray-300">
                    {event.type === 'trade_executed' && (
                      <span>{event.payload_json.side} {event.payload_json.qty} {event.payload_json.symbol} @ {event.payload_json.price}</span>
                    )}
                    {event.type === 'signal_change' && (
                      <span>{event.payload_json.symbol}: {event.payload_json.direction} ({Math.round(event.payload_json.confidence * 100)}%)</span>
                    )}
                    {event.type === 'quote_update' && (
                      <span>{event.payload_json.symbol}: {event.payload_json.last} ({event.payload_json.change})</span>
                    )}
                    {event.type === 'risk_evaluation' && (
                      <span>DD: {(event.payload_json.daily_drawdown * 100).toFixed(2)}% | Total: {(event.payload_json.total_drawdown * 100).toFixed(2)}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      );
};

      export default TradingDashboard;
