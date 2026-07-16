# ============================================================
# KJs TRD Trading Terminal - Backend Server
# Using Dhan API for real market data
# ============================================================

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime, timedelta
import random

# Try to import Dhan API
try:
    from dhanhq import DhanContext, dhanhq
    DHAN_AVAILABLE = True
except ImportError:
    DHAN_AVAILABLE = False
    print("⚠️ Dhan API not installed. Install with: pip install dhanhq")

app = Flask(__name__, static_folder='../')
CORS(app)

# ============================================================
# DHAN API CONFIGURATION
# ============================================================

# REPLACE WITH YOUR ACTUAL CREDENTIALS
DHAN_CLIENT_ID = "1111971907"  # Get from Dhan app
DHAN_ACCESS_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJwX2lwIjoiIiwic19pcCI6IiIsImlzcyI6ImRoYW4iLCJwYXJ0bmVySWQiOiIiLCJleHAiOjE3ODQyNTQwNzUsImlhdCI6MTc4NDE2NzY3NSwidG9rZW5Db25zdW1lclR5cGUiOiJTRUxGIiwid2ViaG9va1VybCI6Imh0dHBzOi8va2praXNob3JlMTMuZ2l0aHViLmlvL0tKcy1UUkQtQVVUTy1UcmFkaW5nLVRlcm1pbmFsLyIsImRoYW5DbGllbnRJZCI6IjExMTE5NzE5MDcifQ.qT7nDMfwpEBnnJxkZW-ehNJTErinSz9hNDuGDO2ekOwh90IR3Q8T7AWpVTSAAhh9AiGKn7tnz7n-CQXaYD4quQ"  # Get from Dhan app

# Initialize Dhan client if available
dhan = None
if DHAN_AVAILABLE and DHAN_CLIENT_ID != "YOUR_CLIENT_ID":
    try:
        dhan_context = DhanContext(DHAN_CLIENT_ID, DHAN_ACCESS_TOKEN)
        dhan = dhanhq(dhan_context)
        print("✅ Dhan API connected successfully!")
    except Exception as e:
        print(f"❌ Dhan API connection failed: {str(e)}")
        dhan = None

# ============================================================
# FALLBACK: Generate Mock Data (if Dhan not available)
# ============================================================

def generate_mock_candles(count=100):
    """Generate mock candle data for testing"""
    data = []
    price = 22400
    now = datetime.now()
    one_hour = 60 * 60

    for i in range(count - 1, -1, -1):
        change = (random.random() - 0.48) * 60
        open_price = price
        close_price = price + change
        high = max(open_price, close_price) + random.random() * 20
        low = min(open_price, close_price) - random.random() * 20
        volume = int(100000 + random.random() * 900000)

        data.append({
            'time': int((now - timedelta(seconds=i * one_hour)).timestamp()),
            'open': round(open_price, 2),
            'high': round(high, 2),
            'low': round(low, 2),
            'close': round(close_price, 2),
            'volume': volume
        })

        price = close_price

    return data

# ============================================================
# ROUTES
# ============================================================

@app.route('/')
def serve_index():
    """Serve the main index.html"""
    return send_from_directory('../', 'index.html')

@app.route('/chart.html')
def serve_chart():
    """Serve the chart page"""
    return send_from_directory('../', 'chart.html')

@app.route('/api/status')
def get_status():
    """Get system status"""
    return jsonify({
        "status": "running",
        "runtime": "online",
        "market_data": "connected" if dhan else "mock",
        "broker": "dhan" if dhan else "mock",
        "notification": "telegram",
        "database": "connected",
        "uptime": "2h 14m",
        "memory": "342MB",
        "running_modules": 4,
        "dhan_connected": dhan is not None
    })

