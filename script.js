// ============================================================
// KJs TRD Trading Terminal - Navigation & Interactions
// ============================================================

// ------------------------------------------------
// 1. PAGE NAVIGATION
// ------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');

    console.log('✅ Navigation initialized');
    console.log('📄 Found pages:', pages.length);
    console.log('📌 Found nav items:', navItems.length);

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();

            // Get the page name from data-page attribute
            const pageName = this.dataset.page;
            console.log('🔄 Navigating to:', pageName);

            // Remove active class from all nav items
            navItems.forEach(n => n.classList.remove('active'));

            // Add active class to clicked item
            this.classList.add('active');

            // Hide ALL pages
            pages.forEach(p => p.classList.remove('active'));

            // Show the target page
            const targetPage = document.getElementById('page-' + pageName);
            if (targetPage) {
                targetPage.classList.add('active');
                console.log('✅ Showing page:', pageName);

                // If chart page, reload iframe
                if (pageName === 'chart') {
                    const iframe = targetPage.querySelector('iframe');
                    if (iframe) {
                        iframe.src = iframe.src;
                    }
                }
            } else {
                console.error('❌ Page not found: page-' + pageName);
            }
        });
    });

    // Set default active page
    const defaultPage = document.querySelector('.nav-item.active');
    if (defaultPage) {
        const pageName = defaultPage.dataset.page;
        const targetPage = document.getElementById('page-' + pageName);
        if (targetPage) {
            pages.forEach(p => p.classList.remove('active'));
            targetPage.classList.add('active');
            console.log('✅ Default page set to:', pageName);
        }
    }
});

// ------------------------------------------------
// 2. CHART DRAWING (for dashboard preview)
// ------------------------------------------------
function drawChart() {
    const canvas = document.getElementById('chartCanvas');
    if (!canvas) return;

    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = canvas.parentElement.clientWidth || 800;
    canvas.height = canvas.parentElement.clientHeight || 400;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

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

    // Grid
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

    // Candles
    candles.forEach((c, i) => {
        const x = padding + i * (candleWidth + gap);
        const yHigh = padding + (h - padding * 2) * (1 - (c.high - minPrice) / range);
        const yLow = padding + (h - padding * 2) * (1 - (c.low - minPrice) / range);
        const yOpen = padding + (h - padding * 2) * (1 - (c.open - minPrice) / range);
        const yClose = padding + (h - padding * 2) * (1 - (c.close - minPrice) / range);

        const isBull = c.close > c.open;
        const color = isBull ? '#22c55e' : '#ef4444';

        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + candleWidth / 2, yHigh);
        ctx.lineTo(x + candleWidth / 2, yLow);
        ctx.stroke();

        const bodyTop = Math.min(yOpen, yClose);
        const bodyHeight = Math.max(Math.abs(yClose - yOpen), 1);
        ctx.fillStyle = color;
        ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
    });

    // MA line
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
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #0f1620;
        border: 1px solid #2a3a4e;
        color: #e8edf5;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 13px;
        z-index: 9999;
        box-shadow: 0 4px 24px rgba(0,0,0,0.6);
        animation: slideUp 0.3s ease;
        max-width: 350px;
    `;

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
// 4. MODULE BUTTON INTERACTIONS
// ------------------------------------------------
document.querySelectorAll('.module-actions button').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const action = this.textContent.trim();
        const moduleCard = this.closest('.module-card');
        if (!moduleCard) return;

        const moduleName = moduleCard.querySelector('.module-name')?.textContent?.trim() || 'Module';
        const statusDot = moduleCard.querySelector('.status-dot');
        const statusText = moduleCard.querySelector('.module-status');

        if (action === '▶ Run' || action === '▶ Resume') {
            if (statusDot && statusText) {
                const versionSpan = statusText.querySelector('span:last-child');
                const version = versionSpan ? versionSpan.textContent : 'v1.0.0';
                statusText.innerHTML =
                    `<span class="status-dot running"></span> Running <span style="color:var(--text-muted);margin-left:8px;">${version}</span>`;
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
// 5. TIMEFRAME BUTTONS
// ------------------------------------------------
document.querySelectorAll('.timeframe-selector button').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.timeframe-selector button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        showToast(`Timeframe changed to ${this.textContent}`);
    });
});

// ------------------------------------------------
// 6. CHART TOOLBAR BUTTONS
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
// 7. PLACEHOLDER PAGE BUTTONS
// ------------------------------------------------
document.querySelectorAll('.placeholder-page .btn-primary, .placeholder-page .btn-success').forEach(btn => {
    btn.addEventListener('click', function() {
        const parent = this.closest('.placeholder-content');
        const title = parent?.querySelector('h3')?.textContent || 'Page';
        showToast(`${title}: ${this.textContent} clicked`);
    });
});

// ------------------------------------------------
// 8. CONSOLE LOG
// ------------------------------------------------
console.log('✅ KJs TRD Trading Terminal Loaded Successfully');
console.log('📊 Platform Philosophy: Build Once, Extend with Python Modules');
console.log('🐍 Python Studio ready for module creation');
console.log('📦 Module Library loaded with sample modules');

// ------------------------------------------------
// 9. RESIZE HANDLER
// ------------------------------------------------
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const chartPage = document.getElementById('page-chart');
        if (chartPage && chartPage.classList.contains('active')) {
            const iframe = chartPage.querySelector('iframe');
            if (iframe) {
                // Refresh iframe on resize
            }
        }
    }, 200);
});

// ------------------------------------------------
// 10. INITIAL SETUP
// ------------------------------------------------
// Make sure default page is showing
setTimeout(() => {
    const activeNav = document.querySelector('.nav-item.active');
    if (activeNav) {
        const pageName = activeNav.dataset.page;
        const targetPage = document.getElementById('page-' + pageName);
        if (targetPage) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            targetPage.classList.add('active');
            console.log('✅ Initial page set to:', pageName);
        }
    }
}, 100);

// Draw chart if on dashboard
setTimeout(() => {
    const dashboard = document.getElementById('page-dashboard');
    if (dashboard && dashboard.classList.contains('active')) {
        drawChart();
    }
}, 200);