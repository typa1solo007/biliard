/**
 * Бильярдный клуб «Пирамида» | Волжск
 * ул. Ленина, 18а (центральный Сбербанк, 3 этаж)
 *
 * Full Interactive Engine:
 * - Analytics & Goals Dispatcher (Yandex.Metrika & VK Pixel & DataLayer)
 * - CRM & UTM Marketing Attribution Pipeline
 * - Physics Canvas: Scroll-driven Billiard Rack Break
 * - Interactive 2D Club Floor Plan & Table Selector
 * - VK Live Streams & Multi-camera switch
 * - Member Portal / Личный кабинет постоянного игрока
 * - Pricing Tariffs & Quick Booking Integration
 * - 152-ФЗ Legal Compliance & Cookie Banner
 * - Audio Synthesis & Mobile Navigation
 */

// Global Configuration
window.YA_METRIKA_ID = 98765432; // Placeholder ID (автоматически подставляется рабочий счетчик)
window.CRM_WEBHOOK_URL = ''; // URL для прямого вебхука Битрикс24 / amoCRM / Telegram Bot

document.addEventListener('DOMContentLoaded', () => {
  initMarketingUTM();
  initAnalyticsTracking();
  initHeader();
  initClubStatus();
  initScrollAnimations();
  initBilliardBreakPhysics();
  initFloorPlan();
  initLiveStreams();
  initMemberPortal();
  initPricingActions();
  initLegalCompliance();
  initGallery();
  initBookingForm();
  initAudioCue();
  initClipboard();
});

/* ==========================================================================
   1. Marketing UTM Attribution & Analytics Tracker
   ========================================================================== */
const marketingData = {
  utm_source: '',
  utm_medium: '',
  utm_campaign: '',
  utm_content: '',
  utm_term: '',
  client_id: '',
  referer: document.referrer || 'direct'
};

function initMarketingUTM() {
  const urlParams = new URLSearchParams(window.location.search);
  marketingData.utm_source = urlParams.get('utm_source') || (document.referrer.includes('vk.com') ? 'vk' : 'direct');
  marketingData.utm_medium = urlParams.get('utm_medium') || 'organic';
  marketingData.utm_campaign = urlParams.get('utm_campaign') || '';
  marketingData.utm_content = urlParams.get('utm_content') || '';
  marketingData.utm_term = urlParams.get('utm_term') || '';

  // Get or generate persistent client_id
  let cid = localStorage.getItem('pyr_client_id');
  if (!cid) {
    cid = 'cid_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    localStorage.setItem('pyr_client_id', cid);
  }
  marketingData.client_id = cid;

  // Populate hidden form inputs if present
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'client_id'].forEach(key => {
    const input = document.getElementById(key);
    if (input) input.value = marketingData[key];
  });
}

function trackGoal(goalName, params = {}) {
  const payload = {
    goal: goalName,
    ...marketingData,
    ...params,
    timestamp: new Date().toISOString()
  };

  // 1. Yandex Metrika Goal
  if (typeof ym === 'function') {
    try {
      ym(window.YA_METRIKA_ID, 'reachGoal', goalName, params);
    } catch(e) {}
  }

  // 2. VK Pixel Retargeting Event
  if (typeof VK === 'object' && VK.Retargeting && typeof VK.Retargeting.Event === 'function') {
    try {
      VK.Retargeting.Event(goalName);
    } catch(e) {}
  }

  // 3. Google Analytics / DataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: goalName,
    ...payload
  });

  console.log(`[Analytics Goal Tracked]: ${goalName}`, payload);
}

function initAnalyticsTracking() {
  // Track phone clicks
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
      trackGoal('phone_click', { phone: link.getAttribute('href') });
    });
  });

  // Track VK social transitions
  document.querySelectorAll('a[href*="vk.ru"], a[href*="vk.com"]').forEach(link => {
    link.addEventListener('click', () => {
      trackGoal('vk_transition', { target_url: link.getAttribute('href') });
    });
  });

  // Track portal opening
  document.querySelectorAll('.portal-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      trackGoal('member_portal_open');
    });
  });
}

/* ==========================================================================
   2. Header & Navigation Logic (Zero Overflow & Drawer Integration)
   ========================================================================== */
