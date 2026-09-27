/**
 * ==========================================================================
 * ROYAL WEDDING INVITATION - WISHES & GUESTBOOK (SUPABASE INTEGRATION)
 * Handles wishes submission, Supabase persistence & live feed
 * ==========================================================================
 */

class WeddingGuestbook {
  constructor() {
    this.form = document.getElementById('wishesForm');
    this.listContainer = document.getElementById('wishesList');
    this.wishes = [];
    this.isSubmitting = false;
  }

  async init() {
    if (!this.listContainer) return;

    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Fetch wishes on initial load
    await this.fetchWishes();
  }

  getSupabaseClient() {
    return window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  }

  async fetchWishes() {
    const client = this.getSupabaseClient();

    if (!client) {
      console.error('Supabase client is not initialized. Please configure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in js/supabase.js');
      // Graceful fallback to initial config wishes if Supabase credentials are not yet entered
      const initialWishes = window.WEDDING_CONFIG ? (window.WEDDING_CONFIG.initialWishes || []) : [];
      this.renderWishes(initialWishes);
      return;
    }

    try {
      const { data, error } = await client
        .from('wedding_wishes')
        .select('id, name, message, order, created_at, is_deleted')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching wedding wishes from Supabase:', error);
        return;
      }

      const allWishes = Array.isArray(data) ? data : [];
      this.wishes = allWishes.filter((w) => w.is_deleted !== 1);
      this.renderWishes(this.wishes);
    } catch (err) {
      console.error('Unexpected error while fetching wishes:', err);
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    if (this.isSubmitting) return;

    const nameInput = document.getElementById('wishName');
    const messageInput = document.getElementById('wishMessage');

    const name = nameInput ? nameInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';

    // Validation
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

    // Determine the next order automatically based on existing wishes
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
      const { data, error } = await client
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

      // Reset form on success
      if (this.form) this.form.reset();

      // Show success toast
      if (window.showToast) {
        window.showToast('💖 Thank you! Your warm blessing has been recorded.');
      }

      // Refresh wishes list from Supabase
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
      // Return raw string if already formatted (e.g. initial demo wishes)
      return String(rawDate);
    }

    try {
      const datePart = dateObj.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      const timePart = dateObj.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return `${datePart} • ${timePart}`;
    } catch (e) {
      return dateObj.toLocaleString();
    }
  }

  renderWishes(wishesToRender) {
    if (!this.listContainer) return;
    const wishes = wishesToRender || this.wishes || [];

    this.listContainer.innerHTML = '';

    const colors = ['#D4AF37', '#942236', '#6B1426', '#B3861B', '#C99A2C', '#5C101D'];

    wishes.forEach((wish, index) => {
      const card = document.createElement('div');
      card.className = 'wish-card';

      const initial = wish.name ? wish.name.trim().charAt(0).toUpperCase() : '★';
      const avatarBg = wish.avatarBg || colors[index % colors.length];
      const formattedDate = this.formatWishDate(wish);

      card.innerHTML = `
        <div class="wish-header">
          <div class="wish-avatar" style="background:${avatarBg}">
            ${initial}
          </div>
          <div>
            <div class="wish-author">${this.escapeHtml(wish.name || 'Well-wisher')}</div>
            <div class="wish-date">${this.escapeHtml(formattedDate)}</div>
          </div>
        </div>
        <p class="wish-message">“${this.escapeHtml(wish.message || '')}”</p>
      `;

      this.listContainer.appendChild(card);
    });
  }

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

window.weddingGuestbook = new WeddingGuestbook();
