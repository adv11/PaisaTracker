/**
 * PaisaTracker — Profile Tab
 */

function rProfile(pg) {
    const u = S.user;
    const { transactions } = S.data;
    const tTx = transactions.length;
    const tSp = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const tIn = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);

    const safePhoto = typeof u.avatarPhoto === 'string' && /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(u.avatarPhoto)
        ? u.avatarPhoto
        : '';

    pg.innerHTML = `
    <div class="safe-top"></div>
    <!-- Hero -->
    <div style="padding-top:24px;text-align:center;margin-bottom:24px" class="au">
      <div class="profile-avatar-wrap">
        <div class="profile-avatar" style="overflow:hidden;display:flex;align-items:center;justify-content:center">
          ${safePhoto ? '<img src="' + safePhoto + '" style="width:100%;height:100%;object-fit:cover"/>' : (u.avatarEmoji || '😊')}
        </div>
        <button class="profile-edit-btn" onclick="showEP()">✏️</button>
      </div>
      <div style="font-family:'Sora',sans-serif;font-size:22px;font-weight:800;color:var(--t)">${escapeHTML(u.name)}</div>
      <div style="font-size:13px;color:var(--t2);margin-top:2px">${escapeHTML(u.email)}</div>
      ${u.phone ? `<div style="font-size:12px;color:var(--t3);margin-top:1px">📱 ${escapeHTML(u.phone)}</div>` : ''}
      <div style="display:inline-flex;align-items:center;gap:6px;margin-top:10px" class="badge badge-green">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--g)" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Secured Account
      </div>
    </div>

    <div id="ep-area"></div>

    <!-- Stats -->
    <div class="g3" style="margin-bottom:20px" class="au1">
      ${[['Transactions', tTx, 'var(--b)'], ['Total Spent', INR(tSp, true), 'var(--r)'], ['Total Income', INR(tIn, true), 'var(--g)']].map(([l, v, c]) => `
        <div class="card2" style="padding:12px;text-align:center">
          <div style="font-size:16px;font-weight:800;color:${c};font-family:'Sora',sans-serif">${v}</div>
          <div style="font-size:9px;color:var(--t3);margin-top:3px;line-height:1.3">${l}</div>
        </div>`).join('')}
    </div>

    <!-- Settings list -->
    <div class="card" style="padding:4px 16px;margin-bottom:16px" class="au2">
      <div class="lr" style="cursor:pointer" onclick="showLock(S.user)">
        <span style="font-size:22px;width:36px">🔒</span>
        <span style="flex:1;font-size:14px;font-weight:600;color:var(--t)">Lock App Now</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </div>
      <div class="lr" style="cursor:pointer" onclick="showChangePIN()">
        <span style="font-size:22px;width:36px">🔑</span>
        <span style="flex:1;font-size:14px;font-weight:600;color:var(--t)">Change PIN</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </div>
      <div class="lr">
        <span style="font-size:22px;width:36px">🛡️</span>
        <span style="flex:1;font-size:14px;font-weight:600;color:var(--t)">Security</span>
        <span class="badge badge-green">${u.bioEnabled ? 'PIN + Bio' : 'PIN Only'}</span>
      </div>
      <div class="lr" style="cursor:pointer" onclick="openCatMgr()">
        <span style="font-size:22px;width:36px">📂</span>
        <span style="flex:1;font-size:14px;font-weight:600;color:var(--t)">Manage Categories</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </div>
      <div class="lr" style="cursor:pointer" onclick="enableNotifs()">
        <span style="font-size:22px;width:36px">🔔</span>
        <span style="flex:1;font-size:14px;font-weight:600;color:var(--t)">Enable Notifications</span>
        <span id="notif-status" class="badge ${Notification.permission === 'granted' ? 'badge-green' : 'badge-idle'}">${Notification.permission === 'granted' ? 'On' : 'Off'}</span>
      </div>
      <div class="lr" style="cursor:pointer" onclick="expAll()">
        <span style="font-size:22px;width:36px">📤</span>
        <span style="flex:1;font-size:14px;font-weight:600;color:var(--t)">Export All Data</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </div>
      <div class="lr" style="cursor:pointer" onclick="impAll()">
        <span style="font-size:22px;width:36px">📥</span>
        <span style="flex:1;font-size:14px;font-weight:600;color:var(--t)">Import Backup</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </div>
    </div>

    <!-- Data Storage Info -->
    <div style="background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:var(--r-md);padding:14px;margin-bottom:12px;font-size:12px;color:var(--t3);line-height:1.8" class="au3">
      <div style="font-weight:700;color:var(--y);margin-bottom:6px;font-size:13px">💾 Where is Your Data?</div>
      Data is stored on <strong style="color:var(--t)">this device's browser storage (localStorage)</strong>.<br/>
      ⚠️ If you clear browser data or lose your phone, data is lost!<br/>
      <strong style="color:var(--y)">Backup regularly using Export below!</strong>
      <button onclick="expAll()" style="display:block;margin-top:8px;background:var(--y);border:none;border-radius:8px;padding:7px 14px;cursor:pointer;color:black;font-weight:700;font-size:12px">Export Backup</button>
    </div>

    <!-- Security info -->
    <div style="background:var(--g3);border:1px solid rgba(16,185,129,.15);border-radius:var(--r-md);padding:14px;margin-bottom:16px;font-size:12px;color:var(--t3);line-height:1.8" class="au3">
      <div style="font-weight:700;color:var(--g);margin-bottom:6px;font-size:13px">🔐 Data Security</div>
      ✓ Data stored locally on this device<br/>
      ✓ PIN hashed with SHA-256 + salt<br/>
      ✓ Auto-locks after 5 min inactivity<br/>
      ✓ Locks on tab switch (2 min)<br/>
      ✓ ${u.bioEnabled ? 'Biometric enabled ✅' : 'PIN-only mode'}
    </div>

    <!-- Danger zone -->
    <div style="border:1px solid rgba(239,68,68,.18);border-radius:var(--r-md);padding:14px;margin-bottom:16px" class="au4">
      <div style="font-size:12px;font-weight:700;color:var(--r);margin-bottom:10px">⚠️ Danger Zone</div>
      <button class="btn btn-r" style="width:100%;padding:12px;font-size:13px;border-radius:14px;margin-bottom:8px" onclick="clearAllData()">
        Clear All Data
      </button>
      <button class="btn btn-r" style="width:100%;padding:12px;font-size:13px;border-radius:14px" onclick="logout()">
        Logout
      </button>
    </div>

    <div style="text-align:center;font-size:12px;color:var(--t3);padding:10px 0 24px">
      PaisaTracker · Made with ❤️ in India 🇮🇳
    </div>
  `;
}

