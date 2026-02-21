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
        // Check if iOS and not in standalone mode
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator.standalone);
        
        if (isIOS && !isInStandaloneMode) {
            // Show banner for iOS users
            setTimeout(() => {
                const banner = document.getElementById('ib');
                if (banner) banner.classList.add('show');
            }, 3000);
        }
        
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
        // Check if iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator.standalone);
        
        if (isIOS && !isInStandaloneMode) {
            // Show iOS-specific instructions
            Modal.alert(
                'Install PaisaTracker',
                'To install on iOS:\n\n1. Tap the Share button (📤) in Safari\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to install',
                { icon: '📱', btnText: 'Got it!' }
            );
            return;
        }
        
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
