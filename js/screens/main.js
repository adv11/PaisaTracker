/**
 * PaisaTracker — Main Screen / Tab Navigation
 */

// ── Tab navigation ────────────────────────────────────────
function tabTo(t) {
    S.tab = t;

    // Update nav buttons
    document.querySelectorAll('.nb').forEach((b) =>
        b.classList.toggle('on', b.dataset.t === t)
    );

    // Show/hide pages
    document.querySelectorAll('[id^="pg-"]').forEach((p) => p.style.display = 'none');
    const pg = document.getElementById('pg-' + t);
    if (pg) {
        pg.style.display = 'block';
        pg.classList.add('tab-enter');
        setTimeout(() => pg.classList.remove('tab-enter'), 400);
        document.getElementById('ms')?.scrollTo(0, 0);
    }

    renderTab(t);

    // Goals reminder badge
    const dueCount = (S.data?.reminders || []).filter((r) => {
        const diff = (new Date(r.date) - new Date()) / 86400000;
        return diff >= 0 && diff <= 3;
    }).length;

    const nb = document.getElementById('nb-g');
    const bd = nb?.querySelector('.nb-bdg');
    if (dueCount > 0 && !bd) {
        const bel = document.createElement('div');
        bel.className = 'nb-bdg';
        nb?.appendChild(bel);
    } else if (!dueCount && bd) {
        bd.remove();
    }

    hap('light');
}

function renderTab(t) {
    const pg = document.getElementById('pg-' + t);
    if (!pg || !S.data) return;
    const renderers = {
        dashboard: rDash,
        transactions: rTxns,
        accounts: rAccs,
        goals: rGoals,
        reports: rRpts,
        profile: rProfile,
    };
    (renderers[t] || (() => { }))(pg);
}

// Expose for inline events
window.tabTo = tabTo;
window.renderTab = renderTab;