// ── Edit Profile ──────────────────────────────────────────
function showEP() {
    const u = S.user;
    S.editAvatarSel = u.avatarEmoji || '😊';
    const photoSrc = typeof u.avatarPhoto === 'string' && /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(u.avatarPhoto)
        ? u.avatarPhoto
        : '';
    const ea = document.getElementById('ep-area');
    ea.innerHTML =
        '<div class="card" style="padding:18px;margin-bottom:16px">' +
        '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +
        '    <div style="font-size:16px;font-weight:800;color:var(--t);font-family:\'Sora\',sans-serif">Edit Profile</div>' +
        '    <button class="sh-close" onclick="document.getElementById(\'ep-area\').innerHTML=\'\'">&#x2715;</button>' +
        '  </div>' +
        '  <div style="text-align:center;margin-bottom:18px">' +
        '    <div id="ep-photo-preview" onclick="document.getElementById(\'ep-photo-inp\').click()"' +
        '         style="width:84px;height:84px;border-radius:50%;margin:0 auto 10px;background:var(--gl2);border:2.5px solid var(--bd2);display:flex;align-items:center;justify-content:center;font-size:40px;overflow:hidden;cursor:pointer;position:relative">' +
        (photoSrc ? '<img src="' + photoSrc + '" style="width:100%;height:100%;object-fit:cover"/>' : (u.avatarEmoji || '😊')) +
        '      <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.5);padding:3px;font-size:9px;font-weight:700;color:white;text-align:center">Change</div>' +
        '    </div>' +
        '    <input type="file" id="ep-photo-inp" accept="image/*" style="display:none" onchange="handleProfilePhoto(this)"/>' +
        '    <div style="font-size:11px;color:var(--t3)">Tap to upload a profile photo</div>' +
        (photoSrc ? '<button onclick="clearProfilePhoto()" style="margin-top:6px;background:var(--r2);border:1px solid rgba(248,113,113,.2);border-radius:8px;padding:4px 12px;cursor:pointer;font-size:11px;color:var(--r);font-weight:600">Remove Photo</button>' : '') +
        '  </div>' +
        '  <div style="margin-bottom:12px">' +
        '    <label class="inp-label">Full Name</label>' +
        '    <input class="inp" id="epn" value="' + escapeAttr(u.name) + '" placeholder="e.g. Rahul Sharma"' +
        '           oninput="V.liveCheck(this,\'epn-err\',v=>V.name(v,{min:2,max:50,label:\'Name\',allowNumbers:false}))"/>' +
        '    <div id="epn-err" style="margin-top:4px"></div>' +
        '  </div>' +
        '  <div style="margin-bottom:16px">' +
        '    <label class="inp-label">Mobile (optional)</label>' +
        '    <input class="inp" id="epp" type="tel" value="' + escapeAttr(u.phone || '') + '" placeholder="98765 43210" maxlength="13"' +
        '           oninput="V.livePhone(this,\'epp-err\')"/>' +
        '    <div id="epp-err" style="margin-top:4px"></div>' +
        '  </div>' +
        '  <div style="margin-bottom:16px">' +
        '    <label class="inp-label">Emoji Avatar' + (photoSrc ? ' (if no photo)' : '') + '</label>' +
        '    <div class="avg" id="epag">' +
        AVTS.map((a) => '<div class="avo ' + (a === S.editAvatarSel ? 'sel' : '') + '" onclick="selEA(\'' + a + '\',this)">' + a + '</div>').join('') +
        '    </div>' +
        '  </div>' +
        '  <div style="display:flex;gap:8px">' +
        '    <button class="btn btn-p" style="flex:1" onclick="saveProf()">Save Changes</button>' +
        '    <button class="btn btn-g" onclick="document.getElementById(\'ep-area\').innerHTML=\'\'">Cancel</button>' +
        '  </div>' +
        '</div>';
}

