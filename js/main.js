document.addEventListener('DOMContentLoaded', () => {
  // Social Links Data
  const socialData = [
    { id: 'discord', icon: 'fab fa-discord', url: 'https://discord.gg/Gp9cfwhq', titleKey: 'discord' },
    { id: 'telegram', icon: 'fab fa-telegram', url: 'https://t.me/hidehelp', titleKey: 'telegram' },
    { id: 'vk', icon: 'fab fa-vk', url: 'https://vk.com/hideandseekgame', titleKey: 'vk' },
    { id: 'support', icon: 'fas fa-envelope', url: 'https://hide.freshdesk.com/support/home', titleKey: 'support' }
  ];

  // Populate Social Links
  function populateSocialLinks() {
    const floatingBar = document.getElementById('floatingSocialBar');
    const headerLinks = document.getElementById('headerSocialLinks');
    const footerLinks = document.querySelector('.footer-social-links');

    const activeSocials = socialData.filter(s => s.url && s.url !== '#');

    if (floatingBar) {
      floatingBar.innerHTML = activeSocials
        .map(s => `<a href="${s.url}" target="_blank" data-i18n-title="${s.titleKey}"><i class="${s.icon}"></i></a>`)
        .join('');
    }

    if (headerLinks) {
      headerLinks.innerHTML = activeSocials
        .map(s => `
          <a href="${s.url}" target="_blank" class="btn btn-${s.id}" data-i18n-title="${s.titleKey}">
            <i class="${s.icon}"></i>
          </a>
        `).join('');
    }

    if (footerLinks) {
      footerLinks.innerHTML = activeSocials
        .map(s => `<a href="${s.url}" target="_blank" class="social-icon" data-i18n-title="${s.titleKey}"><i class="${s.icon}"></i></a>`)
        .join('');
    }

    if (window.updateLanguage) {
      const currentLang = localStorage.getItem('lang') || 'en';
      window.updateLanguage(currentLang);
    }
  }

  populateSocialLinks();

  // System Theme Detection & Management
  function initTheme() {
    const theme = localStorage.getItem('theme');
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
  initTheme();

  // Header Scroll Animation
  const header = document.querySelector('header');
  let isScrolled = false;
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    if (!isScrolled && scrollY > 100) {
      isScrolled = true;
      header.classList.add('scrolled');
    } else if (isScrolled && scrollY < 40) {
      isScrolled = false;
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  const slides = document.getElementById('slides');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  let currentIndex = 0;
  const totalSlides = dots.length;
  let autoSlideInterval;

  function showSlide(index) {
    if (index >= totalSlides) index = 0;
    if (index < 0) index = totalSlides - 1;
    currentIndex = index;
    if (slides) slides.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function startAutoSlide() {
    autoSlideInterval = setInterval(() => showSlide(currentIndex + 1), 5000);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      showSlide(parseInt(dot.dataset.index));
      resetAutoSlide();
    });
  } );

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      showSlide(currentIndex - 1);
      resetAutoSlide();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      showSlide(currentIndex + 1);
      resetAutoSlide();
    });
  }

  startAutoSlide();

  // --- Infinite Carousel Logic ---
  function initCarousel(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const ticker = container.querySelector('.features-ticker, .reviews-ticker');
    if (!ticker) return;

    const originalItems = Array.from(ticker.children);
    // Клонируем элементы: [Clone Set 1] [Original Set] [Clone Set 2]
    originalItems.forEach(item => { ticker.appendChild(item.cloneNode(true)); });
    originalItems.forEach(item => { ticker.prepend(item.cloneNode(true)); });

    let isDown = false;
    let startX;
    let scrollLeft;
    let autoScrollInterval;
    let itemWidth;

    function updateMetrics() {
      const gap = parseInt(getComputedStyle(ticker).gap) || 0;
      itemWidth = originalItems[0].offsetWidth + gap;
    }

    updateMetrics();
    const totalWidth = itemWidth * originalItems.length;
    // Устанавливаем скролл в начало оригинального блока (посередине)
    container.scrollLeft = totalWidth;

    function checkBoundary() {
      if (isDown) return; // Не телепортируем во время перетаскивания
      
      const currentScroll = container.scrollLeft;
      
      // Если ушли слишком влево (в первый блок клонов)
      if (currentScroll <= 0) {
        container.style.scrollBehavior = 'auto';
        container.scrollLeft = totalWidth;
      } 
      // Если дошли до конца (в блок вторых клонов)
      else if (currentScroll >= totalWidth * 2) {
        container.style.scrollBehavior = 'auto';
        container.scrollLeft = totalWidth;
      }
    }

    container.addEventListener('scroll', () => {
      checkBoundary();
      resetAutoScroll();
    }, { passive: true });

    container.addEventListener('mousedown', (e) => {
      isDown = true;
      container.classList.add('dragging');
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      container.style.scrollBehavior = 'auto';
    });

    const handleDragEnd = () => {
      if (!isDown) return;
      isDown = false;
      container.classList.remove('dragging');
      container.style.scrollBehavior = 'smooth';
      resetAutoScroll();
    };

    container.addEventListener('mouseleave', handleDragEnd);
    container.addEventListener('mouseup', handleDragEnd);
    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    });

    container.addEventListener('touchstart', () => {
      isDown = true;
      container.style.scrollBehavior = 'auto';
    }, { passive: true });

    container.addEventListener('touchend', () => {
      isDown = false;
      container.style.scrollBehavior = 'smooth';
      resetAutoScroll();
    }, { passive: true });

    function startAutoScroll() {
      stopAutoScroll();
      autoScrollInterval = setInterval(() => {
        if (isDown) return;
        updateMetrics();
        const currentScroll = container.scrollLeft;
        const totalWidth = itemWidth * originalItems.length;

        // Если автопрокрутка дошла до конца второго блока клонов
        if (currentScroll >= totalWidth * 2 - container.offsetWidth) {
          container.style.scrollBehavior = 'auto';
          container.scrollLeft = totalWidth;
          // Даем один кадр на "тихий" прыжок
          requestAnimationFrame(() => {
            const targetScroll = totalWidth + itemWidth - (container.offsetWidth / 2) + (itemWidth / 2);
            container.scrollTo({ left: targetScroll, behavior: 'smooth' });
          });
          return;
        }

        const currentIndex = Math.round((currentScroll + container.offsetWidth / 2 - itemWidth / 2) / itemWidth);
        const targetScroll = ((currentIndex + 1) * itemWidth) - (container.offsetWidth / 2) + (itemWidth / 2);
        
        container.scrollTo({ left: targetScroll, behavior: 'smooth' });
      }, 3000);
    }

    function stopAutoScroll() {
      if (autoScrollInterval) clearInterval(autoScrollInterval);
    }

    function resetAutoScroll() {
      stopAutoScroll();
      clearTimeout(container._autoTimeout);
      container._autoTimeout = setTimeout(startAutoScroll, 3000);
    }

    container.addEventListener('mouseenter', stopAutoScroll);
    container.addEventListener('mouseleave', () => { if (!isDown) startAutoScroll(); });

    startAutoScroll();
  }

  initCarousel('.features-ticker-container');
  initCarousel('.reviews-ticker-container');

  // FAQ Accordion
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const faqItem = button.parentElement;
      faqItem.classList.toggle('active');
      document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== faqItem) item.classList.remove('active');
      });
    });
  });

  // Platform Detection
  function updateDownloadLink() {
    const mainBtn = document.getElementById('mainDownloadBtn');
    if (!mainBtn) return;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const androidUrl = "https://play.google.com/store/apps/details?id=com.hgames.propvshunter";
    const iosUrl = "https://apps.apple.com/us/app/h-i-d-e-hide-or-seek-online/id1436151665";
    
    if (/android/i.test(userAgent)) {
      mainBtn.href = androidUrl;
      const icon = mainBtn.querySelector('i');
      if (icon) icon.className = 'fab fa-android';
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      mainBtn.href = iosUrl;
      const icon = mainBtn.querySelector('i');
      if (icon) icon.className = 'fab fa-apple';
    } else {
      mainBtn.href = androidUrl;
      const icon = mainBtn.querySelector('i');
      if (icon) icon.className = 'fas fa-download';
    }
  }
  updateDownloadLink();

  // Stats Counter
  const statsElements = document.querySelectorAll('.stat-number[data-target]');
  let started = false;
  function startCounters() {
    statsElements.forEach(stat => {
      const updateCount = () => {
        const target = +stat.getAttribute('data-target');
        const decimals = +stat.getAttribute('data-decimals') || 0;
        const currentText = stat.innerText.replace(/[^\d.]/g, '');
        const count = currentText === '' ? 0 : parseFloat(currentText);
        const speed = 100;
        const inc = target / speed;
        if (count < target) {
          const nextValue = count + inc;
          stat.innerText = (nextValue > target ? target : nextValue).toLocaleString(undefined, {minimumFractionDigits: decimals}) + (target >= 100 ? '+' : '');
          if (nextValue < target) setTimeout(updateCount, 20);
        } else {
          stat.innerText = target.toLocaleString(undefined, {minimumFractionDigits: decimals}) + (target >= 100 ? '+' : '');
        }
      };
      updateCount();
    });
  }

  // Scroll Effects
  const backToTop = document.getElementById('backToTop');
  const progressBar = document.getElementById('progressBar');
  const reveals = document.querySelectorAll('.reveal');
  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (progressBar) progressBar.style.width = (winScroll / height) * 100 + "%";
    if (backToTop) backToTop.style.display = window.scrollY > 500 ? 'flex' : 'none';
    const statsSection = document.querySelector('.stats-section');
    if (statsSection && statsSection.getBoundingClientRect().top < window.innerHeight / 1.3 && !started) {
      startCounters();
      started = true;
    }
    reveals.forEach(reveal => {
      if (reveal.getBoundingClientRect().top < window.innerHeight - 150) reveal.classList.add('active');
    });
  }, { passive: true });

  if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Theme Toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    const themeIcon = themeToggle.querySelector('i');
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const updateIcon = (t) => {
      if (themeIcon) {
        if (t === 'dark') themeIcon.classList.replace('fa-moon', 'fa-sun');
        else themeIcon.classList.replace('fa-sun', 'fa-moon');
      }
    };
    updateIcon(savedTheme);
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateIcon(next);
    });
  }

  // Legal Modal
  const modal = document.getElementById('legalModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const closeBtn = document.querySelector('.close-modal');
  if (modal && closeBtn) {
    const openModal = async (page, title) => {
      modalTitle.textContent = title;
      modalBody.innerHTML = '<div class="modal-loading">Loading...</div>';
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      try {
        const response = await fetch(page);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const content = doc.querySelector('[data-custom-class="body"]') || doc.body;
        content.querySelectorAll('script, style, link, nav, footer, header').forEach(el => el.remove());
        modalBody.innerHTML = content.innerHTML;
        const emailLinks = modalBody.querySelectorAll('.email-lnk');
        emailLinks.forEach(link => {
          const u = link.getAttribute('data-u'), d = link.getAttribute('data-d');
          if (u && d) { link.href = `mailto:${u}@${d}`; link.textContent = `${u}@${d}`; }
        });
      } catch { modalBody.innerHTML = 'Error loading content.'; }
    };
    document.querySelectorAll('a[href="privacy-policy.html"], a[href="hide-terms-conditions.html"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(link.getAttribute('href'), link.textContent);
      });
    });
    closeBtn.addEventListener('click', () => { modal.classList.remove('active'); document.body.style.overflow = ''; });
    modal.addEventListener('click', (e) => { if (e.target === modal) closeBtn.click(); });
  }

  window.checkServerStatus = async function() {
    const statusText = document.getElementById('serverStatusText');
    if (!statusText) return;
    try {
      await fetch('https://prophunt.avegagames.com/ping', { mode: 'no-cors' });
      statusText.textContent = (window.translations && window.translations.online) ? (window.translations.online[localStorage.getItem('lang')] || window.translations.online.en) : 'Online';
      statusText.style.color = '#10b981';
      const dot = statusText.parentElement.querySelector('.status-dot');
      if (dot) { dot.style.background = '#10b981'; dot.style.boxShadow = '0 0 8px #10b981'; }
    } catch {
      statusText.textContent = (window.translations && window.translations.offline) ? (window.translations.offline[localStorage.getItem('lang')] || window.translations.offline.en) : 'Offline';
      statusText.style.color = '#ef4444';
      const dot = statusText.parentElement.querySelector('.status-dot');
      if (dot) { dot.style.background = '#ef4444'; dot.style.boxShadow = '0 0 8px #ef4444'; }
    }
  };
  checkServerStatus();
});