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
    let isScrolling = false;
    let isAnimating = false;
    let lastScrollPos = 0;
    let scrollVelocity = 0;
    let velocityTimeout;
    let startX;
    let scrollLeft;
    let autoScrollInterval;
    let itemWidth;

    function updateMetrics() {
      const gap = parseInt(getComputedStyle(ticker).gap) || 0;
      itemWidth = originalItems[0].offsetWidth + gap;
    }

    // Initial metrics and position
    updateMetrics();
    const containerWidth = container.offsetWidth;
    
    // Initial scroll to the middle clone, centered
    container.scrollLeft = (itemWidth * originalItems.length) - (containerWidth / 2) + (itemWidth / 2);

    function snapToItem() {
      // Don't snap if we are dragging or if there's significant inertia still happening
      if (isDown || isScrolling || Math.abs(scrollVelocity) > 2) return;
      
      updateMetrics();
      const currentContainerWidth = container.offsetWidth;
      const scrollPos = container.scrollLeft;
      const index = Math.round((scrollPos + currentContainerWidth / 2 - itemWidth / 2) / itemWidth);
      const targetLeft = (index * itemWidth) - (currentContainerWidth / 2) + (itemWidth / 2);
      
      const startLeft = container.scrollLeft;
      const distance = targetLeft - startLeft;
      if (Math.abs(distance) < 1) return;

      const duration = 600; 
      const startTime = performance.now();
      isAnimating = true;

      function animate(currentTime) {
        if (isDown || isScrolling) {
          isAnimating = false;
          return;
        }
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easing = 1 - Math.pow(1 - progress, 3);
        
        container.scrollLeft = startLeft + distance * easing;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          isAnimating = false;
          checkBoundary();
        }
      }

      container.style.scrollBehavior = 'auto';
      requestAnimationFrame(animate);
    }

    function checkBoundary() {
      // Only jump when not animating and not dragging
      if (isDown || isAnimating) return; 
      
      updateMetrics();
      const totalWidth = itemWidth * originalItems.length;
      const currentScroll = container.scrollLeft;
      
      // Use a wider margin for boundary check to avoid jumps during inertia
      if (currentScroll <= itemWidth * 0.5) {
        container.style.scrollBehavior = 'auto';
        container.scrollLeft = currentScroll + totalWidth;
      } else if (currentScroll >= totalWidth * 2.5) {
        container.style.scrollBehavior = 'auto';
        container.scrollLeft = currentScroll - totalWidth;
      }
    }

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateMetrics();
        snapToItem();
      }, 100);
    });

    // Mouse drag support
    container.addEventListener('mousedown', (e) => {
      isDown = true;
      isScrolling = true;
      isAnimating = false; // Stop any snapping animation
      stopAutoScroll();
      container.classList.add('dragging');
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      container.style.scrollBehavior = 'auto';
    });

    container.addEventListener('mouseleave', () => {
      if (!isDown) return;
      isDown = false;
      isScrolling = false;
      container.classList.remove('dragging');
      snapToItem();
      resetAutoScroll();
    });

    container.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      isScrolling = false;
      container.classList.remove('dragging');
      snapToItem();
      resetAutoScroll();
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    });

    // Touch support
    container.addEventListener('touchstart', () => {
      isScrolling = true;
      isAnimating = false; // Stop any snapping animation
      stopAutoScroll();
      container.style.scrollBehavior = 'auto';
    }, { passive: true });

    let touchEndTimeout;
    container.addEventListener('touchend', () => {
      isScrolling = false;
      // On touch end, we don't snap immediately because of inertia
      // snapToItem will be called when velocity drops
      resetAutoScroll();
    }, { passive: true });

    // Wheel support
    container.addEventListener('wheel', () => {
      isScrolling = true;
      isAnimating = false;
      resetAutoScroll();
      clearTimeout(container._wheelTimeout);
      container._wheelTimeout = setTimeout(() => { 
        isScrolling = false; 
        snapToItem();
      }, 200);
    }, { passive: true });

    // Monitor scroll velocity and handle boundary
    container.addEventListener('scroll', () => {
      resetAutoScroll();
      
      const currentPos = container.scrollLeft;
      scrollVelocity = currentPos - lastScrollPos;
      lastScrollPos = currentPos;

      // Only check boundary if not actively animating
      if (!isAnimating) {
        checkBoundary();
      }

      // If user stopped scrolling (including inertia), snap to item
      if (!isDown && !isAnimating) {
        clearTimeout(velocityTimeout);
        velocityTimeout = setTimeout(() => {
          if (Math.abs(scrollVelocity) < 0.1) {
            scrollVelocity = 0;
            snapToItem();
          }
        }, 100);
      }
    }, { passive: true });

    // Auto-scroll logic
    let autoScrollRestartTimeout;
    function startAutoScroll() {
      stopAutoScroll();
      autoScrollInterval = setInterval(() => {
        if (isDown || isScrolling || isAnimating) return; // Completely skip if anything else is happening
        updateMetrics();
        
        const startLeft = container.scrollLeft;
        const duration = 800; 
        const startTime = performance.now();
        isAnimating = true;

        function animateAuto(currentTime) {
          if (isDown || isScrolling) {
            isAnimating = false;
            return;
          }
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easing = 1 - Math.pow(1 - progress, 3);
          
          container.scrollLeft = startLeft + (itemWidth * easing);
          
          if (progress < 1) {
            requestAnimationFrame(animateAuto);
          } else {
            isAnimating = false;
            checkBoundary();
          }
        }

        container.style.scrollBehavior = 'auto';
        requestAnimationFrame(animateAuto);
      }, 3000);
    }

    function stopAutoScroll() {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
      }
      if (autoScrollRestartTimeout) {
        clearTimeout(autoScrollRestartTimeout);
        autoScrollRestartTimeout = null;
      }
    }

    function resetAutoScroll() {
      stopAutoScroll();
      autoScrollRestartTimeout = setTimeout(startAutoScroll, 3000);
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

  // Email Deobfuscation
  function initEmailDeobfuscation(container = document) {
    const emailLinks = container.querySelectorAll('.email-lnk');
    emailLinks.forEach(link => {
      const u = link.getAttribute('data-u');
      const d = link.getAttribute('data-d');
      if (u && d) {
        const email = u + '@' + d;
        link.href = 'mailto:' + email;
        link.textContent = email;
      }
    });
  }

  // Initial call
  initEmailDeobfuscation();

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
  
  // Legal Modal Logic
  const modal = document.getElementById('legalModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const closeBtn = document.querySelector('.close-modal');
  const legalLinks = document.querySelectorAll('a[href="privacy-policy.html"], a[href="hide-terms-conditions.html"]');

  // Handle URL parameters for automatic modal opening
  function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const modalPage = urlParams.get('modal');
    if (modalPage) {
      const allowedPages = ['privacy-policy.html', 'hide-terms-conditions.html'];
      if (allowedPages.includes(modalPage)) {
        const title = modalPage === 'privacy-policy.html' ? 'Privacy Policy' : 'Terms & Conditions';
        openModal(modalPage, title);
        // Clean up URL without reloading
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }

  async function openModal(url, title) {
    if (!modal || !modalBody) return;
    
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
    modalTitle.textContent = title;
    modalBody.innerHTML = '<div class="modal-loader"><div class="loader-spinner"></div></div>';

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load content');
      const html = await response.text();
      
      // Parse the HTML to get only the content we need (e.g., from <body> or a specific div)
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Try to find the main content div or fall back to body
      const content = doc.querySelector('[data-custom-class="body"]') || doc.body;
      
      // Remove scripts and unnecessary elements from loaded content
      const scripts = content.querySelectorAll('script, noscript, header, footer, #backToTop, .Yandex.Metrika');
      scripts.forEach(s => s.remove());

      // Remove some style attributes that might break layout
      const elementsWithStyle = content.querySelectorAll('[style]');
      elementsWithStyle.forEach(el => {
        if (el.style.backgroundColor === 'white' || el.style.background === 'white') {
          el.style.background = 'transparent';
          el.style.backgroundColor = 'transparent';
        }
      });

      modalBody.innerHTML = content.innerHTML;
      initEmailDeobfuscation(modalBody);
    } catch (error) {
      modalBody.innerHTML = `<p style="text-align: center; color: #ef4444;">${error.message}</p>`;
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add('closing');
    
    // Wait for animation to finish (0.3s matches CSS)
    setTimeout(() => {
      modal.style.display = 'none';
      modal.classList.remove('closing');
      document.body.classList.remove('modal-open');
    }, 300);
  }

  legalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const url = link.getAttribute('href');
      const title = link.textContent;
      openModal(url, title);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  checkUrlParams();

  startAutoSlide();
});
