import requests
import feedparser
import random
import time

class NewsService:
    _cache = None
    _last_fetch = 0

    # Hardcoded rich content for fallback/demo mode (Futuristic 2026 Data)
    MOCK_ARTICLES = {
        "mock_fed_2026": {
            "title": "Fed Hits Infinity Target: Inflation Stabilizes at 2%",
            "text": "WASHINGTON (Jan 18, 2026) — The Federal Reserve announced today that the U.S. economy has successfully achieved a 'soft landing' with inflation stabilizing at exactly 2.0% for the third consecutive quarter. EURUSD reacted strongly.",
            "image": "https://images.unsplash.com/photo-1604594849809-dfedbc82710f?auto=format&fit=crop&q=80&w=1000",
            "authors": ["Economic Staff"],
            "publish_date": "2026-01-18"
        },
        "mock_ai_2026": {
            "title": "Global Markets Rally on 2025 Earnings Beat",
            "text": "NEW YORK (Jan 18, 2026) — A wave of stronger-than-expected Q4 2025 earnings from major tech conglomerates has sent global indices soaring. NAS100 pushed to record highs.",
            "image": "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000",
            "authors": ["Tech Desk"],
            "publish_date": "2026-01-18"
        },
        "mock_quantum": {
            "title": "Quantum Computing Breakthrough Shifts Crypto Landscape",
            "text": "ZURICH (Jan 16, 2026) — Researchers at ETH Zurich have demonstrated a fault-tolerant quantum processor. BTCUSDT and ETHUSDT remained stable.",
            "image": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000",
            "authors": ["Crypto Insider"],
            "publish_date": "2026-01-16"
        },
        "mock_mars": {
            "title": "SpaceX Announces Mars Cargo Mission Timeline",
            "text": "BOCA CHICA (Jan 17, 2026) — Elon Musk confirmed that the first uncrewed Starship cargo missions to Mars will launch in 2026.",
            "image": "https://images.unsplash.com/photo-1541185933-710f50b908eb?auto=format&fit=crop&q=80&w=1000",
            "authors": ["Space Wire"],
            "publish_date": "2026-01-17"
        },
        "mock_fusion": {
            "title": "Green Energy Adoption Hits 40% Globally",
            "text": "PARIS (Jan 15, 2026) — Renewable sources now generate 40% of the world's electricity. USOIL prices stabilized at $65/barrel.",
            "image": "https://images.unsplash.com/photo-1497436072909-60f360e1d4b0?auto=format&fit=crop&q=80&w=1000",
            "authors": ["Green Earth"],
            "publish_date": "2026-01-15"
        }
    }

    @staticmethod
    def analyze_impact(text):
        """
        Determines the impacted asset and sentiment based on text keywords.
        """
        text = text.lower()
        
        # 1. Asset Mapping
        impact = "Global" # Default
        
        keywords = {
            "EURUSD": ["fed", "powell", "inflation", "rate", "dollar", "usd", "ecb", "lagarde", "euro", "fomc"],
            "GBPUSD": ["boe", "bailey", "pound", "sterling", "uk economy", "brexit"],
            "BTCUSDT": ["bitcoin", "crypto", "btc", "blockchain", "etf", "coinbase", "sec", "mining"],
            "ETHUSDT": ["ethereum", "eth", "smart contract", "vitalik", "defi", "web3"],
            "USOIL": ["oil", "energy", "opec", "petroleum", "crude", "barrel", "saudi", "russia"],
            "XAUUSD": ["gold", "silver", "precious", "metal", "safe haven", "xau"],
            "NAS100": ["tech", "ai", "nvidia", "apple", "google", "microsoft", "nasdaq", "chip"]
        }
        
        for asset, keys in keywords.items():
            if any(k in text for k in keys):
                impact = asset
                break
        
        # 2. Sentiment Analysis
        score = 0
        pos_words = ["surge", "jump", "rally", "gain", "profit", "optimism", "beat", "strong", "growth", "high", "bull", "breakthrough", "launch"]
        neg_words = ["drop", "crash", "loss", "fear", "recession", "inflation", "war", "conflict", "down", "miss", "weak", "bear", "crisis", "fall"]
        
        for w in pos_words:
            if w in text: score += 1
        for w in neg_words:
            if w in text: score -= 1
            
        if score > 0: sentiment = "Bullish"
        elif score < 0: sentiment = "Bearish"
        else: sentiment = "Neutral"
        
        return impact, sentiment

    @staticmethod
    def get_latest_news():
        # RSS Cache (15 minutes = 900 seconds)
        if NewsService._cache and (time.time() - NewsService._last_fetch < 900):
            return NewsService._cache

        news_items = []
        
        # Real-Time RSS Feeds
        rss_feeds = [
            "https://finance.yahoo.com/news/rssindex",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664"
        ]

        try:
            for feed_url in rss_feeds:
                feed = feedparser.parse(feed_url)
                if feed.entries:
                    for entry in feed.entries[:5]: # Take top 5 from each
                        # NLP Analysis
                        full_text = (entry.title + " " + (entry.summary if 'summary' in entry else "")).lower()
                        impact, sentiment = NewsService.analyze_impact(full_text)
                        
                        # Image extraction (basic)
                        image_url = None
                        if 'media_content' in entry:
                            image_url = entry.media_content[0]['url']
                        
                        news_items.append({
                            "title": entry.title,
                            "summary": entry.summary if 'summary' in entry else entry.title,
                            "url": entry.link,
                            "source": feed.feed.title if 'title' in feed.feed else "News Feed",
                            "sentiment": sentiment,
                            "impact": impact,
                            "timestamp": entry.published if 'published' in entry else "Just now"
                        })
        except Exception as e:
            print(f"RSS Error: {e}")

        # If data fetched successfully
        if news_items:
            # Shuffle to mix sources
            random.shuffle(news_items)
            NewsService._cache = news_items[:10] # Keep top 10
            NewsService._last_fetch = time.time()
            return NewsService._cache

        # Fallback to Mock Data (2026 Stories)
        fallback_items = []
        for key, article in NewsService.MOCK_ARTICLES.items():
            # Run NLP on mock data too for consistency
            full_text = (article["title"] + " " + article["text"]).lower()
            impact, sentiment = NewsService.analyze_impact(full_text)

            fallback_items.append({
                "title": article["title"],
                "summary": article["text"][:100] + "...",
                "url": key,
                "source": "Global Wire (2026)",
                "sentiment": sentiment, 
                "impact": impact,
                "timestamp": article["publish_date"]
            })
            
        NewsService._cache = fallback_items
        NewsService._last_fetch = time.time()
        return fallback_items

    @staticmethod
    def get_article_content(url):
        """
        Extracts full article content.
        """
        if not url:
            return {"error": "Invalid URL"}

        # 1. Check for Mock Data
        if url in NewsService.MOCK_ARTICLES:
            return NewsService.MOCK_ARTICLES[url]

        # 2. Check for http
        if not url.startswith('http'):
             return {"error": "Invalid Article URL"}

        # 3. Use newspaper3k for real URLs
        try:
            from newspaper import Article
            article = Article(url)
            article.download()
            article.parse()
            
            return {
                "title": article.title,
                "text": article.text,
                "image": article.top_image,
                "authors": article.authors,
                "publish_date": str(article.publish_date) if article.publish_date else None
            }
        except Exception as e:
            return {"error": str(e)}
