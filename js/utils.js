/**
 * ==========================================================================
 * ROYAL WEDDING INVITATION - UTILITIES & HELPERS
 * Theme toggle, Back to top, Calendar .ics export, Share & Toast alerts
 * ==========================================================================
 */

// Global Toast Notification
window.showToast = function(message, duration = 3800) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 350);
  }, duration);
};

// Theme Toggle (Dark / Light Mode)
class WeddingThemeManager {
  constructor() {
    this.themeToggleBtn = document.getElementById('themeToggleBtn');
    this.currentTheme = localStorage.getItem('royal_wedding_theme') || 'light';
  }

  init() {
    this.applyTheme(this.currentTheme);
    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', () => {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
      });
    }
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('royal_wedding_theme', theme);

    if (this.themeToggleBtn) {
      const icon = this.themeToggleBtn.querySelector('svg');
      if (icon) {
        if (theme === 'dark') {
          // Moon to Sun icon
          icon.innerHTML = `<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
          this.themeToggleBtn.setAttribute('aria-label', 'Switch to Ivory & Gold Light Theme');
        } else {
          // Sun to Moon icon
          icon.innerHTML = `<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
          this.themeToggleBtn.setAttribute('aria-label', 'Switch to Royal Dark Theme');
        }
      }
    }
  }
}

// Back to Top & Scroll Progress Ring
class WeddingScrollManager {
  constructor() {
    this.backToTopBtn = document.getElementById('backToTopBtn');
    this.progressCircle = document.getElementById('scrollProgressCircle');
  }

  init() {
    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    if (this.backToTopBtn) {
      this.backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  handleScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) : 0;

    // Show/hide Back to top
    if (this.backToTopBtn) {
      if (scrollTop > 350) {
        this.backToTopBtn.classList.add('visible');
      } else {
        this.backToTopBtn.classList.remove('visible');
      }
    }

    // Update circular progress SVG
    if (this.progressCircle) {
      const totalCircumference = 157; // 2 * pi * r (2 * 3.14159 * 25)
      const offset = totalCircumference - (scrollPercent * totalCircumference);
      this.progressCircle.style.strokeDashoffset = offset;
    }
  }
}

// Calendar & Sharing Utils
class WeddingShareManager {
  init() {
    this.setupShareButtons();
    this.setupCalendarButton();
  }

  setupShareButtons() {
    const waBtn = document.getElementById('shareWhatsAppBtn');
    const copyBtn = document.getElementById('copyLinkBtn');

    const groomName = window.WEDDING_CONFIG?.groom?.name || 'Rahamathullah';
    const brideName = window.WEDDING_CONFIG?.bride?.name || 'Maseera';
    const dateText = window.WEDDING_CONFIG?.weddingDateDisplay || 'Saturday, 2nd January 2027';
    const currentUrl = window.location.href;

    if (waBtn) {
      const waText = encodeURIComponent(
        `✨ *Royal Wedding Invitation* ✨\n\n` +
        `Together with our families, *${groomName}* & *${brideName}* joyfully invite you to celebrate our wedding on *${dateText}*.\n\n` +
        `Please open our interactive wedding invitation card here:\n🔗 ${currentUrl}`
      );
      waBtn.href = `https://api.whatsapp.com/send?text=${waText}`;
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(currentUrl).then(() => {
            window.showToast('📋 Invitation link copied to clipboard!');
          }).catch(() => {
            this.fallbackCopy(currentUrl);
          });
        } else {
          this.fallbackCopy(currentUrl);
        }
      });
    }
  }

  fallbackCopy(text) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
    window.showToast('📋 Invitation link copied to clipboard!');
  }

  setupCalendarButton() {
    const calBtn = document.getElementById('addToCalendarBtn');
    if (!calBtn) return;

    calBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.downloadIcsFile();
    });
  }

  downloadIcsFile() {
    const config = window.WEDDING_CONFIG;
    const groom = config?.groom?.name || 'Rahamathullah';
    const bride = config?.bride?.name || 'Maseera';
    const venueName = config?.venue?.name || 'Perunthalaivar Kamarajar Community Hall';
    const venueAddress = config?.venue?.address || 'Perambur, Chennai';

    const startDate = "20270102T170000";
    const endDate = "20270102T230000";

    const icsContent = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Royal Wedding//Mohamed and Fathima//EN
PRODID:-//Royal Wedding//Rahamathullah and Maseera//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:wedding-${Date.now()}@royalinvitation.com
DTSTAMP:${startDate}Z
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:Wedding of ${groom} ❤️ ${bride}
DESCRIPTION:Celebration of the Holy Matrimony of ${groom} & ${bride}. Together with their families.
LOCATION:${venueName}, ${venueAddress}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT24H
ACTION:DISPLAY
DESCRIPTION:Reminder: Wedding of ${groom} & ${bride} tomorrow!
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Wedding-${groom}-and-${bride}.ics`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.showToast('📅 Calendar event (.ics) downloaded!');
  }
}

// Scroll-Triggered Reveal Animations
class WeddingScrollObserver {
  constructor() {
    this.observer = null;
  }

  init() {
    const reveals = document.querySelectorAll('.reveal, .reveal-scale');
    if (!reveals.length) return;

    if (!this.observer) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      }, {
        threshold: 0.08,
        rootMargin: '0px 0px -20px 0px'
      });
    }

    reveals.forEach((el) => {
      this.observer.observe(el);
    });
  }
}

window.weddingTheme = new WeddingThemeManager();
window.weddingScroll = new WeddingScrollManager();
window.weddingShare = new WeddingShareManager();
window.weddingObserver = new WeddingScrollObserver();

