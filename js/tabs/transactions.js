/**
 * PaisaTracker — Transactions Tab (v2 — with Edit button)
 */

function txRow(tx, opts = {}) {
  const { showDelete = false } = opts;
  const txId = safeId(tx.id);
  const cat = S.data.categories.find(c => c.id === tx.categoryId);
  const acc = S.data.accounts.find(a => a.id === tx.accountId);
  const pos = tx.type === 'income' || (tx.type === 'udhaar' && tx.udhaarType === 'taken');
  const col = TYPE_COLOR[tx.type] || '#94a3b8';
  const em = cat?.name?.match(/\p{Emoji}/u)?.[0] || cat?.name?.split(' ')[0] || '\ud83d\udcb8';
  const catLabel = cat?.name?.replace(/^\p{Emoji}\s*/u, '') || tx.type;
  const safeCat = escapeHTML(catLabel);
  const safePerson = escapeHTML(tx.person || '');

  // Subtitle text — single line, no wrapping
  const sub = [acc?.name || '\u2014', tx.subcategory ? '\u00b7 ' + tx.subcategory : '', tx.note ? '\u00b7 ' + tx.note : ''].filter(Boolean).join(' ');
  const safeSub = escapeHTML(sub);

  return `
    <div class="lr" id="tr-${txId}" style="align-items:center;gap:10px;cursor:pointer;padding:12px 16px" onclick="openEditTx('${txId}')">
      <!-- Icon -->
      <div style="width:44px;height:44px;border-radius:14px;background:${cat?.color || col}18;border:1px solid ${cat?.color || col}28;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${em}</div>
      <!-- Centre: title + subtitle -->
      <div style="flex:1;min-width:0;overflow:hidden">
        <div style="font-size:14px;font-weight:700;color:var(--t);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
          ${safeCat}${tx.person ? ' <span style="color:var(--t3);font-weight:400">· ' + safePerson + '</span>' : ''}
        </div>
        <div style="font-size:11px;color:var(--t3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px">
          ${tx.isRecurring ? '<span style="background:var(--b2);color:var(--b);border-radius:4px;padding:1px 4px;font-size:9px;font-weight:700;margin-right:4px">RECUR</span>' : ''}${safeSub}
        </div>
      </div>
      <!-- Right: date stack + amount + delete -->
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px;flex-shrink:0">
        <div style="font-size:15px;font-weight:900;color:${col};white-space:nowrap;letter-spacing:-.3px">${pos ? '+' : '-'}${INR(tx.amount, true)}</div>
        <div style="font-size:10px;color:var(--t3);white-space:nowrap">${relativeDate(tx.date)}</div>
      </div>
      ${showDelete ? `<button onclick="event.stopPropagation();delTx('${txId}')" style="background:rgba(248,113,113,.12);border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;color:var(--r);font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0">🗑</button>` : ''}
    </div>`;
}


// Debounce helper
let _txSearchTimer = null;

function filterTxs() {
  const { transactions: txs, accounts, categories } = S.data;
  return txs.filter(tx => {
    if (S.txFilter !== 'all' && tx.type !== S.txFilter) return false;
    if (S.txMonth && !tx.date.startsWith(S.txMonth)) return false;
    if (S.txSearch) {
      const c = categories.find(x => x.id === tx.categoryId);
      const a = accounts.find(x => x.id === tx.accountId);
      const q = S.txSearch.toLowerCase();
      if (!(c?.name?.toLowerCase().includes(q) ||
        a?.name?.toLowerCase().includes(q) ||
        tx.note?.toLowerCase().includes(q) ||
        tx.person?.toLowerCase().includes(q) ||
        String(tx.amount).includes(q))) return false;
    }
    return true;
  });
}

