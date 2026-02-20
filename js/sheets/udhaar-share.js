/**
 * PaisaTracker — Udhaar Share Sheet (v2)
 * Beautiful receipt format + proper brand SVG icons
 */

/* ── SVG Icon definitions ─────────────────────────────── */
const WHATSAPP_SVG = `<svg viewBox="0 0 24 24" width="24" height="24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.527 5.845L0 24l6.32-1.505A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.932 0-3.738-.522-5.29-1.432L2.4 21.748l1.198-4.188A9.964 9.964 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>`;

const TELEGRAM_SVG = `<svg viewBox="0 0 24 24" width="24" height="24" fill="#29A8E0"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 13.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/></svg>`;

const SHARE_SVG = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`;

const COPY_SVG = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`;

function openUdhaarShare(personName) {
  const personSafeText = V.text(personName || '', { max: 80 });
  if (!personSafeText.ok || !personSafeText.v) { toast('Invalid person name', 'error'); return; }
  personName = personSafeText.v;
  const txs = S.data.transactions.filter(
    (t) => t.type === 'udhaar' && t.person?.toLowerCase() === personName.toLowerCase()
  );

  if (!txs.length) { toast('Koi udhaar nahi mila', 'info'); return; }

  const given = txs.filter(t => t.udhaarType === 'given').reduce((s, t) => s + t.amount, 0);
  const taken = txs.filter(t => t.udhaarType === 'taken').reduce((s, t) => s + t.amount, 0);
  const net = given - taken;
  const sorted = [...txs].sort((a, b) => a.date.localeCompare(b.date));
  const myName = V.text(S.user?.name || 'Me', { max: 80 }).v || 'Me';
  const nowDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  // WhatsApp receipt — ASCII + standard emoji only (no special Unicode that shows as boxes)
  const sep = '------------------------------';
  const lines = [
    `*Namaste, ${personName}!* 🙏`,
    ``,
    `*UDHAAR STATEMENT*`,
    `Between: *${myName}* and *${personName}*`,
    `Date: *${nowDate}*`,
    sep,
    ``,
    `*TRANSACTION LIST:*`,
    ...sorted.map((tx, i) => {
      const dir = tx.udhaarType === 'given'
        ? `${myName} -> ${personName}`
        : `${personName} -> ${myName}`;
      const noteClean = V.text(tx.note || '', { max: 200 }).v;
      const note = noteClean ? ` (${noteClean})` : '';
      return `${i + 1}. *${formatDate(tx.date)}*\n   ${dir}\n   Amount: *Rs. ${tx.amount.toLocaleString('en-IN')}*${note}`;
    }),
    ``,
    sep,
    given > 0 ? `Total Given (Diya): *Rs. ${given.toLocaleString('en-IN')}*` : null,
    taken > 0 ? `Total Received (Liya): *Rs. ${taken.toLocaleString('en-IN')}*` : null,
    ``,
    net > 0
      ? `*${personName} owes ${myName}: Rs. ${net.toLocaleString('en-IN')}* 💰\nKindly settle at your earliest. 🙏`
      : net < 0
        ? `*${myName} owes ${personName}: Rs. ${Math.abs(net).toLocaleString('en-IN')}* 💰`
        : `All accounts settled! ✅ Thank you 😊`,
    ``,
    `_Sent via PaisaTracker - Smart Money Manager_`,
  ].filter(v => v !== null).join('\n');

  openSh('udhaar-share');

  setTimeout(() => {
    const c = document.getElementById('sh-udhaar-share');
    if (!c) return;

    // Encode text safely for inline onclick
    const encoded = encodeURIComponent(lines);
    const encodedName = encodeURIComponent(personName);

    c.innerHTML = `
          <!-- Header -->
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
            <div>
              <div style="font-family:'Sora',sans-serif;font-size:20px;font-weight:800;color:var(--t);letter-spacing:-.3px">Share Udhaar</div>
              <div style="font-size:12px;color:var(--t3);margin-top:3px">${txs.length} transaction${txs.length > 1 ? 's' : ''} · ${escapeHTML(personName)}</div>
            </div>
            <button onclick="closeSh('udhaar-share')" class="sh-close" aria-label="Close">&#x2715;</button>
          </div>

          <!-- Person summary card -->
          <div style="background:linear-gradient(135deg,rgba(251,191,36,.14),rgba(251,191,36,.06));border:1px solid rgba(251,191,36,.30);border-radius:var(--r-lg);padding:16px;margin-bottom:14px;display:flex;align-items:center;gap:14px">
            <div style="width:50px;height:50px;border-radius:16px;background:rgba(251,191,36,.20);border:1.5px solid rgba(251,191,36,.35);display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0">🧑</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:17px;font-weight:800;color:var(--t);letter-spacing:-.2px">${escapeHTML(personName)}</div>
              <div style="font-size:13px;color:${net > 0 ? 'var(--r)' : net < 0 ? 'var(--g)' : 'var(--g)'};font-weight:600;margin-top:2px">
                ${net > 0 ? `Owes you ${INR(net)}` : net < 0 ? `You owe ${INR(Math.abs(net))}` : '✅ All settled!'}
              </div>
            </div>
            <div class="badge ${net > 0 ? 'badge-amber' : net < 0 ? 'badge-blue' : 'badge-green'}">${net > 0 ? 'Pending' : net < 0 ? 'You Owe' : 'Clear ✓'}</div>
          </div>

          <!-- Summary chips -->
          <div class="g2" style="margin-bottom:14px;gap:8px">
            <div style="background:var(--r2);border:1px solid rgba(248,113,113,.25);border-radius:var(--r-md);padding:14px 12px;text-align:center">
              <div style="font-size:10px;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">💸 Diya (Given)</div>
              <div style="font-size:20px;font-weight:900;color:var(--r);font-family:'Sora',sans-serif">${INR(given)}</div>
            </div>
            <div style="background:var(--g3);border:1px solid rgba(0,212,161,.25);border-radius:var(--r-md);padding:14px 12px;text-align:center">
              <div style="font-size:10px;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">📥 Liya (Taken)</div>
              <div style="font-size:20px;font-weight:900;color:var(--g);font-family:'Sora',sans-serif">${INR(taken)}</div>
            </div>
          </div>

          <!-- Transaction history -->
          <div style="background:var(--gl);border:1px solid var(--bd);border-radius:var(--r-md);overflow:hidden;margin-bottom:14px">
            <div style="padding:12px 14px;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;align-items:center">
              <div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.6px">Transaction History</div>
              <div style="font-size:11px;color:var(--t3)">${txs.length} entries</div>
            </div>
            <div style="max-height:160px;overflow-y:auto">
              ${sorted.map((tx, i) => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 14px;${i < sorted.length - 1 ? 'border-bottom:1px solid var(--bd)' : ''}">
                  <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:32px;height:32px;border-radius:10px;background:${tx.udhaarType === 'given' ? 'var(--r2)' : 'var(--g3)'};display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">${tx.udhaarType === 'given' ? '📤' : '📥'}</div>
                    <div>
                      <div style="font-size:12px;font-weight:600;color:var(--t)">${formatDate(tx.date)}</div>
                      ${tx.note ? `<div style="font-size:10px;color:var(--t3);margin-top:1px">${escapeHTML(tx.note)}</div>` : ''}
                    </div>
                  </div>
                  <div style="font-size:14px;font-weight:800;color:${tx.udhaarType === 'given' ? 'var(--r)' : 'var(--g)'};font-family:'Sora',sans-serif">
                    ${tx.udhaarType === 'given' ? '-' : '+'}${INR(tx.amount)}
                  </div>
                </div>`).join('')}
            </div>
          </div>

          <!-- Receipt preview -->
          <div style="background:linear-gradient(135deg,rgba(255,255,255,.04),rgba(255,255,255,.02));border:1px solid var(--bd);border-radius:var(--r-md);padding:14px;margin-bottom:18px">
            <div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px">📄 Message Preview</div>
            <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:11.5px;color:var(--t2);line-height:1.75;max-height:120px;overflow-y:auto;white-space:pre-wrap;word-break:break-word">${escapeHTML(lines)
        .replace(/\*([^*]+)\*/g, '<strong style="color:var(--t)">$1</strong>')
        .replace(/_([^_]+)_/g, '<em style="opacity:.75">$1</em>')}</div>
          </div>

          <!-- Share label -->
          <div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.7px;margin-bottom:10px">Share Via</div>

          <!-- Share buttons with proper brand icons -->
          <div style="display:flex;gap:8px;margin-bottom:8px">
            <button class="share-btn" onclick="shareUdhaar('whatsapp', '${encoded}')">
              <div class="si" style="background:#25D36618;border-radius:12px">${WHATSAPP_SVG}</div>
              <span style="color:#25D366;font-size:11px;font-weight:700">WhatsApp</span>
            </button>
            <button class="share-btn" onclick="shareUdhaar('telegram', '${encoded}')">
              <div class="si" style="background:#29A8E018;border-radius:12px">${TELEGRAM_SVG}</div>
              <span style="color:#29A8E0;font-size:11px;font-weight:700">Telegram</span>
            </button>
            <button class="share-btn" onclick="shareUdhaar('native', '${encoded}', '${encodedName}')">
              <div class="si" style="background:var(--b2)"><span style="color:var(--b)">${SHARE_SVG}</span></div>
              <span>More…</span>
            </button>
            <button class="share-btn" onclick="shareUdhaar('copy', '${encoded}')">
              <div class="si" style="background:var(--gl3)"><span style="color:var(--t2)">${COPY_SVG}</span></div>
              <span>Copy</span>
            </button>
          </div>
        `;
  }, 80);
}

async function shareUdhaar(method, encodedText, encodedName) {
  const text = decodeURIComponent(encodedText);
  const name = encodedName ? decodeURIComponent(encodedName) : '';

  if (method === 'whatsapp') {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  } else if (method === 'telegram') {
    window.open(`https://t.me/share/url?text=${encodeURIComponent(text)}`, '_blank');
  } else if (method === 'native') {
    const ok = await webShare({ title: `Udhaar Summary — ${name}`, text });
    if (!ok) {
      await copyToClipboard(text);
      toast('Copied to clipboard! Paste anywhere 📋');
    }
  } else if (method === 'copy') {
    await copyToClipboard(text);
    toast('📋 Message copied! Paste in WhatsApp or any app.');
  }
}

window.openUdhaarShare = openUdhaarShare;
window.shareUdhaar = shareUdhaar;
