/**
 * PaisaTracker — Biometric Setup & Lock Screen
 */

// ── Biometric Setup ───────────────────────────────────────
async function setupBio() {
    const user = S.pendingUser || S.user;
    if (!user) return;

    const icon = document.getElementById('bic');
    const title = document.getElementById('bit');
    const desc = document.getElementById('bid');
    const actions = document.getElementById('bia');

    icon.textContent = '⌛';
    title.textContent = 'Setting up biometric…';
    if (actions) actions.style.display = 'none';

    const result = await Security.setupWebAuthn(user);

    if (result.success) {
        icon.textContent = '✅';
        title.textContent = 'Biometric Enabled! 🎉';
        if (desc) desc.textContent = 'Face ID / Fingerprint se login kar sakte ho ab.';
        setTimeout(() => finishSetup(user), 1400);
    } else {
        icon.textContent = 'ℹ️';
        title.textContent = 'Not Available Here';
        if (desc) desc.textContent = 'HTTPS pe deploy karne ke baad kaam karega. Abhi PIN se continue karo.';
        if (actions) {
            actions.innerHTML = `
        <button class="btn btn-p" style="width:100%;padding:15px" onclick="skipBio()">
          Continue with PIN →
        </button>
      `;
            actions.style.display = 'flex';
        }
    }
}

function skipBio() {
    const user = S.pendingUser || S.user;
    if (user) user.bioEnabled = false;
    finishSetup(S.pendingUser || S.user);
}

function finishSetup(user) {
    su(user);
    const ensured = DB.ensureData(user.id);
    S.user = user;
    S.data = ensured || DB.getData(user.id) || DB.getDefaultData();
    S.pendingUser = null;
    DB.saveSession(user.id);
    document.body.className = '';
    toast('Welcome to PaisaTracker! 🎉');
    go('main');
    tabTo('dashboard');
    Security.resetInactivityTimer();
}

// ── Lock Screen ───────────────────────────────────────────
let _clockInterval = null;

function showLock(user) {
    const safePhoto = typeof user.avatarPhoto === 'string' && /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(user.avatarPhoto)
        ? user.avatarPhoto
        : '';
    
    const avatarEl = document.getElementById('lkav');
    if (avatarEl) {
        if (safePhoto) {
            avatarEl.innerHTML = '<img src="' + safePhoto + '" style="width:56px;height:56px;border-radius:50%;object-fit:cover;filter:drop-shadow(0 8px 24px rgba(0,0,0,.4))"/>';
        } else {
            avatarEl.textContent = user.avatarEmoji || '😊';
            avatarEl.style.fontSize = '56px';
        }
    }
    
    document.getElementById('lknm').textContent = user.name;
    document.getElementById('lkem').textContent = user.email;

    const bioBtn = document.getElementById('biob');
    if (bioBtn) bioBtn.style.display = user.bioEnabled ? 'flex' : 'none';

    S._pinEntry = '';
    renderPINPad('lkp', 'lock');
    go('lock');
    startClock();

    // Auto-prompt biometric if enabled
    if (user.bioEnabled) {
        setTimeout(() => bioLogin(), 500);
    }
}

function startClock() {
    clearInterval(_clockInterval);
    const update = () => {
        const now = new Date();
        const clockEl = document.getElementById('lk-clock');
        const dateEl = document.getElementById('lk-date');
        if (clockEl) {
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            clockEl.textContent = `${h}:${m}`;
        }
        if (dateEl) {
            dateEl.textContent = now.toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long',
            });
        }
    };
    update();
    _clockInterval = setInterval(update, 10000);
}

async function bioLogin() {
    if (!S.user?.bioEnabled) return;
    const ok = await Security.verifyWebAuthn(S.user);
    if (ok) {
        enterApp();
    } else {
        toast('Biometric failed — PIN use karo', 'error');
    }
}

function enterApp() {
    clearInterval(_clockInterval);
    S.data = DB.getData(S.user.id) || DB.getDefaultData();
    DB.saveSession(S.user.id);
    document.body.className = '';
    go('main');
    tabTo('dashboard');
    Security.resetInactivityTimer();
}

function switchAccount() {
    DB.clearSession();
    S.user = null;
    S.data = null;
    go('login');
    Auth.renderSavedAccounts();
    const le = document.getElementById('le');
    if (le) le.value = '';
}

// Expose for inline events
window.setupBio = setupBio;
window.skipBio = skipBio;
window.finishSetup = finishSetup;
window.showLock = showLock;
window.startClock = startClock;
window.bioLogin = bioLogin;
window.bioL = bioLogin;
window.enterApp = enterApp;
window.swAcc = switchAccount;
