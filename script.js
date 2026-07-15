// ============================================================
// KJs TRD TRADING TERMINAL - JAVASCRIPT
// ============================================================

// ------------------------------------------------
// 1. NAVIGATION
// ------------------------------------------------
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

navItems.forEach(item => {
    item.addEventListener('click', function() {
        // Remove active from all nav items
        navItems.forEach(n => n.classList.remove('active'));
        this.classList.add('active');

        // Hide all pages
        pages.forEach(p => p.classList.remove('active'));

        // Show the target page
        const pageId = this.dataset.page;
        const targetPage = document.getElementById('page-' + pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // If chart page, redraw chart after a tiny delay
        if (pageId === 'chart') {
            setTimeout(drawChart, 100);
        }
    });
});

// ------------------------------------------------
// 2. CHART (Simple Candlestick Drawing)
// ------------------------------------------------
function drawChart() {
    const canvas = document.getElementById('chartCanvas');
    if (!canvas) return;

    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.fillStyle = '#0f1620';
    ctx.fillRect(0, 0, w, h);

    // Generate mock candle data
    const candleCount = 60;
    const candles = [];
    let price = 22400;

    for (let i = 0; i < candleCount; i++) {
        const change = (Math.random() - 0.48) * 40;
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * 15;
        const low = Math.min(open, close) - Math.random() * 15;
        candles.push({ open, close, high, low });
        price = close;
    }

    // Find min/max for scaling
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    candles.forEach(c => {
        if (c.high > maxPrice) maxPrice = c.high;
        if (c.low < minPrice) minPrice = c.low;
    });
    const padding = 30;
    const candleWidth = (w - padding * 2) / candleCount * 0.7;
    const gap = (w - padding * 2) / candleCount * 0.3;
    const range = maxPrice - minPrice || 1;

    // Draw grid
    ctx.strokeStyle = '#1a2433';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 5; i++) {
        const y = padding + (h - padding * 2) * (i / 4);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(w - padding, y);
        ctx.stroke();

        const priceLabel = maxPrice - (range * i / 4);
        ctx.fillStyle = '#5a6f8a';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(priceLabel.toFixed(2), 4, y + 3);
    }

    // Draw candles
    candles.forEach((c, i) => {
        const x = padding + i * (candleWidth + gap);
        const yHigh = padding + (h - padding * 2) * (1 - (c.high - minPrice) / range);
        const yLow = padding + (h - padding * 2) * (1 - (c.low - minPrice) / range);
        const yOpen = padding + (h - padding * 2) * (1 - (c.open - minPrice) / range);
        const yClose = padding + (h - padding * 2) * (1 - (c.close - minPrice) / range);

        const isBull = c.close > c.open;
        const color = isBull ? '#22c55e' : '#ef4444';

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + candleWidth / 2, yHigh);
        ctx.lineTo(x + candleWidth / 2, yLow);
        ctx.stroke();

        // Body
        const bodyTop = Math.min(yOpen, yClose);
        const bodyHeight = Math.max(Math.abs(yClose - yOpen), 1);
        ctx.fillStyle = color;
        ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
    });

    // Draw MA line (simple)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 19; i < candles.length; i++) {
        let sum = 0;
        for (let j = i - 19; j <= i; j++) {
            sum += candles[j].close;
        }
        const ma = sum / 20;
        const x = padding + i * (candleWidth + gap) + candleWidth / 2;
        const y = padding + (h - padding * 2) * (1 - (ma - minPrice) / range);
        if (i === 19) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Buy/Sell markers
    const markers = [
        { index: 12, type: 'BUY', price: candles[12].close },
        { index: 28, type: 'SELL', price: candles[28].close },
        { index: 45, type: 'BUY', price: candles[45].close },
    ];

    markers.forEach(m => {
        const x = padding + m.index * (candleWidth + gap) + candleWidth / 2;
        const y = padding + (h - padding * 2) * (1 - (m.price - minPrice) / range);
        const isBuy = m.type === 'BUY';
        ctx.fillStyle = isBuy ? '#22c55e' : '#ef4444';
        ctx.beginPath();
        ctx.moveTo(x, isBuy ? y - 16 : y + 16);
        ctx.lineTo(x - 8, isBuy ? y - 6 : y + 6);
        ctx.lineTo(x + 8, isBuy ? y - 6 : y + 6);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#e8edf5';
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(m.type, x, isBuy ? y - 20 : y + 28);
    });
}

