/**
 * PaisaTracker — Router & Screen Navigation
 */

const Router = (() => {
    let _current = null;

    const go = (id) => {
        document.querySelectorAll('.scr').forEach((s) => {
            s.classList.remove('on');
        });
        const next = document.getElementById(id);
        if (next) {
            next.classList.add('on');
            next.querySelector('.sa')?.scrollTo(0, 0);
            _current = id;
        }
    };

    const current = () => _current;

    // ── Sheets (bottom drawer overlays) ──────────────────────
    const openSheet = (id) => {
        const ov = document.getElementById('ov-' + id);
        if (!ov) return;
        ov.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeSheet = (id) => {
        const ov = document.getElementById('ov-' + id);
        if (!ov) return;
        ov.classList.remove('open');
        document.body.style.overflow = '';
    };

    const closeBg = (e, id) => {
        if (e.target === e.currentTarget) closeSheet(id);
    };

    // ── Swipe-down to dismiss sheets ───────────────────────
    const setupSwipe = () => {
        document.querySelectorAll('.sh-h').forEach((handle) => {
            let startY = 0;
            const sheet = handle.closest('.sh');
            const overlay = handle.closest('.ov');

            handle.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
            }, { passive: true });

            handle.addEventListener('touchmove', (e) => {
                const dy = e.touches[0].clientY - startY;
                if (dy > 0) sheet.style.transform = `translateY(${dy}px)`;
            }, { passive: true });

            handle.addEventListener('touchend', (e) => {
                const dy = e.changedTouches[0].clientY - startY;
                sheet.style.transform = '';
                if (dy > 80) {
                    const id = overlay?.id?.replace('ov-', '');
                    if (id) { closeSheet(id); hap('medium'); }
                }
            });
        });
    };

    return { go, current, openSheet, closeSheet, closeBg, setupSwipe };
})();

// Expose globally for onclick handlers
window.Router = Router;
window.go = (id) => Router.go(id);
window.openSh = (id) => Router.openSheet(id);
window.closeSh = (id) => Router.closeSheet(id);
window.closeBg = (e, id) => Router.closeBg(e, id);
