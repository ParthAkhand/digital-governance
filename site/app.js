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

  // ---- case tracker: step through the status flow (illustrative; nothing is saved)
  const tr = $$('#track li'), tn = $('#track-next'); let at = 0;
  const showStep = () => {
    tr.forEach((li, i) => { li.classList.toggle('done', i < at); li.classList.toggle('now', i === at); });
    $('#track-note').textContent = tr[at].querySelector('span').textContent;
    tn.dataset.last = at === tr.length - 1 ? '1' : '';
    tn.textContent = at === tr.length - 1 ? 'Start again' : 'Move to next step';
  };
  tn.onclick = () => { at = (at + 1) % tr.length; showStep(); };
  tr.forEach((li, i) => li.onclick = () => { at = i; showStep(); });
  showStep();
  if (S.demoUrl) { const d = $('#demo-link'); d.href = S.demoUrl; d.hidden = false; }

  // ---- estimator: households = population / persons; rate falls smoothly as the city grows
  const P = S.pricing, inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const lakh = n => '₹' + (n / 1e5).toFixed(1) + ' lakh';
  const rateFor = pop => {
    const t = Math.min(1, Math.max(0, Math.log(pop / P.popLow) / Math.log(P.popHigh / P.popLow)));
    return Math.max(P.minRate, P.baseRate + P.smallAdj + t * (P.bigAdj - P.smallAdj));
  };
  const quote = pop => {
    const hh = Math.round(pop / P.persons / 1000) * 1000, rate = rateFor(pop), raw = P.cityFee + hh * rate;
    return { hh, rate, fee: Math.max(P.minFee, raw), min: raw < P.minFee };
  };
  const cs = $('#c-state'), cc = $('#c-city'), out = $('#c-out');
  Object.keys(window.CITIES).forEach(s => cs.add(new Option(s, s)));
  cs.onchange = () => {
    cc.length = 1; out.hidden = true;
    (window.CITIES[cs.value] || []).forEach(([n, p]) => cc.add(new Option(n, p)));
    cc.disabled = !cs.value;
  };
  cc.onchange = () => {
    out.hidden = !cc.value;
    if (!cc.value) return;
    const pop = +cc.value, q = quote(pop);
    $('#o-pop').textContent = pop.toLocaleString('en-IN');
    $('#o-hh').textContent = '~' + q.hh.toLocaleString('en-IN');
    $('#o-rate').textContent = '₹' + q.rate.toFixed(2);
    $('#o-fee').textContent = lakh(q.fee);
    $('#o-year').textContent = lakh(q.fee * 12);
    $('#o-min').hidden = !q.min;
    $('#f-city').value = cc.selectedOptions[0].text;
  };

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
