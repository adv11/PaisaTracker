/**
 * PaisaTracker — Custom Modal (replaces browser confirm/prompt/alert)
 */

const Modal = (() => {
    let _overlay, _box;

    const _init = () => {
        _overlay = document.getElementById('modal-overlay');
        _box = document.getElementById('modal-box');
    };

    const _close = () => {
        if (!_overlay) _init();
        _overlay.classList.remove('open');
        setTimeout(() => { _box.innerHTML = ''; }, 300);
    };

    /**
     * Confirmation dialog for destructive actions
     * @param {string} title
     * @param {string} message
     * @param {Function} onConfirm
     * @param {Object} opts — { danger: bool, confirmText, cancelText }
     */
    const confirm = (title, message, onConfirm, opts = {}) => {
        if (!_overlay) _init();
        const {
            danger = true,
            confirmText = 'Delete',
            cancelText = 'Cancel',
            icon = danger ? '⚠️' : '❓',
            allowHtml = false,
        } = opts;
        const safeTitle = escapeHTML(title);
        const safeMessage = allowHtml ? String(message || '') : escapeHTML(message);

        _box.innerHTML = `
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:48px;margin-bottom:12px;animation:pop .3s var(--ease-spring)">${icon}</div>
        <div style="font-family:'Sora',sans-serif;font-size:20px;font-weight:800;color:var(--t);margin-bottom:8px">${safeTitle}</div>
        <div style="font-size:14px;color:var(--t2);line-height:1.65">${safeMessage}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <button id="modal-confirm" class="btn ${danger ? 'btn-r' : 'btn-p'}" style="width:100%;padding:14px;font-size:15px;border-radius:16px">
          ${confirmText}
        </button>
        <button id="modal-cancel" class="btn btn-g" style="width:100%;padding:13px">
          ${cancelText}
        </button>
      </div>
    `;

        _overlay.classList.add('open');

        document.getElementById('modal-confirm').onclick = () => {
            _close();
            setTimeout(onConfirm, 50);
        };
        document.getElementById('modal-cancel').onclick = _close;

        // Close on overlay click
        _overlay.onclick = (e) => { if (e.target === _overlay) _close(); };
    };

    /**
     * Prompt dialog
     * @param {string} title
     * @param {string} placeholder
     * @param {Function} onSubmit — called with the entered value (string)
     * @param {Object} opts — { type, defaultValue, hint }
     */
    const prompt = (title, placeholder, onSubmit, opts = {}) => {
        if (!_overlay) _init();
        const { type = 'text', defaultValue = '', hint = '', confirmText = 'OK' } = opts;
        const safeTitle = escapeHTML(title);
        const safeDefault = escapeAttr(defaultValue);
        const safePlaceholder = escapeAttr(placeholder);
        const safeHint = escapeHTML(hint);

        _box.innerHTML = `
      <div style="margin-bottom:20px">
        <div style="font-family:'Sora',sans-serif;font-size:18px;font-weight:800;color:var(--t);margin-bottom:14px">${safeTitle}</div>
        <input id="modal-input" class="inp" type="${type}" value="${safeDefault}" placeholder="${safePlaceholder}" style="margin-bottom:${hint ? '8px' : '0'}"/>
        ${hint ? `<div style="font-size:12px;color:var(--t3);line-height:1.6">${safeHint}</div>` : ''}
      </div>
      <div style="display:flex;gap:8px">
        <button id="modal-confirm" class="btn btn-p" style="flex:1;padding:13px">${confirmText}</button>
        <button id="modal-cancel" class="btn btn-g" style="flex:1;padding:13px">Cancel</button>
      </div>
    `;

        _overlay.classList.add('open');
        setTimeout(() => document.getElementById('modal-input')?.focus(), 100);

        const submit = () => {
            const val = document.getElementById('modal-input')?.value;
            _close();
            setTimeout(() => onSubmit(val), 50);
        };

        document.getElementById('modal-confirm').onclick = submit;
        document.getElementById('modal-cancel').onclick = _close;
        document.getElementById('modal-input').onkeydown = (e) => {
            if (e.key === 'Enter') submit();
        };
        _overlay.onclick = (e) => { if (e.target === _overlay) _close(); };
    };

    /**
     * Info/Alert modal
     */
    const alert = (title, message, opts = {}) => {
        if (!_overlay) _init();
        const { icon = 'ℹ️', btnText = 'OK', allowHtml = false } = opts;
        const safeTitle = escapeHTML(title);
        const safeMessage = allowHtml ? String(message || '') : escapeHTML(message);

        _box.innerHTML = `
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:48px;margin-bottom:12px">${icon}</div>
        <div style="font-family:'Sora',sans-serif;font-size:18px;font-weight:800;color:var(--t);margin-bottom:8px">${safeTitle}</div>
        <div style="font-size:14px;color:var(--t2);line-height:1.65">${safeMessage}</div>
      </div>
      <button id="modal-ok" class="btn btn-p" style="width:100%;padding:14px">${btnText}</button>
    `;

        _overlay.classList.add('open');
        document.getElementById('modal-ok').onclick = _close;
        _overlay.onclick = (e) => { if (e.target === _overlay) _close(); };
    };

    return { confirm, prompt, alert };
})();

window.Modal = Modal;
