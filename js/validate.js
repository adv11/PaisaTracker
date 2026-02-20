/**
 * PaisaTracker — Production-Grade Validation Module
 *
 * V.validate(rules, data) → { ok, errors }
 * V.phone(val) → { ok, cleaned }   – Indian mobile validation
 * V.email(val) → { ok, cleaned }
 * V.amount(val, opts) → { ok, n }  – numeric, positive, optional max
 * V.pin(val) → { ok }              – exactly 6 digits
 * V.name(val, opts) → { ok, v }    – min/max length, no special chars
 * V.date(val) → { ok }             – YYYY-MM-DD, not future if needed
 * V.required(val) → true/false
 * V.sanitize(str) → XSS-stripped string
 */

const V = (() => {
    // Strip HTML tags, trim, collapse whitespace
    function sanitize(str) {
        if (str == null) return '';
        return String(str)
            .replace(/<[^>]*>/g, '')   // strip HTML
            .replace(/[<>"'`]/g, '')   // strip remaining XSS chars
            .trim()
            .replace(/\s+/g, ' ');     // collapse whitespace
    }

    function required(val) {
        if (val == null) return false;
        return String(val).trim().length > 0;
    }

    // Indian mobile: 10 digits, starts with 6-9, optional +91/0 prefix
    function phone(raw) {
        if (!raw) return { ok: false, cleaned: '', error: 'Mobile number required' };
        const stripped = String(raw).replace(/[\s\-().+]/g, '');
        // Remove country code
        const num = stripped.startsWith('91') && stripped.length === 12
            ? stripped.slice(2)
            : stripped.startsWith('0') && stripped.length === 11
                ? stripped.slice(1)
                : stripped;
        if (!/^\d{10}$/.test(num)) {
            return { ok: false, cleaned: '', error: 'Enter a valid 10-digit Indian mobile number' };
        }
        if (!/^[6-9]/.test(num)) {
            return { ok: false, cleaned: '', error: 'Mobile number must start with 6, 7, 8, or 9' };
        }
        return { ok: true, cleaned: num };
    }

    function email(raw) {
        if (!raw) return { ok: false, cleaned: '', error: 'Email required' };
        const v = sanitize(raw).toLowerCase();
        const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
        if (!re.test(v)) return { ok: false, cleaned: '', error: 'Enter a valid email address' };
        if (v.length > 254) return { ok: false, cleaned: '', error: 'Email too long' };
        return { ok: true, cleaned: v };
    }

    // opts: { min, max, allowNegative, allowZero, integer }
    function amount(raw, opts = {}) {
        const { min = 0, max = 1e9, allowNegative = false, allowZero = false, integer = false } = opts;
        if (!required(raw)) return { ok: false, n: 0, error: 'Amount required' };
        const str = String(raw).trim().replace(/,/g, '');
        const n = integer ? parseInt(str, 10) : parseFloat(str);
        if (isNaN(n) || !isFinite(n)) return { ok: false, n: 0, error: 'Enter a valid number' };
        if (!allowNegative && n < 0) return { ok: false, n: 0, error: 'Amount cannot be negative' };
        if (!allowZero && n === 0) return { ok: false, n: 0, error: 'Amount must be greater than 0' };
        if (n < min) return { ok: false, n: 0, error: `Minimum amount is ₹${min.toLocaleString('en-IN')}` };
        if (n > max) return { ok: false, n: 0, error: `Maximum amount is ₹${max.toLocaleString('en-IN')}` };
        // Limit to 2 decimal places for currency
        const rounded = integer ? n : Math.round(n * 100) / 100;
        return { ok: true, n: rounded };
    }

    function pin(raw) {
        const s = String(raw || '').trim();
        if (!s) return { ok: false, error: 'PIN required' };
        if (!/^\d{6}$/.test(s)) return { ok: false, error: 'PIN must be exactly 6 digits' };
        if (/^(\d)\1{5}$/.test(s)) return { ok: false, error: 'PIN cannot be all same digits (e.g. 111111)' };
        if (['123456', '654321', '000000', '111111'].includes(s)) return { ok: false, error: 'PIN too simple. Choose a stronger PIN' };
        return { ok: true };
    }

    // opts: { min=1, max=50, label='Name', allowNumbers=false }
    function name(raw, opts = {}) {
        const { min = 1, max = 50, label = 'Name', allowNumbers = true } = opts;
        const v = sanitize(raw);
        if (!v) return { ok: false, v: '', error: `${label} is required` };
        if (v.length < min) return { ok: false, v: '', error: `${label} must be at least ${min} characters` };
        if (v.length > max) return { ok: false, v: '', error: `${label} must be ${max} characters or less` };
        if (!allowNumbers && /\d/.test(v)) return { ok: false, v: '', error: `${label} cannot contain numbers` };
        return { ok: true, v };
    }

    // YYYY-MM-DD
    function date(raw, opts = {}) {
        const { required: req = true, allowFuture = true, allowPast = true } = opts;
        if (!raw) return req ? { ok: false, error: 'Date required' } : { ok: true };
        const s = String(raw).trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return { ok: false, error: 'Invalid date format' };
        const d = new Date(s + 'T00:00:00');
        if (isNaN(d.getTime())) return { ok: false, error: 'Invalid date' };
        const now = new Date(); now.setHours(0, 0, 0, 0);
        if (!allowFuture && d > now) return { ok: false, error: 'Date cannot be in the future' };
        if (!allowPast && d < now) return { ok: false, error: 'Date cannot be in the past' };
        const year = d.getFullYear();
        if (year < 1900 || year > 2100) return { ok: false, error: 'Invalid year' };
        return { ok: true };
    }

    // Text / note field (optional)
    function text(raw, opts = {}) {
        const { max = 500 } = opts;
        const v = sanitize(raw);
        if (v.length > max) return { ok: false, v: '', error: `Text too long (max ${max} chars)` };
        return { ok: true, v };
    }

    // Show validation error inline below an input
    function showErr(inputId, msg) {
        const inp = document.getElementById(inputId);
        if (!inp) return;
        inp.style.borderColor = 'var(--r)';
        inp.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.15)';
        let errEl = document.getElementById('verr-' + inputId);
        if (!errEl) {
            errEl = document.createElement('div');
            errEl.id = 'verr-' + inputId;
            errEl.style.cssText = 'font-size:11px;color:var(--r);margin-top:4px;font-weight:600;display:flex;align-items:center;gap:4px';
            inp.parentNode?.insertBefore(errEl, inp.nextSibling);
        }
        errEl.innerHTML = `<span>⚠️</span> ${msg}`;
        inp.addEventListener('input', () => clearErr(inputId), { once: true });
    }

    function clearErr(inputId) {
        const inp = document.getElementById(inputId);
        if (inp) { inp.style.borderColor = ''; inp.style.boxShadow = ''; }
        const e = document.getElementById('verr-' + inputId);
        if (e) e.remove();
    }

    // Show inline info/success
    function showInfo(inputId, msg, type = 'success') {
        const col = type === 'success' ? 'var(--g)' : 'var(--b)';
        let el = document.getElementById('vinfo-' + inputId);
        if (!el) {
            el = document.createElement('div');
            el.id = 'vinfo-' + inputId;
            el.style.cssText = `font-size:11px;margin-top:4px;font-weight:600`;
            const inp = document.getElementById(inputId);
            inp?.parentNode?.insertBefore(el, inp?.nextSibling);
        }
        el.style.color = col;
        el.textContent = msg;
    }

    // ── Real-time inline hint helpers (call from oninput) ──────
    // Show green if valid, red if invalid. Only shows after user types 2+ chars.
    function liveCheck(inputEl, errDivId, validateFn) {
        const val = inputEl.value;
        const errDiv = document.getElementById(errDivId);
        if (!errDiv) return;
        if (!val || val.length < 2) { errDiv.textContent = ''; inputEl.style.borderColor = ''; return; }
        const res = validateFn(val);
        if (res.ok) {
            errDiv.innerHTML = `<span style="color:var(--g);font-weight:600;font-size:11px">&#10003; Looks good!</span>`;
            inputEl.style.borderColor = 'var(--g)';
            inputEl.style.boxShadow = '0 0 0 3px var(--g3)';
        } else {
            errDiv.innerHTML = `<span style="color:var(--r);font-weight:600;font-size:11px">⚠️ ${res.error}</span>`;
            inputEl.style.borderColor = 'var(--r)';
            inputEl.style.boxShadow = '0 0 0 3px var(--r2)';
        }
    }

    function livePhone(inputEl, errDivId) {
        // Strip non-numeric except + for display
        inputEl.value = inputEl.value.replace(/[^0-9+\s]/g, '');
        const val = inputEl.value.replace(/[\s+]/g, '');
        const errDiv = document.getElementById(errDivId);
        if (!errDiv) return;
        if (!val || val.length < 5) { errDiv.textContent = ''; inputEl.style.borderColor = ''; return; }
        const res = phone(val);
        if (res.ok) {
            errDiv.innerHTML = `<span style="color:var(--g);font-weight:600;font-size:11px">&#10003; Valid number</span>`;
            inputEl.style.borderColor = 'var(--g)';
            inputEl.style.boxShadow = '0 0 0 3px var(--g3)';
        } else {
            errDiv.innerHTML = `<span style="color:var(--r);font-weight:600;font-size:11px">⚠️ ${res.error}</span>`;
            inputEl.style.borderColor = 'var(--r)';
            inputEl.style.boxShadow = '0 0 0 3px var(--r2)';
        }
    }

    return {
        sanitize, required,
        phone, email, amount, pin, name, date, text,
        showErr, clearErr, showInfo,
        liveCheck, livePhone,
    };
})();

window.V = V;
