from flask import Blueprint, jsonify, request
from app.services.news_service import NewsService
from app.services.quant_service import QuantService

news_bp = Blueprint('news', __name__)
quant_bp = Blueprint('quant', __name__)

@news_bp.route('/', methods=['GET'])
def get_news():
    try:
        news = NewsService.get_latest_news()
        return jsonify({"status": "success", "news": news}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@news_bp.route('/read', methods=['POST'])
def read_news():
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({"status": "error", "message": "URL required"}), 400
    
    content = NewsService.get_article_content(url)
    if "error" in content:
        # If scraper fails, we return error but frontend can just show 'Read Source' link
        return jsonify({"status": "error", "message": content["error"]}), 200 # Return 200 so fontend handles it gracefully
        
    return jsonify({"status": "success", "article": content}), 200

@quant_bp.route('/analyze/<int:instrument_id>', methods=['GET'])
def analyze_instrument(instrument_id):
    try:
        analysis = QuantService.analyze_instrument(instrument_id)
        return jsonify({"status": "success", "analysis": analysis}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@quant_bp.route('/analyze-ensemble/<int:instrument_id>', methods=['GET'])
def analyze_instrument_ensemble(instrument_id):
    try:
        analysis = QuantService.analyze_instrument_ensemble(instrument_id)
        return jsonify({"status": "success", "analysis": analysis}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