let _boundTxListActions = false;
function bindTxListActions() {
  if (_boundTxListActions) return;
  document.addEventListener('click', (e) => {
    const shareBtn = e.target.closest('[data-action="share-udhaar"]');
    if (shareBtn) {
      const person = decodeURIComponent(shareBtn.dataset.person || '');
      openUdhaarShare(person);
      return;
    }
    const viewBtn = e.target.closest('[data-action="view-udhaar"]');
    if (viewBtn) {
      const person = decodeURIComponent(viewBtn.dataset.person || '');
      showUdhaarTxs(person);
    }
  });
  _boundTxListActions = true;
}

function filterAndRenderList() {
  const filt = filterTxs();
  const tI = filt.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const tE = filt.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const isUdhaar = S.txFilter === 'udhaar';

  // Update stats
  const statsEl = document.getElementById('tx-stats');
  if (statsEl) {
    statsEl.innerHTML = [['Income', tI, 'var(--g)', 'rgba(0,212,161,.08)'],
    ['Expense', tE, 'var(--r)', 'rgba(248,113,113,.08)'],
    ['Net', tI - tE, tI - tE >= 0 ? 'var(--g)' : 'var(--r)', 'rgba(124,111,247,.08)']
    ].map(([l, v, c, bg]) => `
      <div style="background:${bg};border-radius:14px;padding:12px;text-align:center;border:1px solid ${c}22">
        <div style="font-size:9px;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:.6px">${l}</div>
        <div style="font-size:16px;font-weight:900;color:${c};font-family:'Sora',sans-serif;margin-top:4px">${INR(v, true)}</div>
      </div>`).join('');
  }

  // Update list
  const listEl = document.getElementById('tx-list');
  if (!listEl) return;

  if (isUdhaar) {
    const udhaarMap = {};
    filt.forEach(tx => {
      const name = tx.person || 'Unknown';
      if (!udhaarMap[name]) udhaarMap[name] = { given: 0, taken: 0, txs: [] };
      if (tx.udhaarType === 'given') udhaarMap[name].given += tx.amount;
      else udhaarMap[name].taken += tx.amount;
      udhaarMap[name].txs.push(tx);
    });
    if (Object.keys(udhaarMap).length === 0) {
      listEl.innerHTML = emptyState();
      return;
    }
    listEl.innerHTML = Object.entries(udhaarMap).sort((a, b) => b[1].txs.length - a[1].txs.length).map(([name, ud]) => {
      const net = ud.given - ud.taken;
      const encName = encodeURIComponent(name);
      return `<div style="background:var(--gl);border:1px solid var(--bd);border-radius:var(--r-lg);padding:16px;margin-bottom:10px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:44px;height:44px;border-radius:14px;background:var(--y2);border:1px solid rgba(251,191,36,.25);display:flex;align-items:center;justify-content:center;font-size:22px">🧑</div>
            <div>
              <div style="font-size:15px;font-weight:700;color:var(--t)">${escapeHTML(name)}</div>
              <div style="font-size:11px;color:var(--t3)">${ud.txs.length} transaction${ud.txs.length > 1 ? 's' : ''}</div>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:17px;font-weight:800;color:${net > 0 ? 'var(--r)' : 'var(--g)'};font-family:'Sora',sans-serif">${INR(Math.abs(net), true)}</div>
            <div style="font-size:10px;color:var(--t3)">${net > 0 ? 'owes you' : net < 0 ? 'you owe' : 'settled'}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
          <div style="background:var(--r2);border-radius:10px;padding:10px;text-align:center"><div style="font-size:10px;color:var(--t3);margin-bottom:2px">Diya (lent)</div><div style="font-size:15px;font-weight:700;color:var(--r)">${INR(ud.given)}</div></div>
          <div style="background:var(--g3);border-radius:10px;padding:10px;text-align:center"><div style="font-size:10px;color:var(--t3);margin-bottom:2px">Liya (borrowed)</div><div style="font-size:15px;font-weight:700;color:var(--g)">${INR(ud.taken)}</div></div>
        </div>
        <div style="display:flex;gap:8px">
          <button data-action="share-udhaar" data-person="${encName}" class="btn btn-p" style="flex:1;padding:10px;font-size:12px;border-radius:12px">Share Details</button>
          <button data-action="view-udhaar" data-person="${encName}" class="btn btn-g" style="flex:1;padding:10px;font-size:12px;border-radius:12px">View All</button>
        </div>
      </div>`;
    }).join('');
  } else if (filt.length === 0) {
    listEl.innerHTML = emptyState();
  } else {
    listEl.innerHTML = `<div class="card" style="padding:0 16px" id="txn-list">
      ${filt.map(tx => txRow(tx, { showDelete: true })).join('')}
    </div>`;
  }
  bindTxListActions();
}

