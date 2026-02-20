/**
 * PaisaTracker — Accounts Tab
 */

let aF = { name: '', type: 'bank', balance: '', color: '#10b981', icon: '🏦', id: null };

function rAccs(pg) {
  const { accounts } = S.data;
  const tA = accounts.filter((a) => a.type !== 'credit').reduce((s, a) => s + a.balance, 0);
  const tD = accounts.filter((a) => a.type === 'credit').reduce((s, a) => s + Math.abs(a.balance), 0);

  pg.innerHTML = `
    <div class="safe-top"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 0 6px" class="au">
      <div>
        <div style="font-family:'Sora',sans-serif;font-size:24px;font-weight:800;color:var(--t)">Wallet</div>
        <div style="font-size:12px;color:var(--t2);margin-top:2px">
          Assets <span style="color:var(--g);font-weight:700">${INR(tA, true)}</span> · Debt <span style="color:var(--r);font-weight:700">${INR(tD, true)}</span>
        </div>
      </div>
      <button class="btn btn-p" style="padding:10px 15px;font-size:13px;border-radius:14px" onclick="openAF(null)">+ Add</button>
    </div>
    <div id="afw" style="margin:14px 0"></div>
    <div style="display:flex;flex-direction:column;gap:10px" class="au1">
      ${accounts.map((a) => `
        <div style="background:linear-gradient(135deg,${a.color}1a,${a.color}08);border:1px solid ${a.color}2e;border-radius:var(--r-xl);overflow:hidden;box-shadow:0 6px 22px ${a.color}12">
          <div onclick="showAccHistory('${safeId(a.id)}')" style="display:flex;align-items:center;gap:14px;padding:18px 18px 14px;cursor:pointer">
            <div style="width:50px;height:50px;border-radius:16px;background:${a.color}22;border:1.5px solid ${a.color}38;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0">${a.icon}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:16px;font-weight:800;color:var(--t)">${escapeHTML(a.name)}</div>
              <div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:1px;margin-top:2px">${a.type} · tap to view history 📜</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:24px;font-weight:900;color:${a.balance >= 0 ? 'var(--t)' : 'var(--r)'};font-family:'Sora',sans-serif;letter-spacing:-.5px">${INR(a.balance, true)}</div>
            </div>
          </div>
          <div style="display:flex;border-top:1px solid ${a.color}18">
            <button onclick="adjBal('${safeId(a.id)}')" style="flex:1;background:${a.color}12;border:none;border-right:1px solid ${a.color}18;padding:11px 8px;cursor:pointer;font-size:12px;color:${a.color};font-weight:700;display:flex;align-items:center;justify-content:center;gap:5px">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
              Add Balance
            </button>
            <button onclick="openAF('${safeId(a.id)}')" style="background:rgba(124,111,247,.10);border:none;border-right:1px solid ${a.color}18;padding:11px 14px;cursor:pointer;color:var(--b);font-size:16px">✏️</button>
            <button onclick="delAcc('${safeId(a.id)}')" style="background:rgba(248,113,113,.10);border:none;padding:11px 14px;cursor:pointer;color:var(--r);font-size:16px">🗑</button>
          </div>
        </div>`).join('')}
    </div>
  `;
}

function openAF(id) {
  const a = id ? S.data.accounts.find((x) => x.id === id) : null;
  aF = a ? { ...a } : { name: '', type: 'bank', balance: '', color: '#10b981', icon: '🏦', id: null };
  const fw = document.getElementById('afw');
  if (!fw) return;
  fw.innerHTML = `
    <div class="card" style="padding:16px;margin-bottom:8px">
      <div style="font-size:14px;font-weight:700;color:var(--t);margin-bottom:14px">${id ? 'Edit Account' : 'New Account'}</div>
      <div class="g2" style="margin-bottom:10px">
        <div>
          <label class="inp-label">Name</label>
          <input class="inp" value="${escapeAttr(aF.name)}" oninput="aF.name=this.value" placeholder="Account name"/>
        </div>
        <div>
          <label class="inp-label">Type</label>
          <select class="inp" onchange="aF.type=this.value">
            ${ACTY.map((t) => `<option value="${t}" ${aF.type === t ? 'selected' : ''}>${escapeHTML(t.toUpperCase())}</option>`).join('')}
          </select>
        </div>
        ${!id ? `
          <div>
            <label class="inp-label">Opening Balance</label>
            <input type="number" class="inp" value="${escapeAttr(aF.balance)}" oninput="aF.balance=this.value" placeholder="0"/>
          </div>` : ''}
        <div>
          <label class="inp-label">Color</label>
          <input type="color" value="${aF.color}" onchange="aF.color=this.value" style="width:100%;height:42px;border-radius:10px;border:1px solid var(--bd);background:none;cursor:pointer"/>
        </div>
      </div>
      <div style="margin-bottom:12px">
        <label class="inp-label">Icon</label>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${AICS.map((ic) => `
            <button onclick="aF.icon='${escapeAttr(ic)}';document.querySelectorAll('.ico-o').forEach(b=>{b.style.border='2px solid var(--bd)';b.style.background='var(--gl)'});this.style.border='2px solid var(--g)';this.style.background='var(--g3)'"
                    class="ico-o" style="width:40px;height:40px;border-radius:10px;border:2px solid ${aF.icon === ic ? 'var(--g)' : 'var(--bd)'};background:${aF.icon === ic ? 'var(--g3)' : 'var(--gl)'};cursor:pointer;font-size:20px">
              ${ic}
            </button>`).join('')}
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-p" style="flex:1" onclick="saveAcc('${id || ''}')">
          ${id ? 'Save Changes' : 'Add Account'}
        </button>
        <button class="btn btn-g" onclick="document.getElementById('afw').innerHTML=''">Cancel</button>
      </div>
    </div>
  `;
}