// ------------------------------------------------
// 3. TOAST NOTIFICATION
// ------------------------------------------------
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    // Add animation keyframes if not exists
    if (!document.querySelector('#toastStyles')) {
        const style = document.createElement('style');
        style.id = 'toastStyles';
        style.textContent = `
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .toast {
                animation: slideUp 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ------------------------------------------------
// 4. INITIAL LOAD
// ------------------------------------------------
window.addEventListener('load', function() {
    setTimeout(drawChart, 300);
});

// Redraw chart on window resize
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const chartPage = document.getElementById('page-chart');
        if (chartPage && chartPage.classList.contains('active')) {
            drawChart();
        }
    }, 200);
});

// ------------------------------------------------
// 5. PYTHON STUDIO: Console Log Simulation
// ------------------------------------------------
setInterval(() => {
    const consoleOutput = document.getElementById('consoleOutput');
    if (!consoleOutput) return;

    const pagePython = document.getElementById('page-python');
    if (!pagePython || !pagePython.classList.contains('active')) return;

    const messages = [
        { text: '[10:01:15] New candle received', cls: 'info' },
        { text: '[10:01:16] Checking breakout condition', cls: 'info' },
        { text: '[10:01:16] Period high: 22,480.50', cls: 'info' },
        { text: '[10:01:17] BUY signal generated!', cls: 'success' },
        { text: '[10:01:17] 📨 BUY_SIGNAL event published', cls: 'info' },
        { text: '[10:01:18] 📄 Paper Trade: Order placed', cls: 'info' },
        { text: '[10:01:18] 🔔 Notification sent via Telegram', cls: 'info' },
        { text: '[10:01:20] ⚠️ Stop loss: 22,350', cls: 'warn' },
    ];

    const msg = messages[Math.floor(Math.random() * messages.length)];
    const entry = document.createElement('div');
    entry.innerHTML = `<span class="${msg.cls}">${msg.text}</span>`;
    consoleOutput.appendChild(entry);

    // Keep only last 30 entries
    while (consoleOutput.children.length > 30) {
        consoleOutput.removeChild(consoleOutput.firstChild);
    }

    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}, 5000);

// ------------------------------------------------
// 6. MODULE LIBRARY: Button Interactions
// ------------------------------------------------
document.querySelectorAll('.module-actions button').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const action = this.textContent.trim();
        const moduleCard = this.closest('.module-card');
        if (!moduleCard) return;
        
        const moduleName = moduleCard.querySelector('.module-name')
            ?.textContent?.trim() || 'Module';

        const statusDot = moduleCard.querySelector('.status-dot');
        const statusText = moduleCard.querySelector('.module-status');

        if (action === '▶ Run' || action === '▶ Resume') {
            if (statusDot) {
                const versionSpan = statusText?.querySelector('span:last-child');
                const version = versionSpan ? versionSpan.textContent : 'v1.0.0';
                if (statusText) {
                    statusText.innerHTML =
                        `<span class="status-dot running"></span> Running <span style="color:var(--text-muted);margin-left:8px;">${version}</span>`;
                }
            }
        } else if (action === '⏹ Stop') {
            if (statusDot && statusText) {
                const versionSpan = statusText.querySelector('span:last-child');
                const version = versionSpan ? versionSpan.textContent : 'v1.0.0';
                statusText.innerHTML =
                    `<span class="status-dot stopped"></span> Stopped <span style="color:var(--text-muted);margin-left:8px;">${version}</span>`;
            }
        } else if (action === '⏸ Pause') {
            if (statusDot && statusText) {
                const versionSpan = statusText.querySelector('span:last-child');
                const version = versionSpan ? versionSpan.textContent : 'v1.0.0';
                statusText.innerHTML =
                    `<span class="status-dot paused"></span> Paused <span style="color:var(--text-muted);margin-left:8px;">${version}</span>`;
            }
        }

        showToast(`${moduleName}: ${action} clicked`);
    });
});

// ------------------------------------------------
// 7. TIMEFRAME BUTTONS
// ------------------------------------------------
document.querySelectorAll('.timeframe-selector button').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.timeframe-selector button').forEach(b => b.classList
            .remove('active'));
        this.classList.add('active');
        showToast(`Timeframe changed to ${this.textContent}`);
    });
});

// ------------------------------------------------
// 8. CHART TOOLBAR BUTTONS
// ------------------------------------------------
document.querySelectorAll('.chart-toolbar button').forEach(btn => {
    btn.addEventListener('click', function() {
        const group = this.closest('.toolbar-group');
        if (group) {
            const siblings = group.querySelectorAll('button');
            if (siblings.length > 1) {
                siblings.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            }
        }
        showToast(`Chart: ${this.textContent} selected`);
    });
});

// ------------------------------------------------
// 9. PLACEHOLDER PAGE BUTTONS
// ------------------------------------------------
document.querySelectorAll('.placeholder-page .btn-primary, .placeholder-page .btn-success').forEach(btn => {
    btn.addEventListener('click', function() {
        const parent = this.closest('.placeholder-content');
        const title = parent?.querySelector('h3')?.textContent || 'Page';
        showToast(`${title}: ${this.textContent} clicked`);
    });
});

// ------------------------------------------------
// 10. CONSOLE WELCOME
// ------------------------------------------------
console.log('✅ KJs TRD Trading Terminal Loaded Successfully');
console.log('📊 Platform Philosophy: Build Once, Extend with Python Modules');
console.log('🐍 Python Studio ready for module creation');
console.log('📦 Module Library loaded with sample modules');