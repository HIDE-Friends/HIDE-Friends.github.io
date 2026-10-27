(function () {
  var KEY = 'cookieConsent';
  var METRIKA_ID = 106589450;

  var TEXT = {
    en: {
      message: 'We use cookies and analytics to understand how this site is used. You can accept or decline — the site works either way.',
      policy: 'Privacy Policy',
      accept: 'Accept',
      decline: 'Decline'
    },
    ru: {
      message: 'Мы используем cookies и аналитику, чтобы понимать, как используется сайт. Можно принять или отклонить — сайт работает в обоих случаях.',
      policy: 'Политика конфиденциальности',
      accept: 'Принять',
      decline: 'Отклонить'
    }
  };

  function getLang() {
    var saved = localStorage.getItem('lang');
    if (saved === 'ru' || saved === 'en') return saved;
    var nav = (navigator.language || navigator.userLanguage || 'en').split('-')[0];
    return nav === 'ru' ? 'ru' : 'en';
  }

  function loadMetrika() {
    if (window.ym && window.ym.a) return;

    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=' + METRIKA_ID, 'ym');

    ym(METRIKA_ID, 'init', {
      ssr: true,
      webvisor: true,
      clickmap: true,
      ecommerce: 'dataLayer',
      referrer: document.referrer,
      url: location.href,
      accurateTrackBounce: true,
      trackLinks: true
    });
  }

  function injectStyles() {
    if (document.getElementById('cookie-consent-styles')) return;

    var style = document.createElement('style');
    style.id = 'cookie-consent-styles';
    style.textContent = [
      '#cookie-consent{position:fixed;left:0;right:0;bottom:0;z-index:1500;padding:12px;display:flex;justify-content:center;pointer-events:none;}',
      '#cookie-consent .cc-inner{pointer-events:auto;width:100%;max-width:940px;background:var(--card-bg,#fff);color:var(--text-color,#2c2c54);border:1px solid var(--border-color,#e2e8f0);border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.15);padding:16px 18px;display:flex;gap:16px;align-items:center;justify-content:space-between;font-family:"Segoe UI",system-ui,sans-serif;font-size:14px;line-height:1.5;}',
      '#cookie-consent .cc-text{margin:0;}',
      '#cookie-consent .cc-link{color:#4a6cf7;text-decoration:none;font-weight:600;white-space:nowrap;}',
      '#cookie-consent .cc-link:hover{text-decoration:underline;}',
      '#cookie-consent .cc-actions{display:flex;gap:10px;flex-shrink:0;}',
      '#cookie-consent .cc-btn{border-radius:10px;padding:10px 18px;font:inherit;font-weight:700;cursor:pointer;transition:all .2s;}',
      '#cookie-consent .cc-accept{background:#4a6cf7;color:#fff;border:1px solid #4a6cf7;}',
      '#cookie-consent .cc-accept:hover{filter:brightness(1.08);}',
      '#cookie-consent .cc-decline{background:transparent;color:var(--text-color,#2c2c54);border:1px solid var(--border-color,#cbd5e0);}',
      '#cookie-consent .cc-decline:hover{border-color:#4a6cf7;color:#4a6cf7;}',
      '@media (max-width:600px){#cookie-consent .cc-inner{flex-direction:column;align-items:stretch;}#cookie-consent .cc-actions{justify-content:flex-end;}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function removeBanner() {
    var banner = document.getElementById('cookie-consent');
    if (banner) banner.remove();
  }

  function showBanner() {
    var t = TEXT[getLang()];
    injectStyles();

    var banner = document.createElement('div');
    banner.id = 'cookie-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', t.message);
    banner.innerHTML =
      '<div class="cc-inner">' +
        '<p class="cc-text">' + t.message + ' <a class="cc-link" href="privacy-policy.html">' + t.policy + '</a></p>' +
        '<div class="cc-actions">' +
          '<button type="button" class="cc-btn cc-decline">' + t.decline + '</button>' +
          '<button type="button" class="cc-btn cc-accept">' + t.accept + '</button>' +
        '</div>' +
      '</div>';

    banner.querySelector('.cc-accept').addEventListener('click', function () {
      localStorage.setItem(KEY, 'accepted');
      removeBanner();
      loadMetrika();
    });

    banner.querySelector('.cc-decline').addEventListener('click', function () {
      localStorage.setItem(KEY, 'declined');
      removeBanner();
    });

    document.body.appendChild(banner);
  }

  function init() {
    if (localStorage.getItem(KEY) === 'accepted') {
      loadMetrika();
      return;
    }
    if (localStorage.getItem(KEY) !== 'declined') showBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
