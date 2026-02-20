/**
 * PaisaTracker — PWA (Service Worker + Install Prompt + Offline)
 */

const PWA = (() => {
    let _installPrompt = null;

    const registerSW = () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./service-worker.js')
                .then((reg) => {
                    console.log('[PWA] SW registered:', reg.scope);
                    // Check for updates
                    reg.addEventListener('updatefound', () => {
                        const newWorker = reg.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                toast('App updated! Refresh to get latest. 🔄', 'info');
                            }
                        });
                    });
                })
                .catch((err) => console.warn('[PWA] SW registration failed:', err));
        }
    };

    const setupInstallPrompt = () => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            _installPrompt = e;
            const banner = document.getElementById('ib');
            if (banner) banner.classList.add('show');
        });

        window.addEventListener('appinstalled', () => {
            _installPrompt = null;
            const banner = document.getElementById('ib');
            if (banner) banner.classList.remove('show');
            toast('PaisaTracker installed! 🎉');
        });
    };

    const promptInstall = () => {
        if (_installPrompt) {
            _installPrompt.prompt();
            _installPrompt.userChoice.then(() => {
                _installPrompt = null;
                const banner = document.getElementById('ib');
                if (banner) banner.classList.remove('show');
            });
        } else {
            toast('Browser menu → Add to Home Screen 📱', 'info');
        }
    };

    const setupOfflineBanner = () => {
        const show = () => {
            const b = document.getElementById('offline-banner');
            if (b) b.classList.add('show');
        };
        const hide = () => {
            const b = document.getElementById('offline-banner');
            if (b) b.classList.remove('show');
        };

        if (!navigator.onLine) show();
        window.addEventListener('offline', show);
        window.addEventListener('online', () => {
            hide();
            toast('Back online! Data synced 🌐', 'success');
        });
    };

    const init = () => {
        registerSW();
        setupInstallPrompt();
        setupOfflineBanner();
    };

    return { init, promptInstall };
})();

window.PWA = PWA;
window.instPWA = () => PWA.promptInstall();