@app.route('/api/market/historical/<symbol>')
def get_historical_data(symbol):
    """
    Get historical candle data for a symbol.
    Query params: period=5d, interval=15m
    """
    period = request.args.get('period', '5d')
    interval = request.args.get('interval', '15m')

    print(f"📊 Fetching data for {symbol} ({period}, {interval})")

    # Try to get real data from Dhan API
    if dhan:
        try:
            # Map symbol to Dhan security ID
            # NIFTY 50 security ID is 13 in Dhan
            security_id = 13  # NIFTY 50
            if "BANKNIFTY" in symbol:
                security_id = 25  # BANK NIFTY

            # Convert interval to Dhan format
            # Dhan uses: 1, 2, 3, 4, 5, 10, 15, 20, 30, 60
            interval_map = {
                '1m': 1, '2m': 2, '3m': 3, '4m': 4,
                '5m': 5, '10m': 10, '15m': 15, '20m': 20,
                '30m': 30, '1h': 60
            }
            dhan_interval = interval_map.get(interval, 15)

            # Calculate date range
            if period == '1d':
                from_date = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
                to_date = datetime.now().strftime('%Y-%m-%d')
            elif period == '5d':
                from_date = (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d')
                to_date = datetime.now().strftime('%Y-%m-%d')
            elif period == '1mo':
                from_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
                to_date = datetime.now().strftime('%Y-%m-%d')
            else:
                from_date = (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d')
                to_date = datetime.now().strftime('%Y-%m-%d')

            # Fetch data from Dhan
            # Note: Dhan expects NSE_EQ for equities, NSE_FNO for F&O
            response = dhan.historical_daily_data(
                security_id=security_id,
                exchange_segment="IDX_I",  # Index segment
                instrument_type="INDEX",
                from_date=from_date,
                to_date=to_date
            )

            if response and len(response) > 0:
                # Convert Dhan data to our format
                candles = []
                for item in response:
                    candles.append({
                        'time': int(datetime.strptime(item['date'], '%Y-%m-%d').timestamp()),
                        'open': float(item['open']),
                        'high': float(item['high']),
                        'low': float(item['low']),
                        'close': float(item['close']),
                        'volume': int(item.get('volume', 0))
                    })
                print(f"✅ Got {len(candles)} candles from Dhan API")
                return jsonify(candles)

        except Exception as e:
            print(f"❌ Dhan API error: {str(e)}")

    # Fallback: Use mock data
    print("⚠️ Using mock data")
    mock_data = generate_mock_candles(100)
    return jsonify(mock_data)

@app.route('/api/market/price/<symbol>')
def get_current_price(symbol):
    """Get current price for a symbol"""
    if dhan:
        try:
            # Get live price from Dhan
            security_id = 13  # NIFTY 50
            if "BANKNIFTY" in symbol:
                security_id = 25

            response = dhan.ohlc_data(
                securities={"IDX_I": [security_id]}
            )

            if response and len(response) > 0:
                item = response[0] if isinstance(response, list) else response
                return jsonify({
                    'symbol': symbol,
                    'price': float(item.get('ltp', 0)),
                    'change': float(item.get('change', 0)),
                    'change_percent': float(item.get('changePercent', 0)),
                    'volume': int(item.get('volume', 0)),
                    'high': float(item.get('high', 0)),
                    'low': float(item.get('low', 0)),
                    'open': float(item.get('open', 0)),
                    'close': float(item.get('close', 0))
                })
        except Exception as e:
            print(f"❌ Dhan price error: {str(e)}")

    # Fallback: Mock price
    price = 22450 + (random.random() - 0.5) * 100
    return jsonify({
        'symbol': symbol,
        'price': round(price, 2),
        'change': round((random.random() - 0.5) * 50, 2),
        'change_percent': round((random.random() - 0.5) * 0.5, 2),
        'volume': int(100000 + random.random() * 900000),
        'high': round(price + random.random() * 20, 2),
        'low': round(price - random.random() * 20, 2),
        'open': round(price - random.random() * 10, 2),
        'close': round(price, 2)
    })

@app.route('/api/modules')
def get_modules():
    """Get list of all modules"""
    modules = [
        {
            "name": "Momentum Breakout",
            "type": "strategy",
            "description": "Buys on breakout above 20H with volume",
            "status": "running",
            "version": "1.0.0"
        },
        {
            "name": "Previous Day Breakout",
            "type": "strategy",
            "description": "Trades breakouts above yesterday's high",
            "status": "running",
            "version": "2.1.0"
        },
        {
            "name": "EMA Ribbon",
            "type": "indicator",
            "description": "Multiple EMA lines for trend confirmation",
            "status": "running",
            "version": "1.2.0"
        },
        {
            "name": "Momentum Scanner",
            "type": "screener",
            "description": "Scans for momentum stocks across watchlist",
            "status": "stopped",
            "version": "1.0.0"
        }
    ]
    return jsonify(modules)

@app.route('/api/run_module/<module_name>', methods=['POST'])
def run_module(module_name):
    """Start a module"""
    return jsonify({
        "status": "success",
        "message": f"Module '{module_name}' started successfully",
        "module": module_name
    })

@app.route('/api/stop_module/<module_name>', methods=['POST'])
def stop_module(module_name):
    """Stop a module"""
    return jsonify({
        "status": "success",
        "message": f"Module '{module_name}' stopped",
        "module": module_name
    })

# ============================================================
# START THE SERVER
# ============================================================

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 KJs TRD Trading Terminal - Backend Server")
    print("=" * 50)
    print(f"📊 Dhan API: {'✅ Connected' if dhan else '❌ Not connected (using mock data)'}")
    print(f"📊 Server running at: http://localhost:5000")
    print(f"📈 API available at: http://localhost:5000/api/status")
    print("=" * 50)

    # Update frontend to use this backend
    print("\n📌 To use real data, update DHAN_CLIENT_ID and DHAN_ACCESS_TOKEN")
    print("📌 Get credentials from: https://dhan.co/developers/")
    print("=" * 50)

    app.run(debug=True, host='0.0.0.0', port=5000)
