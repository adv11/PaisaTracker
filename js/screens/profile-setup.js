/**
 * PaisaTracker — Profile Setup, PIN Setup, Biometric Setup, Lock Screen
 */

// ── Avatar Grid ───────────────────────────────────────────
function renderAvatarGrid() {
    S.avatarSel = '😊';
    const g = document.getElementById('psag');
    if (g) {
        g.innerHTML = AVTS.map((a) =>
            `<div class="avo ${a === S.avatarSel ? 'sel' : ''}" onclick="selAv('${a}',this)">${a}</div>`
        ).join('');
    }
    const disp = document.getElementById('psad');
    if (disp) disp.textContent = S.avatarSel;
}

function selAv(a, el) {
    S.avatarSel = a;
    const disp = document.getElementById('psad');
    if (disp) disp.textContent = a;
    document.querySelectorAll('#psag .avo').forEach((x) => x.classList.remove('sel'));
    el.classList.add('sel');
    hap('light');
}

// ── Profile Setup submit ──────────────────────────────────
async function finishPs() {
    const nmRaw = document.getElementById('psn')?.value || '';
    const nmRes = V.name(nmRaw, { min: 2, max: 50, label: 'Name', allowNumbers: false });
    if (!nmRes.ok) { toast(nmRes.error, 'error'); document.getElementById('psn').focus(); return; }

    const phoneRaw = document.getElementById('psp')?.value || '';
    let cleanedPhone = '';
    if (phoneRaw.trim()) {
        const phRes = V.phone(phoneRaw);
        if (!phRes.ok) { toast(phRes.error, 'error'); document.getElementById('psp').focus(); return; }
        cleanedPhone = phRes.cleaned;
    }

    S.pendingUser = {
        id: uid(),
        email: S.pendingEmail,
        name: nmRes.v,
        phone: cleanedPhone,
        avatarEmoji: S.avatarSel,
        theme: 'dark',
        createdAt: new Date().toISOString(),
    };

    S.pendingPin = '';
    renderPINPad('pinp', 'create');
    document.getElementById('pinb').textContent = 'Step 2 of 3 — Create PIN';
    go('pin-s');
}

// ── PIN Pad ───────────────────────────────────────────────
function renderPINPad(containerId, mode, shake = false) {
    const c = document.getElementById(containerId);
    if (!c) return;
    S._pinEntry = '';

    const labels = {
        create: 'Create 6-digit PIN',
        confirm: 'Confirm your PIN',
        lock: 'Enter PIN',
        change_old: 'Enter Current PIN',
        change_new: 'Create New PIN',
        change_confirm: 'Confirm New PIN',
    };
    const subs = {
        create: 'Ye PIN app lock karne ke liye use hogi',
        confirm: 'Dobara same PIN enter karo',
        lock: S.lockAttempts > 0 ? `${5 - S.lockAttempts} attempts remaining` : 'Apna PIN enter karo',
        change_old: 'Security ke liye current PIN verify karo',
        change_new: 'Naya 6-digit PIN choose karo',
        change_confirm: 'Naya PIN confirm karo',
    };

    c.innerHTML = `
    <div style="text-align:center">
      <div style="font-family:'Sora',sans-serif;font-size:20px;font-weight:700;color:var(--t)">${labels[mode]}</div>
      <div style="font-size:12px;color:${S.lockAttempts > 0 && mode === 'lock' ? 'var(--r)' : 'var(--t2)'};margin-top:5px;min-height:18px">${subs[mode] || ''}</div>
    </div>
    <div class="pdots ${shake ? 'anim-shake' : ''}" id="${containerId}-d">
      ${Array(6).fill('<div class="pd"></div>').join('')}
    </div>
    <div class="pgrid">
      ${['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k) =>
        `<button class="pk"${k === '' ? ' style="opacity:0;pointer-events:none"' : ''} onclick="pinKey('${containerId}','${k}','${mode}')">${k}</button>`
    ).join('')}
    </div>
  `;
}

function pinKey(cid, k, mode) {
    if (!k) return;
    if (k === '⌫') {
        S._pinEntry = (S._pinEntry || '').slice(0, -1);
        updatePINDots(cid, S._pinEntry);
        return;
    }
    if ((S._pinEntry || '').length >= 6) return;
    S._pinEntry = (S._pinEntry || '') + k;
    updatePINDots(cid, S._pinEntry);
    hap('light');
    if (S._pinEntry.length === 6) setTimeout(() => pinSubmit(cid, S._pinEntry, mode), 120);
}

function updatePINDots(cid, v) {
    document.querySelectorAll(`#${cid}-d .pd`).forEach((d, i) =>
        d.classList.toggle('on', i < (v || '').length)
    );
}

async function pinSubmit(cid, pin, mode) {
    if (mode === 'create') {
        S.pendingPin = pin;
        S._pinEntry = '';
        renderPINPad(cid, 'confirm');
        document.getElementById('pinb').textContent = 'Confirm your PIN';
    } else if (mode === 'confirm') {
        if (pin !== S.pendingPin) {
            S._pinEntry = '';
            renderPINPad(cid, 'confirm', true);
            toast('PIN match nahi hua! Dobara try karo', 'error');
            return;
        }
        // Final PIN strength check
        const pinStrength = V.pin(pin);
        if (!pinStrength.ok) {
            S.pendingPin = '';
            S._pinEntry = '';
            renderPINPad(cid, 'create');
            toast(pinStrength.error, 'warning');
            return;
        }
        const user = S.pendingUser || S.user;
        try {
            user.pinSalt = user.pinSalt || randomHex(16);
            user.pinHash = await hashPin(pin, user.pinSalt);
        } catch {
            toast('Secure PIN setup unsupported in this browser', 'error');
            return;
        }
        if (S.pendingUser) {
            go('bio-s');
            document.getElementById('pinb').textContent = 'Step 2 of 3 ✓';
        } else {
            su(user);
            toast('PIN changed successfully ✅');
            closeSh('change-pin');
            tabTo('profile');
        }
    } else if (mode === 'lock') {
        const ok = await Security.verifyPin(pin, S.user);
        if (ok) {
            enterApp();
        } else {
            S._pinEntry = '';
            renderPINPad(cid, 'lock', true);
        }
    } else if (mode === 'change_old') {
        const ok = await Security.verifyPin(pin, S.user);
        if (ok) {
            S.pendingPin = '';
            S._pinEntry = '';
            renderPINPad(cid, 'change_new');
        } else {
            S._pinEntry = '';
            renderPINPad(cid, 'change_old', true);
        }
    } else if (mode === 'change_new') {
        S.pendingPin = pin;
        S._pinEntry = '';
        renderPINPad(cid, 'change_confirm');
    } else if (mode === 'change_confirm') {
        if (pin !== S.pendingPin) {
            S._pinEntry = '';
            renderPINPad(cid, 'change_confirm', true);
            toast('PIN match nahi hua!', 'error');
            return;
        }
        try {
            S.user.pinSalt = S.user.pinSalt || randomHex(16);
            S.user.pinHash = await hashPin(pin, S.user.pinSalt);
        } catch {
            toast('Unable to update PIN securely', 'error');
            return;
        }
        su(S.user);
        toast('PIN changed ✅');
        tabTo('profile');
    }
}

// Expose for inline events
window.renderAvatarGrid = renderAvatarGrid;
window.selAv = selAv;
window.finishPs = finishPs;
window.renderPINPad = renderPINPad;
window.pinKey = pinKey;
window.updatePINDots = updatePINDots;
window.pinSubmit = pinSubmit;