function saveAcc(id) {
  // Validate name
  const nmRes = V.name(aF.name, { min: 2, max: 30, label: 'Account name', allowNumbers: true });
  if (!nmRes.ok) { toast(nmRes.error, 'error'); return; }
  aF.name = nmRes.v;

  // Validate opening balance (only for new accounts)
  let openBal = 0;
  if (!id) {
    const balRes = V.amount(aF.balance, { min: 0, max: 1e8, allowZero: true, allowNegative: false });
    if (!balRes.ok) { toast(balRes.error, 'error'); return; }
    openBal = balRes.n;
  }

  if (id) {
    S.data.accounts = S.data.accounts.map((a) =>
      a.id === id ? { ...a, name: aF.name, type: aF.type, color: aF.color, icon: aF.icon } : a
    );
    toast('Account updated ✅');
  } else {
    S.data.accounts.push({ ...aF, id: uid(), balance: openBal });
    toast('Account added ✅');
  }
  sd();
  renderTab('accounts');
}

function adjBal(id) {
  const acc = S.data.accounts.find(a => a.id === id);
  const overlay = document.getElementById('modal-overlay');
  const box = document.getElementById('modal-box');
  box.innerHTML = `
        <div style="margin-bottom:18px">
            <div style="font-size:30px;text-align:center;margin-bottom:8px">${acc?.icon || '💰'}</div>
            <div style="font-family:'Sora',sans-serif;font-size:18px;font-weight:800;color:var(--t);margin-bottom:4px;text-align:center">${acc?.name}</div>
            <div style="font-size:12px;color:var(--t3);text-align:center;margin-bottom:16px">Current: <strong style="color:var(--t)">${INR(acc?.balance || 0)}</strong></div>
            <div style="margin-bottom:10px">
                <label class="inp-label">Amount to Add (₹) *</label>
                <input type="number" class="inp" id="adj-amt" placeholder="e.g. 5000" autofocus min="0" step="0.01"/>
                <div style="font-size:11px;color:var(--t3);margin-top:4px">Enter a positive amount to credit to this account</div>
            </div>
            <div>
                <label class="inp-label">Note (optional)</label>
                <input class="inp" id="adj-note" placeholder="e.g. ATM withdrawal, salary credit…" maxlength="100"/>
            </div>
        </div>
        <div style="display:flex;gap:8px">
            <button id="adj-ok" class="btn btn-p" style="flex:1;padding:14px;font-size:14px;font-weight:700">Add Balance</button>
            <button id="adj-cancel" class="btn btn-g" style="flex:1;padding:14px;font-size:14px;font-weight:700">Cancel</button>
        </div>`;
  overlay.classList.add('open');
  overlay.querySelector('#adj-ok').onclick = () => {
    const res = V.amount(document.getElementById('adj-amt')?.value, { min: 0.01, max: 1e8, allowZero: false, allowNegative: false });
    if (!res.ok) { V.showErr('adj-amt', res.error); return; }
    const note = V.sanitize(document.getElementById('adj-note')?.value || '');
    // Apply balance — no -0 possible since amount validated positive
    S.data.accounts = S.data.accounts.map(a =>
      a.id === id ? { ...a, balance: Math.round((a.balance + res.n) * 100) / 100 } : a
    );
    // Log as a manual adjustment transaction
    S.data.transactions.unshift({
      id: uid(), type: 'income', categoryId: '', accountId: id,
      amount: res.n, date: today(), note: note || 'Balance adjustment',
      person: '', subcategory: '', isRecurring: false,
    });
    sd();
    overlay.classList.remove('open'); box.innerHTML = '';
    toast(`₹${res.n.toLocaleString('en-IN')} added to ${acc?.name} ✅`);
    renderTab('accounts');
  };
  overlay.querySelector('#adj-cancel').onclick = () => { overlay.classList.remove('open'); box.innerHTML = ''; };
  overlay.onclick = e => { if (e.target === overlay) { overlay.classList.remove('open'); box.innerHTML = ''; } };
  setTimeout(() => document.getElementById('adj-amt')?.focus(), 50);
}

