/**
 * PaisaTracker — Toast Notifications
 */

let _toastTimer = null;

const toast = (msg, type = 'success') => {
    const el = document.getElementById('toast');
    if (!el) return;

    const configs = {
        success: {
            bg: 'rgba(6,78,59,0.96)',
            border: '#10b981',
            icon: '✓',
        },
        error: {
            bg: 'rgba(127,29,29,0.96)',
            border: '#ef4444',
            icon: '✕',
        },
        info: {
            bg: 'rgba(30,58,138,0.96)',
            border: '#6366f1',
            icon: 'ℹ',
        },
        warning: {
            bg: 'rgba(92,46,0,0.96)',
            border: '#f59e0b',
            icon: '⚠',
        },
    };

    const cfg = configs[type] || configs.success;
    el.innerHTML = `<span style="font-size:14px">${cfg.icon}</span> ${msg}`;
    el.style.background = cfg.bg;
    el.style.border = `1px solid ${cfg.border}`;

    // Animate in
    el.classList.add('show');

    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => {
        el.classList.remove('show');
    }, 3200);
};

window.toast = toast;
