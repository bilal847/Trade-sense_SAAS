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

const TradingDashboard: React.FC<{ userChallenge: UserChallenge; user: any }> = ({ userChallenge, user }) => {
  const { t } = useTranslation();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quotesMap, setQuotesMap] = useState<Record<number, Quote>>({});
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
    STOCKS: true,
    INDEX: true
  });

  // Local Challenge Status for immediate UI updates
  const [currentStatus, setCurrentStatus] = useState<string>(userChallenge?.status || 'IN_PROGRESS');
  const [violatedRules, setViolatedRules] = useState<string[]>(userChallenge?.violated_rules || []);

  // Sync state when props change (e.g., after starting a new challenge)
  useEffect(() => {
    if (userChallenge) {
      setCurrentStatus(userChallenge.status);
      setViolatedRules(userChallenge.violated_rules || []);
    }
  }, [userChallenge?.id, userChallenge?.status]);


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
      setOhlcvData([]); // Clear previous data to prevent chart artifacts and scale issues
      try {
        const response = await marketAPI.getOHLCV(selectedInstrument.id, timeframe, 1000);
        if (response.data && response.data.ohlcv && response.data.ohlcv.length > 0) {
          setOhlcvData(response.data.ohlcv);
        } else {
          // Fallback if empty array returned
          throw new Error("Empty data");
        }
      } catch (error) {
        console.warn('Error fetching chart data, using Smart Fallback:', error);
        // Smart Fallback: Generate local data
        const mockData = generateMockOHLCV(selectedInstrument.id, 1000);
        setOhlcvData(mockData);
        // Do NOT set error state, so UI looks clean
        setIsChartError(false);
      } finally {
        setIsChartLoading(false);
      }
    }
  };

  // Fetch batch quotes for watchlist
  const fetchBatchQuotes = async (instrumentIds: number[]) => {
    if (instrumentIds.length === 0) return;
    try {
      const response = await marketAPI.getQuotes(instrumentIds);
      const quotes = response.data.quotes;

      // Fix for FX pairs where 'last' might be zero or missing in batch
      Object.keys(quotes).forEach(id => {
        const q = quotes[id];
        if (q && (!q.last || q.last === 0) && q.bid && q.ask) {
          q.last = (q.bid + q.ask) / 2;
        }
      });

      setQuotesMap(quotes);

      // Also update current selected instrument quote if it exists in the batch
      if (selectedInstrument && quotes[selectedInstrument.id]) {
        const currentQuote = quotes[selectedInstrument.id];
        setQuote(currentQuote);
        return currentQuote;
      }
    } catch (error) {
      console.warn('Error fetching batch quotes, using fallbacks');
      const newQuotes: Record<number, Quote> = {};
      instruments.forEach(inst => {
        const fallbackPrice = (inst as any).last_price || 100;
        newQuotes[inst.id] = {
          bid: fallbackPrice,
          ask: fallbackPrice * 1.0001,
          last: fallbackPrice,
          ts: Date.now()
        };
      });
      setQuotesMap(newQuotes);
    }
    setLastUpdateTime(new Date().toLocaleTimeString());
    return null;
  };

  // Fetch quote for selected instrument (fallback if batch not used)
  const fetchQuote = async () => {
    if (selectedInstrument) {
      try {
        const response = await marketAPI.getQuote(selectedInstrument.id);
        let q = response.data.quote;

        // Fix for FX pairs where 'last' might be zero or missing
        if (q && (!q.last || q.last === 0) && q.bid && q.ask) {
          q.last = (q.bid + q.ask) / 2;
        }

        setQuote(q);
        setQuotesMap(prev => ({ ...prev, [selectedInstrument.id]: q }));
        return q;
      } catch (error) {
        const fallbackPrice = (selectedInstrument as any).last_price || 100;
        const q = {
          bid: fallbackPrice,
          ask: fallbackPrice * 1.0001,
          last: fallbackPrice,
          ts: Date.now()
        };
        setQuote(q);
        setQuotesMap(prev => ({ ...prev, [selectedInstrument.id]: q }));
        return q;
      }
    }
    return null;
  };

  // Fetch signals
  const fetchSignals = async (currentQuote?: Quote) => {
    // Determine which quote to use (passed or from state)
    const activeQuote = currentQuote || quote;

    if (selectedInstrument && activeQuote) {
      const mockDirection: 'LONG' | 'SHORT' = Math.random() > 0.5 ? 'LONG' : 'SHORT';
      const mockSignal: Signal = {
        instrument: selectedInstrument.display_symbol,
        direction: mockDirection,
        confidence: Math.random() * 0.4 + 0.6, // 60% to 100%
        indicators: {
          rsi: Math.random() * 100,
          ema20: activeQuote.last * (0.95 + Math.random() * 0.1),
          ema50: activeQuote.last * (0.95 + Math.random() * 0.1),
          regime: Math.random() > 0.6 ? 'HIGH' : Math.random() > 0.3 ? 'MED' : 'LOW'
        },
        notes: ['Price momentum shifting', 'EMA crossover imminent']
      };

      setSignals([mockSignal]);

      // Add signal change event to journal
      const newEvent: EventLog = {
        id: Date.now() + 1,
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

      setEvents(prev => {
        // Only keep one signal_change per instrument to reduce noise
        const filtered = prev.filter(e => !(e.type === 'signal_change' && e.instrument_id === selectedInstrument.id));
        return [newEvent, ...filtered].slice(0, 50);
      });
    }
  };

  // Fetch positions and trades - depends on challenge AND instruments being ready
  useEffect(() => {
    if (userChallenge?.id && instruments.length > 0) {
      fetchPositions();
      fetchTrades();
    }
  }, [userChallenge?.id, instruments.length]);

  const fetchPositions = async () => {
    if (!userChallenge?.id) return;
    try {
      const response = await challengeAPI.getPositions(userChallenge.id);
      setPositions(response.data.positions);
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn('Positions endpoint not found, using empty array');
        setPositions([]);
      } else {
        console.error('Error fetching positions:', error);
      }
    }
  };

  const fetchTrades = async () => {
    if (!userChallenge?.id) return;
    try {
      const response = await challengeAPI.getTrades(userChallenge.id);
      setTrades(response.data.trades);

      // Add recent trades to journal in a single update
      const newTradeEvents: EventLog[] = response.data.trades.slice(0, 10).map((trade: Trade) => {
        const inst = instruments.find(i => i.id === trade.instrument_id);
        return {
          id: trade.id,
          instrument_id: trade.instrument_id,
          type: 'trade_executed',
          payload_json: {
            symbol: inst?.display_symbol || 'Unknown',
            side: trade.side,
            qty: trade.qty,
            price: trade.price,
            status: 'filled'
          },
          created_at: trade.created_at
        };
      });

      setEvents(prev => {
        // Filter out any existing events with these IDs to avoid duplicates
        const existingIds = new Set(newTradeEvents.map(e => e.id));
        const filteredPrev = prev.filter(e => !existingIds.has(e.id));
        const combined = [...newTradeEvents, ...filteredPrev];
        return combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 50);
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn('Trades endpoint not found, using empty array');
        setTrades([]);
      } else {
        console.error('Error fetching trades:', error);
      }
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

  // Main Data Fetch & Polling Effect (Sequenced)
  useEffect(() => {
    if (!selectedInstrument || instruments.length === 0) return;

    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    // Initial load: Sequence Chart -> Quote -> Signals
    const loadData = async () => {
      setQuote(null); // Clear stale quote immediately
      await fetchChartData();
      if (!isMounted) return;
      const freshQuote = await fetchQuote();
      if (!isMounted) return;
      await fetchSignals(freshQuote || undefined);
    };

    loadData();

    // Polling Every 2 Seconds: Sequence Quote -> Signals
    intervalId = setInterval(async () => {
      if (!isChartLoading && isMounted) {
        const allIds = instruments.map(i => i.id);
        const freshQuote = await fetchBatchQuotes(allIds);
        if (isMounted) {
          await fetchSignals(freshQuote || undefined);
        }
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [selectedInstrument?.id, timeframe, instruments.length]);

  const [tradeError, setTradeError] = useState<string | null>(null);

  // Execute trade
  const executeTrade = async (side: 'BUY' | 'SELL') => {
    if (!selectedInstrument || !userChallenge?.id) return;

    // Block trading if challenge is FAILED
    if (currentStatus === 'FAILED') {
      setTradeError('Cannot trade on a failed challenge');
      setTimeout(() => setTradeError(null), 3000);
      return;
    }

    setIsTradeLoading(true);
    setTradeError(null);
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

      setEvents(prev => {
        const newerEvents = [newEvent, ...prev];
        return newerEvents.slice(0, 50);
      });

      // Refresh positions and trades after successful trade
      await fetchPositions();
      await fetchTrades();
      // Ensure local events are synced with backend trade IDs if possible
      // (fetchTrades already handles duplicate removal by ID)
      // Refresh quote to get latest prices
      await fetchQuote();
    } catch (error: any) {
      console.error('Error executing trade:', error);
      const errorMessage = error.response?.data?.error || t('error');
      setTradeError(errorMessage);

      // If the error indicates failure (common for quantity limit)
      if (errorMessage.toLowerCase().includes('failed')) {
        setCurrentStatus('FAILED');
        const reason = errorMessage.replace('Challenge FAILED: ', '');
        setViolatedRules(prev => {
          const combined = [...prev, reason];
          return combined.filter((val, idx, self) => self.indexOf(val) === idx);
        });
      }

      // Auto-clear error after 5 seconds
      setTimeout(() => setTradeError(null), 5000);
    } finally {
      setIsTradeLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 h-full text-gray-900 dark:text-gray-100">
      {/* Watchlist Panel with grouped instruments */}
      <div className="flex space-x-4 mb-4">
        {/* AI Assistant Button */}
        <button
          onClick={() => window.location.href = '/quant'}
          disabled={!selectedInstrument}
          className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2 px-4 rounded font-bold shadow-lg flex items-center justify-center transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          AI Quant Assistant
        </button>

        {/* News Hub Button */}
        <button
          onClick={() => window.location.href = '/news'}
          className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white py-2 px-4 rounded font-bold shadow-lg flex items-center justify-center transition-all"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
          News Hub
        </button>

      </div>



      <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg p-4 h-fit border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-blue-400">{t('dash_watchlist')}</h3>

        {/* Dynamic Watchlist Groups */}
        {Object.keys(groupedInstruments).sort().map((group) => (
          <div key={group} className="mb-4">
            <div
              className="flex justify-between items-center cursor-pointer p-2.5 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-gray-100 transition-all hover:bg-gray-200 dark:hover:bg-gray-600/50 border border-gray-200 dark:border-gray-600 group mb-2"
              onClick={() => toggleGroup(group)}
            >
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-wide text-xs uppercase opacity-70">
                  {group === 'FX' ? 'Forex (FX)' :
                    group === 'CRYPTO' ? 'Crypto' :
                      group === 'COMMODITIES' ? 'Commodities' :
                        group === 'STOCKS' ? (t('cate_coding') === 'Codage' ? 'Actions (CSE)' : 'Stocks (CSE)') :
                          group}
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-bold">
                  {groupedInstruments[group].length}
                </span>
              </div>
              <svg className={`w-4 h-4 transition-transform opacity-50 group-hover:opacity-100 ${expandedGroups[group] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>

            {expandedGroups[group] && (
              <div className="space-y-1 ml-1 border-l border-gray-100 dark:border-gray-700/30 pl-2">
                {groupedInstruments[group].map((instrument) => (
                  <div
                    key={instrument.id}
                    className={`p-2.5 rounded-lg cursor-pointer transition-all duration-200 group/item ${selectedInstrument?.id === instrument.id
                      ? 'bg-blue-600/20 border-l-4 border-blue-500 shadow-inner'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-750'
                      }`}
                    onClick={() => setSelectedInstrument(instrument)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className={`text-sm font-semibold ${selectedInstrument?.id === instrument.id ? 'text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {instrument.display_symbol}
                        </span>
                        <span className="text-[10px] opacity-40 uppercase">{instrument.exchange}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        {quotesMap[instrument.id] ? (
                          <span className={`text-xs font-mono font-bold transition-all ${selectedInstrument?.id === instrument.id ? 'text-blue-300' : 'text-blue-500 dark:text-blue-400'
                            }`}>
                            {['FX', 'COMMODITIES'].includes(instrument.asset_class)
                              ? (quotesMap[instrument.id]?.last || 0).toFixed(4)
                              : (quotesMap[instrument.id]?.last || 0).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-gray-400 opacity-50 italic">Loading...</span>
                        )}
                        {quotesMap[instrument.id] && (
                          <span className="text-[9px] opacity-30">
                            {new Date(quotesMap[instrument.id].ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* End of Watchlist */}
      </div>

      {/* Main Chart Area */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 leading-tight">
                {t('nav_dashboard')}
              </h1>
              <p className="text-gray-400 text-sm">Welcome back, {user?.first_name || 'Trader'}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 flex-1 justify-end w-full lg:w-auto">
              <div className={`px-3 py-1 rounded font-bold whitespace-nowrap ${currentStatus === 'FAILED' ? 'bg-red-900 text-red-500 animate-pulse border border-red-500' :
                currentStatus === 'PASSED' ? 'bg-green-900 text-green-400' :
                  'bg-blue-900 text-blue-400'
                }`}>
                {currentStatus || 'Active'}
              </div>

              <div className="text-right min-w-[150px]">
                <h2 className="text-xl font-bold truncate">
                  {selectedInstrument?.display_symbol || t('dash_select_instr')}
                </h2>
                {quote && (
                  <div className="text-xs text-gray-400 flex flex-col items-end">
                    <div className="font-mono">
                      {selectedInstrument?.asset_class === 'FX' ? quote.last.toFixed(4) : quote.last.toFixed(2)} | Bid: {selectedInstrument?.asset_class === 'FX' ? quote.bid.toFixed(4) : quote.bid.toFixed(2)} | Ask: {selectedInstrument?.asset_class === 'FX' ? quote.ask.toFixed(4) : quote.ask.toFixed(2)}
                    </div>
                    <span className="text-[10px] opacity-70">{t('dash_last_update')}: {lastUpdateTime}</span>
                  </div>
                )}
              </div>

              <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                {['1m', '5m', '15m', '1h', '4h', '1d'].map((tf) => (
                  <button
                    key={tf}
                    className={`px-2 py-1 rounded text-xs transition-colors ${timeframe === tf
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 border border-transparent'
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
          </div>

          {/* Error Alert */}
          {tradeError && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 rounded flex items-center justify-between animate-fade-in">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{tradeError}</span>
              </div>
              <button
                onClick={() => setTradeError(null)}
                className="text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="h-96">
            {selectedInstrument ? (
              <TVChartContainer
                symbol={selectedInstrument.display_symbol}
                data={ohlcvData}
                trades={trades.filter(t => t.instrument_id === selectedInstrument.id)}
                timeframe={timeframe}
                latestQuote={quote}
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
              {userChallenge?.challenge?.max_trade_quantity && (
                <p className="text-xs mt-1 text-gray-400">
                  Limit: <span className="font-bold text-blue-400">{userChallenge.challenge.max_trade_quantity}</span> units
                </p>
              )}
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

        {/* Trading Signals - Moved here below Ticket */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-purple-400">Trading Signals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dedicated Trade Log - NEW */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold mb-3 text-blue-400">Trade Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-gray-700">
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Asset</th>
                  <th className="pb-2">Side</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2">Price</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {events.filter(e => e.type === 'trade_executed').map(event => (
                  <tr key={event.id} className="border-b border-gray-800/50">
                    <td className="py-2">{new Date(event.created_at).toLocaleTimeString()}</td>
                    <td className="py-2 font-bold">{event.payload_json.symbol}</td>
                    <td className={`py-2 ${event.payload_json.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                      {event.payload_json.side}
                    </td>
                    <td className="py-2">{event.payload_json.qty}</td>
                    <td className="py-2 font-mono">{event.payload_json.price}</td>
                  </tr>
                ))}
                {events.filter(e => e.type === 'trade_executed').length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500 italic">No trades logged yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Panel - Live Journal Only */}
      <div className="lg:col-span-2 space-y-4">
        {/* Trading Journal / Event Log */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm h-[600px] overflow-hidden flex flex-col">
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
      {/* Challenge Failed Overlay */}
      {currentStatus === 'FAILED' && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gray-900 border-2 border-red-600 rounded-2xl p-8 max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
            {/* Background red pulse */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse"></div>

            <div className="w-24 h-24 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-600 animate-bounce">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>

            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">Evaluation Concluded</h2>
            <p className="text-red-400 font-bold text-lg mb-4">Risk Management Parameters Exceeded</p>

            {/* Professional motivational message */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg p-6 mb-6">
              <p className="text-blue-200 font-semibold text-base leading-relaxed">
                We encourage you to refine your strategy and consider initiating a new challenge to continue your journey.
              </p>
            </div>

            <div className="bg-black/50 rounded-lg p-6 mb-8 text-left border border-red-900/50">
              <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Violation Summary:</h4>
              <ul className="space-y-2">
                {violatedRules && violatedRules.length > 0 ? (
                  violatedRules.map((rule: string, i: number) => (
                    <li key={i} className="flex items-start text-red-300">
                      <span className="mr-2 text-red-500">✖</span>
                      {rule}
                    </li>
                  ))
                ) : (
                  <li className="flex items-start text-red-300">
                    <span className="mr-2 text-red-500">✖</span>
                    Risk threshold breach detected
                  </li>
                )}
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/challenges'}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-blue-900/40 uppercase tracking-wider"
              >
                Start New Challenge
              </button>
              <button
                onClick={() => window.location.href = '/leaderboard'}
                className="w-full py-3 bg-transparent border-2 border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white rounded-lg font-semibold transition-all"
              >
                View Leaderboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingDashboard;
