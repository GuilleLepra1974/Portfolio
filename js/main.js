(function(){
  var d = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var G = window.gsap, ST = window.ScrollTrigger, hasG = !!(G && ST);
  if (hasG) G.registerPlugin(ST);
  var $ = function(s, c){ return (c || document).querySelector(s); };
  var $$ = function(s, c){ return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var POSTERS = ['pieza-06','negri-2','pieza-11','pinero-3','pieza-03','negri-5','pieza-12','pinero-6','pieza-08','negri-1','pieza-04','pinero-2','pieza-09','negri-4','pieza-02','pinero-5','pieza-05','pieza-07','pieza-10','pieza-01'].map(function(n){ return 'img/' + n + '.webp'; });

  /* ---------- split text into masked chars ---------- */
  function split(el){
    if (el._split) return el._split;
    var chars = [];
    (function walk(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(t){
        if (t.nodeType === 1) { walk(t); return; }
        if (t.nodeType !== 3 || !t.textContent.trim()) return;
        var frag = document.createDocumentFragment();
        t.textContent.split(/(\s+)/).forEach(function(w){
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
          var ww = document.createElement('span'); ww.className = 'w';
          w.split('').forEach(function(ch){ var c = document.createElement('span'); c.className = 'c'; c.textContent = ch; ww.appendChild(c); chars.push(c); });
          frag.appendChild(ww);
        });
        node.replaceChild(frag, t);
      });
    })(el);
    el._split = chars; return chars;
  }
  $$('[data-split]').forEach(split);

  /* ---------- hero slot word fit ---------- */
  var heroH = $('.hero-h'), slot = $('.slot');
  function fitHero(){
    heroH.style.fontSize = '';
    var max = heroH.parentNode.clientWidth, w = 0;
    $$(':scope > span', slot).forEach(function(s){ w = Math.max(w, s.scrollWidth); });
    if (w > max) heroH.style.fontSize = (parseFloat(getComputedStyle(heroH).fontSize) * max / w * 0.98) + 'px';
  }
  fitHero();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ fitHero(); if (hasG) ST.refresh(); });
  window.addEventListener('resize', fitHero);

  /* ---------- hero entrance + slot cycling ---------- */
  function heroIn(){
    if (!hasG) return;
    G.from($$('.hero-h .row:first-child .c').concat(split(slot.children[0])), { yPercent: 115, duration: 1.2, ease: 'expo.out', stagger: 0.035 });
    G.from('.hero-meta > *, .hero-foot > *', { y: 24, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.3 });
    $$('.pitch .dr').forEach(function(p){
      var len = p.getTotalLength ? p.getTotalLength() : 1000;
      G.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', delay: 0.2 + Math.random() * 0.5 });
    });
    startSlot();
  }
  function startSlot(){
    var words = Array.prototype.slice.call(slot.children), i = 0;
    slot.classList.add('live');
    words.forEach(function(w, j){ if (j) G.set(split(w), { yPercent: 170 }); });
    setInterval(function(){
      if (document.hidden) return;
      var cur = split(words[i]); i = (i + 1) % words.length; var nxt = split(words[i]);
      G.to(cur, { yPercent: -170, duration: 0.7, ease: 'expo.in', stagger: 0.025 });
      G.fromTo(nxt, { yPercent: 170 }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.03, delay: 0.55 });
    }, 3000);
  }

  /* ---------- intro ---------- */
  function intro(done){
    if (!d.classList.contains('intro-on')) { done(); return; }
    if (!hasG) { d.classList.remove('intro-on'); done(); return; }
    var flip = $('.intro-flip img'), count = $('.intro-count');
    POSTERS.slice(0, 12).forEach(function(src){ var im = new Image(); im.src = src; });
    var o = { v: 0 }, last = -1;
    var tl = G.timeline({ onComplete: function(){
      d.classList.remove('intro-on');
      try { sessionStorage.setItem('tz-intro', '1'); } catch (e) {}
      done();
    } });
    tl.from(split($('.intro-logo')), { yPercent: 120, duration: 0.8, ease: 'expo.out', stagger: 0.04 })
      .from('.intro-top .c', { yPercent: 120, duration: 0.8, ease: 'expo.out' }, 0)
      .from('.intro-flip', { clipPath: 'inset(50% 0% 50% 0%)', duration: 0.8, ease: 'expo.inOut' }, 0.1)
      .from('.intro-count', { opacity: 0, duration: 0.4 }, 0.2)
      .to(o, { v: 100, duration: 2.2, ease: 'power2.inOut', onUpdate: function(){
          var v = Math.round(o.v); count.textContent = String(v).padStart(3, '0');
          var k = Math.floor(o.v / 8.4) % 12; if (k !== last) { last = k; flip.src = POSTERS[k]; }
        } }, 0.2)
      .to('.intro-flip', { scale: 1.12, duration: 2.2, ease: 'power2.inOut' }, 0.2)
      .to(split($('.intro-logo')).concat($$('.intro-top .c')), { yPercent: -120, duration: 0.6, ease: 'expo.in', stagger: 0.015 }, '>-0.1')
      .to('.intro-count', { yPercent: -40, opacity: 0, duration: 0.5, ease: 'expo.in' }, '<')
      .to('.intro-flip', { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.7, ease: 'expo.inOut' }, '<0.1')
      .to('.intro-skip', { opacity: 0, duration: 0.3 }, '<')
      .to('.intro-bg.a', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '>-0.25')
      .to('.intro-bg.b', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '<0.12')
      .add(function(){ heroIn(); heroIn = function(){}; }, '<0.35');
    $('.intro-skip').addEventListener('click', function(){ tl.progress(1); });
  }
  intro(function(){ heroIn(); heroIn = function(){}; });


  /* ---------- scroll: progress, header, clock ---------- */
  var prog = $('.progress'), hdr = $('.hdr'), lastY = 0;
  function onScroll(){
    var y = window.scrollY, m = Math.max(1, d.scrollHeight - innerHeight);
    prog.style.transform = 'scaleX(' + (y / m) + ')';
    hdr.classList.toggle('hide', y > lastY && y > 300 && !menu.classList.contains('open'));
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- menu ---------- */
  var menu = $('#menu'), mBtn = $('.menu-btn');
  function openMenu(){
    menu.classList.add('open'); mBtn.setAttribute('aria-expanded', 'true');
    if (hasG) G.fromTo($$('.menu nav .c'), { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.012, delay: 0.25 });
    setTimeout(function(){ var a = $('.menu nav a'); if (a) a.focus(); }, 300);
  }
  function closeMenu(){ menu.classList.remove('open'); mBtn.setAttribute('aria-expanded', 'false'); mBtn.focus({ preventScroll: true }); }
  mBtn.addEventListener('click', openMenu);
  $('.menu-close').addEventListener('click', closeMenu);
  $$('.menu a[href^="#"]').forEach(function(a){ a.addEventListener('click', function(){ menu.classList.remove('open'); mBtn.setAttribute('aria-expanded', 'false'); }); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu(); });

  /* ---------- story phone ---------- */
  $$('[data-story]').forEach(function(ph){
    var imgs = $$('img', ph), bars = $$('.bars i', ph), k = 0;
    function show(n){
      imgs.forEach(function(im, j){ im.classList.toggle('on', j === n); });
      bars.forEach(function(b, j){ b.className = j < n ? 'done' : ''; });
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ if (bars[n]) bars[n].className = 'go'; }); });
    }
    show(0);
    setInterval(function(){ if (!document.hidden){ k = (k + 1) % imgs.length; show(k); } }, 2600);
  });

  /* ---------- tabs / before-after / copy ---------- */
  var tabs = $$('.tab');
  tabs.forEach(function(t){
    t.addEventListener('click', function(){
      tabs.forEach(function(o){ var on = o === t; o.setAttribute('aria-selected', on); document.getElementById(o.getAttribute('aria-controls')).hidden = !on; });
      var pan = document.getElementById(t.getAttribute('aria-controls'));
      if (hasG) G.fromTo($$('.thumb', pan), { y: 40, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out', stagger: 0.06 });
      if (hasG) ST.refresh();
    });
  });
  $$('.ba').forEach(function(ba){ var inp = $('input', ba); inp.addEventListener('input', function(){ ba.style.setProperty('--p', inp.value + '%'); }); });
  $$('button.copy[data-copy]').forEach(function(b){
    var label = $('span', b);
    b.addEventListener('click', function(){
      var txt = b.getAttribute('data-copy');
      function done(){ label.textContent = 'Copiado'; b.classList.add('ok'); setTimeout(function(){ label.textContent = 'Copiar'; b.classList.remove('ok'); }, 1600); }
      function fallback(){ var a = b.parentNode.querySelector('a'); var r = document.createRange(); r.selectNodeContents(a); var s = getSelection(); s.removeAllRanges(); s.addRange(r); label.textContent = 'Seleccionado'; setTimeout(function(){ label.textContent = 'Copiar'; }, 1600); }
      try { navigator.clipboard.writeText(txt).then(done, fallback); } catch (e) { fallback(); }
    });
  });

  /* ---------- lightbox ---------- */
  var lb = $('.lb'), lbImg = $('.lb-stage img'), lbCap = $('.lb .cap'), lbCount = $('.lb .count'), list = [], idx = 0, opener = null;
  function render(){
    var b = list[idx], src = $('img', b);
    lbImg.src = src.getAttribute('src'); lbImg.alt = src.alt;
    lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
    lbCap.textContent = b.getAttribute('data-label') || '';
    lbCount.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(list.length).padStart(2, '0');
  }
  function step(n){ idx = (idx + n + list.length) % list.length; render(); }
  $$('[data-lb]').forEach(function(b){
    b.addEventListener('click', function(){
      if (b._dragged) return;
      list = $$('[data-lb="' + b.getAttribute('data-lb') + '"]'); idx = list.indexOf(b); opener = b; render();
      if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
      lb.dispatchEvent(new Event('lb-open'));
    });
  });
  function closeLb(){ if (lb.close) lb.close(); else lb.removeAttribute('open'); lb.dispatchEvent(new Event('lb-close')); }
  $('[data-lb-close]').addEventListener('click', closeLb);
  $('[data-lb-prev]').addEventListener('click', function(){ step(-1); });
  $('[data-lb-next]').addEventListener('click', function(){ step(1); });
  lb.addEventListener('click', function(e){ if (e.target === lb || e.target.classList.contains('lb-stage')) closeLb(); });
  lb.addEventListener('close', function(){ if (opener) opener.focus({ preventScroll: true }); });
  document.addEventListener('keydown', function(e){ if (!lb.open) return; if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
  var tx = null;
  lb.addEventListener('touchstart', function(e){ tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function(e){ if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); tx = null; });

  /* ---------- drag to scroll the agency rail (when not pinned) ---------- */
  var view = $('.ag-view');
  (function(){
    var down = false, sx = 0, sl = 0, moved = 0;
    view.addEventListener('pointerdown', function(e){ if (e.pointerType !== 'mouse' || $('.agency').classList.contains('pinned')) return; down = true; moved = 0; sx = e.clientX; sl = view.scrollLeft; });
    window.addEventListener('pointermove', function(e){ if (!down) return; moved = Math.abs(e.clientX - sx); view.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener('pointerup', function(){ if (!down) return; down = false; $$('.poster', view).forEach(function(p){ p._dragged = moved > 6; setTimeout(function(){ p._dragged = false; }, 50); }); });
  })();

  /* ---------- custom cursor + magnetic ---------- */
  if (fine){
    var cur = $('.cursor');
    d.classList.add('has-cursor');
    $$('img').forEach(function(im){ im.draggable = false; });
    function moveBall(e){
      if (!e.clientX && !e.clientY) return; /* some drag events report 0,0 */
      cur.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      cur.classList.add('on');
    }
    document.addEventListener('mousemove', moveBall, { passive: true });
    /* while the browser drags a text selection, mousemove stops firing: follow the drag instead */
    document.addEventListener('dragover', moveBall, { passive: true });
    document.addEventListener('drag', moveBall, { passive: true });
    document.addEventListener('dragend', function(){ cur.classList.remove('down'); });
    document.addEventListener('mouseleave', function(){ cur.classList.remove('on'); });
    document.addEventListener('mousedown', function(){ cur.classList.add('down'); });
    document.addEventListener('mouseup', function(){ cur.classList.remove('down'); });
    /* the lightbox opens in the browser's top layer: move the ball inside it so it stays visible */
    lb.addEventListener('lb-open', function(){ cur.classList.remove('big', 'link'); lb.appendChild(cur); });
    function ballBack(){ if (cur.parentElement !== document.body) document.body.appendChild(cur); }
    lb.addEventListener('lb-close', ballBack);
    lb.addEventListener('close', ballBack);
    $$('[data-lb]').forEach(function(el){ el.addEventListener('mouseenter', function(){ cur.classList.add('big'); }); el.addEventListener('mouseleave', function(){ cur.classList.remove('big'); }); });
    $$('a, button:not([data-lb]), .ba').forEach(function(el){ el.addEventListener('mouseenter', function(){ cur.classList.add('link'); }); el.addEventListener('mouseleave', function(){ cur.classList.remove('link'); }); });
    $$('.lk, .menu-btn').forEach(function(el){
      el.addEventListener('mousemove', function(e){ var r = el.getBoundingClientRect(); el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2) + 'px)'; });
      el.addEventListener('mouseleave', function(){ el.style.transform = ''; });
    });
  }

  /* ================= SCROLL ANIMATIONS (GSAP) ================= */
  if (!hasG) return;
  var mm = G.matchMedia();

  /* agency horizontal pin (desktop) — created first so later triggers account for its spacing */
  mm.add('(min-width: 900px)', function(){
    var sec = $('.agency'), track = $('.ag-track'), bar = $('.ag-bar i');
    sec.classList.add('pinned');
    var dist = function(){ return Math.max(0, track.scrollWidth - innerWidth); };
    var skewTo = G.quickTo($$('.ag-track .poster'), 'skewX', { duration: 0.5, ease: 'power3' });
    var tw = G.to(track, { x: function(){ return -dist(); }, ease: 'none',
      scrollTrigger: { trigger: sec, pin: true, start: 'top top', end: function(){ return '+=' + dist(); }, scrub: 0.8, invalidateOnRefresh: true,
        onUpdate: function(self){ bar.style.transform = 'scaleX(' + self.progress + ')'; if (!reduce) skewTo(G.utils.clamp(-8, 8, self.getVelocity() / -300)); } } });
    $$('.ag-name h3, .ag-intro .st').forEach(function(h){
      G.from(h, { x: 40, opacity: 0, ease: 'none', scrollTrigger: { trigger: h, containerAnimation: tw, start: 'left 100%', end: 'left 70%', scrub: true } });
    });
    return function(){ sec.classList.remove('pinned'); G.set(track, { x: 0 }); };
  });

  /* manifesto word fill + pill images */
  var mp = $('[data-words]');
  var words = [];
  (function wrapWords(node){
    Array.prototype.slice.call(node.childNodes).forEach(function(t){
      if (t.nodeType === 1 && !t.classList.contains('pill')) { wrapWords(t); return; }
      if (t.nodeType !== 3) return;
      var frag = document.createDocumentFragment();
      t.textContent.split(/(\s+)/).forEach(function(w){
        if (!w) return;
        if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
        var s = document.createElement('span'); s.className = 'wd'; s.textContent = w; frag.appendChild(s); words.push(s);
      });
      node.replaceChild(frag, t);
    });
  })(mp);
  G.fromTo(words, { opacity: 0.14 }, { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: mp, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  $$('.pill', mp).forEach(function(p){ G.from(p, { width: 0, marginInline: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 75%' } }); });

  /* section titles: chars rise */
  $$('.st[data-split], .st [data-split]').forEach(function(h){
    G.from(split(h), { yPercent: 115, duration: 1.1, ease: 'expo.out', stagger: 0.03, scrollTrigger: { trigger: h, start: 'top 88%' } });
  });

  /* service cards: previous card recedes as the next one stacks on top */
  var cards = $$('.svc');
  cards.forEach(function(c, i){
    var next = cards[i + 1]; if (!next) return;
    G.fromTo(c, { scale: 1, filter: 'brightness(1)' }, { scale: 0.93, filter: 'brightness(0.6)', ease: 'none', scrollTrigger: { trigger: next, start: 'top 85%', end: 'top 25%', scrub: true } });
  });
  cards.forEach(function(c){
    var vis = $('.svc-vis', c);
    G.fromTo(vis, { clipPath: 'inset(100% 0% 0% 0%)', y: 60 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.2, ease: 'expo.out', clearProps: 'clipPath',
      scrollTrigger: { trigger: c, start: 'top 75%' } });
  });

  /* personal columns parallax (desktop) */
  mm.add('(min-width: 761px) and (prefers-reduced-motion: no-preference)', function(){
    $$('.col').forEach(function(col){
      var s = parseFloat(col.getAttribute('data-speed')) || 0;
      G.fromTo(col, { yPercent: -s / 2 }, { yPercent: s / 2, ease: 'none', scrollTrigger: { trigger: '.cols', start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });

  /* generic reveals */
  G.set('.rv', { y: 60, opacity: 0 });
  ST.batch('.rv', { start: 'top 92%', once: true, onEnter: function(els){ G.to(els, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.08, overwrite: true }); } });

  /* CTR counter + scale */
  var cnt = $('[data-count]');
  ST.create({ trigger: '.ctr', start: 'top 75%', once: true, onEnter: function(){
    var o = { v: 0 };
    G.to(o, { v: 10, duration: 1.8, ease: 'power3.out', onUpdate: function(){ cnt.textContent = (o.v >= 9.95 ? '+' : '') + Math.round(o.v); } });
    G.from('.scale > div', { scaleX: 0, duration: 1.1, ease: 'expo.out', stagger: 0.15, delay: 0.2 });
  } });

  /* skill bars */
  G.from('.sk-bar i', { scaleX: 0, duration: 1.4, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.skills', start: 'top 80%' } });

  /* contact marquee reacts to scroll */
  G.to('.big-wrap', { x: '-12%', ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* footer logo rise */
  G.from(split($('.foot-logo')), { yPercent: 100, duration: 1.2, ease: 'expo.out', stagger: 0.04, scrollTrigger: { trigger: '.foot', start: 'top 85%' } });

  window.addEventListener('load', function(){ ST.refresh(); });
})();
