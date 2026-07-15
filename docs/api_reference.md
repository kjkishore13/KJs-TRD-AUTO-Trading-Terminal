# KJs TRD Trading Terminal - API Reference

## Base URL

## Authentication

Currently, the API uses a simple API key header:

---

## Endpoints

### 1. System Status

**GET** `/api/status`

Returns the current system status.

**Response:**
```json
{
    "status": "running",
    "runtime": "online",
    "market_data": "connected",
    "broker": "dhan",
    "notification": "telegram",
    "database": "connected",
    "uptime": "2h 14m",
    "memory": "342MB",
    "running_modules": 4
}[
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
    }
]{
    "name": "Momentum Breakout",
    "type": "strategy",
    "version": "1.0.0",
    "author": "KJ",
    "description": "Buys when price breaks above 20-period high",
    "status": "running",
    "settings": {
        "period": 20,
        "volume_threshold": 1.5
    }
}{
    "status": "success",
    "message": "Module 'Momentum Breakout' started successfully",
    "module": "Momentum Breakout"
}{
    "status": "success",
    "message": "Module 'Momentum Breakout' stopped",
    "module": "Momentum Breakout"
}{
    "status": "success",
    "message": "Module 'Momentum Breakout' paused",
    "module": "Moment[
    {
        "id": "ORD_20260115_123456",
        "symbol": "NIFTY 50",
        "quantity": 10,
        "order_type": "BUY",
        "price": 22450,
        "status": "executed",
        "timestamp": "2026-01-15T12:34:56"
    }
]{
    "id": "ORD_20260115_123456",
    "status": "executed",
    "filled_quantity": 10,
    "price": 22450,
    "timestamp": "2026-01-15T12:34:56"
}{
    "status": "success",
    "message": "Order cancelled",
    "order_id": "ORD_20260115_123456"
}{
    "balance": 1000000,
    "equity": 1024500,
    "pnl": 24500,
    "positions": [
        {
            "symbol": "NIFTY 50",
            "quantity": 10,
            "average_price": 22450,
            "current_price": 22550,
            "pnl": 1000
        }
    ],
    "total_trades": 15,
    "win_rate": 65.5
}[
    {
        "symbol": "NIFTY 50",
        "quantity": 10,
        "average_price": 22450,
        "current_price": 22550,
        "pnl": 1000,
        "entry_time": "2026-01-15T10:30:00"
    }
]{
    "module_name": "Momentum Breakout",
    "symbol": "NIFTY 50",
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "initial_capital": 100000
}{
    "module_name": "Momentum Breakout",
    "symbol": "NIFTY 50",
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "total_trades": 45,
    "win_rate": 62.5,
    "profit_factor": 1.8,
    "total_pnl": 24500,
    "max_drawdown": 12.5,
    "return_percent": 24.5,
    "final_equity": 124500
}{
    "module_name": "Momentum Breakout",
    "symbol": "NIFTY 50",
    "total_trades": 45,
    "win_rate": 62.5,
    "profit_factor": 1.8,
    "total_pnl": 24500,
    "max_drawdown": 12.5,
    "return_percent": 24.5
}{
    "symbol": "NIFTY 50",
    "price": 22450.75,
    "change": 142.30,
    "change_percent": 0.64,
    "volume": 1250000,
    "high": 22500.00,
    "low": 22350.00,
    "open": 22308.45,
    "close": 22450.75
}[
    {
        "time": 1705305600,
        "open": 22300,
        "high": 22450,
        "low": 22250,
        "close": 22450,
        "volume": 1000000
    }
]{
    "channel": "telegram",
    "message": "BUY Signal for NIFTY 50 at 22450",
    "data": {
        "symbol": "NIFTY 50",
        "price": 22450,
        "signal": "BUY"
    }
}{
    "status": "success",
    "message": "Notification sent",
    "notification_id": "NOTIF_20260115_123456"
}[
    {
        "id": "NOTIF_20260115_123456",
        "channel": "telegram",
        "message": "BUY Signal for NIFTY 50 at 22450",
        "status": "sent",
        "timestamp": "2026-01-15T12:34:56"
    }
][
    {
        "id": 1,
        "name": "Nifty 50",
        "symbols": ["NIFTY 50", "BANKNIFTY", "RELIANCE", "TCS", "HDFC"]
    }
]{
    "name": "My Favorites",
    "symbols": ["NIFTY 50", "BANKNIFTY"]
}{
    "status": "success",
    "id": 2,
    "name": "My Favorites",
    "symbols": ["NIFTY 50", "BANKNIFTY"]
}{
    "error": true,
    "message": "Error description",
    "code": "ERROR_CODE"
}
### Step 4: Click **"Commit new file"**

---

## ✅ File #35 DONE!

---

## Tell Me: **"Next"** for File #36: `docs/module_development.md` 🚀um Breakout"
}{
    "status": "success",
    "message": "Module 'Momentum Breakout' resumed",
    "module": "Momentum Breakout"
}{
    "symbol": "NIFTY 50",
    "quantity": 10,
    "order_type": "BUY",
    "price": 22450,
    "type": "MARKET"
}{
    "id": "ORD_20260115_123456",
    "symbol": "NIFTY 50",
    "quantity": 10,
    "order_type": "BUY",
    "price": 22450,
    "status": "executed",
    "timestamp": "2026-01-15T12:34:56"
}
