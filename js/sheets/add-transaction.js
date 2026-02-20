/**
 * PaisaTracker — Add / Edit Transaction Sheet (v2)
 */

/**
 * Open the Add Transaction sheet in create mode
 */
function openAddTx() {
  S.txForm = {
    id: null, // null = new
    type: 'expense',
    amount: '',
    categoryId: '',
    subcategory: '',
    accountId: S.data?.accounts[0]?.id || '',
    toAccountId: '',
    note: '',
    date: today(),
    person: '',
    udhaarType: 'given',
    isRecurring: false,
  };
  openSh('add-tx');
  setTimeout(() => renderTF(), 80);
}

/**
 * Open the Add Transaction sheet in edit mode
 */
function openEditTx(id) {
  const tx = S.data.transactions.find(t => t.id === id);
  if (!tx) { toast('Transaction nahi mila!', 'error'); return; }
  S.txForm = { ...tx };
  openSh('add-tx');
  setTimeout(() => renderTF(true), 80);
}

function initAddTxSheet() { openAddTx(); }

function renderTF(isEdit = !!(S.txForm && S.txForm.id)) {
  const { categories, accounts } = S.data;
  const f = S.txForm;
  const TC = TYPE_COLOR;
  const filtCats = categories.filter(c => c.type === f.type);
  const selCat = categories.find(c => c.id === f.categoryId);
  const safeTxId = safeId(f.id);
  const typeLabels = { expense: 'Expense', income: 'Income', investment: 'Invest', transfer: 'Transfer', udhaar: 'Udhaar' };

  const c = document.getElementById('sh-add-tx');
  if (!c) return;

  c.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div style="font-size:20px;font-weight:800;color:var(--t)">
        ${isEdit ? '&#x270F; Edit Transaction' : '+ New Transaction'}
      </div>
      <button onclick="closeSh('add-tx')" class="sh-close" aria-label="Close">&#x2715;</button>
    </div>

    <!-- Type chips — only shown in add mode -->
    ${!isEdit ? `
    <div style="display:flex;gap:7px;margin-bottom:14px;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none;padding-bottom:2px">
      ${['expense', 'income', 'investment', 'transfer', 'udhaar'].map(t => `
        <button onclick="setTxType('${t}')"
          style="flex-shrink:0;padding:8px 14px;border-radius:50px;font-size:12px;font-weight:700;cursor:pointer;
                 background:${f.type === t ? TC[t] + '22' : 'var(--gl)'};
                 color:${f.type === t ? TC[t] : 'var(--t2)'};
                 border:1.5px solid ${f.type === t ? TC[t] + '55' : 'var(--bd)'}">
          ${typeLabels[t]}
        </button>`).join('')}
    </div>` : `
    <div style="display:inline-flex;align-items:center;gap:7px;background:${TC[f.type]}18;border:1px solid ${TC[f.type]}40;border-radius:50px;padding:6px 14px;margin-bottom:14px">
      <div style="width:8px;height:8px;border-radius:50%;background:${TC[f.type]}"></div>
      <span style="font-size:12px;font-weight:700;color:${TC[f.type]}">${typeLabels[f.type]}</span>
    </div>`}

    <!-- Amount — large prominent input -->
    <div style="background:linear-gradient(135deg,${TC[f.type]}15,${TC[f.type]}06);border:2px solid ${TC[f.type]}35;border-radius:22px;padding:18px;margin-bottom:14px;text-align:center">
      <div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;font-weight:700">Amount</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:4px">
        <span style="font-size:28px;font-weight:800;color:${TC[f.type]};font-family:'Sora',sans-serif">₹</span>
        <input type="number" id="ta" value="${escapeAttr(f.amount || '')}" placeholder="0"
          style="font-size:40px;font-weight:800;color:${TC[f.type]};background:transparent;border:none;text-align:center;width:200px;font-family:'Space Grotesk',sans-serif;outline:none;caret-color:${TC[f.type]};-webkit-appearance:none;-moz-appearance:textfield"
          oninput="S.txForm.amount=this.value"/>
      </div>
    </div>

    <!-- Form fields -->
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:12px">
      <!-- Category + Subcategory row -->
      ${f.type !== 'transfer' ? `
      <div>
        <label class="inp-label">Category *</label>
        <select class="inp" onchange="S.txForm.categoryId=this.value;S.txForm.subcategory='';renderTF(${isEdit})">
          <option value="">Select category…</option>
          ${filtCats.map(c => `<option value="${safeId(c.id)}" ${f.categoryId === c.id ? 'selected' : ''}>${escapeHTML(c.name)}</option>`).join('')}
        </select>
      </div>
      ${selCat?.sub?.length > 0 ? `
      <div>
        <label class="inp-label">Subcategory</label>
        <select class="inp" onchange="S.txForm.subcategory=this.value">
          <option value="">Optional</option>
          ${selCat.sub.map(s => `<option value="${escapeAttr(s)}" ${f.subcategory === s ? 'selected' : ''}>${escapeHTML(s)}</option>`).join('')}
        </select>
      </div>` : ''}` : ''}

      <!-- Account -->
      <div>
        <label class="inp-label">${f.type === 'transfer' ? 'From Account' : 'Account'} *</label>
        <select class="inp" onchange="S.txForm.accountId=this.value">
          ${accounts.map(a => `<option value="${safeId(a.id)}" ${f.accountId === a.id ? 'selected' : ''}>${a.icon} ${escapeHTML(a.name)}</option>`).join('')}
        </select>
      </div>

      <!-- Transfer: To Account -->
      ${f.type === 'transfer' ? `
      <div>
        <label class="inp-label">To Account *</label>
        <select class="inp" onchange="S.txForm.toAccountId=this.value">
          <option value="">Select…</option>
          ${accounts.filter(a => a.id !== f.accountId).map(a => `<option value="${safeId(a.id)}" ${f.toAccountId === a.id ? 'selected' : ''}>${a.icon} ${escapeHTML(a.name)}</option>`).join('')}
        </select>
      </div>` : ''}

      <!-- Udhaar fields -->
      ${f.type === 'udhaar' ? `
      <div>
        <label class="inp-label">Person's Name *</label>
        <input class="inp" value="${escapeAttr(f.person || '')}" oninput="S.txForm.person=this.value" placeholder="e.g. Rahul Kumar"/>
      </div>
      <div>
        <label class="inp-label">Type</label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <button onclick="S.txForm.udhaarType='given';renderTF(${isEdit})"
            style="padding:11px;border-radius:12px;cursor:pointer;font-weight:700;font-size:13px;border:2px solid ${f.udhaarType === 'given' ? '#ef4444' : 'var(--bd)'};background:${f.udhaarType === 'given' ? 'rgba(239,68,68,.12)' : 'var(--gl)'};color:${f.udhaarType === 'given' ? '#ef4444' : 'var(--t2)'}">
            Diya (Lent)
          </button>
          <button onclick="S.txForm.udhaarType='taken';renderTF(${isEdit})"
            style="padding:11px;border-radius:12px;cursor:pointer;font-weight:700;font-size:13px;border:2px solid ${f.udhaarType === 'taken' ? '#10b981' : 'var(--bd)'};background:${f.udhaarType === 'taken' ? 'rgba(16,185,129,.12)' : 'var(--gl)'};color:${f.udhaarType === 'taken' ? '#10b981' : 'var(--t2)'}">
            Liya (Borrowed)
          </button>
        </div>
      </div>` : ''}

      <!-- Date -->
      <div>
        <label class="inp-label">Date</label>
        <input type="date" class="inp" value="${escapeAttr(f.date || today())}" onchange="S.txForm.date=this.value"/>
      </div>

      <!-- Note -->
      <div>
        <label class="inp-label">Note (optional)</label>
        <input class="inp" value="${escapeAttr(f.note || '')}" oninput="S.txForm.note=this.value" placeholder="Description or reference…"/>
      </div>
    </div>

    <!-- Recurring toggle -->
    <div style="display:flex;align-items:center;gap:12px;padding:12px 15px;background:var(--gl);border:1px solid var(--bd);border-radius:14px;margin-bottom:16px;cursor:pointer"
         onclick="S.txForm.isRecurring=!S.txForm.isRecurring;document.getElementById('rec-tgl').classList.toggle('on',S.txForm.isRecurring);document.getElementById('rec-tglk').style.left=S.txForm.isRecurring?'25px':'3px'">
      <button class="tgl ${f.isRecurring ? 'on' : ''}" id="rec-tgl" style="pointer-events:none"><div class="tgl-k" id="rec-tglk"></div></button>
      <div>
        <div style="font-size:13px;color:var(--t);font-weight:600">Recurring / EMI</div>
        <div style="font-size:11px;color:var(--t3)">Monthly repeat transactions track karo</div>
      </div>
    </div>

    <!-- Submit button -->
    <button class="btn btn-p" style="width:100%;padding:16px;font-size:15px;border-radius:16px" onclick="subTx()">
      ${isEdit ? 'Save Changes' : 'Add Transaction'}
    </button>

    <!-- Edit mode: delete option -->
    ${isEdit ? `
    <button onclick="closeSh('add-tx');delTx('${safeTxId}')"
      class="btn btn-r" style="width:100%;padding:13px;font-size:13px;border-radius:14px;margin-top:8px">
      Delete Transaction
    </button>` : ''}
  `;

  setTimeout(() => document.getElementById('ta')?.focus(), 60);
}

function setTxType(t) {
  S.txForm.type = t;
  S.txForm.categoryId = '';
  S.txForm.subcategory = '';
  renderTF(false);
}

function subTx() {
  const f = S.txForm;
  const amtEl = document.getElementById('ta');
  if (amtEl) f.amount = amtEl.value;

  const amtRes = V.amount(f.amount, { min: 0.01, max: 1e9, allowZero: false, allowNegative: false });
  if (!amtRes.ok) { toast(amtRes.error, 'error'); return; }
  if (f.type !== 'transfer' && !f.categoryId) { toast('Category choose karo!', 'error'); return; }
  if (f.type === 'transfer' && !f.toAccountId) { toast('To account choose karo!', 'error'); return; }
  if (f.type === 'udhaar' && !f.person?.trim()) { toast('Person ka naam likho!', 'error'); return; }
  const dtRes = V.date(f.date || today(), { required: true, allowFuture: true });
  if (!dtRes.ok) { toast(dtRes.error, 'error'); return; }
  const person = f.type === 'udhaar'
    ? V.name(f.person || '', { min: 2, max: 60, label: 'Person', allowNumbers: true })
    : { ok: true, v: '' };
  if (!person.ok) { toast(person.error, 'error'); return; }
  const note = V.text(f.note || '', { max: 200 });
  if (!note.ok) { toast(note.error, 'error'); return; }

  const amt = amtRes.n;
  f.person = person.v || '';
  f.note = note.v || '';
  f.categoryId = safeId(f.categoryId);
  f.accountId = safeId(f.accountId);
  f.toAccountId = safeId(f.toAccountId);
  f.id = safeId(f.id || '');

  if (f.id) {
    // EDIT MODE: Reverse old balance effects, then apply new
    const old = S.data.transactions.find(t => t.id === f.id);
    if (old) {
      S.data.accounts = S.data.accounts.map(a => {
        if (old.type === 'income' && a.id === old.accountId) return { ...a, balance: a.balance - old.amount };
        if ((old.type === 'expense' || old.type === 'investment') && a.id === old.accountId) return { ...a, balance: a.balance + old.amount };
        if (old.type === 'transfer') {
          if (a.id === old.accountId) return { ...a, balance: a.balance + old.amount };
          if (a.id === old.toAccountId) return { ...a, balance: a.balance - old.amount };
        }
        if (old.type === 'udhaar') {
          if (old.udhaarType === 'given' && a.id === old.accountId) return { ...a, balance: a.balance + old.amount };
          if (old.udhaarType === 'taken' && a.id === old.accountId) return { ...a, balance: a.balance - old.amount };
        }
        return a;
      });
    }
    // Apply new balance effects
    S.data.accounts = applyTxBalance(S.data.accounts, { ...f, amount: amt }, true);
    // Update transaction
    S.data.transactions = S.data.transactions.map(t =>
      t.id === f.id ? { ...f, amount: amt } : t
    );
    sd(); closeSh('add-tx'); hap('medium'); toast('Transaction updated ✅'); renderTab(S.tab);
  } else {
    // ADD MODE
    const tx = { ...f, id: uid(), amount: amt };
    S.data.accounts = applyTxBalance(S.data.accounts, tx, true);
    S.data.transactions.unshift(tx);
    sd(); closeSh('add-tx'); hap('medium'); toast('Transaction added ✅'); renderTab(S.tab);
  }
}

function applyTxBalance(accounts, tx, add) {
  const sign = add ? 1 : -1;
  return accounts.map(a => {
    if (tx.type === 'income' && a.id === tx.accountId) return { ...a, balance: a.balance + sign * tx.amount };
    if ((tx.type === 'expense' || tx.type === 'investment') && a.id === tx.accountId) return { ...a, balance: a.balance - sign * tx.amount };
    if (tx.type === 'transfer') {
      if (a.id === tx.accountId) return { ...a, balance: a.balance - sign * tx.amount };
      if (a.id === tx.toAccountId) return { ...a, balance: a.balance + sign * tx.amount };
    }
    if (tx.type === 'udhaar') {
      if (tx.udhaarType === 'given' && a.id === tx.accountId) return { ...a, balance: a.balance - sign * tx.amount };
      if (tx.udhaarType === 'taken' && a.id === tx.accountId) return { ...a, balance: a.balance + sign * tx.amount };
    }
    return a;
  });
}

window.openAddTx = openAddTx;
window.openEditTx = openEditTx;
window.initAddTxSheet = openAddTx;
window.renderTF = renderTF;
window.setTxType = setTxType;
window.subTx = subTx;
window.applyTxBalance = applyTxBalance;