function delAcc(id) {
  const acc = S.data.accounts.find((a) => a.id === id);
  Modal.confirm(
    'Delete Account?',
    `"${acc?.name}" account permanently delete hoga. Its transactions will remain but won't be linked.`,
    () => {
      S.data.accounts = S.data.accounts.filter((a) => a.id !== id);
      sd();
      toast('Account deleted', 'error');
      renderTab('accounts');
    },
    { confirmText: 'Delete Account', icon: '🏦' }
  );
}

function showAccHistory(accId) {
  const acc = S.data.accounts.find(a => a.id === accId);
  if (!acc) return;
  const allTxs = S.data.transactions
    .filter(t => t.accountId === accId)
    .sort((a, b) => b.date.localeCompare(a.date));
  const txs = allTxs.slice(0, 60);

  // Calculate running balance from latest backward
  let running = acc.balance;
  const rows = txs.map(tx => {
    const pos = tx.type === 'income' || (tx.type === 'udhaar' && tx.udhaarType === 'taken');
    const balAfter = running;
    running -= (pos ? tx.amount : -tx.amount);
    const cat = S.data.categories.find(c => c.id === tx.categoryId);
    const em = cat?.name?.split(' ')[0] || '💸';
    return { tx, balAfter, pos, cat, em };
  });

  const overlay = document.getElementById('modal-overlay');
  const box = document.getElementById('modal-box');
  box.style.cssText = 'max-width:390px;padding:22px 20px 18px;background:var(--bg3);border:1px solid var(--bd2);border-radius:var(--r-2xl)';
  box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
        <div>
          <div style="font-size:28px;line-height:1;margin-bottom:4px">${acc.icon}</div>
          <div style="font-family:'Sora',sans-serif;font-size:17px;font-weight:800;color:var(--t)">${acc.name}</div>
          <div style="font-size:12px;color:var(--t3);margin-top:2px">Balance: <strong style="color:${acc.balance >= 0 ? 'var(--g)' : 'var(--r)'}">${INR(acc.balance)}</strong> · ${allTxs.length} txns</div>
        </div>
        <button onclick="document.getElementById('modal-overlay').classList.remove('open')" class="sh-close" aria-label="Close">&#x2715;</button>
      </div>
      ${txs.length === 0
      ? `<div style="text-align:center;padding:28px 0;color:var(--t3);font-size:13px">📬 No transactions yet<br><span style="font-size:11px">Add balance or record a transaction</span></div>`
      : `<div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.7px;margin-bottom:8px">Last ${rows.length} transactions</div>
           <div style="max-height:320px;overflow-y:auto;display:flex;flex-direction:column;gap:5px">
             ${rows.map(({ tx, balAfter, pos, cat, em }) => `
               <div style="display:flex;align-items:center;gap:10px;padding:9px 11px;background:var(--gl);border:1px solid var(--bd);border-radius:11px">
                 <div style="width:34px;height:34px;border-radius:10px;background:${pos ? 'var(--g3)' : 'var(--r2)'};display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0">${em}</div>
                 <div style="flex:1;min-width:0">
                   <div style="font-size:12px;font-weight:600;color:var(--t);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHTML((cat?.name?.replace(/^\S+\s/, '') || tx.type) + (tx.note ? ' · ' + tx.note : ''))}</div>
                   <div style="font-size:10px;color:var(--t3);margin-top:1px">${relativeDate(tx.date)} · after: ${INR(balAfter, true)}</div>
                 </div>
                 <div style="font-size:13px;font-weight:800;color:${pos ? 'var(--g)' : 'var(--r)'};font-family:'Sora',sans-serif;flex-shrink:0">${pos ? '+' : '-'}${INR(tx.amount, true)}</div>
               </div>`).join('')}
           </div>`}
      <button onclick="document.getElementById('modal-overlay').classList.remove('open')" class="btn btn-g" style="width:100%;margin-top:12px;padding:12px">Close</button>
  `;
  overlay.classList.add('open');
  overlay.onclick = e => { if (e.target === overlay) overlay.classList.remove('open'); };
}

window.rAccs = rAccs;
window.openAF = openAF;
window.saveAcc = saveAcc;
window.adjBal = adjBal;
window.delAcc = delAcc;
window.showAccHistory = showAccHistory;
