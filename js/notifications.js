/**
 * PaisaTracker — Push Notifications Module
 *
 * Covers:
 *  1. Push notification permission request
 *  2. Reminder notifications on due date (daily check via setTimeout & on launch)
 *  3. Recurring/EMI month-start reminder
 *  4. Weekly "Add your expenses!" nudge
 *  5. Daily spending budget exceeded alert
 */

const Notifs = (() => {
    const STORE_KEY = 'pt-notif-fired';

    function getFired() {
        try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch { return {}; }
    }
    function markFired(key) {
        const f = getFired(); f[key] = today();
        localStorage.setItem(STORE_KEY, JSON.stringify(f));
    }
    function wasFiredToday(key) {
        return getFired()[key] === today();
    }

    async function requestPermission() {
        if (!('Notification' in window)) return false;
        if (Notification.permission === 'granted') return true;
        if (Notification.permission === 'denied') return false;
        const perm = await Notification.requestPermission();
        return perm === 'granted';
    }

    function send(title, body, opts = {}) {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        const n = new Notification(title, {
            body,
            icon: './icons/icon-192.png',
            badge: './icons/icon-192.png',
            tag: opts.tag || 'paisa-notif',
            requireInteraction: opts.requireInteraction || false,
            data: opts.data || {},
            silent: opts.silent || false,
            ...opts,
        });
        n.onclick = () => { window.focus(); n.close(); };
        return n;
    }

    function runChecks() {
        if (!S?.data || !S?.user) return;
        const { reminders = [], budgets = [], categories = [], transactions = [] } = S.data;
        const now = new Date();
        const todayStr = today();

        // ── 1. Reminders due today ─────────────────────────────
        reminders.forEach(r => {
            if (r.date === todayStr && !wasFiredToday(`rem-${r.id}`)) {
                send(
                    `🔔 Bill Due Today: ${r.title}`,
                    `Amount: ₹${r.amount.toLocaleString('en-IN')}${r.note ? ` — ${r.note}` : ''}`,
                    { tag: `rem-${r.id}`, requireInteraction: true }
                );
                markFired(`rem-${r.id}`);
            }
            // Reminders coming in 3 days — early warning
            const daysTo = Math.ceil((new Date(r.date) - now) / 86400000);
            if (daysTo === 3 && !wasFiredToday(`rem-early-${r.id}`)) {
                send(
                    `⚡ Upcoming Bill: ${r.title}`,
                    `Due in 3 days (${r.date}) · ₹${r.amount.toLocaleString('en-IN')}`,
                    { tag: `rem-early-${r.id}` }
                );
                markFired(`rem-early-${r.id}`);
            }
        });

        // ── 2. Recurring / EMI on 1st of month ─────────────────
        if (now.getDate() === 1 && !wasFiredToday('emi-month-start')) {
            const recTxs = transactions.filter(t => t.isRecurring && t.type === 'expense');
            if (recTxs.length > 0) {
                const tot = recTxs.reduce((s, t) => s + t.amount, 0);
                send(
                    `💳 EMI Month Start Reminder`,
                    `${recTxs.length} recurring expense${recTxs.length > 1 ? 's' : ''} totalling ₹${tot.toLocaleString('en-IN')} this month`,
                    { tag: 'emi-month-start', requireInteraction: true }
                );
                markFired('emi-month-start');
            }
        }

        // ── 3. Weekly "Add transactions" nudge ─────────────────
        const lastTx = transactions[0];
        const daysSinceLast = lastTx
            ? Math.floor((now - new Date(lastTx.date)) / 86400000) : 99;
        if (daysSinceLast >= 3 && !wasFiredToday('add-tx-nudge')) {
            send(
                `📊 PaisaTracker — ${daysSinceLast} days!`,
                `Koi naya transaction add nahi hua. Expenses track karte raho!`,
                { tag: 'add-tx-nudge', silent: true }
            );
            markFired('add-tx-nudge');
        }

        // ── 4. Budget exceeded alert ───────────────────────────
        const mTxs = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === 'expense';
        });
        budgets.forEach(b => {
            const sp = mTxs.filter(t => t.categoryId === b.categoryId).reduce((s, t) => s + t.amount, 0);
            if (sp > b.amount && !wasFiredToday(`budget-breach-${b.id}`)) {
                const cat = categories.find(c => c.id === b.categoryId);
                send(
                    `⚠️ Budget Exceeded: ${cat?.name || 'Category'}`,
                    `Spent ₹${sp.toLocaleString('en-IN')} of ₹${b.amount.toLocaleString('en-IN')} budget!`,
                    { tag: `budget-breach-${b.id}`, requireInteraction: true }
                );
                markFired(`budget-breach-${b.id}`);
            }
        });
    }

    // Schedule a new reminder notification
    function scheduleReminder(r) {
        if (!r.date || !r.amount) return;
        const ms = new Date(r.date).getTime() - Date.now();
        if (ms > 0 && ms < 7 * 24 * 60 * 60 * 1000) { // only schedule if within 7 days
            setTimeout(() => {
                send(`🔔 Bill Due: ${r.title}`, `₹${r.amount.toLocaleString('en-IN')} due today`, { tag: `sched-${r.id}`, requireInteraction: true });
            }, ms);
        }
    }

    async function init() {
        // Request permission on init (after user is logged in)
        const granted = await requestPermission();
        if (!granted) return;
        // Run checks at startup
        runChecks();
        // Re-run checks every hour
        setInterval(runChecks, 60 * 60 * 1000);
        // Also run on focus
        window.addEventListener('focus', runChecks, { passive: true });
    }

    return { init, requestPermission, send, scheduleReminder, runChecks };
})();

window.Notifs = Notifs;