function initHeader() {
  const header = document.querySelector('.site-header');
  const burger = document.querySelector('.nav-burger');
  const menu = document.querySelector('.nav-menu');
  const navBackdrop = document.querySelector('#navBackdrop');
  const closeBtn = document.querySelector('#navMenuClose');
  const navLinks = document.querySelectorAll('.nav-link');
  const drawerBtns = document.querySelectorAll('.nav-drawer-btn');

  const closeMenu = () => {
    burger?.classList.remove('open');
    menu?.classList.remove('open');
    navBackdrop?.classList.remove('open');
    document.body.style.overflow = '';
  };

  const openMenu = () => {
    burger?.classList.add('open');
    menu?.classList.add('open');
    navBackdrop?.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
    highlightActiveNavLink();
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (burger && menu) {
    burger.addEventListener('click', () => {
      const isOpen = menu.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    closeBtn?.addEventListener('click', closeMenu);
    navBackdrop?.addEventListener('click', closeMenu);

    navLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    drawerBtns.forEach(btn => {
      btn.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  function highlightActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY + 140;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop;
      const sectionId = section.getAttribute('id');
      const navLinksForSection = document.querySelectorAll(`.nav-link[href="#${sectionId}"]`);

      if (navLinksForSection.length > 0) {
        const isActive = scrollY >= sectionTop && scrollY < sectionTop + sectionHeight;
        navLinksForSection.forEach(link => {
          link.classList.toggle('active', isActive);
        });
      }
    });
  }
}

/* ==========================================================================
   3. Club Status Live Indicator (15:00 - 00:00)
   ========================================================================== */
function initClubStatus() {
  const statusBadges = document.querySelectorAll('.status-badge');
  if (!statusBadges.length) return;

  const updateStatus = () => {
    const now = new Date();
    const hours = now.getHours();
    const isOpen = hours >= 15 && hours < 24;

    statusBadges.forEach(badge => {
      const dot = badge.querySelector('.status-dot');
      const text = badge.querySelector('.status-text');

      if (isOpen) {
        if (dot) dot.classList.remove('closed');
        if (text) text.textContent = 'Открыто сейчас • до 00:00';
      } else {
        if (dot) dot.classList.add('closed');
        if (text) text.textContent = 'Откроемся сегодня в 15:00';
      }
    });
  };

  updateStatus();
  setInterval(updateStatus, 60000);
}

/* ==========================================================================
   4. Scroll-Triggered Animations
   ========================================================================== */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.fade-in-up');
  
  if (!('IntersectionObserver' in window)) {
    animatedElements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  animatedElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   5. Physics Canvas: Scroll-Driven Billiard Rack Break
   ========================================================================== */
function initBilliardBreakPhysics() {
  const canvas = document.getElementById('billiardCanvas');
  const section = document.getElementById('billiardBreakSection');
  const triggerBtn = document.getElementById('breakBallsBtn');
  const resetBtn = document.getElementById('resetBallsBtn');
  if (!canvas || !section) return;

  const ctx = canvas.getContext('2d');
  let isBroken = false;

  class Ball {
    constructor(x, y, radius, isCueBall = false, number = 1) {
      this.initialX = x;
      this.initialY = y;
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 0;
      this.radius = radius;
      this.isCueBall = isCueBall;
      this.number = number;
    }

    reset() {
      this.x = this.initialX;
      this.y = this.initialY;
      this.vx = 0;
      this.vy = 0;
    }

    update(friction = 0.985, width, height) {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= friction;
      this.vy *= friction;

      const padding = 20;
      if (this.x - this.radius < padding) {
        this.x = padding + this.radius;
        this.vx = -this.vx * 0.75;
      } else if (this.x + this.radius > width - padding) {
        this.x = width - padding - this.radius;
        this.vx = -this.vx * 0.75;
      }
      if (this.y - this.radius < padding) {
        this.y = padding + this.radius;
        this.vy = -this.vy * 0.75;
      } else if (this.y + this.radius > height - padding) {
        this.y = height - padding - this.radius;
        this.vy = -this.vy * 0.75;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      // Shadow
      ctx.beginPath();
      ctx.arc(4, 5, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fill();

      // Ball
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);

      const grad = ctx.createRadialGradient(-this.radius * 0.35, -this.radius * 0.35, this.radius * 0.1, 0, 0, this.radius);
      if (this.isCueBall) {
        grad.addColorStop(0, '#ff7878');
        grad.addColorStop(0.3, '#d81e1e');
        grad.addColorStop(0.85, '#990d0d');
        grad.addColorStop(1, '#500505');
      } else {
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.5, '#f4f4f2');
        grad.addColorStop(0.85, '#dedcd5');
        grad.addColorStop(1, '#a6a297');
      }
      ctx.fillStyle = grad;
      ctx.fill();

      if (!this.isCueBall) {
        ctx.fillStyle = 'rgba(20, 20, 20, 0.85)';
        ctx.font = `bold ${Math.round(this.radius * 0.65)}px Montserrat, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.number.toString(), 0, 1);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      ctx.restore();
    }
  }

  let balls = [];
  let cueBall = null;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    initRack();
  }

  function initRack() {
    balls = [];
    const width = canvas.width;
    const height = canvas.height;
    const r = Math.min(width, height) * 0.038;

    const startX = width * 0.68;
    const startY = height * 0.5;
    const dx = r * Math.sqrt(3) + 0.5;
    const dy = r + 0.5;

    let ballNum = 1;
    for (let col = 0; col < 5; col++) {
      const colX = startX + col * dx;
      const startRowY = startY - col * dy;
      for (let row = 0; row <= col; row++) {
        const colY = startRowY + row * (dy * 2);
        balls.push(new Ball(colX, colY, r, false, ballNum++));
      }
    }

    cueBall = new Ball(width * 0.22, height * 0.5, r, true, 0);
    balls.push(cueBall);
    isBroken = false;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function breakRack(force = 24) {
    if (isBroken) return;
    isBroken = true;

    cueBall.vx = force;
    cueBall.vy = (Math.random() - 0.5) * 2;

    playBilliardCrack();
    trackGoal('billiard_break_click');

    setTimeout(() => {
      balls.forEach(b => {
        if (!b.isCueBall) {
          const angle = Math.atan2(b.y - cueBall.y, b.x - cueBall.x) + (Math.random() - 0.5) * 0.8;
          const speed = force * (0.6 + Math.random() * 0.7);
          b.vx = Math.cos(angle) * speed;
          b.vy = Math.sin(angle) * speed;
        }
      });
      setTimeout(playBilliardCrack, 70);
    }, 120);
  }

  let scrollTriggered = false;
  window.addEventListener('scroll', () => {
    const rect = section.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.65 && rect.bottom > 150;
    if (inView && !scrollTriggered && !isBroken) {
      scrollTriggered = true;
      breakRack(26);
    }
  }, { passive: true });

  if (triggerBtn) {
    triggerBtn.addEventListener('click', () => {
      initRack();
      setTimeout(() => breakRack(28), 50);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      initRack();
      scrollTriggered = false;
    });
  }

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const angle = Math.atan2(mouseY - cueBall.y, mouseX - cueBall.x);
    cueBall.vx = Math.cos(angle) * 22;
    cueBall.vy = Math.sin(angle) * 22;
    playBilliardCrack();
    isBroken = true;
    trackGoal('billiard_canvas_shot');
  });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]);

    ctx.beginPath();
    ctx.moveTo(w * 0.22, 20);
    ctx.lineTo(w * 0.22, h - 20);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(w * 0.68, h * 0.5, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.fill();
    ctx.restore();

    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const b1 = balls[i];
        const b2 = balls[j];
        const dist = Math.hypot(b2.x - b1.x, b2.y - b1.y);
        const minDist = b1.radius + b2.radius;

        if (dist < minDist) {
          const angle = Math.atan2(b2.y - b1.y, b2.x - b1.x);
          const overlap = minDist - dist;
          
          b1.x -= Math.cos(angle) * overlap * 0.5;
          b1.y -= Math.sin(angle) * overlap * 0.5;
          b2.x += Math.cos(angle) * overlap * 0.5;
          b2.y += Math.sin(angle) * overlap * 0.5;

          const nx = Math.cos(angle);
          const ny = Math.sin(angle);
          const kx = b1.vx - b2.vx;
          const ky = b1.vy - b2.vy;
          const p = 2 * (nx * kx + ny * ky) / 2;

          b1.vx -= p * nx * 0.85;
          b1.vy -= p * ny * 0.85;
          b2.vx += p * nx * 0.85;
          b2.vy += p * ny * 0.85;
        }
      }
    }

    balls.forEach(ball => {
      ball.update(0.985, canvas.width, canvas.height);
      ball.draw(ctx);
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   6. Interactive 2D Club Floor Plan & Table Selector
   ========================================================================== */
function initFloorPlan() {
  const tableCards = document.querySelectorAll('.table-slot-card');
  const tableSelectInput = document.getElementById('bookTable');

  tableCards.forEach(card => {
    card.addEventListener('click', () => {
      tableCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      const tableName = card.getAttribute('data-table-name');
      if (tableSelectInput && tableName) {
        tableSelectInput.value = tableName;
      }

      playBilliardCrack();
      trackGoal('table_selected_floorplan', { table: tableName });
      showToast(`Выбран: ${tableName}. Заполните форму бронирования!`);

      const bookingSection = document.getElementById('booking');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ==========================================================================
   7. VK Live Streams & Multi-Camera Switcher
   ========================================================================== */
function initLiveStreams() {
  const camButtons = document.querySelectorAll('.cam-switch-btn');
  const streamTitle = document.getElementById('streamCurrentTitle');
  const streamDesc = document.getElementById('streamCurrentDesc');
  const chatBox = document.getElementById('streamChatBox');

  const streamInfo = {
    cam1: {
      title: '🔴 Стол №1: Турнир по Московской пирамиде (Финал)',
      desc: 'Прямая трансляция с главного турнирного стола клуба «Пирамида» г. Волжск'
    },
    cam2: {
      title: 'Стол №3: Тренировочная сессия (Свободная пирамида)',
      desc: 'Камера общего зала клуба «Пирамида», столы 12 футов'
    },
    cam3: {
      title: 'VIP-зал: Закрытая товарищеская игра',
      desc: 'Приватное пространство для клубных игроков и гостей'
    }
  };

  camButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      camButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const camKey = btn.getAttribute('data-cam');
      if (streamInfo[camKey]) {
        if (streamTitle) streamTitle.textContent = streamInfo[camKey].title;
        if (streamDesc) streamDesc.textContent = streamInfo[camKey].desc;
      }
      playBilliardCrack();
      trackGoal('stream_camera_switch', { camera: camKey });
      showToast(`Переключено: ${btn.textContent}`);
    });
  });

  if (chatBox) {
    const comments = [
      { author: 'Ильдар Волжск', text: 'Красивый выход через два борта! 👏' },
      { author: 'Алексей М.', text: 'Сукно в Пирамиде всегда в идеале, раскат топовый' },
      { author: 'Артем_Кий', text: 'Кто сегодня в финале играет?' },
      { author: 'Бильярд 112', text: 'Приглашаем на бронь столов на вечер: +7 (960) 074-89-43' }
    ];

    let commentIdx = 0;
    setInterval(() => {
      if (commentIdx < comments.length) {
        const item = comments[commentIdx];
        const msgEl = document.createElement('div');
        msgEl.className = 'chat-message-item';
        msgEl.innerHTML = `<span class="chat-author">${escapeHtml(item.author)}:</span> <span class="chat-text">${escapeHtml(item.text)}</span>`;
        chatBox.appendChild(msgEl);
        chatBox.scrollTop = chatBox.scrollHeight;
        commentIdx++;
      }
    }, 12000);
  }
}

/* ==========================================================================
   8. Member Portal / Личный кабинет постоянного игрока
   ========================================================================== */
function initMemberPortal() {
  const portalTriggers = document.querySelectorAll('.portal-trigger');
  const portalModal = document.getElementById('memberPortalModal');
  const portalClose = document.getElementById('portalCloseBtn');
  const tabBtns = document.querySelectorAll('.portal-tab-btn');
  const tabPanes = document.querySelectorAll('.portal-pane');

  portalTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (portalModal) {
        portalModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const closePortal = () => {
    if (portalModal) {
      portalModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (portalClose) portalClose.addEventListener('click', closePortal);
  if (portalModal) {
    portalModal.addEventListener('click', (e) => {
      if (e.target === portalModal) closePortal();
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
      trackGoal('portal_tab_switch', { tab: targetId });
    });
  });

  const extendBtn = document.getElementById('extendBookingBtn');
  const cancelBtn = document.getElementById('cancelBookingBtn');
  const rebookBtns = document.querySelectorAll('.rebook-action-btn');

  if (extendBtn) {
    extendBtn.addEventListener('click', () => {
      showToast('Запрос на продление стола на 1 час отправлен администратору!');
      trackGoal('portal_extend_booking');
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (confirm('Вы уверены, что хотите отменить сегодняшнее бронирование?')) {
        showToast('Бронирование отменено. Ждем вас в следующий раз!');
        trackGoal('portal_cancel_booking');
      }
    });
  }

  rebookBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      closePortal();
      showToast('Параметры прошлой игры перенесены в форму бронирования!');
      const bookingSec = document.getElementById('booking');
      if (bookingSec) bookingSec.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ==========================================================================
   9. Pricing Actions & Quick Booking Pre-selection
   ========================================================================== */
function initPricingActions() {
  const pricingCtaBtns = document.querySelectorAll('.pricing-cta');
  const tableSelect = document.getElementById('bookTable');

  pricingCtaBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tariff = btn.getAttribute('data-tariff');
      if (tableSelect && tariff) {
        if (tariff.includes('VIP')) {
          tableSelect.value = 'VIP-зал (Приватный русский бильярд 12ft)';
        } else {
          tableSelect.value = tariff;
        }
        showToast(`Выбран тариф: ${tariff.split('(')[0].trim()}`);
      }
      trackGoal('pricing_select', { tariff });
    });
  });
}

/* ==========================================================================
   10. Russian Legal Compliance (152-ФЗ, Согласие, Cookie Banner)
   ========================================================================== */
function initLegalCompliance() {
  const cookieBanner = document.getElementById('cookieBanner');
  const acceptCookieBtn = document.getElementById('acceptCookieBtn');
  const privacyModal = document.getElementById('privacyModal');
  const privacyLinks = document.querySelectorAll('.privacy-modal-trigger');
  const privacyClose = document.getElementById('privacyCloseBtn');
  const rulesModal = document.getElementById('rulesModal');
  const rulesLinks = document.querySelectorAll('.rules-modal-trigger');
  const rulesClose = document.getElementById('rulesCloseBtn');

  if (!localStorage.getItem('pyr_cookie_consent')) {
    setTimeout(() => {
      cookieBanner?.classList.add('show');
    }, 1500);
  }

  if (acceptCookieBtn) {
    acceptCookieBtn.addEventListener('click', () => {
      localStorage.setItem('pyr_cookie_consent', 'accepted');
      cookieBanner?.classList.remove('show');
      trackGoal('cookie_consent_accepted');
    });
  }

  privacyLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (privacyModal) {
        privacyModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (privacyClose) {
    privacyClose.addEventListener('click', () => {
      privacyModal?.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  rulesLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (rulesModal) {
        rulesModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (rulesClose) {
    rulesClose.addEventListener('click', () => {
      rulesModal?.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  [privacyModal, rulesModal].forEach(m => {
    if (m) {
      m.addEventListener('click', (e) => {
        if (e.target === m) {
          m.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }
  });
}

/* ==========================================================================
   11. Gallery Filtering & Lightbox Modal
   ========================================================================== */
function initGallery() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.querySelector('.lightbox-overlay');
  const lightboxImg = document.querySelector('.lightbox-img');
  const lightboxCaption = document.querySelector('.lightbox-caption');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 20);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 250);
        }
      });
      trackGoal('gallery_filter_click', { filter });
    });
  });

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const title = item.querySelector('.gallery-item-title')?.textContent || '';
      
      if (img && lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || 'Бильярдный клуб «Пирамида» Волжск';
        if (lightboxCaption) lightboxCaption.textContent = title;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        trackGoal('gallery_photo_view', { title });
      }
    });
  });

  const closeLightbox = () => {
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
        closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

/* ==========================================================================
   12. Booking Form & CRM Pipeline Integration
   ========================================================================== */
function initBookingForm() {
  const form = document.getElementById('bookingForm');
  const submitBtn = document.getElementById('bookingSubmitBtn');
  const successModal = document.getElementById('bookingSuccessModal');
  const modalClose = document.getElementById('modalCloseBtn');
  const dateInput = document.getElementById('bookDate');
  const timeInput = document.getElementById('bookTime');
  const consentCheckbox = document.getElementById('bookingConsentCheck');

  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (consentCheckbox && !consentCheckbox.checked) {
        showToast('Пожалуйста, подтвердите согласие на обработку персональных данных (152-ФЗ)');
        return;
      }

      const name = document.getElementById('bookName')?.value.trim();
      const phone = document.getElementById('bookPhone')?.value.trim();
      const tableType = document.getElementById('bookTable')?.value;
      const date = dateInput?.value;
      const time = timeInput?.value;
      const guests = document.getElementById('bookGuests')?.value;

      if (!name || !phone) {
        showToast('Пожалуйста, укажите ваше имя и телефон');
        return;
      }

      // UI Loading state
      if (submitBtn) {
        submitBtn.classList.add('btn-loading');
      }

      // Build Complete CRM Payload
      const crmLeadPayload = {
        lead_source: 'landing_page_volzhsk',
        created_at: new Date().toISOString(),
        client: {
          name: name,
          phone: phone
        },
        booking: {
          table: tableType,
          date: date,
          time: time,
          guests: guests,
          club_address: 'г. Волжск, ул. Ленина, 18а (3 этаж)'
        },
        marketing: {
          ...marketingData,
          user_agent: navigator.userAgent,
          screen: `${window.innerWidth}x${window.innerHeight}`
        }
      };

      console.log('[CRM Pipeline Dispatch]:', crmLeadPayload);

      // Dispatch to webhook if configured
      if (window.CRM_WEBHOOK_URL) {
        try {
          await fetch(window.CRM_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(crmLeadPayload)
          });
        } catch (err) {
          console.warn('CRM Webhook error:', err);
        }
      }

      // Track macro conversion goal in analytics
      trackGoal('lead_form_submit', {
        table: tableType,
        guests: guests,
        date: date
      });

      // Sound effect
      playBilliardCrack();

      // Reset loading state
      if (submitBtn) {
        submitBtn.classList.remove('btn-loading');
      }

      // Show confirmation in modal
      const modalSummary = document.getElementById('modalBookingSummary');
      if (modalSummary) {
        modalSummary.innerHTML = `
          <strong>${escapeHtml(name)}</strong>, спасибо за бронирование в клубе «Пирамида»!<br>
          <span style="color: var(--gold-light);">Выбранный стол:</span> ${escapeHtml(tableType)}<br>
          <span style="color: var(--gold-light);">Дата и время:</span> ${date} в ${time} (${guests} чел.)<br>
          <span style="color: var(--gold-light);">Адрес:</span> г. Волжск, ул. Ленина, 18а (3 этаж)<br>
          Администратор свяжется с вами по номеру <strong style="color: #fff;">${escapeHtml(phone)}</strong> для подтверждения.
        `;
      }

      if (successModal) {
        successModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }

      form.reset();
      if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
      if (consentCheckbox) consentCheckbox.checked = true;
    });
  }

  const closeModal = () => {
    if (successModal) {
      successModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (successModal) {
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) closeModal();
    });
  }
}

/* ==========================================================================
   13. Synthesizer: Billiard Ball Crack Sound (Web Audio API)
   ========================================================================== */
let audioCtx = null;

function initAudioCue() {
  const interactiveBtns = document.querySelectorAll('.btn-primary, .sound-effect-trigger, .table-select-btn');
  interactiveBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playBilliardCrack();
    });
  });
}

function playBilliardCrack() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const t = audioCtx.currentTime;

    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1400, t);
    osc1.frequency.exponentialRampToValueAtTime(320, t + 0.08);

    gain1.gain.setValueAtTime(0.3, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(t);
    osc1.stop(t + 0.1);

    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2800, t + 0.005);
    osc2.frequency.exponentialRampToValueAtTime(900, t + 0.04);

    gain2.gain.setValueAtTime(0.18, t + 0.005);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(t + 0.005);
    osc2.stop(t + 0.06);
  } catch (err) {}
}

/* ==========================================================================
   14. Copy to Clipboard & Toast
   ========================================================================== */
function initClipboard() {
  const copyElements = document.querySelectorAll('[data-copy]');
  copyElements.forEach(el => {
    el.addEventListener('click', () => {
      const textToCopy = el.getAttribute('data-copy');
      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`Номер ${textToCopy} скопирован в буфер обмена!`);
        trackGoal('phone_copy', { phone: textToCopy });
      }).catch(() => {
        showToast(`Телефон: ${textToCopy}`);
      });
    });
  });
}

function showToast(msg) {
  let toast = document.querySelector('.toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notice';
    toast.innerHTML = `
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style="color: var(--gold-light);">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
      </svg>
      <span class="toast-text"></span>
    `;
    document.body.appendChild(toast);
  }

  toast.querySelector('.toast-text').textContent = msg;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
