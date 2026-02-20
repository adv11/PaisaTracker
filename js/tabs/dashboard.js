/**
 * PaisaTracker — Dashboard Tab
 * Note: txRow is defined in transactions.js (loaded before this file)
 */

function rDash(pg) {
  const { transactions: txs, accounts, categories, budgets, goals, reminders } = S.data;
  const now = new Date();
  const mTxs = txs.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const mI = mTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const mE = mTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const mS = mI - mE;
  const sr = mI > 0 ? Math.round((mS / mI) * 100) : 0;
  const nW = accounts.filter((a) => a.type !== 'credit').reduce((s, a) => s + a.balance, 0)
    - accounts.filter((a) => a.type === 'credit').reduce((s, a) => s + Math.abs(a.balance), 0);

  const expMap = {};
  mTxs.filter((t) => t.type === 'expense').forEach((t) => {
    const c = categories.find((x) => x.id === t.categoryId);
    const n = c?.name || 'Other';
    expMap[n] = { v: (expMap[n]?.v || 0) + t.amount, col: c?.color || '#6366f1' };
  });
  const pieData = Object.entries(expMap).sort((a, b) => b[1].v - a[1].v).slice(0, 8);

  const dueReminders = reminders.filter((r) => {
    const diff = (new Date(r.date) - now) / 86400000;
    return diff >= 0 && diff <= 3;
  });
  const overBudgets = budgets.filter((b) => {
    const sp = mTxs.filter((t) => t.type === 'expense' && t.categoryId === b.categoryId)
      .reduce((s, t) => s + t.amount, 0);
    return sp > b.amount * 0.85;
  });

  // Daily budget ring
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const todayTxs = txs.filter((t) => t.date === today() && t.type === 'expense');
  const todaySpend = todayTxs.reduce((s, t) => s + t.amount, 0);
  const dailyBudget = totalBudget > 0 ? totalBudget / 30 : 0;
  const ringPct = dailyBudget > 0 ? Math.min(100, (todaySpend / dailyBudget) * 100) : 0;
  const ringColor = ringPct > 90 ? '#ef4444' : ringPct > 70 ? '#f59e0b' : '#10b981';
  const ringCirc = 2 * Math.PI * 38;
  const ringDash = ringCirc * (1 - ringPct / 100);

  // Spending insights
  const lastMStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMTxs = txs.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === lastMStart.getMonth() && d.getFullYear() === lastMStart.getFullYear();
  });
  const lastME = lastMTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const topCat = pieData[0];

  pg.innerHTML = `
    <div class="safe-top"></div>
    <div class="dash-header au">
      <div>
        <div class="dash-greeting">${greeting()}</div>
        <div class="dash-name">${escapeHTML(S.user?.name?.split(' ')[0] || 'User')}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:1px">Net Worth</div>
        <div style="font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:800;color:${nW >= 0 ? 'var(--g)' : 'var(--r)'};margin-top:2px">${INR(nW, true)}</div>
      </div>
    </div>

    <!-- Monthly summary card -->
    <div class="card-glow" style="padding:22px;margin-bottom:14px" class="au1">
      <div style="font-size:10px;color:rgba(148,163,184,.5);font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:14px">${MN[now.getMonth()]} ${now.getFullYear()}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;margin-bottom:${mI > 0 ? 16 : 0}px">
        ${[['Income', mI, '#10b981'], ['Expense', mE, '#ef4444'], ['Savings', mS, mS >= 0 ? '#6366f1' : '#ef4444']].map(([l, v, c]) => `
          <div style="text-align:center;padding:6px 4px">
            <div style="font-size:9px;color:rgba(148,163,184,.45);margin-bottom:4px;font-weight:700;text-transform:uppercase;letter-spacing:.5px">${l}</div>
            <div style="font-size:18px;font-weight:800;color:${c};font-family:'Space Grotesk',sans-serif;letter-spacing:-.5px">${INR(v, true)}</div>
          </div>`).join('')}
      </div>
      ${mI > 0 ? `
        <div style="display:flex;justify-content:space-between;margin-bottom:7px">
          <span style="font-size:10px;color:rgba(148,163,184,.5)">Savings Rate</span>
          <span style="font-size:10px;font-weight:700;color:${srColor(sr)}">${sr}%</span>
        </div>
        <div class="pb">
          <div class="pbf" style="width:${Math.max(0, Math.min(100, sr))}%;background:linear-gradient(90deg,${sr > 30 ? '#10b981,#6366f1' : sr > 10 ? '#f59e0b,#ef4444' : '#ef4444,#dc2626'})"></div>
        </div>` : ''}
    </div>

    <!-- Daily Spend Meter -->
    ${dailyBudget > 0 ? `
    <div class="card" style="padding:16px;margin-bottom:10px;display:flex;align-items:center;gap:14px">
      <div class="spend-ring">
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="6"/>
          <circle cx="45" cy="45" r="38" fill="none" stroke="${ringColor}" stroke-width="6" stroke-linecap="round"
            stroke-dasharray="${ringCirc}" stroke-dashoffset="${ringDash}" style="transition:stroke-dashoffset 1s var(--ease-smooth)"/>
        </svg>
        <div class="spend-ring-label">
          <div style="font-size:11px;font-weight:800;color:${ringColor};font-family:'Space Grotesk',sans-serif">${Math.round(ringPct)}%</div>
        </div>
      </div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:var(--t);margin-bottom:2px">Today's Spending</div>
        <div style="font-size:20px;font-weight:800;color:${ringColor};font-family:'Space Grotesk',sans-serif">${INR(todaySpend)}</div>
        <div style="font-size:11px;color:var(--t3);margin-top:2px">Daily budget: ${INR(Math.round(dailyBudget))}</div>
      </div>
    </div>` : ''}

    <!-- Alerts -->
    ${dueReminders.slice(0, 1).map((r) => `
      <div class="insight-card" style="border-color:rgba(245,158,11,.25);background:rgba(245,158,11,.07)">
        <span style="font-size:20px">🔔</span>
        <div>
          <div style="font-size:13px;font-weight:700;color:#f59e0b">${r.title} due soon!</div>
          <div style="font-size:11px;color:var(--t3)">${formatDate(r.date)} · ${INR(r.amount)}</div>
        </div>
      </div>`).join('')}

    ${overBudgets.slice(0, 1).map((b) => {
    const cat = categories.find((c) => c.id === b.categoryId);
    const sp = mTxs.filter((t) => t.type === 'expense' && t.categoryId === b.categoryId).reduce((s, t) => s + t.amount, 0);
    return `
      <div class="insight-card" style="border-color:rgba(239,68,68,.25);background:rgba(239,68,68,.07)">
        <span style="font-size:20px">⚠️</span>
        <div>
          <div style="font-size:13px;font-weight:700;color:var(--r)">${cat?.name} budget almost over!</div>
          <div style="font-size:11px;color:var(--t3)">${INR(sp)} spent of ${INR(b.amount)} budget</div>
        </div>
      </div>`;
  }).join('')}

    <!-- Spending insight -->
    ${lastME > 0 && mE > 0 ? `
    <div class="insight-card" style="margin-bottom:10px">
      <span style="font-size:20px">💡</span>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:700;color:var(--t)">Spending Insight</div>
        <div style="font-size:11px;color:var(--t2);margin-top:2px">
          ${mE > lastME ? `⬆ ${Math.round(((mE - lastME) / lastME) * 100)}% more than last month` : `⬇ ${Math.round(((lastME - mE) / lastME) * 100)}% less than last month`}
          ${topCat ? ` · Top: ${escapeHTML(topCat[0].replace(/^\S+\s/, ''))}` : ''}
        </div>
      </div>
    </div>` : ''}

    <!-- Accounts carousel -->
    <div style="margin-bottom:18px" class="au2">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div class="section-title">Accounts</div>
        <button onclick="tabTo('accounts')" style="background:none;border:none;cursor:pointer;font-size:12px;color:var(--g);font-weight:700">See all →</button>
      </div>
      <div class="hscroll">
        ${accounts.map((a) => `
          <div class="acd" style="background:linear-gradient(135deg,${a.color}20,${a.color}08);border:1px solid ${a.color}28">
            <div style="font-size:28px;margin-bottom:10px">${a.icon}</div>
            <div style="font-size:11px;color:var(--t2);margin-bottom:2px;font-weight:500">${escapeHTML(a.name)}</div>
            <div style="font-size:18px;font-weight:800;color:${a.balance >= 0 ? 'var(--t)' : 'var(--r)'};font-family:'Space Grotesk',sans-serif">${INR(a.balance, true)}</div>
            <div style="font-size:9px;color:var(--t3);text-transform:uppercase;letter-spacing:1px;margin-top:3px">${a.type}</div>
          </div>`).join('')}
      </div>
    </div>

    <!-- Charts -->
    ${txs.length > 0 ? `
      <div class="card" style="padding:18px;margin-bottom:14px" class="au3">
        <div class="section-title">6-Month Overview</div>
        <div class="ch"><canvas id="d-bar"></canvas></div>
      </div>
      ${pieData.length > 0 ? `
        <div class="card" style="padding:18px;margin-bottom:14px">
          <div class="section-title">This Month's Expenses</div>
          <div style="display:flex;align-items:center">
            <div style="width:160px;height:160px;flex-shrink:0"><canvas id="d-pie"></canvas></div>
            <div style="flex:1;display:flex;flex-direction:column;gap:7px;overflow:hidden;padding-left:8px">
              ${pieData.slice(0, 5).map(([nm, { v, col }]) => `
                <div style="display:flex;align-items:center;gap:7px">
                  <div style="width:8px;height:8px;border-radius:2px;background:${col};flex-shrink:0"></div>
                  <span style="font-size:11px;color:var(--t2);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHTML(nm.replace(/^\S+\s/, ''))}</span>
                  <span style="font-size:11px;font-weight:700;color:var(--t);flex-shrink:0">${INR(v, true)}</span>
                </div>`).join('')}
            </div>
          </div>
        </div>` : ''}
      <div class="card" style="padding:18px;margin-bottom:14px">
        <div style="padding-bottom:12px"><div class="section-title">Recent Transactions</div></div>
        ${txs.slice(0, 5).map((t) => txRow(t)).join('')}
        <button onclick="tabTo('transactions')" style="width:100%;padding:12px;background:var(--gl);border:1px solid var(--bd);border-radius:12px;cursor:pointer;font-size:13px;color:var(--t2);font-weight:600;margin-top:8px">View all →</button>
      </div>` :
      `<div style="text-align:center;padding:56px 20px;color:var(--t3)">
      <div style="font-size:58px;margin-bottom:16px;animation:float 3s ease-in-out infinite">💰</div>
      <div style="font-size:17px;font-weight:700;color:var(--t2);margin-bottom:6px">Koi transaction nahi abhi</div>
      <div style="font-size:13px">Neeche + button dabao 👇</div>
    </div>`}
  `;

  setTimeout(() => {
    if (!txs.length) return;

    // ── 6-Month bar chart with gradient fills ─────────────
    const bars = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const t = txs.filter((x) => {
        const td = new Date(x.date);
        return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
      });
      return {
        m: MN[d.getMonth()].slice(0, 3),
        i: t.filter((x) => x.type === 'income').reduce((s, x) => s + x.amount, 0),
        e: t.filter((x) => x.type === 'expense').reduce((s, x) => s + x.amount, 0),
      };
    });

    const barCanvas = document.getElementById('d-bar');
    if (barCanvas) {
      const ctx = barCanvas.getContext('2d');

      // Gradient for income bars
      const gIn = ctx.createLinearGradient(0, 0, 0, barCanvas.offsetHeight || 140);
      gIn.addColorStop(0, 'rgba(63,185,80,0.88)');
      gIn.addColorStop(1, 'rgba(35,134,54,0.50)');

      // Gradient for expense bars
      const gEx = ctx.createLinearGradient(0, 0, 0, barCanvas.offsetHeight || 140);
      gEx.addColorStop(0, 'rgba(248,81,73,0.88)');
      gEx.addColorStop(1, 'rgba(248,81,73,0.30)');

      Charts.bar('d-bar', {
        labels: bars.map((d) => d.m),
        datasets: [
          {
            label: 'Income', data: bars.map((d) => d.i),
            backgroundColor: gIn, borderRadius: 8, borderSkipped: false,
            borderColor: 'rgba(63,185,80,0.3)', borderWidth: 1,
          },
          {
            label: 'Expense', data: bars.map((d) => d.e),
            backgroundColor: gEx, borderRadius: 8, borderSkipped: false,
            borderColor: 'rgba(248,81,73,0.2)', borderWidth: 1,
          },
        ],
      }, null, {
        animation: { duration: 900, easing: 'easeOutQuart', delay: (ctx) => ctx.dataIndex * 60 },
        plugins: {
          legend: {
            display: true,
            labels: { color: 'rgba(232,245,233,0.6)', font: { family: 'Space Grotesk', size: 11 }, boxWidth: 10, borderRadius: 3 },
          },
          tooltip: {
            backgroundColor: 'rgba(10,10,10,0.92)',
            titleColor: '#39FF14', bodyColor: '#e8f5e9',
            borderColor: 'rgba(57,255,20,0.2)', borderWidth: 1,
            callbacks: { label: (item) => ' ' + INR(item.raw) },
          },
        },
        scales: {
          x: { ticks: { color: 'rgba(158,186,156,0.7)', font: { family: 'Space Grotesk', size: 10 } }, grid: { display: false } },
          y: { ticks: { color: 'rgba(158,186,156,0.5)', font: { family: 'Space Grotesk', size: 10 }, callback: (v) => INR(v, true) }, grid: { color: 'rgba(57,255,20,0.05)' }, border: { display: false } },
        },
      });
    }

    // ── Doughnut chart with animation ─────────────────────
    if (pieData.length > 0) {
      Charts.doughnut('d-pie', {
        labels: pieData.map(([n]) => n.replace(/^\S+\s/, '')),
        datasets: [{
          data: pieData.map(([, { v }]) => v),
          backgroundColor: pieData.map(([, { col }]) => col),
          borderWidth: 2,
          borderColor: '#0d1117',
          hoverOffset: 6,
        }],
      }, '60%', {
        animation: { animateRotate: true, animateScale: true, duration: 800, easing: 'easeOutCubic' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(10,10,10,0.92)',
            titleColor: '#39FF14', bodyColor: '#e8f5e9',
            borderColor: 'rgba(57,255,20,0.2)', borderWidth: 1,
            callbacks: { label: (item) => ' ' + INR(item.raw) + ' (' + Math.round((item.raw / pieData.reduce((s, [, { v }]) => s + v, 0)) * 100) + '%)' },
          },
        },
      });
    }
  }, 90);

}