function handleProfilePhoto(input) {
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast('Image too large (max 2 MB)', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
        if (!/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(String(e.target.result || ''))) {
            toast('Unsupported image format', 'error');
            return;
        }
        S._pendingPhoto = e.target.result;
        const preview = document.getElementById('ep-photo-preview');
        if (preview) preview.innerHTML =
            '<img src="' + S._pendingPhoto + '" style="width:100%;height:100%;object-fit:cover"/>' +
            '<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.5);padding:3px;font-size:9px;font-weight:700;color:white;text-align:center">Change</div>';
    };
    reader.readAsDataURL(file);
}

function clearProfilePhoto() {
    S._pendingPhoto = '';
    S.user.avatarPhoto = '';
    showEP();
}

function selEA(a, el) {
    S.editAvatarSel = a;
    document.querySelectorAll('#epag .avo').forEach((x) => x.classList.remove('sel'));
    el.classList.add('sel');
}

function saveProf() {
    const nmRes = V.name(document.getElementById('epn')?.value || '', { min: 2, max: 50, label: 'Name', allowNumbers: false });
    if (!nmRes.ok) { V.showErr('epn', nmRes.error); toast(nmRes.error, 'error'); return; }
    const phoneRaw = document.getElementById('epp')?.value || '';
    let cleanedPhone = '';
    if (phoneRaw.trim()) {
        const phRes = V.phone(phoneRaw);
        if (!phRes.ok) { V.showErr('epp', phRes.error); toast(phRes.error, 'error'); return; }
        cleanedPhone = phRes.cleaned;
    }
    S.user.name = nmRes.v;
    S.user.phone = cleanedPhone;
    S.user.avatarEmoji = S.editAvatarSel;
    if (typeof S._pendingPhoto !== 'undefined') {
        S.user.avatarPhoto = /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(S._pendingPhoto || '') ? S._pendingPhoto : '';
        delete S._pendingPhoto;
    }
    su(S.user);
    document.getElementById('ep-area').innerHTML = '';
    toast('Profile updated ✅');
    rProfile(document.getElementById('pg-profile'));
}


// ── Theme ─────────────────────────────────────────────────
function togTheme() { /* dark-only */ }

// ── Data ──────────────────────────────────────────────────
function expAll() {
    const data = { user: { name: S.user.name, email: S.user.email }, ...S.data, exported: new Date().toISOString() };
    const el = document.createElement('a');
    el.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    el.download = `paisatracker-backup-${today()}.json`;
    el.click();
    toast('Data exported ✅');
}

