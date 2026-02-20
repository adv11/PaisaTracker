/**
 * PaisaTracker — Auth Module (Google picker, email login, saved accounts)
 */

const Auth = (() => {
    // ── Render saved accounts on login page ──────────────────
    const renderSavedAccounts = () => {
        const users = DB.getAllUsers();
        const section = document.getElementById('eu-s');
        const list = document.getElementById('eu-l');
        if (!section || !list) return;

        if (!users.length) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        list.innerHTML = users.map((u) => `
      <div class="lr" style="cursor:pointer" onclick="Auth.pickUser('${safeId(u.id)}')">
        <div style="font-size:30px">${u.avatarEmoji || '😊'}</div>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:700;color:var(--t)">${escapeHTML(u.name)}</div>
          <div style="font-size:12px;color:var(--t3)">${escapeHTML(u.email)}</div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    `).join('');
    };

    // ── Select an existing user → go to lock screen ──────────
    const pickUser = (id) => {
        closeGP();
        const user = DB.getUser(id);
        if (!user) return;
        S.user = user;
        showLock(user);
    };

    // ── Email login / signup ──────────────────────────────────
    const emailLogin = () => {
        const input = document.getElementById('le');
        const em = V.email(input?.value || '');
        if (!em.ok) {
            toast('Valid email enter karo', 'error');
            input?.classList.add('anim-shake');
            setTimeout(() => input?.classList.remove('anim-shake'), 500);
            return;
        }
        const email = em.cleaned;
        const users = DB.getAllUsers();
        const existing = users.find((u) => u.email === email);
        if (existing) {
            S.user = existing;
            showLock(existing);
        } else {
            S.pendingEmail = email;
            document.getElementById('pse').textContent = email;
            renderAvatarGrid();
            go('ps');
        }
    };

    // ── Google picker modal ───────────────────────────────────
    const openGP = () => {
        const users = DB.getAllUsers();
        const el = document.getElementById('gpef');
        const gpad = document.getElementById('gpad');
        if (el) el.style.display = 'none';
        if (gpad) gpad.style.display = 'block';

        const gpa = document.getElementById('gpa');
        if (gpa) {
            gpa.innerHTML = users.map((u) => `
        <div style="display:flex;align-items:center;gap:14px;padding:14px 0;cursor:pointer;border-radius:8px;transition:background .15s"
             onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='transparent'"
             onclick="Auth.pickUser('${safeId(u.id)}')">
          <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#4285f4,#34a853);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${u.avatarEmoji || '😊'}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:500;color:#202124;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHTML(u.name)}</div>
            <div style="font-size:12px;color:#5f6368;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHTML(u.email)}</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      `).join('');
        }
        document.getElementById('gmv').classList.add('open');
    };

    const closeGP = () => document.getElementById('gmv').classList.remove('open');

    const showGEInput = () => {
        document.getElementById('gpef').style.display = 'block';
        document.getElementById('gpad').style.display = 'none';
        setTimeout(() => document.getElementById('gpei')?.focus(), 100);
    };

    const confirmGEInput = () => {
        const em = V.email(document.getElementById('gpei')?.value || '');
        if (!em.ok) {
            const i = document.getElementById('gpei');
            if (i) { i.style.borderColor = '#ea4335'; setTimeout(() => i.style.borderColor = '#dadce0', 2000); }
            return;
        }
        const email = em.cleaned;
        closeGP();
        const existing = DB.getAllUsers().find((u) => u.email === email);
        if (existing) {
            S.user = existing;
            showLock(existing);
        } else {
            S.pendingEmail = email;
            document.getElementById('pse').textContent = email;
            renderAvatarGrid();
            go('ps');
        }
    };

    return {
        renderSavedAccounts,
        pickUser,
        emailLogin,
        openGP,
        closeGP,
        showGEInput,
        confirmGEInput,
    };
})();

window.Auth = Auth;
// Expose for onclick
window.openGP = () => Auth.openGP();
window.closeGP = () => Auth.closeGP();
window.showGEI = () => Auth.showGEInput();
window.confGE = () => Auth.confirmGEInput();
window.emailL = () => Auth.emailLogin();
window.renderEU = () => Auth.renderSavedAccounts();
window.pickU = (id) => Auth.pickUser(id);
