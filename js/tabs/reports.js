/**
 * PaisaTracker — Reports Tab
 */

function rRpts(pg) {
    const { transactions: txs, categories } = S.data;
    const now = new Date();

    const getPT = () => {
        if (S.reportPeriod === 'yearly') return txs.filter((t) => new Date(t.date).getFullYear() === S.reportYear);
        if (S.reportPeriod === 'monthly') {
            return txs.filter((t) => {
                const d = new Date(t.date);
                return d.getMonth() === S.reportMonth && d.getFullYear() === S.reportYear;
            });
        }
        const w = new Date(Date.now() - 7 * 86400000);
        return txs.filter((t) => new Date(t.date) >= w);
    };

    const pt = getPT();
    const inc = pt.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const exp = pt.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const inv = pt.filter((t) => t.type === 'investment').reduce((s, t) => s + t.amount, 0);
    const sr = inc > 0 ? Math.round(((inc - exp) / inc) * 100) : 0;

    const catMap = {};
    pt.filter((t) => t.type === 'expense').forEach((t) => {
        const c = categories.find((x) => x.id === t.categoryId);
        const n = c?.name || 'Other';
        catMap[n] = { v: (catMap[n]?.v || 0) + t.amount, col: c?.color || '#6366f1' };
    });
    const pieData = Object.entries(catMap).sort((a, b) => b[1].v - a[1].v).slice(0, 9);
    const topExp = Object.entries(catMap).sort((a, b) => b[1].v - a[1].v).slice(0, 5);

    pg.innerHTML = `
    <div class="safe-top"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 0 14px" class="au">
      <div style="font-family:'Sora',sans-serif;font-size:24px;font-weight:800;color:var(--t)">Reports</div>
      <button onclick="dlRpt()" style="background:var(--gl);border:1px solid var(--bd);border-radius:12px;padding:9px 13px;cursor:pointer;color:var(--g);font-size:12px;font-weight:700;display:flex;align-items:center;gap:6px;backdrop-filter:var(--blur)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
        Export
      </button>
    </div>

    <!-- Period selector -->
    <div style="display:flex;gap:8px;margin-bottom:12px" class="au1">
      ${['weekly', 'monthly', 'yearly'].map((p) => `
        <button class="btn" style="flex:1;padding:9px;font-size:12px;border-radius:14px;
          background:${S.reportPeriod === p ? 'var(--g)' : 'var(--gl)'};
          color:${S.reportPeriod === p ? 'white' : 'var(--t2)'};
          border:1px solid ${S.reportPeriod === p ? 'transparent' : 'var(--bd)'}"
          onclick="S.reportPeriod='${p}';rRpts(document.getElementById('pg-reports'))">
          ${p[0].toUpperCase() + p.slice(1)}
        </button>`).join('')}
    </div>

    <!-- Year / month filter -->
    ${S.reportPeriod !== 'weekly' ? `
      <div style="display:flex;gap:8px;margin-bottom:14px" class="au2">
        <select class="inp" style="flex:1" onchange="S.reportYear=parseInt(this.value);rRpts(document.getElementById('pg-reports'))">
          ${[2023, 2024, 2025, 2026, 2027].map((y) => `<option value="${y}" ${S.reportYear === y ? 'selected' : ''}>${y}</option>`).join('')}
        </select>
        ${S.reportPeriod === 'monthly' ? `
          <select class="inp" style="flex:1" onchange="S.reportMonth=parseInt(this.value);rRpts(document.getElementById('pg-reports'))">
            ${MNF.map((m, i) => `<option value="${i}" ${S.reportMonth === i ? 'selected' : ''}>${m}</option>`).join('')}
          </select>` : ''}
      </div>` : ''}

    <!-- Summary cards -->
    <div class="g2" style="margin-bottom:14px" class="au2">
      ${[['💰 Income', inc, 'var(--g)', 'rgba(16,185,129,.1)', 'rgba(16,185,129,.2)'],
        ['💸 Expense', exp, 'var(--r)', 'rgba(239,68,68,.1)', 'rgba(239,68,68,.2)'],
        ['📊 Invested', inv, 'var(--b)', 'rgba(99,102,241,.1)', 'rgba(99,102,241,.2)'],
        ['💰 Net', inc - exp, inc - exp >= 0 ? 'var(--g)' : 'var(--r)', 'rgba(16,185,129,.1)', 'rgba(16,185,129,.2)']
        ].map(([l, v, c, bg, brd]) => `
          <div style="background:${bg};border:1px solid ${brd};border-radius:var(--r-md);padding:14px">
            <div style="font-size:12px;color:var(--t2);font-weight:600;margin-bottom:3px">${l}</div>
            <div style="font-size:18px;font-weight:800;color:${c};font-family:'Sora',sans-serif">${INR(v, true)}</div>
          </div>`).join('')}
    </div>

    <!-- Financial health -->
    ${inc > 0 ? `
      <div class="card" style="padding:18px;margin-bottom:14px" class="au3">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <span style="font-size:14px;font-weight:700;color:var(--t2)">Financial Health</span>
          <span style="font-size:16px;font-weight:800;color:${srColor(sr)}">${srLabel(sr)}</span>
        </div>
        <div class="pb">
          <div class="pbf" style="width:${Math.max(0, Math.min(100, sr))}%;background:linear-gradient(90deg,${sr > 30 ? '#10b981,#6366f1' : sr > 10 ? '#f59e0b,#10b981' : '#ef4444,#f59e0b'})"></div>
        </div>
        <div style="text-align:center;margin-top:6px;font-size:12px;color:var(--t3)">Savings Rate: ${sr}%</div>
      </div>` : ''}

    <!-- Yearly line chart -->
    ${S.reportPeriod === 'yearly' ? `
      <div class="card" style="padding:18px;margin-bottom:14px" class="au3">
        <div class="section-title">Monthly Trend (${S.reportYear})</div>
        <div class="ch"><canvas id="r-line"></canvas></div>
      </div>` : ''}

    <!-- Expense breakdown -->
    ${pieData.length > 0 ? `
      <div class="card" style="padding:18px;margin-bottom:14px" class="au4">
        <div class="section-title">Expense Breakdown</div>
        <div style="height:200px;position:relative"><canvas id="r-pie"></canvas></div>
        <div style="display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:10px;justify-content:center">
          ${pieData.map(([nm, { v, col }]) => `
            <div style="display:flex;align-items:center;gap:5px">
              <div style="width:8px;height:8px;border-radius:2px;background:${col}"></div>
              <span style="font-size:11px;color:var(--t2)">${escapeHTML(nm.replace(/^\S+\s/, ''))}</span>
              <span style="font-size:11px;font-weight:700;color:var(--t)">${INR(v, true)}</span>
            </div>`).join('')}
        </div>
      </div>` : ''}

    <!-- Top Expenses -->
    ${topExp.length > 0 ? `
      <div class="card" style="padding:18px;margin-bottom:14px" class="au4">
        <div class="section-title">Top Expenses</div>
        ${topExp.map(([nm, { v, col }], i) => `
          <div style="display:flex;align-items:center;gap:10px;padding:9px 0;${i < 4 ? 'border-bottom:1px solid var(--bd)' : ''}">
            <div style="width:26px;height:26px;border-radius:8px;background:${col}20;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:${col}">${i + 1}</div>
            <div style="flex:1;font-size:13px;color:var(--t2)">${escapeHTML(nm)}</div>
            <div style="font-size:14px;font-weight:800;color:var(--r);font-family:'Sora',sans-serif">${INR(v, true)}</div>
          </div>`).join('')}
      </div>` : ''}

    ${pt.length === 0 ? `<div style="text-align:center;padding:40px;color:var(--t3)">Is period mein koi data nahi</div>` : ''}
  `;

    setTimeout(() => {
        if (S.reportPeriod === 'yearly') {
            const aD = Array.from({ length: 12 }, (_, m) => {
                const t = txs.filter((x) => {
                    const d = new Date(x.date);
                    return d.getMonth() === m && d.getFullYear() === S.reportYear;
                });
                return {
                    m: MN[m],
                    i: t.filter((x) => x.type === 'income').reduce((s, x) => s + x.amount, 0),
                    e: t.filter((x) => x.type === 'expense').reduce((s, x) => s + x.amount, 0),
                };
            });
            Charts.line('r-line', {
                labels: aD.map((d) => d.m),
                datasets: [
                    { label: 'Income', data: aD.map((d) => d.i), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.1)', fill: true, tension: 0.4, pointRadius: 3 },
                    { label: 'Expense', data: aD.map((d) => d.e), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.1)', fill: true, tension: 0.4, pointRadius: 3 },
                ],
            });
        }
        if (pieData.length > 0) {
            Charts.doughnut('r-pie', {
                labels: pieData.map(([n]) => n.replace(/^\S+\s/, '')),
                datasets: [{
                    data: pieData.map(([, { v }]) => v),
                    backgroundColor: pieData.map(([, { col }]) => col),
                    borderWidth: 2,
                    borderColor: 'rgba(10,17,35,.85)',
                }],
            }, '60%');
        }
    }, 90);
}

function dlRpt() {
    const { transactions, categories } = S.data;
    const pt = S.reportPeriod === 'yearly'
        ? transactions.filter((t) => new Date(t.date).getFullYear() === S.reportYear)
        : transactions.filter((t) => { const d = new Date(t.date); return d.getMonth() === S.reportMonth && d.getFullYear() === S.reportYear; });
    const rows = [['Date', 'Type', 'Category', 'Amount', 'Note']];
    pt.forEach((t) => {
        const c = categories.find((x) => x.id === t.categoryId);
        rows.push([t.date, t.type, c?.name || '', t.amount, t.note || '']);
    });
    const el = document.createElement('a');
    el.href = URL.createObjectURL(new Blob([rows.map((r) => r.map(csvCell).join(',')).join('\n')], { type: 'text/csv' }));
    el.download = `report-${S.reportPeriod}-${S.reportYear}.csv`;
    el.click();
    toast('Report downloaded ✅');
}

window.rRpts = rRpts;
window.dlRpt = dlRpt;