function emptyState() {
  return `<div style="text-align:center;padding:52px 20px;color:var(--t3)">
    <div style="font-size:48px;margin-bottom:12px;opacity:.5">🔍</div>
    <div style="font-size:16px;font-weight:600">No transactions found</div>
    <div style="font-size:13px;margin-top:6px">Try different filters or add a transaction</div>
  </div>`;
}

function rTxns(pg) {
  const filt = filterTxs();
  const tI = filt.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const tE = filt.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // Custom month display (avoids clipping)
  const monthLabel = S.txMonth
    ? new Date(S.txMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'All Months';

  pg.innerHTML = `
    <div class="safe-top"></div>

    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 0 10px" class="au">
      <div style="font-size:26px;font-weight:900;color:var(--t);letter-spacing:-.5px">Transactions</div>
      <div style="display:flex;gap:8px">
        <button onclick="openAddTx()" style="background:var(--g);border:none;border-radius:12px;padding:9px 16px;cursor:pointer;color:white;font-size:13px;font-weight:700;display:flex;align-items:center;gap:5px">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add
        </button>
        <button onclick="dlCSV()" style="background:var(--gl2);border:1.5px solid var(--bd2);border-radius:12px;padding:9px 13px;cursor:pointer;color:var(--g);font-size:12px;font-weight:700;display:flex;align-items:center;gap:5px">
          Export
        </button>
      </div>
    </div>

    <!-- Type filter chips -->
    <div style="display:flex;gap:7px;overflow-x:auto;margin-bottom:14px;padding-bottom:2px;scrollbar-width:none" class="au1">
      ${['all', 'income', 'expense', 'investment', 'transfer', 'udhaar'].map(f => `
        <button
          onclick="S.txFilter='${f}';filterAndRenderList();document.querySelectorAll('.txf-chip').forEach(b=>{b.style.background=b.dataset.f===S.txFilter?'var(--g)':'var(--gl2)';b.style.color=b.dataset.f===S.txFilter?'var(--bg)':'var(--t2)';b.style.border='1.5px solid '+(b.dataset.f===S.txFilter?'transparent':'var(--bd2)');});"
          data-f="${f}" class="txf-chip"
          style="flex-shrink:0;padding:7px 16px;border-radius:50px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;transition:all .15s;background:${S.txFilter === f ? 'var(--g)' : 'var(--gl2)'};color:${S.txFilter === f ? 'white' : 'var(--t2)'};border:1.5px solid ${S.txFilter === f ? 'transparent' : 'var(--bd2)'};">
          ${f[0].toUpperCase() + f.slice(1)}
        </button>`).join('')}
    </div>

    <!-- Search + month picker row -->
    <div style="display:flex;gap:8px;margin-bottom:14px" class="au2">
      <div style="flex:1;position:relative">
        <svg style="position:absolute;left:13px;top:50%;transform:translateY(-50%);opacity:.45" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input class="inp" id="tx-search-inp" placeholder="Search transactions…" value="${S.txSearch}"
               style="padding-left:40px"
               oninput="clearTimeout(_txSearchTimer);_txSearchTimer=setTimeout(()=>{S.txSearch=this.value;filterAndRenderList();},220)"/>
      </div>
      <div style="flex-shrink:0">
        <input type="month" id="tx-month-inp" value="${S.txMonth}"
               style="height:46px;min-width:145px;background:var(--gl2);border:1.5px solid var(--bd2);border-radius:12px;padding:0 14px;font-size:13px;font-weight:600;color:var(--t);cursor:pointer;-webkit-appearance:none;appearance:none;outline:none;color-scheme:dark"
               onchange="S.txMonth=this.value;filterAndRenderList();"/>
      </div>
    </div>

    <!-- Summary stats -->
    <div id="tx-stats" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px" class="au2">
      ${[['Income', tI, 'var(--g)', 'var(--g3)'],
    ['Expense', tE, 'var(--r)', 'var(--r2)'],
    ['Net', tI - tE, tI - tE >= 0 ? 'var(--g)' : 'var(--r)', tI - tE >= 0 ? 'var(--g4)' : 'var(--r2)']
    ].map(([l, v, c, bg]) => `
        <div style="background:${bg};border-radius:14px;padding:12px;text-align:center;border:1px solid ${c}30">
          <div style="font-size:9px;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:.6px">${l}</div>
          <div style="font-size:16px;font-weight:900;color:${c};margin-top:4px">${INR(v, true)}</div>
        </div>`).join('')}
    </div>

    <!-- Transaction list -->
    <div id="tx-list"></div>
    <div style="height:20px"></div>
  `;

    // Populate list after shell renders
    filterAndRenderList();
}

    // Show all txs for one udhaar person in a modal-like view
function showUdhaarTxs(name) {
  const txs = S.data.transactions.filter(t => t.type === 'udhaar' && t.person?.toLowerCase() === name.toLowerCase());
  const sorted = [...txs].sort((a, b) => b.date.localeCompare(a.date));
    Modal.alert(
    `${name}'s Transactions`,
    `<div style="max-height:280px;overflow-y:auto;margin-top:10px">
      ${sorted.map(tx => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--bd)">
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--t)">${formatDate(tx.date)}</div>
            ${tx.note ? `<div style="font-size:11px;color:var(--t3)">${escapeHTML(tx.note)}</div>` : ''}
          </div>
          <span style="font-size:14px;font-weight:700;color:${tx.udhaarType === 'given' ? 'var(--r)' : 'var(--g)'};font-family:'Sora',sans-serif">
            ${tx.udhaarType === 'given' ? '-' : '+'}${INR(tx.amount)}
          </span>
        </div>`).join('')}
    </div>`,
    {icon: '🧑', btnText: 'Close', allowHtml: true }
    );
}

    // ── CSV Export ────────────────────────────────────────────
    function dlCSV() {
  const {transactions: txs, categories, accounts } = S.data;
  const filt = txs.filter(t => {
    if (S.txFilter !== 'all' && t.type !== S.txFilter) return false;
    if (S.txMonth && !t.date.startsWith(S.txMonth)) return false;
    return true;
  });
    const rows = [['Date', 'Type', 'Category', 'Amount', 'Account', 'Person', 'Note', 'Subcategory', 'Recurring']];
  filt.forEach(t => {
    const c = categories.find(x => x.id === t.categoryId);
    const a = accounts.find(x => x.id === t.accountId);
    rows.push([t.date, t.type, c?.name || '', t.amount, a?.name || '', t.person || '', t.note || '', t.subcategory || '', t.isRecurring ? 'Yes' : 'No']);
  });
  const el = document.createElement('a');
  el.href = URL.createObjectURL(new Blob([rows.map(r => r.map(csvCell).join(',')).join('\n')], {type: 'text/csv' }));
    el.download = `paisatracker-txns-${S.txMonth || 'all'}.csv`;
    el.click(); toast('CSV downloaded ✅');
}

    window.filterAndRenderList = filterAndRenderList;
    window.txRow = txRow;
    window.rTxns = rTxns;
    window.showUdhaarTxs = showUdhaarTxs;
    window.dlCSV = dlCSV;