function impAll() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                const cleaned = normalizeBackupData(data);
                if (!cleaned) { toast('Invalid backup file!', 'error'); return; }
                Modal.confirm(
                    'Import Backup?',
                    'This will REPLACE all your current data with the backup. This cannot be undone.',
                    () => {
                        S.data = cleaned;
                        if (sd()) {
                            toast('Data imported successfully ✅');
                            tabTo('dashboard');
                        }
                    },
                    { confirmText: 'Yes, Import', icon: '📥', danger: true }
                );
            } catch { toast('Invalid JSON file!', 'error'); }
        };
        reader.readAsText(file);
    };
    input.click();
}

function clearAllData() {
    Modal.confirm(
        'Clear ALL Data?',
        '⚠️ This will permanently delete ALL your transactions, accounts, budgets, and goals. This CANNOT be undone.',
        () => {
            S.data = DB.getDefaultData();
            if (sd()) {
                toast('All data cleared', 'error');
                tabTo('dashboard');
            }
        },
        { confirmText: 'Yes, Clear Everything', icon: '⚠️' }
    );
}

function normalizeBackupData(data) {
    if (!data || typeof data !== 'object') return null;
    if (!Array.isArray(data.transactions) || !Array.isArray(data.accounts)) return null;

    const cleanAccounts = data.accounts.slice(0, 200).map((a) => {
        const nm = V.text(a?.name || '', { max: 40 });
        const bal = V.amount(a?.balance ?? 0, { min: -1e9, max: 1e9, allowNegative: true, allowZero: true });
        if (!nm.ok || !bal.ok) return null;
        return {
            id: safeId(a?.id || uid()),
            name: nm.v,
            type: V.text(a?.type || 'other', { max: 20 }).v || 'other',
            balance: bal.n,
            color: /^#[0-9a-fA-F]{6}$/.test(a?.color || '') ? a.color : '#10b981',
            icon: V.text(a?.icon || '💰', { max: 4 }).v || '💰',
        };
    }).filter(Boolean);

    const cleanCategories = Array.isArray(data.categories) ? data.categories.slice(0, 300).map((c) => {
        const nm = V.text(c?.name || '', { max: 50 });
        if (!nm.ok || !nm.v) return null;
        return {
            id: safeId(c?.id || uid()),
            name: nm.v,
            type: V.text(c?.type || 'expense', { max: 20 }).v || 'expense',
            color: /^#[0-9a-fA-F]{6}$/.test(c?.color || '') ? c.color : '#6366f1',
            sub: Array.isArray(c?.sub) ? c.sub.slice(0, 50).map((s) => V.text(s, { max: 40 }).v).filter(Boolean) : [],
        };
    }).filter(Boolean) : DB.getDefaultData().categories;

    const cleanTxs = data.transactions.slice(0, 50000).map((t) => {
        const amt = V.amount(t?.amount, { min: 0.01, max: 1e9, allowNegative: false, allowZero: false });
        const dt = V.date(t?.date || '', { required: true, allowFuture: true });
        if (!amt.ok || !dt.ok) return null;
        return {
            id: safeId(t?.id || uid()),
            type: V.text(t?.type || 'expense', { max: 20 }).v || 'expense',
            amount: amt.n,
            categoryId: safeId(t?.categoryId || ''),
            subcategory: V.text(t?.subcategory || '', { max: 80 }).v || '',
            accountId: safeId(t?.accountId || ''),
            toAccountId: safeId(t?.toAccountId || ''),
            note: V.text(t?.note || '', { max: 200 }).v || '',
            date: String(t.date),
            person: V.text(t?.person || '', { max: 80 }).v || '',
            udhaarType: t?.udhaarType === 'taken' ? 'taken' : 'given',
            isRecurring: !!t?.isRecurring,
        };
    }).filter(Boolean);

    const cleanBudgets = Array.isArray(data.budgets) ? data.budgets.slice(0, 500).map((b) => {
        const amt = V.amount(b?.amount, { min: 1, max: 1e9, allowZero: false, allowNegative: false });
        if (!amt.ok) return null;
        return {
            id: safeId(b?.id || uid()),
            categoryId: safeId(b?.categoryId || ''),
            amount: amt.n,
        };
    }).filter(Boolean) : [];

    const cleanGoals = Array.isArray(data.goals) ? data.goals.slice(0, 1000).map((g) => {
        const title = V.text(g?.title || '', { max: 80 });
        const target = V.amount(g?.targetAmount, { min: 1, max: 1e9, allowZero: false, allowNegative: false });
        const current = V.amount(g?.currentAmount ?? 0, { min: 0, max: 1e9, allowZero: true, allowNegative: false });
        if (!title.ok || !title.v || !target.ok || !current.ok) return null;
        const targetDate = g?.targetDate || '';
        if (targetDate) {
            const d = V.date(targetDate, { required: true, allowFuture: true });
            if (!d.ok) return null;
        }
        const savingsHistory = Array.isArray(g?.savingsHistory) ? g.savingsHistory.slice(0, 5000).map((h) => {
            const ha = V.amount(h?.amount, { min: 0.01, max: 1e9, allowZero: false, allowNegative: false });
            const hd = V.date(h?.date || '', { required: true, allowFuture: true });
            if (!ha.ok || !hd.ok) return null;
            return { amount: ha.n, date: String(h.date), note: V.text(h?.note || '', { max: 200 }).v || '' };
        }).filter(Boolean) : [];
        return {
            id: safeId(g?.id || uid()),
            title: title.v,
            targetAmount: target.n,
            currentAmount: Math.min(current.n, target.n),
            targetDate: targetDate || '',
            emoji: V.text(g?.emoji || '🎯', { max: 4 }).v || '🎯',
            createdAt: V.date(g?.createdAt || today(), { required: true, allowFuture: true }).ok ? (g?.createdAt || today()) : today(),
            savingsHistory,
        };
    }).filter(Boolean) : [];

    const cleanReminders = Array.isArray(data.reminders) ? data.reminders.slice(0, 5000).map((r) => {
        const title = V.text(r?.title || '', { max: 100 });
        const date = V.date(r?.date || '', { required: true, allowFuture: true });
        const amt = V.amount(r?.amount ?? 0, { min: 0, max: 1e9, allowZero: true, allowNegative: false });
        if (!title.ok || !title.v || !date.ok || !amt.ok) return null;
        return {
            id: safeId(r?.id || uid()),
            title: title.v,
            date: String(r.date),
            amount: amt.n,
            note: V.text(r?.note || '', { max: 200 }).v || '',
        };
    }).filter(Boolean) : [];

    return {
        transactions: cleanTxs,
        accounts: cleanAccounts.length ? cleanAccounts : DB.getDefaultData().accounts,
        categories: cleanCategories,
        budgets: cleanBudgets,
        goals: cleanGoals,
        reminders: cleanReminders,
    };
}

