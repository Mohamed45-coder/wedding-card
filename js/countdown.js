/**
 * ==========================================================================
 * ROYAL WEDDING INVITATION - LIVE COUNTDOWN TIMER
 * ==========================================================================
 */

class WeddingCountdown {
  constructor() {
    this.daysEl = document.getElementById('cdDays');
    this.hoursEl = document.getElementById('cdHours');
    this.minutesEl = document.getElementById('cdMinutes');
    this.secondsEl = document.getElementById('cdSeconds');
    this.timerInterval = null;
  }

  init() {
    this.targetDate = new Date(window.WEDDING_CONFIG ? window.WEDDING_CONFIG.weddingDate : "2027-01-02T17:00:00").getTime();
    this.update();
    this.timerInterval = setInterval(() => this.update(), 1000);
  }

  update() {
    const now = new Date().getTime();
    const distance = this.targetDate - now;

    if (distance <= 0) {
      if (this.daysEl) this.daysEl.textContent = "00";
      if (this.hoursEl) this.hoursEl.textContent = "00";
      if (this.minutesEl) this.minutesEl.textContent = "00";
      if (this.secondsEl) this.secondsEl.textContent = "00";
      clearInterval(this.timerInterval);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    this.setNumber(this.daysEl, days);
    this.setNumber(this.hoursEl, hours);
    this.setNumber(this.minutesEl, minutes);
    this.setNumber(this.secondsEl, seconds);
  }

  setNumber(element, val) {
    if (!element) return;
    const formatted = val < 10 ? `0${val}` : `${val}`;
    if (element.textContent !== formatted) {
      element.textContent = formatted;
      element.classList.add('pulse-number');
      setTimeout(() => element.classList.remove('pulse-number'), 300);
    }
  }
}

window.weddingCountdown = new WeddingCountdown();

