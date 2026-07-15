# ============================================================
# KJs TRD Trading Terminal - Backend Server
# ============================================================

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os

app = Flask(__name__, static_folder='../')
CORS(app)

# ============================================================
# Routes
# ============================================================

@app.route('/')
def serve_index():
    return send_from_directory('../', 'index.html')

@app.route('/chart.html')
def serve_chart():
    return send_from_directory('../', 'chart.html')

@app.route('/api/status')
def get_status():
    return jsonify({
        "status": "running",
        "runtime": "online",
        "market_data": "connected",
        "broker": "dhan",
        "notification": "telegram",
        "database": "connected",
        "uptime": "2h 14m",
        "memory": "342MB",
        "running_modules": 4
    })

@app.route('/api/modules')
def get_modules():
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
    return jsonify({
        "status": "success",
        "message": f"Module '{module_name}' started successfully",
        "module": module_name
    })

@app.route('/api/stop_module/<module_name>', methods=['POST'])
def stop_module(module_name):
    return jsonify({
        "status": "success",
        "message": f"Module '{module_name}' stopped",
        "module": module_name
    })

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 KJs TRD Trading Terminal - Backend Server")
    print("=" * 50)
    print("📊 Server running at: http://localhost:5000")
    print("📈 API available at: http://localhost:5000/api/status")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)