function logout() {
    Modal.confirm(
        'Logout?',
        'You will be signed out. Your data will remain saved on this device.',
        () => {
            DB.clearSession();
            S.user = null;
            S.data = null;
            document.body.className = '';
            go('login');
            Auth.renderSavedAccounts();
        },
        { confirmText: 'Logout', icon: '🚪', danger: false }
    );
}

// ── Change PIN ────────────────────────────────────────────
function showChangePIN() {
    openSh('change-pin');
    setTimeout(() => {
        const c = document.getElementById('sh-change-pin');
        if (!c) return;
        c.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
        <div style="font-family:'Sora',sans-serif;font-size:20px;font-weight:800;color:var(--t)">Change PIN</div>
        <button onclick="closeSh('change-pin')" class="sh-close" aria-label="Close">&#x2715;</button>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:28px;padding:12px 0">
        <div style="font-size:48px">🔑</div>
        <div id="cpinp" style="display:flex;flex-direction:column;align-items:center;gap:26px;width:100%"></div>
      </div>
    `;
        renderPINPad('cpinp', 'change_old');
    }, 100);
}

window.rProfile = rProfile;
window.showEP = showEP;
window.handleProfilePhoto = handleProfilePhoto;
window.clearProfilePhoto = clearProfilePhoto;
window.selEA = selEA;
window.saveProf = saveProf;
window.expAll = expAll;
window.impAll = impAll;
window.clearAllData = clearAllData;
window.logout = logout;
window.showChangePIN = showChangePIN;

async function enableNotifs() {
    const granted = await Notifs.requestPermission();
    const el = document.getElementById('notif-status');
    if (granted) {
        toast('Notifications enabled! 🔔 Bill reminders will now appear.', 'success');
        if (el) { el.textContent = 'On'; el.className = 'badge badge-green'; }
        Notifs.runChecks();
    } else {
        toast('Notifications blocked. Please enable in browser settings.', 'warning');
        if (el) { el.textContent = 'Blocked'; el.className = 'badge badge-red'; }
    }
}
window.enableNotifs = enableNotifs;
