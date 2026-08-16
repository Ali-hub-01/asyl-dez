/* ============================================================
   ASYL DEZ — «Арка защиты»
   canvas-споры · reveal · magnetic · tilt · counters · lead → WhatsApp
   ============================================================ */
(function () {
  'use strict';

  var PHONE = '77001107095';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ----------------------------------------------------------
     Хуки конверсий (Opus позже повесит сюда gtag)
     ---------------------------------------------------------- */
  function trackLeadSubmit(payload) {
    /* gtag('event', 'generate_lead', {...payload}) — добавится позже */
  }
  function trackContactClick(type, href) {
    /* gtag('event', 'contact_click', { type: type, link: href }) — добавится позже */
  }
  // делегированные клики по tel: / WhatsApp / Instagram
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-track]');
    if (a) trackContactClick(a.getAttribute('data-track'), a.href);
  });

  /* ----------------------------------------------------------
     WhatsApp-ссылки с готовым текстом (data-wa-text)
     ---------------------------------------------------------- */
  document.querySelectorAll('a[data-wa]').forEach(function (a) {
    var text = a.getAttribute('data-wa-text') ||
      'Здравствуйте! Хочу оставить заявку на санитарную обработку.';
    a.href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(text);
  });

  /* ----------------------------------------------------------
     Header: фон при скролле + скрытие вниз/показ вверх
     ---------------------------------------------------------- */
  var header = document.getElementById('header');
  var lastY = 0;
  function onScrollHeader() {
    var y = window.scrollY;
    header.classList.toggle('scrolled', y > 30);
    if (y > 480 && y > lastY + 6) header.classList.add('hidden');
    else if (y < lastY - 6 || y < 480) header.classList.remove('hidden');
    lastY = y;
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ----------------------------------------------------------
     Мобильное меню
     ---------------------------------------------------------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  function setMenu(open) {
    burger.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () {
    setMenu(!menu.classList.contains('open'));
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });

  /* ----------------------------------------------------------
     Reveal по скроллу
     ---------------------------------------------------------- */
  var rvEls = document.querySelectorAll('[data-rv]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rvEls.forEach(function (el) { io.observe(el); });
  } else {
    rvEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ----------------------------------------------------------
     Счётчики с easing
     ---------------------------------------------------------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var dur = 1600;
    var t0 = null;
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4); // easeOutQuart
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          animateCount(en.target);
          cio.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
  }

  /* ----------------------------------------------------------
     Активный пункт навигации
     ---------------------------------------------------------- */
  var navLinks = document.querySelectorAll('.nav a');
  var sections = [];
  navLinks.forEach(function (a) {
    var sec = document.querySelector(a.getAttribute('href'));
    if (sec) sections.push({ a: a, sec: sec });
  });
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.remove('active'); });
          var found = sections.find(function (s) { return s.sec === en.target; });
          if (found) found.a.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { nio.observe(s.sec); });
  }

  /* ----------------------------------------------------------
     Magnetic-кнопки (только точный указатель)
     ---------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      var raf = null;
      btn.addEventListener('mousemove', function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var r = btn.getBoundingClientRect();
          var dx = (e.clientX - r.left - r.width / 2) * 0.22;
          var dy = (e.clientY - r.top - r.height / 2) * 0.3;
          btn.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
          raf = null;
        });
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ----------------------------------------------------------
     Hover-tilt карточек услуг
     ---------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.tilt').forEach(function (card) {
      var raf = null;
      card.addEventListener('mousemove', function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform =
            'perspective(900px) rotateX(' + (-py * 5) + 'deg) rotateY(' + (px * 6) + 'deg) translateY(-4px)';
          raf = null;
        });
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ----------------------------------------------------------
     FAQ: плавное раскрытие <details>
     ---------------------------------------------------------- */
  document.querySelectorAll('.faq-item').forEach(function (d) {
    var summary = d.querySelector('summary');
    var body = d.querySelector('.faq-body');
    summary.addEventListener('click', function (e) {
      if (reduceMotion) return; // нативное поведение
      e.preventDefault();
      if (d.hasAttribute('open')) {
        body.style.height = body.scrollHeight + 'px';
        requestAnimationFrame(function () {
          body.style.transition = 'height .38s cubic-bezier(.22,1,.36,1)';
          body.style.height = '0px';
        });
        body.addEventListener('transitionend', function close() {
          d.removeAttribute('open');
          body.style.cssText = '';
          body.removeEventListener('transitionend', close);
        });
      } else {
        d.setAttribute('open', '');
        var h = body.scrollHeight;
        body.style.height = '0px';
        requestAnimationFrame(function () {
          body.style.transition = 'height .42s cubic-bezier(.22,1,.36,1)';
          body.style.height = h + 'px';
        });
        body.addEventListener('transitionend', function opened() {
          body.style.cssText = '';
          body.removeEventListener('transitionend', opened);
        });
      }
    });
  });

  /* ----------------------------------------------------------
     Форма заявки → WhatsApp
     ---------------------------------------------------------- */
  var form = document.getElementById('leadForm');
  var thanks = document.getElementById('leadThanks');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var ok = true;
      [form.name, form.phone].forEach(function (f) {
        var bad = !f.value.trim();
        f.classList.toggle('err', bad);
        if (bad) ok = false;
      });
      if (!ok) return;

      var msg =
        'Здравствуйте! Заявка с сайта Asyl Dez:\n' +
        '— Имя: ' + name + '\n' +
        '— Телефон: ' + phone + '\n' +
        '— Услуга: ' + form.service.value + '\n' +
        '— Город: ' + form.city.value + '\n' +
        '— Объект: ' + form.object.value +
        (form.message.value.trim() ? '\n— Комментарий: ' + form.message.value.trim() : '');

      trackLeadSubmit({
        service: form.service.value,
        city: form.city.value,
        object: form.object.value
      });

      window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg), '_blank');
      thanks.hidden = false;
      setTimeout(function () { thanks.hidden = true; form.reset(); }, 7000);
    });
    [form.name, form.phone].forEach(function (f) {
      f.addEventListener('input', function () { f.classList.remove('err'); });
    });
  }

  /* ----------------------------------------------------------
     CANVAS: споры-«пыльца» под куполом
     Дрейфующие частицы: серые «споры» сверху, зелёные «очищенные»
     в зоне купола; связи-молекулы между близкими; отклик на курсор.
     ---------------------------------------------------------- */
  var canvas = document.getElementById('spores');
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
    var parts = [];
    var mouse = { x: -9999, y: -9999 };
    var running = true;

    function resize() {
      var r = canvas.parentElement.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      spawn();
    }

    function spawn() {
      var n = Math.round(Math.min(Math.max(W * H / 16000, 34), 92));
      parts = [];
      for (var i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 1 + Math.random() * 2.4,
          vx: (Math.random() - 0.5) * 0.25,
          vy: -0.12 - Math.random() * 0.3,       // мягкий дрейф вверх, как пыльца
          ph: Math.random() * Math.PI * 2,        // фаза покачивания
          sway: 0.2 + Math.random() * 0.5,
          hue: Math.random()                      // 0..1 — зелёный ↔ бирюза
        });
      }
    }

    // зона купола: эллипс у нижней середины экрана
    function domeFactor(x, y) {
      var dx = (x - W / 2) / (W * 0.42);
      var dy = (y - H) / (H * 0.72);
      var d = dx * dx + dy * dy;
      return d < 1 ? 1 - d : 0; // 1 в центре купола → 0 на границе
    }

    function tick(t) {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      var i, p;
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        p.ph += 0.008;
        p.x += p.vx + Math.sin(p.ph) * p.sway * 0.3;
        p.y += p.vy;

        // отклик на курсор — мягкое отталкивание
        var mdx = p.x - mouse.x, mdy = p.y - mouse.y;
        var md = mdx * mdx + mdy * mdy;
        if (md < 16900) { // 130px
          var f = (130 - Math.sqrt(md)) / 130;
          p.x += (mdx / (Math.sqrt(md) + 0.01)) * f * 2.2;
          p.y += (mdy / (Math.sqrt(md) + 0.01)) * f * 2.2;
        }

        if (p.y < -12) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -12) p.x = W + 10;
        if (p.x > W + 12) p.x = -10;

        var df = domeFactor(p.x, p.y);
        var alpha = 0.25 + df * 0.55;
        // вне купола — приглушённо-серые «споры», внутри — живая зелень/бирюза
        var color = df > 0.08
          ? (p.hue > 0.5 ? '52,174,134' : '44,160,160')
          : '150,170,182';

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + df * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + color + ',' + alpha.toFixed(3) + ')';
        ctx.fill();

        // свечение крупных «очищенных» частиц
        if (df > 0.4 && p.r > 2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(52,174,134,' + (df * 0.05).toFixed(3) + ')';
          ctx.fill();
        }
      }

      // связи-«молекулы» между близкими частицами внутри купола
      ctx.lineWidth = 1;
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        if (domeFactor(p.x, p.y) < 0.1) continue;
        for (var j = i + 1; j < parts.length; j++) {
          var q = parts[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 8100) { // 90px
            var a = (1 - Math.sqrt(d2) / 90) * 0.14;
            ctx.strokeStyle = 'rgba(52,174,134,' + a.toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(tick);
    }

    if (finePointer) {
      canvas.parentElement.addEventListener('mousemove', function (e) {
        var r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
      });
      canvas.parentElement.addEventListener('mouseleave', function () {
        mouse.x = -9999; mouse.y = -9999;
      });
    }

    // пауза, когда hero не виден / вкладка скрыта
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var vis = entries[0].isIntersecting && !document.hidden;
        if (vis && !running) { running = true; requestAnimationFrame(tick); }
        else if (!vis) running = false;
      }, { threshold: 0 }).observe(canvas);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) running = false;
      else if (!running) { running = true; requestAnimationFrame(tick); }
    });

    var rT;
    window.addEventListener('resize', function () {
      clearTimeout(rT);
      rT = setTimeout(resize, 180);
    });
    resize();
    requestAnimationFrame(tick);
  }
})();

