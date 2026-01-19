# TradeSense Quant

TradeSense Quant is a professional quantitative trading simulator with multi-asset support (FX, Crypto, Stocks) and prop-firm challenge engine. Built with Python Flask backend and React Next.js frontend.

## Features

- **Multi-Asset Trading**: Support for FX (via MT5), Crypto (via Binance), and Casablanca stocks (via Morocco data provider)
- **Challenge Engine**: Prop-firm style challenges with risk management rules, drawdown limits, and profit targets
- **Real-Time Data**: Live market data from multiple providers with caching
- **Advanced Charting**: TradingView Lightweight Charts for technical analysis
- **Risk Management**: Daily/total drawdown limits, position sizing tools
- **Leaderboards**: Monthly and all-time performance leaderboards
- **Learning Hub**: Quantitative trading education modules
- **Mock Payment System**: With optional PayPal integration

## Tech Stack

- **Backend**: Python Flask with Blueprints, REST API, SQLAlchemy ORM
- **Frontend**: React with Next.js, TypeScript, Tailwind CSS
- **Database**: PostgreSQL (production) / SQLite (development)
- **Charts**: TradingView Lightweight Charts
- **Authentication**: JWT-based authentication
- **Caching**: Redis (optional) or in-memory caching

## Project Structure

```
TradeSense-Quant/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── models/          # Database models
│   │   ├── services/        # Business logic services
│   │   ├── providers/       # Market data providers
│   │   ├── api/             # API blueprints
│   │   └── utils/           # Utility functions
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── src/
│   │   ├── pages/           # Next.js pages
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   └── styles/          # CSS styles
│   └── Dockerfile
├── docker-compose.yml
├── database.sql
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 18+
- Docker and Docker Compose (optional, for containerized deployment)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- On Windows: `venv\Scripts\activate`
- On macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

6. Update the `.env` file with your configuration

7. Run the application:
```bash
python run.py
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file based on `.env.example`:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

### Docker Setup

1. Build and run the application with Docker Compose:
```bash
docker-compose up --build
```

The application will be available at:
- Backend API: http://localhost:5000
- Frontend: http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user

### Market Data
- `GET /api/v1/market/instruments` - Get available instruments
- `GET /api/v1/market/quote?instrument_id=` - Get current quote
- `GET /api/v1/market/ohlcv?instrument_id=&timeframe=&limit=` - Get OHLCV data
- `GET /api/v1/market/health` - Check provider health

### Challenges
- `GET /api/v1/challenges` - Get available challenges
- `POST /api/v1/challenges/start` - Start a challenge
- `GET /api/v1/challenges/{id}` - Get challenge status
- `POST /api/v1/challenges/{id}/trade` - Execute trade
- `GET /api/v1/challenges/{id}/trades` - Get challenge trades
- `GET /api/v1/challenges/{id}/positions` - Get challenge positions
- `GET /api/v1/challenges/{id}/equity` - Get equity history

### Leaderboard
- `GET /api/v1/leaderboard/monthly` - Monthly leaderboard
- `GET /api/v1/leaderboard/all-time` - All-time leaderboard

### Learning
- `GET /api/v1/learning/modules` - Get learning modules
- `GET /api/v1/learning/modules/{id}` - Get learning module
- `POST /api/v1/learning/quizzes/{id}/attempt` - Attempt quiz

## Design Decisions

### Equity and Drawdown Calculation
- **Equity**: balance + unrealized_pnl (open positions marked to market)
- **Daily Start Equity**: equity at 00:00 Africa/Casablanca (or at challenge start if same day)
- **Daily Drawdown**: (daily_start_equity - min_equity_today) / daily_start_equity
- **Total Drawdown**: (initial_balance - min_equity_all_time) / initial_balance
- **Profit**: (current_equity - initial_balance) / initial_balance

### Caching Strategy
- Quotes cache TTL: 10 seconds per instrument
- Candles cache TTL: 60 seconds per (instrument,timeframe)
- Only refresh "hot" instruments (currently viewed + in user watchlists)

### Provider Fallbacks
- Primary: Real API calls to providers
- Secondary: Cached values with manual refresh endpoint
- Tertiary: Simulated values for demo safety

## Development

### Running Tests
```bash
cd backend
python -m pytest tests/
```

### Database Migrations
```bash
cd backend
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

## Deployment

For production deployment, update the environment variables and use the docker-compose.prod.yml file (not included in this repo but can be created based on the development compose file).

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.