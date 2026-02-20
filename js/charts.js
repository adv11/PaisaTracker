/**
 * PaisaTracker — Chart.js Helpers (v2 — hacker-green theme, animated)
 */

const Charts = (() => {
    const _instances = {};

    const destroy = (id) => {
        if (_instances[id]) { _instances[id].destroy(); delete _instances[id]; }
    };

    // Deep-merge two option objects
    const _merge = (base, override) => {
        if (!override) return base;
        const result = { ...base };
        for (const k of Object.keys(override)) {
            if (override[k] && typeof override[k] === 'object' && !Array.isArray(override[k]) && typeof base[k] === 'object') {
                result[k] = _merge(base[k] || {}, override[k]);
            } else {
                result[k] = override[k];
            }
        }
        return result;
    };

    // Shared dark-mode chart defaults
    const _defaults = () => ({
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 750, easing: 'easeOutQuart' },
        plugins: {
            legend: {
                labels: {
                    color: 'rgba(139,148,158,0.7)',
                    font: { size: 11, family: 'Space Grotesk' },
                    boxWidth: 10,
                    padding: 12,
                },
            },
            tooltip: {
                backgroundColor: 'rgba(10,10,10,0.93)',
                borderColor: 'rgba(88,166,255,0.15)',
                borderWidth: 1,
                titleColor: '#58a6ff',
                bodyColor: '#e8f5e9',
                padding: 10,
                cornerRadius: 10,
                callbacks: {
                    label: (ctx) => ` ${INR(Number(ctx.raw))}`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: 'rgba(158,186,156,0.6)',
                    font: { size: 10, family: 'Space Grotesk' },
                },
                border: { display: false },
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                border: { display: false },
                ticks: {
                    color: 'rgba(139,148,158,0.5)',
                    font: { size: 9, family: 'Space Grotesk' },
                    callback: (v) => INR(v, true),
                },
            },
        },
    });

    // Bar chart — supports extra options override
    const bar = (canvasId, data, _unused, extraOpts) => {
        destroy(canvasId);
        const el = document.getElementById(canvasId);
        if (!el) return;
        const baseOpts = {
            ..._defaults(),
            barPercentage: 0.55,
            categoryPercentage: 0.72,
        };
        _instances[canvasId] = new Chart(el, {
            type: 'bar',
            data,
            options: _merge(baseOpts, extraOpts || {}),
        });
    };

    // Line chart
    const line = (canvasId, data, extraOpts) => {
        destroy(canvasId);
        const el = document.getElementById(canvasId);
        if (!el) return;
        _instances[canvasId] = new Chart(el, {
            type: 'line',
            data,
            options: _merge(_defaults(), extraOpts || {}),
        });
    };

    // Doughnut chart — supports extra options override
    const doughnut = (canvasId, data, cutout = '60%', extraOpts) => {
        destroy(canvasId);
        const el = document.getElementById(canvasId);
        if (!el) return;
        const baseOpts = {
            responsive: true,
            maintainAspectRatio: false,
            cutout,
            animation: { animateRotate: true, animateScale: true, duration: 750, easing: 'easeOutCubic' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(10,10,10,0.93)',
                    borderColor: 'rgba(88,166,255,0.15)',
                    borderWidth: 1,
                    titleColor: '#58a6ff',
                    bodyColor: '#e8f5e9',
                    padding: 10,
                    cornerRadius: 10,
                    callbacks: {
                        label: (ctx) => ` ${INR(Number(ctx.raw))}`,
                    },
                },
            },
        };
        _instances[canvasId] = new Chart(el, {
            type: 'doughnut',
            data,
            options: _merge(baseOpts, extraOpts || {}),
        });
    };

    return { bar, line, doughnut, destroy };
})();

window.Charts = Charts;
window.dc = (id) => Charts.destroy(id);
