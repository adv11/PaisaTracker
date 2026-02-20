/**
 * PaisaTracker — Global State
 */

const S = {
    user: null,
    data: null,
    tab: 'dashboard',
    charts: {},

    // Auth
    pendingEmail: '',
    pendingUser: null,   // user object being built in setup
    pendingPin: '',     // first PIN entry (for confirm step)

    // Lock
    lockAttempts: 0,
    lockUntil: null,

    // Transaction form
    txForm: {},

    // Transaction filter state
    txFilter: 'all',
    txSearch: '',
    txMonth: new Date().toISOString().slice(0, 7),

    // Goals sub-tab
    goalsTab: 'budget',

    // Reports
    reportPeriod: 'monthly',
    reportYear: new Date().getFullYear(),
    reportMonth: new Date().getMonth(),

    // UI
    avatarSel: '😊',
    editAvatarSel: '😊',
    acctForm: { name: '', type: 'bank', balance: '', color: '#10b981', icon: '🏦', id: null },

    // Inactivity timer
    inactivityTimer: null,
};

// ── Data persistence helpers ─────────────────────────────
const sd = () => {
    if (!S.user || !S.data) return true;
    const ok = DB.saveData(S.user.id, S.data);
    if (!ok && typeof toast === 'function') {
        toast('Save failed: storage full or blocked. Export backup now.', 'error');
    }
    return ok;
};

const su = (user) => {
    const ok = DB.saveUser(user);
    if (!ok && typeof toast === 'function') {
        toast('Profile save failed: storage unavailable.', 'error');
    }
    S.user = user;
    return ok;
};

window.S = S;
window.sd = sd;
window.su = su;
