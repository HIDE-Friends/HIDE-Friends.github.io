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

    // Refresh translations for new elements
    if (window.updateLanguage) {
      const currentLang = localStorage.getItem('lang') || 'en';
      window.updateLanguage(currentLang);
    }
  }

  populateSocialLinks();

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

    // Clone items for infinite effect
    const originalItems = Array.from(ticker.children);
    originalItems.forEach(item => {
      const clone = item.cloneNode(true);
      ticker.appendChild(clone);
    });
    originalItems.forEach(item => {
      const clone = item.cloneNode(true);
      ticker.prepend(clone);
    });

    let isDown = false;
    let startX;
    let scrollLeft;
    let autoScrollInterval;

    // Initial position in the middle
    const containerWidth = container.offsetWidth;
    const itemWidth = originalItems[0].offsetWidth + parseInt(getComputedStyle(ticker).gap);
    
    // Initial scroll to the middle clone, centered
    container.scrollLeft = (itemWidth * originalItems.length) - (containerWidth / 2) + (itemWidth / 2);

    function snapToItem() {
      const currentContainerWidth = container.offsetWidth;
      const scrollPos = container.scrollLeft;
      const index = Math.round((scrollPos + currentContainerWidth / 2 - itemWidth / 2) / itemWidth);
      
      container.scrollTo({
        left: (index * itemWidth) - (currentContainerWidth / 2) + (itemWidth / 2),
        behavior: 'smooth'
      });
    }

    function checkBoundary() {
      const totalWidth = itemWidth * originalItems.length;
      if (container.scrollLeft <= itemWidth) {
        container.scrollLeft += totalWidth;
      } else if (container.scrollLeft >= totalWidth * 2) {
        container.scrollLeft -= totalWidth;
      }
    }

    // Mouse drag support
    container.addEventListener('mousedown', (e) => {
      isDown = true;
      container.classList.add('dragging');
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      stopAutoScroll();
      container.style.scrollBehavior = 'auto';
    });

    container.addEventListener('mouseleave', () => {
      if (!isDown) return;
      isDown = false;
      container.classList.remove('dragging');
      container.style.scrollBehavior = 'smooth';
      snapToItem();
      startAutoScroll();
    });

    container.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      container.classList.remove('dragging');
      container.style.scrollBehavior = 'smooth';
      snapToItem();
      startAutoScroll();
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
      
      const totalWidth = itemWidth * originalItems.length;
      if (container.scrollLeft <= 0) {
        container.scrollLeft = totalWidth;
        scrollLeft = container.scrollLeft;
        startX = x;
      } else if (container.scrollLeft >= totalWidth * 2) {
        container.scrollLeft = totalWidth;
        scrollLeft = container.scrollLeft;
        startX = x;
      }
    });

    // Touch support
    container.addEventListener('touchstart', () => {
      stopAutoScroll();
      container.style.scrollBehavior = 'auto';
    }, { passive: true });

    let touchEndTimeout;
    container.addEventListener('touchend', () => {
      container.style.scrollBehavior = 'smooth';
      // Wait for native scroll to slow down before snapping
      clearTimeout(touchEndTimeout);
      touchEndTimeout = setTimeout(() => {
        checkBoundary();
        snapToItem();
        startAutoScroll();
      }, 150);
    }, { passive: true });

    // Handle the infinite jump
    container.addEventListener('scroll', () => {
      if (!isDown) {
        const totalWidth = itemWidth * originalItems.length;
        const currentContainerWidth = container.offsetWidth;
        const centerPos = (totalWidth) - (currentContainerWidth / 2) + (itemWidth / 2);

        if (container.scrollLeft <= 10) {
          container.style.scrollBehavior = 'auto';
          container.scrollLeft = centerPos + totalWidth;
          container.style.scrollBehavior = 'smooth';
        } else if (container.scrollLeft >= totalWidth * 2 + (totalWidth - currentContainerWidth)) {
          container.style.scrollBehavior = 'auto';
          container.scrollLeft = centerPos;
          container.style.scrollBehavior = 'smooth';
        }
      }
    }, { passive: true });

    // Auto-scroll logic
    function startAutoScroll() {
      stopAutoScroll();
      autoScrollInterval = setInterval(() => {
        if (isDown) return;
        container.scrollBy({ left: itemWidth, behavior: 'smooth' });
      }, 3000);
    }

    function stopAutoScroll() {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
      }
    }

    // Pause on hover
    container.addEventListener('mouseenter', stopAutoScroll);
    container.addEventListener('mouseleave', () => {
      if (!isDown) startAutoScroll();
    });

    startAutoScroll();
  }

  initCarousel('.features-ticker-container');
  initCarousel('.reviews-ticker-container');

  // FAQ Accordion
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const faqItem = button.parentElement;
      faqItem.classList.toggle('active');
      
      // Close other items
      document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== faqItem) {
          item.classList.remove('active');
        }
      });
    });
  });

  // Platform Detection for Download Button
  function updateDownloadLink() {
    const mainBtn = document.getElementById('mainDownloadBtn');
    if (!mainBtn) return;
    
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const androidUrl = "https://h-i-d-e.en.uptodown.com/android";
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

  // Stats Counter Animation
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
          if (nextValue > target) {
            stat.innerText = target.toLocaleString(undefined, {minimumFractionDigits: decimals}) + (target >= 100 ? '+' : '');
          } else {
            stat.innerText = nextValue.toLocaleString(undefined, {minimumFractionDigits: decimals}) + (target >= 100 ? '+' : '');
            setTimeout(updateCount, 20);
          }
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
    // Progress Bar
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    if (progressBar) progressBar.style.width = scrolled + "%";

    // Back to Top Button
    if (backToTop) {
      if (window.scrollY > 500) {
        backToTop.style.display = 'flex';
      } else {
        backToTop.style.display = 'none';
      }
    }

    // Stats Animation Trigger
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
      const sectionPos = statsSection.getBoundingClientRect().top;
      const screenPos = window.innerHeight / 1.3;
      if (sectionPos < screenPos && !started) {
        startCounters();
        started = true;
      }
    }

    // Scroll Reveal
    reveals.forEach(reveal => {
      const windowHeight = window.innerHeight;
      const revealTop = reveal.getBoundingClientRect().top;
      const revealPoint = 150;

      if (revealTop < windowHeight - revealPoint) {
        reveal.classList.add('active');
      }
    });
  });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Theme Toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    const themeIcon = themeToggle.querySelector('i');
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme, themeIcon);

    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme, themeIcon);
    });
  }

  function updateThemeIcon(theme, icon) {
    if (!icon) return;
    if (theme === 'dark') {
      icon.classList.replace('fa-moon', 'fa-sun');
    } else {
      icon.classList.replace('fa-sun', 'fa-moon');
    }
  }

  window.checkServerStatus = async function() {
    const statusText = document.getElementById('serverStatusText');
    if (!statusText) return;
    const pingUrl = 'https://prophunt.avegagames.com/ping';
    const lang = localStorage.getItem('lang') || 'en';
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // We need to check translations structure first
      const getTranslation = (key) => {
        const trans = window.translations[key];
        if (trans && typeof trans === 'object') {
          return trans[lang] || trans['en'];
        }
        return trans || key;
      };

      await fetch(pingUrl, { 
        mode: 'no-cors',
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      statusText.textContent = getTranslation('online');
      statusText.style.color = '#10b981';
      
      const statusItem = statusText.parentElement;
      const dot = statusItem.querySelector('.status-dot');
      if (dot) {
        dot.style.background = '#10b981';
        dot.style.boxShadow = '0 0 8px #10b981';
      }
    } catch (error) {
      const getTranslation = (key) => {
        const trans = window.translations[key];
        if (trans && typeof trans === 'object') {
          return trans[lang] || trans['en'];
        }
        return trans || key;
      };

      statusText.textContent = getTranslation('offline');
      statusText.style.color = '#ef4444';
      const statusItem = statusText.parentElement;
      const dot = statusItem.querySelector('.status-dot');
      if (dot) {
        dot.style.background = '#ef4444';
        dot.style.boxShadow = '0 0 8px #ef4444';
      }
    }
  };

  checkServerStatus();
  startAutoSlide();
});
