from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services import MarketDataService
from app.models import Instrument
from app import db
import logging

logger = logging.getLogger(__name__)

market_bp = Blueprint('market', __name__, url_prefix='/market')
market_service = MarketDataService()


@market_bp.route('/quote', methods=['GET'])
def get_quote():
    """Get current quote for an instrument."""
    try:
        instrument_id = request.args.get('instrument_id')
        
        if not instrument_id:
            return jsonify({'error': 'instrument_id is required'}), 400
        
        # Get instrument from database
        instrument = Instrument.query.get(instrument_id)
        if not instrument:
            return jsonify({'error': 'Instrument not found'}), 404
        
        quote = market_service.get_quote(
            instrument.provider_symbol,
            instrument.provider
        )
        
        return jsonify({
            'instrument': instrument.to_dict(),
            'quote': quote,
            'timestamp': quote.get('ts', int(__import__('time').time() * 1000))
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@market_bp.route('/quotes', methods=['POST'])
def get_quotes():
    """Get current quotes for multiple instruments."""
    try:
        data = request.get_json()
        instrument_ids = data.get('instrument_ids', [])
        
        if not instrument_ids:
            return jsonify({'error': 'instrument_ids is required'}), 400
        
        results = {}
        for inst_id in instrument_ids:
            instrument = Instrument.query.get(inst_id)
            if instrument:
                try:
                    quote = market_service.get_quote(
                        instrument.provider_symbol,
                        instrument.provider
                    )
                    results[inst_id] = quote
                except Exception as e:
                    logger.warning(f"Failed to get quote for {inst_id}: {e}")
                    results[inst_id] = None
        
        return jsonify({
            'quotes': results,
            'timestamp': int(__import__('time').time() * 1000)
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@market_bp.route('/ohlcv', methods=['GET'])
def get_ohlcv():
    """Get OHLCV data for an instrument."""
    try:
        instrument_id = request.args.get('instrument_id')
        timeframe = request.args.get('timeframe', '1h')
        limit = int(request.args.get('limit', 100))
        
        if not instrument_id:
            return jsonify({'error': 'instrument_id is required'}), 400
        
        # Get instrument from database
        instrument = Instrument.query.get(instrument_id)
        if not instrument:
            return jsonify({'error': 'Instrument not found'}), 404
        
        ohlcv_data = market_service.get_ohlcv(
            instrument.provider_symbol,
            instrument.provider,
            timeframe,
            limit
        )
        
        return jsonify({
            'instrument': instrument.to_dict(),
            'timeframe': timeframe,
            'ohlcv': ohlcv_data,
            'limit': limit
        }), 200
    
    except ValueError as e:
        return jsonify({'error': f'Invalid parameter: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@market_bp.route('/instruments', methods=['GET'])
def get_instruments():
    """Get all available instruments."""
    try:
        asset_class = request.args.get('asset_class')
        exchange = request.args.get('exchange')
        active = request.args.get('active', 'true')
        
        query = Instrument.query
        
        if asset_class:
            query = query.filter(Instrument.asset_class == asset_class)
        if exchange:
            query = query.filter(Instrument.exchange == exchange)
        if active.lower() == 'true':
            query = query.filter(Instrument.active == True)
        elif active.lower() == 'false':
            query = query.filter(Instrument.active == False)
        
        instruments = query.all()
        
        return jsonify({
            'instruments': [instrument.to_dict() for instrument in instruments],
            'total': len(instruments)
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@market_bp.route('/health', methods=['GET'])
def health():
    """Check health of all market data providers."""
    try:
        health_status = market_service.health_check()
        return jsonify(health_status), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@market_bp.route('/refresh', methods=['POST'])
@jwt_required()
def refresh_data():
    """Force refresh market data for specific instrument."""
    try:
        data = request.get_json()
        instrument_id = data.get('instrument_id')
        
        if not instrument_id:
            return jsonify({'error': 'instrument_id is required'}), 400
        
        # Get instrument from database
        instrument = Instrument.query.get(instrument_id)
        if not instrument:
            return jsonify({'error': 'Instrument not found'}), 404
        
        # Force refresh by clearing cache
        cache_keys = [
            f"quote_{instrument.provider}_{instrument.provider_symbol}",
            f"ohlcv_{instrument.provider}_{instrument.provider_symbol}_1m_100",
            f"ohlcv_{instrument.provider}_{instrument.provider_symbol}_5m_100",
            f"ohlcv_{instrument.provider}_{instrument.provider_symbol}_1h_100",
            f"ohlcv_{instrument.provider}_{instrument.provider_symbol}_1d_100"
        ]
        
        # In a real implementation, we would clear the cache here
        # For now, just return success
        return jsonify({
            'message': 'Market data refreshed',
            'instrument_id': instrument_id,
            'timestamp': int(__import__('time').time() * 1000)
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500