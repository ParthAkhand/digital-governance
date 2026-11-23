(() => {
  const S = window.SITE, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---- brand: one source of truth
  const brandize = () => $$('[data-brand]').forEach(e => e.textContent = S.brand);
  document.title = document.title.replace('City PMU', S.brand);
  $('#company').textContent = S.company;

  // ---- language: English lives in the HTML; Hindi comes only from i18n/hi.json (owner-supplied).
  // The toggle stays hidden until hi.json has content, so we never ship invented Hindi.
  const en = new Map($$('[data-i18n]').map(e => [e, e.innerHTML]));
  const setLang = (l, hi = {}) => {
    document.documentElement.lang = l;
    en.forEach((html, e) => { e.innerHTML = l === 'hi' && hi[e.dataset.i18n] ? hi[e.dataset.i18n] : html; });
    $('#lang').textContent = l === 'hi' ? 'English' : 'हिंदी';
    brandize();
    try { localStorage.setItem('lang', l); } catch (_) {}
  };
  brandize();
  fetch('i18n/hi.json').then(r => r.json()).then(hi => {
    if (!Object.keys(hi).length) return;
    const b = $('#lang'); b.style.display = 'inline-flex';
    b.onclick = () => setLang(document.documentElement.lang === 'hi' ? 'en' : 'hi', hi);
    let saved; try { saved = localStorage.getItem('lang'); } catch (_) {}
    if (saved === 'hi') setLang('hi', hi);
  }).catch(() => {});

  // ---- ward gap: bars + reveal
  $$('.row[data-rep]').forEach(r => {
    const { rep, ver, max, unit } = r.dataset;
    r.querySelector('.tracks').innerHTML = [['rep', rep], ['ver', ver]].map(([k, v]) =>
      `<div class="track ${k}"><div class="bar" aria-hidden="true"><span style="--w:${v / max * 100}%"></span></div><em>${v}${unit}</em></div>`).join('');
  });
  const ward = $('#ward'), reveal = () => ward.classList.add('revealed');
  $('#reveal').onclick = reveal;
  new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { setTimeout(reveal, 1500); o.disconnect(); } }), { threshold: .5 }).observe(ward);

  // ---- form
  const f = $('#form'), st = $('#status');
  const say = (t, c) => { st.textContent = t; st.className = c; };
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    if (d.website) return; // honeypot
    const phone = (d.mobile || '').replace(/[\s-]/g, '').replace(/^(\+91|0)/, '');
    if (!d.name.trim() || !d.designation.trim() || !d.city.trim()) return say('Please fill in all fields.', 'err');
    if (!/^[6-9]\d{9}$/.test(phone)) return say('Please enter a valid 10-digit mobile number.', 'err');
    if (!d.consent) return say('Please tick the consent box so we can contact you.', 'err');
    if (!S.formEndpoint) return say('This form is not connected yet.' + (S.fallbackContact ? ' Please contact ' + S.fallbackContact + '.' : ''), 'err');
    const btn = $('button[type=submit]', f); btn.disabled = true; say('Sending…', '');
    try {
      // text/plain avoids a CORS preflight, which Apps Script web apps do not answer
      const r = await fetch(S.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ ...d, mobile: phone, page: location.href }) });
      const j = await r.json();
      if (!j.ok) throw 0;
      f.reset(); say('Thank you. We will call you to fix the visit.', 'ok');
    } catch (_) {
      say('Could not send. Please try again' + (S.fallbackContact ? ' or contact ' + S.fallbackContact : '') + '.', 'err');
    } finally { btn.disabled = false; }
  });
})();