/* ---------- Спрей-проявление «Объекты» (canvas-аэрозоль, во всю ширину, blur) ---------- */
(function () {
  var wrap = document.querySelector('.objects');
  if (!wrap) return;
  var tiles = [].slice.call(wrap.querySelectorAll('li'));
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    tiles.forEach(function (t) { t.classList.add('sprayed-in'); }); return;
  }
  var fired = false;
  function run() {
    if (fired) return; fired = true;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cv = document.createElement('canvas'); cv.className = 'spray-canvas';
    wrap.appendChild(cv);
    var crect = cv.getBoundingClientRect();
    var CW = crect.width, CH = crect.height;           // во всю ширину экрана
    cv.width = CW * dpr; cv.height = CH * dpr;
    var ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    // центры плиток относительно canvas (надёжно, независимо от контейнера)
    var centers = tiles.map(function (t) {
      var r = t.getBoundingClientRect();
      return { el: t, cx: r.left + r.width / 2 - crect.left, done: false };
    });
    var COL = ['rgba(52,174,134,', 'rgba(46,158,110,', 'rgba(120,224,181,', 'rgba(44,160,160,', 'rgba(200,245,225,'];
    var parts = [], start = null, DUR = 2000;
    function nozzle(p) {
      return { x: -0.04 * CW + p * 1.08 * CW, y: CH * 0.34 + Math.sin(p * Math.PI) * CH * 0.30 };
    }
    function emit(nx, ny) {
      for (var i = 0; i < 80; i++) {                    // капель больше
        var ang = Math.random() * 6.2832, rad = Math.random() * Math.random() * 92; // облако крупнее, гуще к центру
        parts.push({ x: nx + Math.cos(ang) * rad + (Math.random()-.5)*10, y: ny + Math.sin(ang) * rad + (Math.random()-.5)*10,
          vx: (Math.random()-.5)*0.5, vy: Math.random()*0.45+0.15, r: 0.4 + Math.random()*1.3, // капли мельче
          a: 0.4 + Math.random()*0.4, life: 1, decay: 0.011 + Math.random()*0.018, c: COL[(Math.random()*COL.length)|0] });
      }
    }
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / DUR, 1), nz = nozzle(p);
      ctx.clearRect(0, 0, CW, CH);
      if (p < 1) {
        emit(nz.x, nz.y);
        var g = ctx.createRadialGradient(nz.x, nz.y, 0, nz.x, nz.y, 130);  // туман крупнее
        g.addColorStop(0, 'rgba(120,224,181,0.30)'); g.addColorStop(1, 'rgba(120,224,181,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(nz.x, nz.y, 130, 0, 7); ctx.fill();
      }
      for (var i = parts.length - 1; i >= 0; i--) {
        var q = parts[i]; q.x += q.vx; q.y += q.vy; q.vy += 0.012; q.life -= q.decay;
        if (q.life <= 0) { parts.splice(i, 1); continue; }
        ctx.fillStyle = q.c + (q.a * q.life).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 7); ctx.fill();
      }
      centers.forEach(function (c) { if (!c.done && nz.x >= c.cx - 26) { c.done = true; c.el.classList.add('sprayed-in'); } });
      if (p < 1 || parts.length) requestAnimationFrame(tick);
      else {
        tiles.forEach(function (t) { t.classList.add('sprayed-in'); });
        cv.style.transition = 'opacity .5s'; cv.style.opacity = '0';
        setTimeout(function () { cv.remove(); }, 600);
      }
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { run(); io.disconnect(); } });
    }, { threshold: 0.3 });
    io.observe(wrap);
  } else { run(); }
})();
