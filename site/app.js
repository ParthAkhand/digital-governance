(() => {
  const S = window.SITE, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---- brand: one source of truth
  const brandize = () => $$('[data-brand]').forEach(e => e.textContent = S.brand);
  document.title = document.title.replace('City PMU', S.brand);
  $$('[data-company]').forEach(e => e.textContent = S.company);

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

  // ---- ward 23: Reported / Verified toggle. Without JS the full table shows.
  const ward = $('#ward'), bR = $('#b-rep'), bV = $('#b-ver'); let touched = false;
  const showVer = on => { ward.classList.toggle('verified', on); bV.setAttribute('aria-pressed', on); bR.setAttribute('aria-pressed', !on); };
  bR.onclick = () => { touched = true; showVer(false); };
  bV.onclick = () => { touched = true; showVer(true); };
  showVer(false);
  new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { setTimeout(() => touched || showVer(true), 2500); o.disconnect(); } }), { threshold: .6 }).observe(ward);

  // ---- tabs (all panels stay visible without JS)
  const tabs = $$('#tabs [role=tab]'), panels = $$('#tabs .panel');
  const pick = i => tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; panels[k].hidden = k !== i; });
  tabs.forEach((t, i) => { t.onclick = () => pick(i); t.onkeydown = e => { const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (d) { const n = (i + d + tabs.length) % tabs.length; pick(n); tabs[n].focus(); } }; });
  pick(0);

  // ---- pillar thread + progress bar: each section lists the pillars it is about (data-p)
  const secs = $$('main section[data-p]'), chips = $$('.pillars a'), bar = $('#prog');
  const mark = () => {
    const y = innerHeight * .35, cur = secs.filter(s => s.getBoundingClientRect().top <= y).pop();
    const p = cur ? cur.dataset.p : '';
    chips.forEach(c => c.classList.toggle('on', p.includes(c.dataset.p)));
    bar.style.width = Math.min(100, scrollY / (document.documentElement.scrollHeight - innerHeight) * 100) + '%';
  };
  addEventListener('scroll', mark, { passive: true }); mark();

  // ---- sticky visit button hides while the form is on screen
  new IntersectionObserver(es => $('#sticky').classList.toggle('off', es[0].isIntersecting)).observe($('#visit'));

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
    if (d.website) return; // honeypot: drop silently
    const phone = (d.mobile || '').replace(/[\s-]/g, '').replace(/^(\+91|0)/, '');
    const bad = (el, m) => { say(m, 'err'); f.elements[el].focus(); };
    const empty = ['name', 'designation', 'city'].find(k => !d[k].trim());
    if (empty) return bad(empty, 'Please fill in all fields.');
    if (!/^[6-9]\d{9}$/.test(phone)) return bad('mobile', 'Please enter a valid 10-digit mobile number.');
    if (!d.consent) return bad('consent', 'Please tick the consent box so we can contact you.');
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
