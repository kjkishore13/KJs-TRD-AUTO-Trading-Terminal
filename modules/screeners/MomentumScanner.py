# ============================================================
# KJs TRD Trading Terminal - Momentum Scanner
# ============================================================

"""
Momentum Scanner - Scans for momentum stocks across watchlist.
"""

class MomentumScanner:
    """Momentum Scanner Module"""

    name = "Momentum Scanner"
    type = "screener"
    version = "1.0.0"
    author = "KJ"
    description = "Scans for momentum stocks across watchlist"

    def __init__(self):
        self.period = 20
        self.volume_threshold = 1.5
        self.min_price = 50
        self.results = []

    def initialize(self, context):
        """Initialize the scanner"""
        print(f"✅ {self.name} initialized")
        print(f"📊 Period: {self.period}")
        print(f"📊 Volume Threshold: {self.volume_threshold}x")
        return True

    def scan(self, watchlist, market_data):
        """
        Scan a watchlist for momentum stocks.
        
        Args:
            watchlist: List of symbols to scan
            market_data: Market data engine instance
        
        Returns:
            list: Matching symbols with data
        """
        results = []

        for symbol in watchlist:
            try:
                # Get historical data
                candles = market_data.get_candles(symbol, count=self.period + 10)
                
                if not candles or len(candles) < self.period:
                    continue

                # Get last N candles
                recent = candles[-self.period:]
                current = candles[-1]
                previous = candles[-2]

                # Check price condition
                if current['close'] < self.min_price:
                    continue

                # Calculate momentum
                price_change = ((current['close'] - recent[0]['close']) / recent[0]['close']) * 100
                
                # Calculate volume
                avg_volume = sum(c['volume'] for c in recent) / self.period
                volume_spike = current['volume'] > avg_volume * self.volume_threshold

                # Check breakout
                high_20 = max(c['high'] for c in recent)
                is_breakout = current['close'] > high_20

                # Check if conditions are met
                if price_change > 5 and (volume_spike or is_breakout):
                    result = {
                        'symbol': symbol,
                        'price': current['close'],
                        'change': round(price_change, 2),
                        'volume': current['volume'],
                        'avg_volume': int(avg_volume),
                        'volume_ratio': round(current['volume'] / avg_volume, 2),
                        'is_breakout': is_breakout,
                        'high_20': high_20,
                        'momentum_score': self._calculate_score(price_change, volume_spike, is_breakout)
                    }
                    results.append(result)

            except Exception as e:
                print(f"Error scanning {symbol}: {str(e)}")
                continue

        # Sort by momentum score (highest first)
        results.sort(key=lambda x: x['momentum_score'], reverse=True)
        self.results = results
        
        return results

    def _calculate_score(self, price_change, volume_spike, is_breakout):
        """Calculate momentum score for a stock."""
        score = 0
        
        # Price change contribution
        if price_change > 10:
            score += 30
        elif price_change > 5:
            score += 20
        else:
            score += 10
        
        # Volume spike contribution
        if volume_spike:
            score += 30
        
        # Breakout contribution
        if is_breakout:
            score += 20
        
        # Additional bonus for strong combination
        if price_change > 10 and volume_spike and is_breakout:
            score += 20
        
        return min(score, 100)  # Cap at 100

    def get_results(self):
        """Get the latest scan results."""
        return self.results

    def get_top_momentum(self, limit=10):
        """Get top momentum stocks."""
        return self.results[:limit]

    def on_candle(self, candle, context):
        """
        Called when a new candle is received.
        For scanners, this can trigger a re-scan.
        """
        # Scanner doesn't process individual candles
        pass

    def on_stop(self):
        """Called when scanner stops"""
        print(f"🛑 {self.name} stopped")
        return True

    def get_settings(self):
        """Return scanner settings"""
        return {
            'period': self.period,
            'volume_threshold': self.volume_threshold,
            'min_price': self.min_price
        }

    def update_settings(self, settings):
        """Update scanner settings"""
        if 'period' in settings:
            self.period = settings['period']
        if 'volume_threshold' in settings:
            self.volume_threshold = settings['volume_threshold']
        if 'min_price' in settings:
            self.min_price = settings['min_price']
        return True
