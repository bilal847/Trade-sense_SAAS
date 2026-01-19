from flask import Blueprint, jsonify

swagger_bp = Blueprint('swagger', __name__)


@swagger_bp.route('/spec')
def spec():
    """API specification in JSON format."""
    spec_json = {
        "openapi": "3.0.0",
        "info": {
            "title": "TradeSense Quant API",
            "description": "API for the TradeSense Quant trading platform",
            "version": "1.0.0"
        },
        "servers": [
            {
                "url": "/api/v1"
            }
        ],
        "paths": {
            "/auth/register": {
                "post": {
                    "summary": "Register a new user",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "email": {"type": "string"},
                                        "password": {"type": "string"},
                                        "first_name": {"type": "string"},
                                        "last_name": {"type": "string"}
                                    },
                                    "required": ["email", "password"]
                                }
                            }
                        }
                    },
                    "responses": {
                        "201": {"description": "User registered successfully"}
                    }
                }
            },
            "/auth/login": {
                "post": {
                    "summary": "Login user",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "email": {"type": "string"},
                                        "password": {"type": "string"}
                                    },
                                    "required": ["email", "password"]
                                }
                            }
                        }
                    },
                    "responses": {
                        "200": {"description": "Login successful"}
                    }
                }
            },
            "/market/instruments": {
                "get": {
                    "summary": "Get supported instruments",
                    "responses": {
                        "200": {"description": "List of instruments"}
                    }
                }
            },
            "/challenges": {
                "get": {
                    "summary": "Get available challenges",
                    "responses": {
                        "200": {"description": "List of challenges"}
                    }
                }
            }
        }
    }
    return jsonify(spec_json)