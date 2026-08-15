/* ============================================================
   ASYL — Санитарная служба · script.js
   Без внешних библиотек. Чистые обработчики (готово под gtag).
   ============================================================ */
(function () {
  'use strict';

  var WHATSAPP_NUMBER = '77001107095';
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: состояние при скролле ---------- */
  var header = document.getElementById('header');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    });
    // Закрывать меню по клику на ссылку
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Reveal-анимации (IntersectionObserver) ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Счётчики ---------- */
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      return;
    }
    var duration = 1600;
    var start = null;
    function tick(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var counterEls = document.querySelectorAll('.counter__value[data-count]');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counterEls.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counterEls.forEach(animateCounter);
  }

  /* ---------- FAQ: закрывать соседние ---------- */
  var faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item && other.open) other.open = false;
        });
      }
    });
  });

  /* ---------- Трекинг кликов tel / WhatsApp (позже: gtag) ---------- */
  document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
    link.addEventListener('click', function () {
      // Точка подключения конверсии: клик по телефону
      // gtag('event', 'conversion', { send_to: 'AW-XXXX/tel' });
    });
  });
  document.querySelectorAll('a[href*="wa.me"]').forEach(function (link) {
    link.addEventListener('click', function () {
      // Точка подключения конверсии: клик по WhatsApp
      // gtag('event', 'conversion', { send_to: 'AW-XXXX/whatsapp' });
    });
  });

  /* ---------- Форма заявки → WhatsApp ---------- */
  var leadForm = document.getElementById('leadForm');
  var formThanks = document.getElementById('formThanks');

  if (leadForm) {
    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = leadForm.querySelector('#f-name');
      var phone = leadForm.querySelector('#f-phone');
      var service = leadForm.querySelector('#f-service');
      var city = leadForm.querySelector('#f-city');
      var objectType = leadForm.querySelector('#f-object');
      var comment = leadForm.querySelector('#f-comment');

      // Простая валидация обязательных полей
      var valid = true;
      [name, phone, service, city].forEach(function (field) {
        if (!field.value || !field.value.trim()) {
          field.classList.add('is-error');
          valid = false;
        } else {
          field.classList.remove('is-error');
        }
      });
      if (!valid) {
        var firstError = leadForm.querySelector('.is-error');
        if (firstError) firstError.focus();
        return;
      }

      var lines = [
        'Здравствуйте! Заявка с сайта ASYL (asyl-dez.kz):',
        '',
        'Имя: ' + name.value.trim(),
        'Телефон: ' + phone.value.trim(),
        'Услуга: ' + service.value,
        'Город: ' + city.value
      ];
      if (objectType.value) lines.push('Тип объекта: ' + objectType.value);
      if (comment.value && comment.value.trim()) lines.push('Комментарий: ' + comment.value.trim());

      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));

      // Точка подключения конверсии: отправка формы
      // gtag('event', 'conversion', { send_to: 'AW-XXXX/lead_form' });

      window.open(url, '_blank', 'noopener');

      if (formThanks) formThanks.hidden = false;
      leadForm.reset();

      // Снять ошибки после reset
      leadForm.querySelectorAll('.is-error').forEach(function (field) {
        field.classList.remove('is-error');
      });
    });

    // Убирать подсветку ошибки при вводе
    leadForm.querySelectorAll('input, select').forEach(function (field) {
      field.addEventListener('input', function () {
        if (field.value && field.value.trim()) field.classList.remove('is-error');
      });
    });
  }
})();
