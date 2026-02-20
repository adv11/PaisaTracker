/**
 * PaisaTracker — Category Manager Sheet (FIXED)
 */

let _cmT = 'expense';

function openCatMgr() {
  _cmT = 'expense';
  openSh('cat-mgr');
  setTimeout(() => renderCM(), 80);
}

function renderCM() {
  const c = document.getElementById('sh-cat-mgr');
  if (!c) return;
  const cats = S.data.categories.filter(x => x.type === _cmT);

  c.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
      <div style="font-family:'Sora',sans-serif;font-size:20px;font-weight:800;color:var(--t)">Manage Categories</div>
      <button onclick="closeSh('cat-mgr')" class="sh-close" aria-label="Close">&#x2715;</button>
    </div>

    <!-- Type filter -->
    <div style="display:flex;gap:8px;margin-bottom:16px;overflow-x:auto;padding-bottom:4px">
      ${['income', 'expense', 'investment', 'udhaar'].map(t => `
        <button onclick="_cmT='${t}';renderCM()"
          style="flex-shrink:0;padding:8px 16px;border-radius:50px;font-size:12px;font-weight:700;cursor:pointer;border:1.5px solid ${_cmT === t ? 'transparent' : 'var(--bd)'};background:${_cmT === t ? 'var(--g)' : 'var(--gl)'};color:${_cmT === t ? 'white' : 'var(--t2)'}">
          ${t[0].toUpperCase() + t.slice(1)}
        </button>`).join('')}
    </div>

    <!-- Add new -->
    <button class="btn btn-p" style="width:100%;margin-bottom:12px;padding:12px;border-radius:14px"
            onclick="showACF()">+ Add Category</button>
    <div id="acf-area" style="margin-bottom:12px"></div>

    <!-- Category list -->
    <div style="display:flex;flex-direction:column;gap:8px">
      ${cats.length === 0 ? `<div style="text-align:center;padding:30px;color:var(--t3);font-size:14px">No categories yet. Add one above!</div>` : ''}
      ${cats.map(cat => `
        <div style="background:var(--gl);border:1px solid var(--bd);border-radius:var(--r-md);overflow:hidden">
          <div style="display:flex;align-items:center;padding:12px 14px;gap:10px">
            <div style="width:11px;height:11px;border-radius:3px;background:${cat.color};flex-shrink:0"></div>
            <div style="flex:1;font-size:14px;font-weight:600;color:var(--t)">${escapeHTML(cat.name)}</div>
            <span style="font-size:11px;color:var(--t3);margin-right:4px">${(cat.sub || []).length} sub</span>
            <button onclick="togCatExpand('${safeId(cat.id)}')"
                    style="background:var(--gl2);border:1px solid var(--bd);border-radius:8px;padding:4px 8px;cursor:pointer;color:var(--t2);font-size:11px;font-weight:700"
                    id="cex-${safeId(cat.id)}">▼ Expand</button>
            <button onclick="delCat('${safeId(cat.id)}')"
                    style="background:rgba(239,68,68,.12);border:none;border-radius:8px;padding:5px 8px;cursor:pointer;color:var(--r);font-size:14px"></button>
          </div>
          <div id="cx-${safeId(cat.id)}" style="display:none;padding:0 14px 12px;border-top:1px solid var(--bd)">
            ${(cat.sub || []).length === 0 ? '<div style="font-size:12px;color:var(--t3);padding:8px 0">No subcategories yet</div>' : ''}
            ${(cat.sub || []).map(s => `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--bd)">
                <span style="font-size:12px;color:var(--t2)">↳ ${escapeHTML(s)}</span>
                <button onclick="delSub('${safeId(cat.id)}', decodeURIComponent('${encodeURIComponent(s)}'))"
                        style="background:none;border:none;cursor:pointer;color:var(--t3);font-size:16px;line-height:1">✕</button>
              </div>`).join('')}
            <div style="display:flex;gap:7px;margin-top:10px">
              <input class="inp" id="si-${safeId(cat.id)}" placeholder="Add subcategory…"
                     style="flex:1;font-size:12px;padding:9px 13px"
                     onkeydown="if(event.key==='Enter')addSub('${safeId(cat.id)}')"/>
              <button onclick="addSub('${safeId(cat.id)}')"
                      style="background:var(--g);border:none;border-radius:10px;padding:9px 14px;cursor:pointer;color:white;font-weight:700;font-size:12px">Add</button>
            </div>
          </div>
        </div>`).join('')}
    </div>
  `;
}

function togCatExpand(id) {
  const el = document.getElementById('cx-' + id);
  const btn = document.getElementById('cex-' + id);
  if (!el) return;
  const open = el.style.display === 'none';
  el.style.display = open ? 'block' : 'none';
  if (btn) btn.textContent = open ? '▲ Collapse' : '▼ Expand';
}

function delCat(id) {
  const cat = S.data.categories.find(c => c.id === id);
  Modal.confirm(
    'Delete Category?',
    `"${cat?.name}" permanently delete hoga. Existing transactions will remain but category link will break.`,
    () => {
      S.data.categories = S.data.categories.filter(c => c.id !== id);
      sd(); toast('Category deleted', 'error'); renderCM();
    },
    { confirmText: 'Delete', icon: '📂' }
  );
}

function addSub(cId) {
  const inp = document.getElementById('si-' + cId);
  const v = V.text(inp?.value || '', { max: 60 });
  if (!v.ok) { toast(v.error, 'error'); return; }
  if (!v.v) return;
  S.data.categories = S.data.categories.map(c =>
    c.id === cId ? { ...c, sub: [...(c.sub || []), v.v] } : c
  );
  sd(); toast('Subcategory added ✅'); renderCM();
}

function delSub(cId, sub) {
  S.data.categories = S.data.categories.map(c =>
    c.id === cId ? { ...c, sub: (c.sub || []).filter(s => s !== sub) } : c
  );
  sd(); renderCM();
}

function showACF() {
  const a = document.getElementById('acf-area');
  if (!a) return;
  const COLORS = ['#10b981', '#6366f1', '#ef4444', '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#8b5cf6'];
  let pickedColor = '#10b981';
  a.innerHTML = `
    <div style="background:var(--gl2);border:1px solid var(--bd2);border-radius:var(--r-md);padding:14px;margin-bottom:10px">
      <div style="font-size:13px;font-weight:700;color:var(--t);margin-bottom:12px">New Category</div>
      <div style="margin-bottom:10px">
        <label class="inp-label">Name (include emoji)</label>
        <input class="inp" id="ncn" placeholder="e.g. 🍕 Pizza" autofocus/>
      </div>
      <div style="margin-bottom:12px">
        <label class="inp-label">Color</label>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px" id="ncc-grid">
          ${COLORS.map(col => `
            <button onclick="pickedCatColor('${col}',this)"
              style="width:32px;height:32px;border-radius:50%;background:${col};border:3px solid ${col === pickedColor ? 'white' : 'transparent'};cursor:pointer;transition:transform .15s"
              class="cc-swatch" data-col="${col}"></button>`).join('')}
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-p" style="flex:1" onclick="saveNCat()">Add Category</button>
        <button class="btn btn-g" onclick="document.getElementById('acf-area').innerHTML=''">Cancel</button>
      </div>
    </div>`;
  // Pick first color
  window._pickedCatColor = pickedColor;
}

function pickedCatColor(col, el) {
  window._pickedCatColor = col;
  document.querySelectorAll('.cc-swatch').forEach(b => b.style.border = '3px solid transparent');
  el.style.border = '3px solid white';
  el.style.transform = 'scale(1.2)';
  setTimeout(() => el.style.transform = 'scale(1)', 200);
}

function saveNCat() {
  const nm = V.text(document.getElementById('ncn')?.value || '', { max: 50 });
  if (!nm.ok || !nm.v) { toast(nm.error || 'Category name chahiye!', 'error'); return; }
  S.data.categories.push({
    id: uid(), name: nm.v, type: _cmT,
    color: window._pickedCatColor || '#10b981', sub: []
  });
  sd(); toast('Category added ✅'); renderCM();
}

window.openCatMgr = openCatMgr;
window.renderCM = renderCM;
window.togCatExpand = togCatExpand;
window.delCat = delCat;
window.addSub = addSub;
window.delSub = delSub;
window.showACF = showACF;
window.pickedCatColor = pickedCatColor;
window.saveNCat = saveNCat;
window._cmT = _cmT;