// ── Delete Transaction ────────────────────────────────────
let _undoTimer = null;
let _undoTx = null;

function delTx(id) {
  const tx = S.data.transactions.find((t) => t.id === id);
  if (!tx) return;

  Modal.confirm(
    'Delete Transaction?',
    `This will remove the transaction and reverse the balance adjustment.`,
    () => {
      // Reverse balance
      S.data.accounts = S.data.accounts.map((a) => {
        if (tx.type === 'income' && a.id === tx.accountId) return { ...a, balance: a.balance - tx.amount };
        if ((tx.type === 'expense' || tx.type === 'investment') && a.id === tx.accountId) return { ...a, balance: a.balance + tx.amount };
        if (tx.type === 'transfer') {
          if (a.id === tx.accountId) return { ...a, balance: a.balance + tx.amount };
          if (a.id === tx.toAccountId) return { ...a, balance: a.balance - tx.amount };
        }
        if (tx.type === 'udhaar') {
          if (tx.udhaarType === 'given' && a.id === tx.accountId) return { ...a, balance: a.balance + tx.amount };
          if (tx.udhaarType === 'taken' && a.id === tx.accountId) return { ...a, balance: a.balance - tx.amount };
        }
        return a;
      });
      S.data.transactions = S.data.transactions.filter((t) => t.id !== id);
      sd();
      toast('Transaction deleted', 'error');
      renderTab(S.tab);
    },
    { confirmText: 'Yes, Delete', icon: '🗑️' }
  );
}

window.rDash = rDash;
window.delTx = delTx;
