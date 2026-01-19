# Design Decisions for TradeSense Quant

This document outlines the key design decisions made during the development of TradeSense Quant.

## 1. Architecture and Tech Stack

### Backend Architecture
- **Flask with Blueprints**: Used for clean separation of concerns and modular API endpoints
- **Service Layer Pattern**: Business logic is separated from API layer for better testability and maintainability
- **Provider Adapter Pattern**: Market data providers are abstracted behind a common interface

### Frontend Architecture
- **Next.js with TypeScript**: Provides server-side rendering, type safety, and optimized production builds
- **Component-Based Structure**: Reusable UI components organized by feature
- **API Service Layer**: Centralized API calls with type safety

## 2. Equity and Risk Calculations

### Equity Definition
- **Total Equity** = Balance + Unrealized PnL
- Unrealized PnL is calculated by marking open positions to current market prices

### Drawdown Calculations
- **Daily Drawdown** = (daily_start_equity - current_equity) / daily_start_equity
- **Total Drawdown** = (initial_balance - current_equity) / initial_balance
- **Daily Start Equity** is reset at 00:00 Africa/Casablanca timezone

### Risk Management Rules
- Daily Max Loss: 5% (configurable per challenge)
- Total Max Loss: 10% (configurable per challenge)
- Profit Target: 10% (configurable per challenge)
- Auto-evaluation after each trade and at price refresh intervals

## 3. Data Modeling

### Challenge State Management
- Challenges have explicit states: IN_PROGRESS, FAILED, PASSED, STOPPED
- State transitions are handled by the risk service based on evaluation rules
- Evaluation logs are stored for explainability

### Position Management
- Positions are tracked by instrument and challenge
- Support for both long and short positions
- FIFO (First In, First Out) order management for position closing

## 4. Caching Strategy

### Cache Implementation
- **In-Memory Cache**: Used when Redis is not available
- **Redis Cache**: Used in production for distributed caching
- **TTL Configuration**: 
  - Quotes: 10 seconds
  - OHLCV: 60 seconds

### Cache Key Strategy
- Cache keys are constructed as: `{data_type}_{provider}_{instrument}_{timeframe}_{limit}`
- Only "hot" instruments (currently viewed + watchlist items) are refreshed

## 5. Market Data Providers

### Provider Abstraction
- All providers implement the BaseProvider interface
- Common methods: get_quote(), get_ohlcv(), get_supported_instruments(), health()
- Provider-specific configurations are handled in the config module

### Provider-Specific Implementations
- **Binance**: Uses public REST API endpoints
- **MT5**: Uses MetaTrader5 Python package with local terminal
- **Morocco**: Web scraping with fallback to cached values

## 6. Security Considerations

### Authentication
- JWT-based authentication with access and refresh tokens
- Passwords are hashed using bcrypt
- Rate limiting on authentication endpoints

### Authorization
- JWT tokens are validated on protected endpoints
- Users can only access their own data
- Role-based access is planned but not implemented in MVP

## 7. Error Handling and Logging

### Error Response Format
- Consistent error response structure: `{"error": "error message"}`
- Appropriate HTTP status codes (400, 401, 404, 500)

### Logging Strategy
- Structured logging with appropriate log levels
- Sensitive information is not logged
- Provider-specific errors are logged for debugging

## 8. Performance Optimization

### Database Queries
- Use of appropriate indexes on frequently queried fields
- Eager loading for related entities to avoid N+1 queries
- Pagination for large result sets

### Frontend Performance
- Code splitting with Next.js
- Lazy loading of non-critical components
- Client-side caching of API responses

## 9. Testing Strategy

### Backend Testing
- Unit tests for risk service and provider adapters
- Integration tests for API endpoints
- Mock services for external dependencies

### Frontend Testing
- Component tests for UI components
- Integration tests for API service calls
- End-to-end tests for critical user flows (planned)

## 10. Deployment and DevOps

### Containerization
- Docker containers for consistent deployment environments
- Docker Compose for local development
- Multi-stage builds for optimized production images

### Database Migrations
- Flask-Migrate for database schema management
- Migration scripts included in repository
- Environment-specific configurations

## 11. Future Enhancements

### Planned Features
- WebSocket support for real-time updates
- Advanced order types (limit, stop-loss)
- Backtesting engine
- More sophisticated risk metrics
- Multi-language support

### Scalability Considerations
- Horizontal scaling of API servers
- Database read replicas
- CDN for static assets
- Message queues for background processing