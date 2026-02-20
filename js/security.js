/**
 * PaisaTracker — Security (PIN, WebAuthn, Inactivity Lock)
 */

const Security = (() => {
    const LOCK_TIMEOUT = 5 * 60 * 1000; // 5 min
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_DURATION = 30 * 1000; // 30s
    const lockKey = (userId) => `pt_lock_${userId}`;

    const getLockState = (userId) => {
        if (!userId) return { attempts: 0, until: null };
        try {
            const raw = localStorage.getItem(lockKey(userId));
            if (!raw) return { attempts: 0, until: null };
            const p = JSON.parse(raw);
            return {
                attempts: Number.isFinite(p?.attempts) ? p.attempts : 0,
                until: Number.isFinite(p?.until) ? p.until : null,
            };
        } catch {
            return { attempts: 0, until: null };
        }
    };

    const saveLockState = (userId, attempts, until) => {
        if (!userId) return;
        try {
            localStorage.setItem(lockKey(userId), JSON.stringify({ attempts, until }));
        } catch { }
    };

    // ── Inactivity Timer ─────────────────────────────────────
    const resetInactivityTimer = () => {
        clearTimeout(S.inactivityTimer);
        S.inactivityTimer = setTimeout(() => {
            if (document.getElementById('main')?.classList.contains('on')) {
                showLock(S.user);
            }
        }, LOCK_TIMEOUT);
    };

    const setupInactivityListeners = () => {
        ['click', 'touchstart', 'keydown', 'scroll'].forEach((ev) => {
            document.addEventListener(ev, resetInactivityTimer, { passive: true });
        });
        // Lock on tab visibility change after 2 min idle
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Start a shorter timer when hidden
                clearTimeout(S.inactivityTimer);
                S.inactivityTimer = setTimeout(() => {
                    if (S.user && document.getElementById('main')?.classList.contains('on')) {
                        showLock(S.user);
                    }
                }, 2 * 60 * 1000);
            } else {
                resetInactivityTimer();
            }
        });
    };

    // ── PIN Verification ─────────────────────────────────────
    const verifyPin = async (pin, user) => {
        const lk = getLockState(user.id);
        S.lockAttempts = lk.attempts || 0;
        S.lockUntil = lk.until || null;

        // Check lockout
        if (S.lockUntil && Date.now() < S.lockUntil) {
            const remaining = Math.ceil((S.lockUntil - Date.now()) / 1000);
            toast(`${remaining}s baad try karo 🔒`, 'error');
            return false;
        }

        const primarySalt = user.pinSalt || user.id;
        let ok = false;
        try {
            const h = await hashPin(pin, primarySalt);
            if (h === user.pinHash) ok = true;

            // Backward compatibility migration from old user.id salt to random per-user salt
            if (!ok && user.pinSalt) {
                const legacy = await hashPin(pin, user.id);
                if (legacy === user.pinHash) ok = true;
            }
        } catch {
            toast('Secure crypto unavailable in this browser', 'error');
            return false;
        }

        if (ok) {
            if (!user.pinSalt) {
                user.pinSalt = randomHex(16);
                user.pinHash = await hashPin(pin, user.pinSalt);
                su(user);
            }
            S.lockAttempts = 0;
            S.lockUntil = null;
            saveLockState(user.id, 0, null);
            return true;
        }

        S.lockAttempts++;
        if (S.lockAttempts >= MAX_ATTEMPTS) {
            S.lockUntil = Date.now() + LOCKOUT_DURATION;
            S.lockAttempts = 0;
            toast('5 wrong attempts! 30s locked 🔒', 'error');
            saveLockState(user.id, 0, S.lockUntil);
        } else {
            toast(`Wrong PIN — ${MAX_ATTEMPTS - S.lockAttempts} attempts left`, 'error');
            saveLockState(user.id, S.lockAttempts, null);
        }
        return false;
    };

    // ── WebAuthn Setup ───────────────────────────────────────
    const setupWebAuthn = async (user) => {
        try {
            const challenge = new Uint8Array(32);
            crypto.getRandomValues(challenge);
            const hostname = location.hostname;

            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge,
                    timeout: 60000,
                    rp: {
                        name: 'PaisaTracker',
                        id: hostname && hostname !== '' && hostname !== 'localhost' ? hostname : undefined,
                    },
                    user: {
                        id: new TextEncoder().encode(user.id),
                        name: user.email,
                        displayName: user.name,
                    },
                    pubKeyCredParams: [
                        { type: 'public-key', alg: -7 },
                        { type: 'public-key', alg: -257 },
                    ],
                    authenticatorSelection: {
                        authenticatorAttachment: 'platform',
                        userVerification: 'required',
                    },
                },
            });

            // Store the raw credential ID as hex
            user.bioEnabled = true;
            user.bioCredId = Array.from(new Uint8Array(credential.rawId))
                .map((b) => b.toString(16).padStart(2, '0'))
                .join('');

            return { success: true };
        } catch (err) {
            return { success: false, error: err.name };
        }
    };

    // ── WebAuthn Verification ────────────────────────────────
    const verifyWebAuthn = async (user) => {
        try {
            const challenge = new Uint8Array(32);
            crypto.getRandomValues(challenge);
            const opts = {
                publicKey: {
                    challenge,
                    timeout: 60000,
                    userVerification: 'required',
                },
            };

            if (user.bioCredId) {
                const bytes = new Uint8Array(
                    user.bioCredId.match(/.{2}/g).map((b) => parseInt(b, 16))
                );
                opts.publicKey.allowCredentials = [
                    { type: 'public-key', id: bytes, transports: ['internal'] },
                ];
            }

            await navigator.credentials.get(opts);
            return true;
        } catch {
            return false;
        }
    };

    return {
        resetInactivityTimer,
        setupInactivityListeners,
        verifyPin,
        setupWebAuthn,
        verifyWebAuthn,
    };
})();

window.Security = Security;
