/**
 * ==========================================================================
 * ROYAL WEDDING INVITATION - UTILITIES & HELPERS
 * Back to top, Calendar .ics export, Share & Toast alerts
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

// Back to Top & Scroll Progress Ring
class WeddingScrollManager {
  constructor() {
    this.backToTopBtn = document.getElementById('backToTopBtn');
    this.progressCircle = document.getElementById('scrollProgressCircle');
    this._ticking = false;
  }

  init() {
    window.addEventListener('scroll', () => {
      if (!this._ticking) {
        window.requestAnimationFrame(() => {
          this.handleScroll();
          this._ticking = false;
        });
        this._ticking = true;
      }
    }, { passive: true });

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
    const openBtn = document.getElementById('openWhatsAppModalBtn');
    const closeBtn = document.getElementById('closeWhatsAppModalBtn');
    const cancelBtn = document.getElementById('cancelWhatsAppModalBtn');
    const backdrop = document.getElementById('whatsappModalBackdrop');
    const confirmBtn = document.getElementById('confirmShareWhatsAppBtn');
    const copyBtn = document.getElementById('copyLinkBtn');
    const currentUrl = window.location.href;

    if (openBtn) {
      openBtn.addEventListener('click', () => this.openWhatsAppModal());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeWhatsAppModal());
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.closeWhatsAppModal());
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => this.closeWhatsAppModal());
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeWhatsAppModal();
      }
    });

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.shareToWhatsApp());
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

  openWhatsAppModal() {
    const modal = document.getElementById('whatsappModal');
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  closeWhatsAppModal() {
    const modal = document.getElementById('whatsappModal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  async shareToWhatsApp() {
    const currentUrl = window.location.href;
    const shareMessage =
      `🌿✨ *A little something special from our hearts…*\n\n` +
      `*Mohamed Rahamathullah & Maseera Kowsar*\n` +
      `invite you to be part of a beautiful new beginning. 🤍\n\n` +
      `💌 *Open the invitation and discover the rest…*\n\n` +
      `With love,\n` +
      `*Rahamathullah & Maseera* 🌸\n\n` +
      `🔗 ${currentUrl}`;

    this.closeWhatsAppModal();

    // Check if Web Share API with image file attachment is supported (mobile devices / native WhatsApp app)
    if (navigator.share) {
      try {
        const imageRes = await fetch('assets/images/whatsapp_invite.png');
        const blob = await imageRes.blob();
        const file = new File([blob], 'wedding_invitation.png', { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Mohamed Rahamathullah & Maseera Kowsar | Wedding Invitation',
            text: shareMessage,
            files: [file]
          });
          return;
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    // Direct WhatsApp share URL fallback
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(waUrl, '_blank');
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
    const wrapper = document.getElementById('calendarDropdownWrapper');
    const calBtn = document.getElementById('addToCalendarBtn');
    const menu = document.getElementById('calendarDropdownMenu');
    if (!calBtn || !menu) return;

    const config = window.WEDDING_CONFIG;
    const groom = config?.groom?.name || 'Mohamed Rahamathullah';
    const bride = config?.bride?.name || 'Maseera Kowsar';
    const venueName = config?.venue?.name || 'Perunthalaivar Kamarajar Community Hall';
    const venueAddress = config?.venue?.address || '225, SRP Koil street (North), Peravallur, Perambur, Chennai - 600082';
    const location = `${venueName}, ${venueAddress}`;
    const eventTitle = `Wedding: ${groom} & ${bride}`;
    const description = `Celebration of the Holy Matrimony of ${groom} & ${bride}.\n\nSchedule:\n• Mehfil-E-Nikkah: 5:00 PM\n• Dawat-E-Valima (Reception): 7:00 PM Onwards\n\nVenue: ${venueName}, ${venueAddress}\nIn Sha Allah, looking forward to your presence and prayers!`;

    // Date & times (2nd January 2027, 5:00 PM - 11:00 PM IST = UTC+5:30)
    // 2027-01-02 17:00:00 IST = 2027-01-02 11:30:00 UTC
    // 2027-01-02 23:00:00 IST = 2027-01-02 17:30:00 UTC
    const startIsoUtc = '20270102T113000Z';
    const endIsoUtc = '20270102T173000Z';
    const startIsoLocal = '2027-01-02T17:00:00+05:30';
    const endIsoLocal = '2027-01-02T23:00:00+05:30';

    // 1. Google Calendar Link
    const googleCalLink = document.getElementById('calGoogle');
    if (googleCalLink) {
      const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
        `&text=${encodeURIComponent(eventTitle)}` +
        `&dates=${startIsoUtc}/${endIsoUtc}` +
        `&details=${encodeURIComponent(description)}` +
        `&location=${encodeURIComponent(location)}` +
        `&ctz=Asia/Kolkata`;
      googleCalLink.href = googleUrl;
      googleCalLink.addEventListener('click', () => {
        wrapper?.classList.remove('open');
        calBtn.setAttribute('aria-expanded', 'false');
        window.showToast('📅 Opening Google Calendar...');
      });
    }

    // 2. Apple Calendar Link / Action
    const appleCalLink = document.getElementById('calApple');
    if (appleCalLink) {
      appleCalLink.addEventListener('click', (e) => {
        e.preventDefault();
        wrapper?.classList.remove('open');
        calBtn.setAttribute('aria-expanded', 'false');
        this.downloadIcsFile();
        window.showToast('📅 Added to Apple Calendar / iCal!');
      });
    }

    // Toggle dropdown open/close on button click
    calBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrapper?.classList.toggle('open');
      calBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (wrapper && !wrapper.contains(e.target)) {
        wrapper.classList.remove('open');
        calBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && wrapper?.classList.contains('open')) {
        wrapper.classList.remove('open');
        calBtn.setAttribute('aria-expanded', 'false');
        calBtn.focus();
      }
    });
  }

  downloadIcsFile() {
    const config = window.WEDDING_CONFIG;
    const groom = config?.groom?.name || 'Mohamed Rahamathullah';
    const bride = config?.bride?.name || 'Maseera Kowsar';
    const venueName = config?.venue?.name || 'Perunthalaivar Kamarajar Community Hall';
    const venueAddress = config?.venue?.address || '225, SRP Koil street (North), Peravallur, Perambur, Chennai - 600082';

    const startDateUtc = "20270102T113000Z";
    const endDateUtc = "20270102T173000Z";

    const icsContent = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Royal Wedding//Rahamathullah and Maseera//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:wedding-20270102-rahamathullah-maseera@royalwedding.com
DTSTAMP:${startDateUtc}
DTSTART:${startDateUtc}
DTEND:${endDateUtc}
SUMMARY:Wedding: ${groom} ❤️ ${bride}
DESCRIPTION:Celebration of the Holy Matrimony of ${groom} & ${bride}. Together with their families.\\n\\nSchedule:\\n• Mehfil-E-Nikkah: 5:00 PM\\n• Dawat-E-Valima (Reception): 7:00 PM Onwards\\n\\nVenue: ${venueName}, ${venueAddress}
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
    link.setAttribute('download', `Wedding-${groom.replace(/\s+/g, '-')}-and-${bride.replace(/\s+/g, '-')}.ics`);
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
            this.observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.02,
        rootMargin: '0px 0px 60px 0px'
      });
    }

    reveals.forEach((el) => {
      this.observer.observe(el);
    });
  }
}

window.weddingScroll = new WeddingScrollManager();
window.weddingShare = new WeddingShareManager();
window.weddingObserver = new WeddingScrollObserver();

