/**
 * PaisaTracker — Utility Functions
 */

// ── ID Generator ─────────────────────────────────────────
const uid = () =>
    Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

// ── Date ─────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];

const MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MNF = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const relativeDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return diff + 'd ago';
    return formatDate(dateStr);
};

const groupByDate = (txs) => {
    const groups = {};
    txs.forEach((tx) => {
        const key = relativeDate(tx.date) + '|' + tx.date;
        if (!groups[key]) groups[key] = [];
        groups[key].push(tx);
    });
    return Object.entries(groups).sort((a, b) =>
        b[0].split('|')[1].localeCompare(a[0].split('|')[1])
    );
};

// ── Currency Formatter ───────────────────────────────────
const INR = (n, compact = false) => {
    // Normalise: null → 0, NaN → 0, -0 → 0
    let v = parseFloat(n) || 0;
    if (Object.is(v, -0)) v = 0;  // fix -0 display bug
    const a = Math.abs(v);
    if (compact) {
        // Only use compact format for very large numbers
        if (a >= 1e7) return `₹${(v / 1e7).toFixed(2).replace(/\.?0+$/, '')}Cr`;
        if (a >= 1e5) return `₹${(v / 1e5).toFixed(2).replace(/\.?0+$/, '')}L`;
        // Don't abbreviate thousands - show full amount
    }
    // Round to 2 decimal places to avoid floating-point noise
    const rounded = Math.round(v * 100) / 100;
    return `₹${rounded.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// ── Emoji Lists ──────────────────────────────────────────
const AVTS = ['😊', '😎', '🤑', '🧑‍💼', '👩‍💼', '🧑‍💻', '👨‍🎨', '🦸', '🥷', '🎯', '💎', '🌟', '🦊', '🐬', '🦋'];
const AICS = ['💵', '🏦', '📱', '💳', '💰', '🏧', '📊', '💎', '🪙', '👛', '🎯', '🌟', '🔥', '⚡'];
const ACTY = ['cash', 'bank', 'upi', 'credit', 'debit', 'wallet', 'fd', 'mf', 'other'];

// ── Type colour map ──────────────────────────────────────
const TYPE_COLOR = {
    income: '#10b981',
    expense: '#ef4444',
    investment: '#6366f1',
    transfer: '#3b82f6',
    udhaar: '#f59e0b',
};

const TYPE_BG = {
    income: 'rgba(16,185,129,0.10)',
    expense: 'rgba(239,68,68,0.10)',
    investment: 'rgba(99,102,241,0.10)',
    transfer: 'rgba(59,130,246,0.10)',
    udhaar: 'rgba(245,158,11,0.10)',
};

// ── Safe text helpers ────────────────────────────────────
const escapeHTML = (v) => String(v == null ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeAttr = (v) => escapeHTML(v).replace(/`/g, '&#96;');

const safeId = (v) => String(v == null ? '' : v).replace(/[^a-zA-Z0-9_-]/g, '');

const csvCell = (v) => {
    const s = String(v == null ? '' : v).replace(/\r?\n/g, ' ');
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return `"${safe.replace(/"/g, '""')}"`;
};

// ── Haptics ──────────────────────────────────────────────
const hap = (type = 'light') => {
    try {
        if (navigator.vibrate) {
            navigator.vibrate(type === 'light' ? 10 : type === 'medium' ? 30 : [30, 20, 30]);
        }
    } catch { }
};

// ── PIN hash (SHA-256) ───────────────────────────────────
const randomHex = (bytes = 16) => {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return Array.from(arr).map((x) => x.toString(16).padStart(2, '0')).join('');
};

const hashPin = async (pin, salt = '') => {
    if (!crypto?.subtle) throw new Error('Secure crypto unavailable');
    const enc = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
        'raw',
        enc.encode(String(pin)),
        'PBKDF2',
        false,
        ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: enc.encode(String(salt)),
            iterations: 120000,
            hash: 'SHA-256',
        },
        baseKey,
        256
    );
    return Array.from(new Uint8Array(bits))
        .map((x) => x.toString(16).padStart(2, '0'))
        .join('');
};

// ── Copy to clipboard ────────────────────────────────────
const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        return true;
    }
};

// ── Web Share ────────────────────────────────────────────
const webShare = async ({ title, text, url }) => {
    if (navigator.share) {
        try {
            await navigator.share({ title, text, url });
            return true;
        } catch { return false; }
    }
    return false;
};

// ── Savings rate colour ──────────────────────────────────
const srColor = (sr) => sr > 30 ? '#10b981' : sr > 10 ? '#f59e0b' : '#ef4444';
const srLabel = (sr) => sr > 30 ? 'Excellent 🌟' : sr > 10 ? 'Good 👍' : 'Needs Work ⚠️';

// ── Greeting ─────────────────────────────────────────────
const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning ☀️';
    if (h < 17) return 'Good Afternoon 🌤️';
    if (h < 21) return 'Good Evening 🌆';
    return 'Good Night 🌙';
};

window.uid = uid;
window.today = today;
window.MN = MN;
window.MNF = MNF;
window.formatDate = formatDate;
window.relativeDate = relativeDate;
window.groupByDate = groupByDate;
window.INR = INR;
window.AVTS = AVTS;
window.AICS = AICS;
window.ACTY = ACTY;
window.TYPE_COLOR = TYPE_COLOR;
window.TYPE_BG = TYPE_BG;
window.escapeHTML = escapeHTML;
window.escapeAttr = escapeAttr;
window.safeId = safeId;
window.csvCell = csvCell;
window.hap = hap;
window.randomHex = randomHex;
window.hashPin = hashPin;
window.copyToClipboard = copyToClipboard;
window.webShare = webShare;
window.srColor = srColor;
window.srLabel = srLabel;
window.greeting = greeting;
