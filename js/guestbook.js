/**
 * ==========================================================================
 * ROYAL WEDDING INVITATION - 3D LUXURY BLESSING CAROUSEL & GUESTBOOK
 * Supabase integration, 3D stacked deck presentation, touch gestures & autoplay
 * ==========================================================================
 */

class WeddingGuestbook {
  constructor() {
    this.form = document.getElementById('wishesForm');
    this.listContainer = document.getElementById('wishesList');
    this.wishes = [];
    this.deckItems = [];
    this.activeIndex = 0;
    this.isSubmitting = false;

    // Autoplay & Interaction state
    this.autoplayInterval = null;
    this.resumeTimeout = null;
    this.isPaused = false;
    this.isDragging = false;
    this.isSwipingHorizontal = null;
    this.startX = 0;
    this.startY = 0;
    this.currentDeltaX = 0;
    this.cardWidth = 340;

    // DOM references
    this.viewport = null;
    this.cardElements = [];
    this.dotElements = [];
  }

  async init() {
    if (!this.listContainer) return;

    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Fetch wishes on initial load
    await this.fetchWishes();

    // Pause autoplay when document is not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopAutoplay();
      } else {
        this.startAutoplay();
      }
    });

    // Window resize handler to adapt card width calculation
    window.addEventListener('resize', () => {
      this.cardWidth = window.innerWidth <= 640 ? Math.min(320, window.innerWidth - 44) : 340;
    });
  }

  getSupabaseClient() {
    return window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  }

  async fetchWishes() {
    const client = this.getSupabaseClient();

    if (!client) {
      console.warn('Supabase client is not initialized. Using initial config wishes.');
      const initialWishes = window.WEDDING_CONFIG ? (window.WEDDING_CONFIG.initialWishes || []) : [];
      this.wishes = initialWishes;
      this.render();
      return;
    }

    try {
      const { data, error } = await client
        .from('wedding_wishes')
        .select('id, name, message, order, created_at, is_deleted')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching wedding wishes from Supabase:', error);
        const fallback = window.WEDDING_CONFIG ? (window.WEDDING_CONFIG.initialWishes || []) : [];
        this.wishes = fallback;
        this.render();
        return;
      }

      const allWishes = Array.isArray(data) ? data : [];
      this.wishes = allWishes.filter((w) => w.is_deleted !== 1);
      this.render();
    } catch (err) {
      console.error('Unexpected error while fetching wishes:', err);
      const fallback = window.WEDDING_CONFIG ? (window.WEDDING_CONFIG.initialWishes || []) : [];
      this.wishes = fallback;
      this.render();
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    if (this.isSubmitting) return;

    const nameInput = document.getElementById('wishName');
    const messageInput = document.getElementById('wishMessage');

    const name = nameInput ? nameInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';

    if (!name || !message) {
      if (window.showToast) window.showToast('Please enter your name and heartfelt wish! ✨');
      return;
    }

    const client = this.getSupabaseClient();

    if (!client) {
      console.error('Supabase client is not initialized. Cannot submit wish.');
      if (window.showToast) {
        window.showToast('Unable to submit wish. Supabase credentials are not configured yet.');
      }
      return;
    }

    const maxOrder = this.wishes.reduce((max, w) => {
      const orderVal = typeof w.order === 'number' ? w.order : parseInt(w.order, 10);
      return !isNaN(orderVal) ? Math.max(max, orderVal) : max;
    }, 0);
    const nextOrder = maxOrder + 1;

    this.isSubmitting = true;
    const submitBtn = this.form ? this.form.querySelector('button[type="submit"]') : null;
    if (submitBtn) {
      submitBtn.disabled = true;
    }

    try {
      const { error } = await client
        .from('wedding_wishes')
        .insert([
          {
            name: name,
            message: message,
            order: nextOrder
          }
        ]);

      if (error) {
        console.error('Error inserting wish into Supabase:', error);
        if (window.showToast) {
          window.showToast('Failed to send wish. Please try again later.');
        }
        return;
      }

      if (this.form) this.form.reset();

      if (window.showToast) {
        window.showToast('💖 Thank you! Your warm blessing has been recorded.');
      }

      // Refresh wishes and place newly added wish into active focus
      this.activeIndex = 0;
      await this.fetchWishes();
    } catch (err) {
      console.error('Unexpected error while inserting wish:', err);
      if (window.showToast) {
        window.showToast('An unexpected error occurred. Please try again.');
      }
    } finally {
      this.isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
      }
    }
  }

  formatWishDate(wish) {
    const rawDate = wish.created_at || wish.date;
    if (!rawDate) return 'Recently';

    const dateObj = new Date(rawDate);
    if (isNaN(dateObj.getTime())) {
      return String(rawDate);
    }

    try {
      const datePart = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const timePart = dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return `${datePart} • ${timePart}`;
    } catch (e) {
      return dateObj.toLocaleString();
    }
  }

  render() {
    if (!this.listContainer) return;
    this.stopAutoplay();

    this.cardWidth = window.innerWidth <= 640 ? Math.min(280, window.innerWidth - 44) : 310;
    this.listContainer.innerHTML = '';

    const count = this.wishes.length;

    // Case 0: Empty state
    if (count === 0) {
      this.renderEmptyState();
      return;
    }

    // Build virtual deck
    // If exactly 2 wishes, duplicate to 4 items [w0, w1, w0, w1] so the left, center, right 3D stack stays complete
    if (count === 2) {
      this.deckItems = [
        { ...this.wishes[0], originalIndex: 0 },
        { ...this.wishes[1], originalIndex: 1 },
        { ...this.wishes[0], originalIndex: 0 },
        { ...this.wishes[1], originalIndex: 1 }
      ];
    } else {
      this.deckItems = this.wishes.map((w, idx) => ({ ...w, originalIndex: idx }));
    }

    // Ensure activeIndex is valid
    if (this.activeIndex >= this.deckItems.length) {
      this.activeIndex = 0;
    }

    // Viewport
    this.viewport = document.createElement('div');
    this.viewport.className = 'wishes-carousel-viewport';
    this.viewport.setAttribute('tabindex', '0');
    this.viewport.setAttribute('role', 'region');
    this.viewport.setAttribute('aria-roledescription', 'carousel');
    this.viewport.setAttribute('aria-label', 'Wedding Wishes & Prayers Carousel');

    this.cardElements = [];

    // Render individual cards
    this.deckItems.forEach((wish, idx) => {
      const card = this.createCardElement(wish, idx);
      this.viewport.appendChild(card);
      this.cardElements.push(card);
    });

    // Navigation buttons (for desktop / accessible keyboard users)
    if (count > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.className = 'blessing-nav-btn blessing-nav-prev';
      prevBtn.setAttribute('aria-label', 'Previous blessing');
      prevBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      `;
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.prev();
        this.pauseAutoplayTemporarily(4000);
      });

      const nextBtn = document.createElement('button');
      nextBtn.className = 'blessing-nav-btn blessing-nav-next';
      nextBtn.setAttribute('aria-label', 'Next blessing');
      nextBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      `;
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.next();
        this.pauseAutoplayTemporarily(4000);
      });

      this.viewport.appendChild(prevBtn);
      this.viewport.appendChild(nextBtn);
    }

    this.listContainer.appendChild(this.viewport);

    // Minimal pagination indicator
    if (count > 1) {
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'blessing-carousel-dots';
      dotsContainer.setAttribute('role', 'tablist');
      dotsContainer.setAttribute('aria-label', 'Wishes pagination');

      this.dotElements = [];
      const numDots = count;

      for (let i = 0; i < numDots; i++) {
        const dot = document.createElement('button');
        dot.className = `blessing-carousel-dot ${i === this.getActiveOriginalIndex() ? 'active' : ''}`;
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to blessing ${i + 1} of ${count}`);
        dot.setAttribute('aria-selected', i === this.getActiveOriginalIndex() ? 'true' : 'false');
        dot.addEventListener('click', () => {
          this.goToOriginalIndex(i);
          this.pauseAutoplayTemporarily(4000);
        });
        dotsContainer.appendChild(dot);
        this.dotElements.push(dot);
      }

      this.listContainer.appendChild(dotsContainer);
    }

    // Set initial card states
    this.updateCardPositions();

    // Attach gestures & listeners
    if (count > 1) {
      this.attachGestureListeners();
      this.startAutoplay();
    }
  }

  getActiveOriginalIndex() {
    if (!this.deckItems[this.activeIndex]) return 0;
    return this.deckItems[this.activeIndex].originalIndex ?? (this.activeIndex % this.wishes.length);
  }

  goToOriginalIndex(targetOriginalIndex) {
    const foundIdx = this.deckItems.findIndex(item => item.originalIndex === targetOriginalIndex);
    if (foundIdx !== -1) {
      this.activeIndex = foundIdx;
      this.updateCardPositions();
    }
  }

  createCardElement(wish, idx) {
    const card = document.createElement('div');
    card.className = 'blessing-card';
    card.setAttribute('role', 'group');
    card.setAttribute('aria-roledescription', 'slide');
    card.setAttribute('aria-label', `Blessing from ${wish.name || 'Well-wisher'}`);

    const name = wish.name ? wish.name.trim() : 'Well-Wisher';
    const initial = name.charAt(0).toUpperCase() || 'M';
    const formattedDate = this.formatWishDate(wish);
    const message = wish.message ? wish.message.trim() : '';
    const isGoldAvatar = idx % 2 !== 0;

    card.innerHTML = `
      <!-- SVG Frame with Scalloped Concave Corners & Medallion Crests -->
      <svg class="blessing-card-frame" viewBox="0 0 310 340" fill="none" preserveAspectRatio="none" aria-hidden="true">
        <!-- Inset Border Lines -->
        <path d="M 38 12 H 125 M 185 12 H 272" stroke="#C99A2C" stroke-width="1.2" stroke-opacity="0.65"/>
        <path d="M 38 328 H 125 M 185 328 H 272" stroke="#C99A2C" stroke-width="1.2" stroke-opacity="0.65"/>
        <path d="M 12 38 V 302" stroke="#C99A2C" stroke-width="1.2" stroke-opacity="0.65"/>
        <path d="M 298 38 V 302" stroke="#C99A2C" stroke-width="1.2" stroke-opacity="0.65"/>
        
        <!-- Concave Scalloped Corners (Indented) -->
        <path d="M 12 38 A 14 14 0 0 1 38 12" stroke="#C99A2C" stroke-width="1.2" stroke-opacity="0.65"/>
        <path d="M 272 12 A 14 14 0 0 1 298 38" stroke="#C99A2C" stroke-width="1.2" stroke-opacity="0.65"/>
        <path d="M 12 302 A 14 14 0 0 0 38 328" stroke="#C99A2C" stroke-width="1.2" stroke-opacity="0.65"/>
        <path d="M 272 328 A 14 14 0 0 0 298 302" stroke="#C99A2C" stroke-width="1.2" stroke-opacity="0.65"/>

        <!-- Corner Accent Dots -->
        <circle cx="22" cy="22" r="1.8" fill="#C99A2C" opacity="0.65"/>
        <circle cx="288" cy="22" r="1.8" fill="#C99A2C" opacity="0.65"/>
        <circle cx="22" cy="318" r="1.8" fill="#C99A2C" opacity="0.65"/>
        <circle cx="288" cy="318" r="1.8" fill="#C99A2C" opacity="0.65"/>

        <!-- Top Medallion Crest with Fine Arabesque Detail -->
        <g transform="translate(155, 12)">
          <path d="M 0 -11 L 11 0 L 0 11 L -11 0 Z" fill="#FFFDF9" stroke="#C99A2C" stroke-width="1.3"/>
          <path d="M 0 -6 L 6 0 L 0 6 L -6 0 Z" fill="none" stroke="#C99A2C" stroke-width="0.8" opacity="0.75"/>
          <circle cx="0" cy="0" r="1.5" fill="#C99A2C"/>
          <circle cx="-16" cy="0" r="1.2" fill="#C99A2C"/>
          <circle cx="16" cy="0" r="1.2" fill="#C99A2C"/>
        </g>

        <!-- Bottom Medallion Crest -->
        <g transform="translate(155, 328)">
          <path d="M 0 -11 L 11 0 L 0 11 L -11 0 Z" fill="#F5EFE4" stroke="#C99A2C" stroke-width="1.3"/>
          <path d="M 0 -6 L 6 0 L 0 6 L -6 0 Z" fill="none" stroke="#C99A2C" stroke-width="0.8" opacity="0.75"/>
          <circle cx="0" cy="0" r="1.5" fill="#C99A2C"/>
          <circle cx="-16" cy="0" r="1.2" fill="#C99A2C"/>
          <circle cx="16" cy="0" r="1.2" fill="#C99A2C"/>
        </g>
      </svg>

      <!-- Realistic Velvet Rose Petals -->
      <svg class="blessing-petal blessing-petal-top" viewBox="0 0 40 30" aria-hidden="true">
        <defs>
          <radialGradient id="pGrad_${idx}_1" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#E22E4D"/>
            <stop offset="50%" stop-color="#8A1327"/>
            <stop offset="100%" stop-color="#36060F"/>
          </radialGradient>
        </defs>
        <path d="M 8 20 C 2 12 10 3 24 2 C 36 1 38 15 32 24 C 26 30 14 26 8 20 Z" fill="url(#pGrad_${idx}_1)"/>
      </svg>

      <svg class="blessing-petal blessing-petal-right-top" viewBox="0 0 40 30" aria-hidden="true">
        <path d="M 8 20 C 2 12 10 3 24 2 C 36 1 38 15 32 24 C 26 30 14 26 8 20 Z" fill="url(#pGrad_${idx}_1)"/>
      </svg>

      <svg class="blessing-petal blessing-petal-bottom" viewBox="0 0 40 30" aria-hidden="true">
        <path d="M 8 20 C 2 12 10 3 24 2 C 36 1 38 15 32 24 C 26 30 14 26 8 20 Z" fill="url(#pGrad_${idx}_1)"/>
      </svg>

      <!-- Baby's Breath Corner Florals (SVG) -->
      <svg class="blessing-floral-corner blessing-floral-bl" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <path d="M 8 92 Q 35 70 42 42 Q 48 24 64 14" stroke="#8C7355" stroke-width="1.1" opacity="0.45"/>
        <path d="M 18 82 Q 36 58 28 32 Q 22 18 12 14" stroke="#8C7355" stroke-width="1" opacity="0.4"/>
        <path d="M 32 68 Q 52 62 68 46" stroke="#8C7355" stroke-width="0.9" opacity="0.4"/>
        <circle cx="64" cy="14" r="3.8" fill="#FFFFFF" stroke="#E5DEC9" stroke-width="0.7"/>
        <circle cx="64" cy="14" r="1.2" fill="#F7E5A9"/>
        <circle cx="45" cy="24" r="3.2" fill="#FFFFFF" stroke="#E5DEC9" stroke-width="0.7"/>
        <circle cx="45" cy="24" r="1" fill="#F7E5A9"/>
        <circle cx="68" cy="46" r="3.6" fill="#FFFFFF" stroke="#E5DEC9" stroke-width="0.7"/>
        <circle cx="68" cy="46" r="1.2" fill="#F7E5A9"/>
        <circle cx="28" cy="32" r="3.2" fill="#FFFFFF" stroke="#E5DEC9" stroke-width="0.7"/>
        <circle cx="28" cy="32" r="1" fill="#F7E5A9"/>
        <circle cx="12" cy="14" r="2.8" fill="#FFFFFF" stroke="#E5DEC9" stroke-width="0.7"/>
        <circle cx="12" cy="14" r="0.8" fill="#F7E5A9"/>
        <circle cx="36" cy="48" r="2.8" fill="#FFFFFF" stroke="#E5DEC9" stroke-width="0.7"/>
        <circle cx="36" cy="48" r="0.8" fill="#F7E5A9"/>
        <circle cx="20" cy="58" r="3.2" fill="#FFFFFF" stroke="#E5DEC9" stroke-width="0.7"/>
        <circle cx="20" cy="58" r="1" fill="#F7E5A9"/>
      </svg>

      <svg class="blessing-floral-corner blessing-floral-tr" viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <path d="M 5 75 Q 28 60 36 36 Q 40 24 52 16" stroke="#8C7355" stroke-width="1" opacity="0.4"/>
        <circle cx="52" cy="16" r="3.2" fill="#FFFFFF" stroke="#E5DEC9" stroke-width="0.7"/>
        <circle cx="52" cy="16" r="1" fill="#F7E5A9"/>
        <circle cx="36" cy="36" r="2.8" fill="#FFFFFF" stroke="#E5DEC9" stroke-width="0.7"/>
        <circle cx="36" cy="36" r="0.8" fill="#F7E5A9"/>
      </svg>

      <!-- Card Inner Content -->
      <div class="blessing-card-content">
        <div class="blessing-card-header">
          <div class="blessing-avatar-wrapper">
            <div class="blessing-avatar-badge ${isGoldAvatar ? 'blessing-avatar-gold' : ''}">
              ${this.escapeHtml(initial)}
            </div>
            <!-- Delicate Floral Sprig Nestled by Avatar -->
            <svg class="blessing-avatar-sprig" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M 26 26 Q 14 20 8 10" stroke="#8C7355" stroke-width="0.9" opacity="0.45"/>
              <circle cx="8" cy="10" r="2.4" fill="#FFFFFF" stroke="#E5DEC9" stroke-width="0.6"/>
              <circle cx="8" cy="10" r="0.8" fill="#F7E5A9"/>
              <circle cx="15" cy="18" r="2" fill="#FFFFFF" stroke="#E5DEC9" stroke-width="0.6"/>
              <circle cx="15" cy="18" r="0.6" fill="#F7E5A9"/>
            </svg>
          </div>
          <div class="blessing-author-meta">
            <span class="blessing-author-name">${this.escapeHtml(name)}</span>
            <span class="blessing-date-text">${this.escapeHtml(formattedDate)}</span>
          </div>
        </div>

        <!-- Ornamental Divider Line -->
        <div class="blessing-card-divider" aria-hidden="true">
          <div class="blessing-divider-line"></div>
          <div class="blessing-divider-ornament">
            <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
              <path d="M 10 1 L 14 5 L 10 9 L 6 5 Z" fill="#FAF5ED" stroke="#C99A2C" stroke-width="1"/>
              <circle cx="10" cy="5" r="1.2" fill="#C99A2C"/>
              <line x1="0" y1="5" x2="5" y2="5" stroke="#C99A2C" stroke-width="0.8" opacity="0.6"/>
              <line x1="15" y1="5" x2="20" y2="5" stroke="#C99A2C" stroke-width="0.8" opacity="0.6"/>
            </svg>
          </div>
          <div class="blessing-divider-line"></div>
        </div>

        <!-- Blessing Message -->
        <div class="blessing-card-body">
          <span class="blessing-quote-mark" aria-hidden="true">“</span>
          <p class="blessing-quote-text">${this.escapeHtml(message)}</p>
        </div>
      </div>
    `;

    // Clicking adjacent cards moves to them directly
    card.addEventListener('click', () => {
      if (this.isDragging) return;
      const offset = this.getCardOffset(idx);
      if (offset === -1) {
        this.prev();
        this.pauseAutoplayTemporarily(4000);
      } else if (offset === 1) {
        this.next();
        this.pauseAutoplayTemporarily(4000);
      }
    });

    return card;
  }

  getCardOffset(idx) {
    const total = this.deckItems.length;
    let diff = idx - this.activeIndex;
    while (diff > total / 2) diff -= total;
    while (diff < -total / 2) diff += total;
    return diff;
  }

  updateCardPositions() {
    const total = this.deckItems.length;
    if (total === 0) return;

    this.cardElements.forEach((card, idx) => {
      const diff = this.getCardOffset(idx);

      // Clean inline transform set during dragging
      card.style.transform = '';
      card.style.opacity = '';
      card.style.filter = '';
      card.style.zIndex = '';

      card.classList.remove('card-active', 'card-prev', 'card-next', 'card-hidden-left', 'card-hidden-right');

      if (diff === 0) {
        card.classList.add('card-active');
        card.setAttribute('aria-hidden', 'false');
      } else if (diff === -1) {
        card.classList.add('card-prev');
        card.setAttribute('aria-hidden', 'true');
      } else if (diff === 1) {
        card.classList.add('card-next');
        card.setAttribute('aria-hidden', 'true');
      } else if (diff < -1) {
        card.classList.add('card-hidden-left');
        card.setAttribute('aria-hidden', 'true');
      } else if (diff > 1) {
        card.classList.add('card-hidden-right');
        card.setAttribute('aria-hidden', 'true');
      }
    });

    // Update dots indicator
    const activeOrig = this.getActiveOriginalIndex();
    this.dotElements.forEach((dot, idx) => {
      const isActive = idx === activeOrig;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  next() {
    const total = this.deckItems.length;
    if (total <= 1) return;
    this.activeIndex = (this.activeIndex + 1) % total;
    this.updateCardPositions();
  }

  prev() {
    const total = this.deckItems.length;
    if (total <= 1) return;
    this.activeIndex = (this.activeIndex - 1 + total) % total;
    this.updateCardPositions();
  }

  attachGestureListeners() {
    if (!this.viewport) return;

    const vp = this.viewport;

    // Pointer events (unifies touch & mouse gracefully)
    const onPointerDown = (e) => {
      this.isDragging = true;
      this.isSwipingHorizontal = null;
      this.startX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      this.startY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      this.currentDeltaX = 0;
      this.pauseAutoplayTemporarily(10000);
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;

      const currentX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const currentY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

      const deltaX = currentX - this.startX;
      const deltaY = currentY - this.startY;

      // Determine intent (horizontal swipe vs vertical scroll)
      if (this.isSwipingHorizontal === null) {
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
          // Native vertical page scroll
          this.isDragging = false;
          return;
        } else if (Math.abs(deltaX) > 8) {
          this.isSwipingHorizontal = true;
          vp.classList.add('is-dragging');
        }
      }

      if (this.isSwipingHorizontal) {
        if (e.cancelable) e.preventDefault();
        this.currentDeltaX = deltaX;
        this.applyDragTransform(deltaX);
      }
    };

    const onPointerUp = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      vp.classList.remove('is-dragging');

      if (this.isSwipingHorizontal) {
        const threshold = Math.max(45, this.cardWidth * 0.15);
        if (this.currentDeltaX < -threshold) {
          this.next();
        } else if (this.currentDeltaX > threshold) {
          this.prev();
        } else {
          this.updateCardPositions();
        }
      }

      this.isSwipingHorizontal = null;
      this.currentDeltaX = 0;
      this.pauseAutoplayTemporarily(3500);
    };

    // Pointer events for desktop & modern mobile
    vp.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Touch events fallback
    vp.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('touchcancel', onPointerUp);

    // Keyboard navigation (ArrowLeft & ArrowRight)
    vp.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prev();
        this.pauseAutoplayTemporarily(4000);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.next();
        this.pauseAutoplayTemporarily(4000);
      }
    });

    // Hover pauses autoplay on desktop
    vp.addEventListener('mouseenter', () => {
      this.isPaused = true;
    });

    vp.addEventListener('mouseleave', () => {
      this.isPaused = false;
    });

    // Focus pauses autoplay
    vp.addEventListener('focusin', () => {
      this.isPaused = true;
    });

    vp.addEventListener('focusout', () => {
      this.isPaused = false;
    });
  }

  applyDragTransform(deltaX) {
    const total = this.deckItems.length;
    if (total <= 1) return;

    const w = this.cardWidth || 310;
    const progress = Math.max(-1, Math.min(1, deltaX / w));
    const isMobile = window.innerWidth <= 640;
    const baseOffsetPct = isMobile ? 38 : 46;
    const zOffset = isMobile ? -45 : -60;

    this.cardElements.forEach((card, idx) => {
      const diff = this.getCardOffset(idx);

      if (diff === 0) {
        // Active card moves with finger
        const tx = progress * baseOffsetPct;
        const scale = 1 - Math.abs(progress) * 0.14;
        const opacity = 1 - Math.abs(progress) * 0.4;
        const blur = Math.abs(progress) * 2.5;
        const rotate = progress * 2;
        card.style.transform = `translate3d(${tx}%, 0, 0) scale(${scale}) rotate(${rotate}deg)`;
        card.style.opacity = `${opacity}`;
        card.style.filter = `blur(${blur}px)`;
        card.style.zIndex = '10';
      } else if (diff === 1) {
        // Next card (on the right)
        if (progress < 0) {
          // Dragging left: moves towards center
          const p = -progress;
          const tx = baseOffsetPct - p * baseOffsetPct;
          const scale = 0.86 + p * 0.14;
          const opacity = 0.6 + p * 0.4;
          const blur = (1 - p) * 2.5;
          const rotate = 2 * (1 - p);
          card.style.transform = `translate3d(${tx}%, 0, ${zOffset * (1 - p)}px) scale(${scale}) rotate(${rotate}deg)`;
          card.style.opacity = `${opacity}`;
          card.style.filter = `blur(${blur}px)`;
          card.style.zIndex = '8';
        } else {
          // Dragging right: pushed further right
          const tx = baseOffsetPct + progress * 20;
          const opacity = 0.6 * (1 - progress);
          card.style.transform = `translate3d(${tx}%, 0, ${zOffset}px) scale(0.86) rotate(2deg)`;
          card.style.opacity = `${opacity}`;
        }
      } else if (diff === -1) {
        // Previous card (on the left)
        if (progress > 0) {
          // Dragging right: moves towards center
          const p = progress;
          const tx = -baseOffsetPct + p * baseOffsetPct;
          const scale = 0.86 + p * 0.14;
          const opacity = 0.6 + p * 0.4;
          const blur = (1 - p) * 2.5;
          const rotate = -2 * (1 - p);
          card.style.transform = `translate3d(${tx}%, 0, ${zOffset * (1 - p)}px) scale(${scale}) rotate(${rotate}deg)`;
          card.style.opacity = `${opacity}`;
          card.style.filter = `blur(${blur}px)`;
          card.style.zIndex = '8';
        } else {
          // Dragging left: pushed further left
          const tx = -baseOffsetPct + progress * 20;
          const opacity = 0.6 * (1 + progress);
          card.style.transform = `translate3d(${tx}%, 0, ${zOffset}px) scale(0.86) rotate(-2deg)`;
          card.style.opacity = `${opacity}`;
        }
      }
    });
  }

  startAutoplay() {
    this.stopAutoplay();
    if (this.deckItems.length <= 1) return;

    // Active card visible ~2.2s, transition ~0.85s -> 3000ms loop
    this.autoplayInterval = setInterval(() => {
      if (!this.isPaused && !this.isDragging) {
        this.next();
      }
    }, 3000);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
    if (this.resumeTimeout) {
      clearTimeout(this.resumeTimeout);
      this.resumeTimeout = null;
    }
  }

  pauseAutoplayTemporarily(ms = 3500) {
    this.isPaused = true;
    if (this.resumeTimeout) clearTimeout(this.resumeTimeout);
    this.resumeTimeout = setTimeout(() => {
      this.isPaused = false;
    }, ms);
  }

  renderEmptyState() {
    const emptyCard = document.createElement('div');
    emptyCard.className = 'blessing-empty-card';
    emptyCard.innerHTML = `
      <div class="blessing-empty-icon" aria-hidden="true">✨</div>
      <h3 class="blessing-empty-title">Be The First To Bestow A Blessing</h3>
      <p class="blessing-empty-desc">Send your warmest Duas and heartfelt congratulations to Mohamed Rahamathullah & Maseera Kowsar.</p>
      <button type="button" class="btn-royal" id="emptyStateWriteBtn" style="padding: 0.7rem 1.8rem; font-size: 0.85rem;">
        Pen Your Blessing
      </button>
    `;

    const writeBtn = emptyCard.querySelector('#emptyStateWriteBtn');
    if (writeBtn && this.form) {
      writeBtn.addEventListener('click', () => {
        this.form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const nameInput = document.getElementById('wishName');
        if (nameInput) nameInput.focus();
      });
    }

    this.listContainer.appendChild(emptyCard);
  }

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

window.weddingGuestbook = new WeddingGuestbook();
