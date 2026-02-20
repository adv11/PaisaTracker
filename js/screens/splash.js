/**
 * PaisaTracker — Splash Screen
 */

const SplashScreen = (() => {
    const init = () => {
        const failsafe = setTimeout(() => { go('welcome'); Auth.renderSavedAccounts(); }, 3800);

        try {
            const cv = document.getElementById('spc');
            if (!cv) { clearTimeout(failsafe); go('welcome'); Auth.renderSavedAccounts(); return; }

            const ctx = cv.getContext('2d');
            cv.width = window.innerWidth;
            cv.height = window.innerHeight;

            const colors = [
                'rgba(16,185,129,', 'rgba(99,102,241,',
                'rgba(236,72,153,', 'rgba(245,158,11,',
                'rgba(59,130,246,',
            ];

            // Create particles
            const pts = Array.from({ length: 65 }, (_, i) => ({
                x: Math.random() * cv.width,
                y: Math.random() * cv.height,
                r: Math.random() * 2.2 + 0.5,
                c: colors[i % colors.length],
                vx: (Math.random() - 0.5) * 0.48,
                vy: (Math.random() - 0.5) * 0.48,
                o: Math.random() * 0.45 + 0.08,
            }));

            // Connections between nearby particles
            let raf;
            const draw = () => {
                ctx.clearRect(0, 0, cv.width, cv.height);

                // Draw connections
                for (let i = 0; i < pts.length; i++) {
                    for (let j = i + 1; j < pts.length; j++) {
                        const dx = pts[i].x - pts[j].x;
                        const dy = pts[i].y - pts[j].y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 100) {
                            ctx.beginPath();
                            ctx.moveTo(pts[i].x, pts[i].y);
                            ctx.lineTo(pts[j].x, pts[j].y);
                            ctx.strokeStyle = `rgba(16,185,129,${0.06 * (1 - dist / 100)})`;
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                        }
                    }
                }

                // Draw particles
                pts.forEach((p) => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = p.c + p.o + ')';
                    ctx.fill();
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x < 0) p.x = cv.width;
                    if (p.x > cv.width) p.x = 0;
                    if (p.y < 0) p.y = cv.height;
                    if (p.y > cv.height) p.y = 0;
                });

                raf = requestAnimationFrame(draw);
            };
            draw();

            setTimeout(() => {
                clearTimeout(failsafe);
                try { cancelAnimationFrame(raf); } catch { }

                // Check for existing session
                try {
                    const sess = DB.getSession();
                    if (sess?.userId) {
                        const u = DB.getUser(sess.userId);
                        if (u) {
                            S.user = u;
                            document.body.className = (u.theme || 'dark') === 'light' ? 'light' : '';
                            showLock(u);
                            return;
                        }
                    }
                } catch { }

                go('welcome');
                try { Auth.renderSavedAccounts(); } catch { }
            }, 2800);
        } catch {
            clearTimeout(failsafe);
            go('welcome');
            try { Auth.renderSavedAccounts(); } catch { }
        }
    };

    return { init };
})();

window.SplashScreen = SplashScreen;
