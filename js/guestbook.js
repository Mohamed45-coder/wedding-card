/**
 * ==========================================================================
 * ROYAL WEDDING INVITATION - WISHES & GUESTBOOK
 * Handles wishes submission, localStorage persistence & live animated feed
 * ==========================================================================
 */

class WeddingGuestbook {
  constructor() {
    this.form = document.getElementById('wishesForm');
    this.listContainer = document.getElementById('wishesList');
    this.storageKey = 'royal_wedding_wishes';
  }

  init() {
    if (!this.listContainer) return;
    this.renderWishes();

    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  getSavedWishes() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  saveWishes(wishes) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(wishes));
    } catch (e) {}
  }

  handleSubmit(e) {
    e.preventDefault();

    const nameInput = document.getElementById('wishName');
    const messageInput = document.getElementById('wishMessage');

    const name = nameInput ? nameInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';

    if (!name || !message) {
      if (window.showToast) window.showToast('Please enter your name and heartfelt wish! ✨');
      return;
    }

    // Avatar colors
    const colors = ['#D4AF37', '#942236', '#6B1426', '#B3861B', '#C99A2C', '#5C101D'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newWish = {
      name: name,
      message: message,
      date: 'Just now',
      avatarBg: randomColor,
      timestamp: Date.now()
    };

    const currentWishes = this.getSavedWishes();
    currentWishes.unshift(newWish);
    this.saveWishes(currentWishes);

    // Reset form
    if (this.form) this.form.reset();

    // Re-render
    this.renderWishes();

    if (window.showToast) {
      window.showToast('💖 Thank you! Your warm blessing has been recorded.');
    }
  }

  renderWishes() {
    const customWishes = this.getSavedWishes();
    const initialWishes = window.WEDDING_CONFIG ? (window.WEDDING_CONFIG.initialWishes || []) : [];
    
    // Combine custom (saved) wishes at the top, followed by config initial wishes
    const allWishes = [...customWishes, ...initialWishes];

    this.listContainer.innerHTML = '';

    allWishes.forEach((wish) => {
      const card = document.createElement('div');
      card.className = 'wish-card';

      const initial = wish.name ? wish.name.charAt(0).toUpperCase() : '★';

      card.innerHTML = `
        <div class="wish-header">
          <div class="wish-avatar" style="background:${wish.avatarBg || '#D4AF37'}">
            ${initial}
          </div>
          <div>
            <div class="wish-author">${this.escapeHtml(wish.name)}</div>
            <div class="wish-date">${wish.date || 'Recently'}</div>
          </div>
        </div>
        <p class="wish-message">“${this.escapeHtml(wish.message)}”</p>
      `;

      this.listContainer.appendChild(card);
    });
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

window.weddingGuestbook = new WeddingGuestbook();

