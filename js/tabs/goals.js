/**
 * PaisaTracker — Goals, Budget, Reminders, EMI Tab (v2)
 * - Goals: savings history, detail view, emoji picker, edit/delete
 * - Budget: edit budget amount
 * - Reminders: edit/view, notifications
 * - EMI: view all recurring
 */

const GOAL_EMOJIS = ['🎯', '🏠', '🚗', '✈️', '📱', '💻', '🎓', '💍', '🏖️', '🎸', '🏍️', '🎮', '📷', '🛒', '💰', '🏆', '🎁', '🌱', '⚽', '📚'];

function rGoals(pg) {
    const { budgets, goals, reminders, transactions, categories } = S.data;
    const now = new Date();
    const mTxs = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    pg.innerHTML = `
    <div class="safe-top"></div>
    <div style="font-family:'Sora',sans-serif;font-size:24px;font-weight:800;color:var(--t);padding:16px 0 14px" class="au">Goals & Budget</div>

    <!-- Sub-tab strip -->
    <div style="display:flex;gap:8px;margin-bottom:16px;overflow-x:auto;padding-bottom:2px" class="au1">
      ${[['budget', '💰 Budget'], ['goals', '🎯 Goals'], ['reminders', '🔔 Reminders'], ['emi', '💳 EMI']].map(([id, label]) => `
        <button onclick="S.goalsTab='${id}';rGoals(document.getElementById('pg-goals'))"
          style="flex-shrink:0;padding:8px 16px;border-radius:50px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;
                 background:${S.goalsTab === id ? 'var(--g)' : 'var(--gl)'};
                 color:${S.goalsTab === id ? 'white' : 'var(--t2)'};
                 border:1.5px solid ${S.goalsTab === id ? 'transparent' : 'var(--bd)'}">
          ${label}
        </button>`).join('')}
    </div>
    <div id="gtc"></div>
  `;

    const gc = document.getElementById('gtc');

    // ──────────────────────────────────────────────────────
    if (S.goalsTab === 'budget') {
        gc.innerHTML = `
      <button class="btn btn-p" style="width:100%;margin-bottom:14px;border-radius:14px" onclick="showBF()">
        + Set Monthly Budget
      </button>
      <div id="bfw"></div>
      ${budgets.length === 0 ? '<div style="text-align:center;padding:40px;color:var(--t3)">💰 Monthly spending limits set karo!</div>' : ''}
      <div style="display:flex;flex-direction:column;gap:10px">
        ${budgets.map(b => {
            const cat = categories.find(x => x.id === b.categoryId);
            const sp = mTxs.filter(t => t.type === 'expense' && t.categoryId === b.categoryId).reduce((s, t) => s + t.amount, 0);
            const pct = Math.min(100, (sp / b.amount) * 100);
            const ov = pct >= 100, almostOver = pct > 80;
            const statusColor = ov ? 'var(--r)' : almostOver ? 'var(--y)' : 'var(--g)';
            return `
            <div style="background:var(--gl);border:1px solid ${ov ? 'rgba(239,68,68,.3)' : almostOver ? 'rgba(245,158,11,.3)' : 'var(--bd)'};border-radius:var(--r-card);padding:18px">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
                <div>
                  <div style="font-size:15px;font-weight:700;color:var(--t)">${escapeHTML(cat?.name || '?')}</div>
                  <div style="font-size:12px;color:var(--t3);margin-top:2px">Monthly limit: ${INR(b.amount)}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:20px;font-weight:800;color:${statusColor};font-family:'Sora',sans-serif">${INR(sp, true)}</div>
                  <div style="font-size:11px;color:var(--t3)">${Math.round(pct)}% used</div>
                </div>
              </div>
              <div style="height:8px;background:rgba(255,255,255,.06);border-radius:6px;overflow:hidden;margin-bottom:12px">
                <div style="height:100%;border-radius:6px;width:${pct}%;background:${ov ? 'linear-gradient(90deg,#ef4444,#dc2626)' : almostOver ? 'linear-gradient(90deg,#f59e0b,#ef4444)' : 'linear-gradient(90deg,#10b981,#6366f1)'};transition:width .9s ease"></div>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="font-size:12px;color:${statusColor}">
                  ${ov ? '⚠️ Over budget by ' + INR(sp - b.amount) : almostOver ? `⚡ ${INR(b.amount - sp)} remaining` : `✓ ${INR(b.amount - sp)} remaining`}
                </span>
                <div style="display:flex;gap:6px">
                  <button onclick="editBudget('${safeId(b.id)}')"
                    style="background:var(--b2);border:none;border-radius:8px;padding:5px 10px;cursor:pointer;font-size:12px;color:var(--b);font-weight:700">Edit</button>
                  <button onclick="delBudget('${safeId(b.id)}')"
                    style="background:var(--r2);border:none;border-radius:8px;padding:5px 10px;cursor:pointer;font-size:12px;color:var(--r);font-weight:700"></button>
                </div>
              </div>
            </div>`;
        }).join('')}
      </div>`;

        // ──────────────────────────────────────────────────────
    } else if (S.goalsTab === 'goals') {
        gc.innerHTML = `
      <button class="btn btn-p" style="width:100%;margin-bottom:14px;border-radius:14px" onclick="showGF()">
        New Goal
      </button>
      <div id="gfw"></div>
      ${goals.length === 0 ? '<div style="text-align:center;padding:40px;color:var(--t3)">🎯 Apna dream set karo!</div>' : ''}
      <div style="display:flex;flex-direction:column;gap:12px">
        ${goals.map(g => {
            const pct = Math.min(100, ((g.currentAmount || 0) / g.targetAmount) * 100);
            const dL = g.targetDate ? Math.ceil((new Date(g.targetDate) - now) / 86400000) : null;
            const done = pct >= 100;
            return `
            <div style="background:var(--gl);border:1px solid ${done ? 'rgba(16,185,129,.3)' : 'var(--bd)'};border-radius:var(--r-card);padding:18px;cursor:pointer;transition:transform .15s"
                 onmousedown="this.style.transform='scale(0.98)'" onmouseup="this.style.transform=''" ontouchend="this.style.transform=''"
                 onclick="viewGoal('${safeId(g.id)}')">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px">
                <div style="display:flex;gap:14px;align-items:center">
                  <div style="font-size:44px;line-height:1;filter:drop-shadow(0 4px 8px rgba(0,0,0,.3))">${g.emoji || '🎯'}</div>
                  <div>
                    <div style="font-size:16px;font-weight:700;color:var(--t)">${escapeHTML(g.title)}</div>
                    <div style="font-size:11px;color:var(--t3);margin-top:3px">
                      ${dL !== null ? (dL > 0 ? `${dL} days left` : '⚠️ Overdue!') : 'No deadline'}
                      ${done ? ' · 🎉 Complete!' : ''}
                    </div>
                  </div>
                </div>
                <div style="text-align:right" onclick="event.stopPropagation()">
                  <div style="display:flex;gap:6px;justify-content:flex-end">
                    <button onclick="editGoal('${safeId(g.id)}')"
                      style="background:var(--b2);border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center">Edit</button>
                    <button onclick="delGoal('${safeId(g.id)}')"
                      style="background:var(--r2);border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center"></button>
                  </div>
                </div>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                <span style="font-size:13px;color:var(--t2)">Saved: <strong style="color:var(--g)">${INR(g.currentAmount || 0)}</strong></span>
                <span style="font-size:13px;color:var(--t2)">Target: <strong>${INR(g.targetAmount)}</strong></span>
              </div>
              <div style="height:8px;background:rgba(255,255,255,.06);border-radius:6px;overflow:hidden;margin-bottom:12px">
                <div style="height:100%;border-radius:6px;width:${pct}%;background:${done ? 'linear-gradient(90deg,#10b981,#f59e0b)' : 'linear-gradient(90deg,#6366f1,#10b981)'};transition:width .9s ease"></div>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="font-size:12px;color:var(--t3)">${Math.round(pct)}% complete</span>
                <button onclick="event.stopPropagation();addGS('${safeId(g.id)}')"
                  style="background:var(--g);border:none;border-radius:10px;padding:7px 14px;cursor:pointer;font-size:12px;color:white;font-weight:700">
                  Add Savings
                </button>
              </div>
              <div style="font-size:11px;color:var(--t3);margin-top:8px;text-align:center">Tap card to see savings history 📜</div>
            </div>`;
        }).join('')}
      </div>`;

        // ──────────────────────────────────────────────────────
    } else if (S.goalsTab === 'reminders') {
        const dueToday = reminders.filter(r => r.date === today());
        gc.innerHTML = `
      <button class="btn btn-p" style="width:100%;margin-bottom:${dueToday.length ? '10' : '14'}px;border-radius:14px" onclick="showRF()">
        Add Reminder
      </button>
      ${dueToday.length > 0 ? `
        <div style="background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.35);border-radius:var(--r-md);padding:12px 14px;margin-bottom:14px;display:flex;align-items:center;gap:10px">
          <span style="font-size:22px">🔔</span>
          <div>
            <div style="font-size:13px;font-weight:700;color:var(--y)">${dueToday.length} reminder${dueToday.length > 1 ? 's' : ''} due today!</div>
            <div style="font-size:11px;color:var(--t3)">${escapeHTML(dueToday.map(r => r.title).join(', '))}</div>
          </div>
        </div>` : ''}
      <div id="rfw"></div>
      ${reminders.length === 0 ? '<div style="text-align:center;padding:40px;color:var(--t3)">🔔 Bills aur EMIs ka reminder set karo!</div>' : ''}
      <div style="display:flex;flex-direction:column;gap:10px">
        ${reminders.sort((a, b) => new Date(a.date) - new Date(b.date)).map(r => {
            const diff = Math.ceil((new Date(r.date) - now) / 86400000);
            const urg = diff <= 0, soon = diff <= 3;
            return `
            <div style="background:var(--gl);border:1px solid ${urg ? 'rgba(239,68,68,.4)' : soon ? 'rgba(245,158,11,.4)' : 'var(--bd)'};border-radius:var(--r-md);padding:14px">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div style="display:flex;gap:11px;align-items:flex-start">
                  <span style="font-size:28px;flex-shrink:0">${urg ? '🔴' : soon ? '🟡' : '🟢'}</span>
                  <div>
                    <div style="font-size:15px;font-weight:700;color:var(--t)">${escapeHTML(r.title)}</div>
                    <div style="font-size:12px;color:var(--t3);margin-top:3px">${formatDate(r.date)} · ${INR(r.amount)}</div>
                    ${r.note ? `<div style="font-size:11px;color:var(--t3);margin-top:2px">${escapeHTML(r.note)}</div>` : ''}
                    <div style="font-size:11px;font-weight:700;margin-top:5px;color:${urg ? 'var(--r)' : soon ? 'var(--y)' : 'var(--g)'}">
                      ${diff < 0 ? `Overdue by ${Math.abs(diff)} days!` : diff === 0 ? 'Due Today!' : diff === 1 ? 'Due Tomorrow!' : diff + ' days left'}
                    </div>
                  </div>
                </div>
                <div style="display:flex;flex-direction:column;gap:6px">
                  <button onclick="editRem('${safeId(r.id)}')"
                    style="background:var(--b2);border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center">Edit</button>
                  <button onclick="delRem('${safeId(r.id)}')"
                    style="background:var(--r2);border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center"></button>
                </div>
              </div>
            </div>`;
        }).join('')}
      </div>`;

        // ──────────────────────────────────────────────────────
    } else {
        const emiCatIds = categories.filter(c => c.name.toLowerCase().includes('emi') || c.name.includes('EMI')).map(c => c.id);
        const recTxs = transactions.filter(t => t.isRecurring || emiCatIds.includes(t.categoryId));
        const thisMonth = recTxs.filter(t => { const d = new Date(t.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === 'expense'; });
        const tot = thisMonth.reduce((s, t) => s + t.amount, 0);
        const nextMonth = recTxs.filter(t => { const d = new Date(t.date); return d.getMonth() === now.getMonth() - 1; }).reduce((s, t) => s + t.amount, 0);

        gc.innerHTML = `
      <div style="background:linear-gradient(135deg,rgba(239,68,68,.1),rgba(239,68,68,.04));border:1px solid rgba(239,68,68,.2);border-radius:var(--r-card);padding:20px;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:12px;color:var(--t3);margin-bottom:4px">This Month EMIs/Recurring</div>
            <div style="font-size:28px;font-weight:800;color:var(--r);font-family:'Sora',sans-serif">${INR(tot)}</div>
            ${nextMonth > 0 ? `<div style="font-size:11px;color:var(--t3);margin-top:3px">Last month: ${INR(nextMonth)}</div>` : ''}
          </div>
          <span style="font-size:48px">💳</span>
        </div>
      </div>
      <div style="font-size:13px;color:var(--t2);margin-bottom:12px;font-weight:600">
        ${recTxs.length} recurring transactions found
        <span style="font-size:11px;color:var(--t3);font-weight:400"> (toggle "Recurring" when adding tx)</span>
      </div>
      ${recTxs.length === 0 ? '<div style="text-align:center;padding:40px;color:var(--t3)">No recurring transactions yet.<br/>When adding a transaction, toggle "Recurring/EMI" on.</div>' : ''}
      <div class="card" style="padding:0 16px">
        ${recTxs.sort((a, b) => b.date.localeCompare(a.date)).map(tx => txRow(tx, { showDelete: true })).join('')}
      </div>`;
    }
}

// ── Budget ────────────────────────────────────────────────
function showBF(existingId) {
    const existing = existingId ? S.data.budgets.find(b => b.id === existingId) : null;
    const expCats = S.data.categories.filter(x => x.type === 'expense');
    const c = document.getElementById('bfw');
    c.innerHTML = `
    <div style="background:var(--gl2);border:1px solid var(--bd2);border-radius:var(--r-md);padding:15px;margin-bottom:14px">
      <div style="font-size:14px;font-weight:700;color:var(--t);margin-bottom:12px">${existing ? 'Edit Budget' : 'Set New Budget'}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
        <div>
          <label class="inp-label">Category</label>
          <select class="inp" id="bfc" ${existing ? 'disabled' : ''}>
            <option value="">Select…</option>
            ${expCats.map(x => `<option value="${safeId(x.id)}" ${existing?.categoryId === x.id ? 'selected' : ''}>${escapeHTML(x.name)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="inp-label">Monthly Limit (₹)</label>
          <input type="number" class="inp" id="bfa" value="${escapeAttr(existing?.amount || '')}" placeholder="5000"/>
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-p" style="flex:1" onclick="saveBudget('${existingId || ''}')">
          ${existing ? 'Update Budget' : 'Save Budget'}
        </button>
        <button class="btn btn-g" onclick="document.getElementById('bfw').innerHTML=''">Cancel</button>
      </div>
    </div>`;
}

function editBudget(id) { showBF(id); document.getElementById('bfw')?.scrollIntoView({ behavior: 'smooth' }); }

function saveBudget(existingId) {
    const cid = safeId(document.getElementById('bfc')?.value || '');
    const amt = V.amount(document.getElementById('bfa')?.value, { min: 1, max: 1e9, allowZero: false, allowNegative: false });
    if (!amt.ok) { toast(amt.error, 'error'); return; }
    if (existingId) {
        S.data.budgets = S.data.budgets.map(b => b.id === existingId ? { ...b, amount: amt.n } : b);
        toast('Budget updated ✅');
    } else {
        if (!cid) { toast('Category choose karo!', 'error'); return; }
        const exists = S.data.budgets.find(b => b.categoryId === cid);
        if (exists) { toast('Is category ka budget already set hai. Edit karo.', 'warning'); return; }
        S.data.budgets.push({ id: uid(), categoryId: cid, amount: amt.n });
        toast('Budget set ✅');
    }
    sd(); rGoals(document.getElementById('pg-goals'));
}

function delBudget(id) {
    const b = S.data.budgets.find(x => x.id === id);
    Modal.confirm('Remove Budget?', `Budget limit for "${S.data.categories.find(c => c.id === b?.categoryId)?.name}" hata dein?`, () => {
        S.data.budgets = S.data.budgets.filter(x => x.id !== id);
        sd(); rGoals(document.getElementById('pg-goals'));
    }, { confirmText: 'Remove', icon: '💰', danger: true });
}

// ── Goals ─────────────────────────────────────────────────
function showGF(existingId) {
    const g = existingId ? S.data.goals.find(x => x.id === existingId) : null;
    let selEmoji = g?.emoji || '🎯';
    const c = document.getElementById('gfw');
    c.innerHTML = `
    <div style="background:var(--gl2);border:1px solid var(--bd2);border-radius:var(--r-md);padding:15px;margin-bottom:14px">
      <div style="font-size:14px;font-weight:700;color:var(--t);margin-bottom:12px">${g ? 'Edit Goal' : 'New Goal'}</div>
      <div style="margin-bottom:10px">
        <label class="inp-label">Choose Emoji</label>
        <div style="display:flex;flex-wrap:wrap;gap:7px;padding:10px;background:var(--gl);border:1px solid var(--bd);border-radius:12px" id="emoji-grid">
          ${GOAL_EMOJIS.map(e => `
            <button onclick="selGoalEmoji('${escapeAttr(e)}',this)"
              style="font-size:26px;width:44px;height:44px;border-radius:10px;border:2px solid ${e === selEmoji ? 'var(--g)' : 'transparent'};background:${e === selEmoji ? 'var(--g3)' : 'transparent'};cursor:pointer;transition:all .15s"
              data-emoji="${e}">${e}</button>`).join('')}
        </div>
        <div style="font-size:11px;color:var(--t3);margin-top:6px">Or type custom emoji:
          <input id="custom-emoji" value="${selEmoji}" maxlength="2" 
                 style="width:44px;border:1px solid var(--bd);border-radius:6px;background:var(--gl);color:var(--t);text-align:center;font-size:20px;padding:4px"
                 oninput="selGoalEmoji(this.value,null)"/>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr;gap:9px;margin-bottom:10px">
        <div>
          <label class="inp-label">Goal Title *</label>
          <input class="inp" id="gt" value="${escapeAttr(g?.title || '')}" placeholder="e.g. New Bike 🏍️"/>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div>
            <label class="inp-label">Target Amount *</label>
            <input type="number" class="inp" id="gta" value="${escapeAttr(g?.targetAmount || '')}" placeholder="100000"/>
          </div>
          <div>
            <label class="inp-label">Already saved</label>
            <input type="number" class="inp" id="gca" value="${escapeAttr(g?.currentAmount || 0)}" placeholder="0" ${g && (g.currentAmount || 0) > 0 ? 'readonly' : ''}/>
          </div>
        </div>
        <div>
          <label class="inp-label">Target Date (optional)</label>
          <input type="date" class="inp" id="gtd" value="${escapeAttr(g?.targetDate || '')}"/>
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-p" style="flex:1" onclick="saveGoal('${existingId || ''}')">
          ${g ? 'Update Goal' : 'Create Goal'}
        </button>
        <button class="btn btn-g" onclick="document.getElementById('gfw').innerHTML=''">Cancel</button>
      </div>
    </div>`;
    window._goalEmoji = selEmoji;
}

function selGoalEmoji(e, btn) {
    if (!e) return;
    window._goalEmoji = e;
    document.querySelectorAll('#emoji-grid button').forEach(b => {
        b.style.border = b.dataset.emoji === e ? '2px solid var(--g)' : '2px solid transparent';
        b.style.background = b.dataset.emoji === e ? 'var(--g3)' : 'transparent';
    });
    const ci = document.getElementById('custom-emoji');
    if (ci && btn) ci.value = e;
}

function editGoal(id) {
    showGF(id);
    document.getElementById('gfw')?.scrollIntoView({ behavior: 'smooth' });
}

function saveGoal(existingId) {
    const title = V.text(document.getElementById('gt')?.value || '', { max: 80 });
    const target = V.amount(document.getElementById('gta')?.value, { min: 1, max: 1e9, allowZero: false, allowNegative: false });
    if (!title.ok || !title.v || !target.ok) { toast('Title aur target amount chahiye!', 'error'); return; }
    const current = V.amount(document.getElementById('gca')?.value || 0, { min: 0, max: 1e9, allowZero: true, allowNegative: false });
    if (!current.ok) { toast(current.error, 'error'); return; }
    const targetDate = document.getElementById('gtd')?.value || '';
    if (targetDate) {
        const d = V.date(targetDate, { required: true, allowFuture: true });
        if (!d.ok) { toast(d.error, 'error'); return; }
    }
    if (existingId) {
        S.data.goals = S.data.goals.map(g => g.id === existingId ? {
            ...g, title: title.v, targetAmount: target.n,
            targetDate: targetDate || g.targetDate,
            emoji: window._goalEmoji || g.emoji,
        } : g);
        toast('Goal updated ✅');
    } else {
        S.data.goals.push({
            id: uid(), title: title.v, targetAmount: target.n,
            currentAmount: current.n,
            targetDate: targetDate,
            emoji: window._goalEmoji || '🎯',
            createdAt: today(),
            savingsHistory: [],
        });
        toast('Goal added 🎯');
    }
    sd(); rGoals(document.getElementById('pg-goals'));
}

function delGoal(id) {
    Modal.confirm('Delete Goal?', 'Ye goal aur iski savings history permanently delete hogi.', () => {
        S.data.goals = S.data.goals.filter(g => g.id !== id);
        sd(); rGoals(document.getElementById('pg-goals'));
    }, { confirmText: 'Delete Goal', icon: '🎯' });
}

// Goal detail view with savings history
function viewGoal(id) {
    const g = S.data.goals.find(x => x.id === id);
    if (!g) return;
    const history = g.savingsHistory || [];
    const pct = Math.min(100, ((g.currentAmount || 0) / g.targetAmount) * 100);
    Modal.alert(
        `${g.emoji || '🎯'} ${g.title}`,
        `<div>
      <div style="display:flex;justify-content:space-between;margin-bottom:10px">
        <span>Saved</span><strong style="color:var(--g)">${INR(g.currentAmount || 0)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:14px">
        <span>Target</span><strong>${INR(g.targetAmount)}</strong>
      </div>
      <div style="height:8px;background:rgba(255,255,255,.06);border-radius:6px;overflow:hidden;margin-bottom:16px">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#6366f1,#10b981);border-radius:6px"></div>
      </div>
      <div style="font-size:12px;font-weight:700;color:var(--t2);margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px">Savings History</div>
      ${history.length === 0 ? '<div style="font-size:12px;color:var(--t3);text-align:center;padding:20px 0">No savings entries yet</div>' :
            `<div style="max-height:220px;overflow-y:auto">
          ${history.sort((a, b) => b.date.localeCompare(a.date)).map(h => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--bd)">
              <div>
                <div style="font-size:13px;color:var(--t)">${formatDate(h.date)}</div>
                ${h.note ? `<div style="font-size:11px;color:var(--t3)">💬 ${escapeHTML(h.note)}</div>` : ''}
              </div>
              <span style="font-size:14px;font-weight:700;color:var(--g);font-family:'Sora',sans-serif">+${INR(h.amount)}</span>
            </div>`).join('')}
        </div>`}
    </div>`,
        { icon: g.emoji || '🎯', btnText: 'Close', allowHtml: true }
    );
}

function addGS(id) {
    const g = S.data.goals.find(x => x.id === id);
    if (!g) return;
    const remaining = g.targetAmount - (g.currentAmount || 0);
    // Custom prompt with note field
    const overlay = document.getElementById('modal-overlay');
    const box = document.getElementById('modal-box');
    box.innerHTML = `
    <div style="margin-bottom:18px">
      <div style="font-size:40px;text-align:center;margin-bottom:10px">${g.emoji || '🎯'}</div>
      <div style="font-family:'Sora',sans-serif;font-size:18px;font-weight:800;color:var(--t);margin-bottom:4px;text-align:center">${escapeHTML(g.title)}</div>
      <div style="font-size:12px;color:var(--t3);text-align:center;margin-bottom:16px">Remaining: ${INR(remaining)}</div>
      <div style="margin-bottom:10px">
        <label class="inp-label">Amount to Add (₹)</label>
        <input type="number" class="inp" id="gs-amt" placeholder="e.g. 5000" autofocus/>
      </div>
      <div>
        <label class="inp-label">Note (optional)</label>
        <input class="inp" id="gs-note" placeholder="e.g. Salary savings, bonus bonus…"/>
      </div>
    </div>
    <div style="display:flex;gap:8px">
      <button id="gs-ok" class="btn btn-p" style="flex:1">Add Savings</button>
      <button id="gs-cancel" class="btn btn-g" style="flex:1">Cancel</button>
    </div>
  `;
    overlay.classList.add('open');
    overlay.querySelector('#gs-ok').onclick = () => {
        const n = V.amount(document.getElementById('gs-amt')?.value, { min: 0.01, max: 1e9, allowZero: false, allowNegative: false });
        if (!n.ok) { toast('Valid amount enter karo', 'error'); return; }
        const note = V.text(document.getElementById('gs-note')?.value || '', { max: 200 }).v || '';
        S.data.goals = S.data.goals.map(go => go.id === id ? {
            ...go,
            currentAmount: Math.min(go.targetAmount, (go.currentAmount || 0) + n.n),
            savingsHistory: [...(go.savingsHistory || []), { amount: n.n, date: today(), note }]
        } : go);
        sd(); overlay.classList.remove('open'); box.innerHTML = '';
        toast('Progress updated ✅');
        if ((g.currentAmount || 0) + n.n >= g.targetAmount) toast(`🎉 Goal "${g.title}" complete! Congratulations!`, 'success');
        rGoals(document.getElementById('pg-goals'));
    };
    overlay.querySelector('#gs-cancel').onclick = () => { overlay.classList.remove('open'); box.innerHTML = ''; };
    overlay.onclick = e => { if (e.target === overlay) { overlay.classList.remove('open'); box.innerHTML = ''; } };
    setTimeout(() => document.getElementById('gs-amt')?.focus(), 50);
}

// ── Reminders ─────────────────────────────────────────────
function showRF(existingId) {
    const r = existingId ? S.data.reminders.find(x => x.id === existingId) : null;
    const c = document.getElementById('rfw');
    c.innerHTML = `
    <div style="background:var(--gl2);border:1px solid var(--bd2);border-radius:var(--r-md);padding:15px;margin-bottom:14px">
      <div style="font-size:14px;font-weight:700;color:var(--t);margin-bottom:12px">${r ? 'Edit Reminder' : 'New Reminder'}</div>
      <div style="display:grid;gap:9px;margin-bottom:10px">
        <div>
          <label class="inp-label">Title *</label>
          <input class="inp" id="rt" value="${escapeAttr(r?.title || '')}" placeholder="e.g. Credit Card Bill"/>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div>
            <label class="inp-label">Due Date *</label>
            <input type="date" class="inp" id="rd" value="${escapeAttr(r?.date || '')}"/>
          </div>
          <div>
            <label class="inp-label">Amount (₹)</label>
            <input type="number" class="inp" id="ra" value="${escapeAttr(r?.amount || '')}" placeholder="0"/>
          </div>
        </div>
        <div>
          <label class="inp-label">Note (optional)</label>
          <input class="inp" id="rn" value="${escapeAttr(r?.note || '')}" placeholder="Additional details…"/>
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-p" style="flex:1" onclick="saveRem('${existingId || ''}')">
          ${r ? 'Update Reminder' : 'Set Reminder'}
        </button>
        <button class="btn btn-g" onclick="document.getElementById('rfw').innerHTML=''">Cancel</button>
      </div>
    </div>`;
}

function editRem(id) {
    showRF(id);
    document.getElementById('rfw')?.scrollIntoView({ behavior: 'smooth' });
}

function saveRem(existingId) {
    const t = V.text(document.getElementById('rt')?.value || '', { max: 100 });
    const d = document.getElementById('rd')?.value;
    const dv = V.date(d, { required: true, allowFuture: true });
    if (!t.ok || !t.v || !dv.ok) { toast('Title aur date chahiye!', 'error'); return; }
    const amt = V.amount(document.getElementById('ra')?.value || 0, { min: 0, max: 1e9, allowZero: true, allowNegative: false });
    if (!amt.ok) { toast(amt.error, 'error'); return; }
    const obj = {
        title: t.v, date: d,
        amount: amt.n,
        note: V.text(document.getElementById('rn')?.value || '', { max: 200 }).v || '',
    };
    if (existingId) {
        S.data.reminders = S.data.reminders.map(r => r.id === existingId ? { ...r, ...obj } : r);
        toast('Reminder updated ✅');
    } else {
        S.data.reminders.push({ id: uid(), ...obj });
        toast('Reminder set 🔔');
        // Try to schedule notification
        Notifs.scheduleReminder({ id: S.data.reminders[S.data.reminders.length - 1].id, ...obj });
    }
    sd(); rGoals(document.getElementById('pg-goals'));
}

function delRem(id) {
    Modal.confirm('Delete Reminder?', 'Ye reminder permanently delete hoga.', () => {
        S.data.reminders = S.data.reminders.filter(r => r.id !== id);
        sd(); rGoals(document.getElementById('pg-goals'));
    }, { confirmText: 'Delete', icon: '🔔' });
}

window.rGoals = rGoals;
window.showBF = showBF; window.editBudget = editBudget; window.saveBudget = saveBudget; window.delBudget = delBudget;
window.showGF = showGF; window.editGoal = editGoal; window.saveGoal = saveGoal; window.delGoal = delGoal;
window.addGS = addGS; window.viewGoal = viewGoal; window.selGoalEmoji = selGoalEmoji;
window.showRF = showRF; window.editRem = editRem; window.saveRem = saveRem; window.delRem = delRem;
window.GOAL_EMOJIS = GOAL_EMOJIS;
