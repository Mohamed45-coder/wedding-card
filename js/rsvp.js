/**
 * ==========================================================================
 * ROYAL WEDDING INVITATION - RSVP HANDLER
 * Validates, records RSVP in localStorage and generates WhatsApp RSVP message
 * ==========================================================================
 */

class WeddingRSVP {
  constructor() {
    this.form = document.getElementById('rsvpForm');
    this.storageKey = 'royal_wedding_rsvp_submissions';
  }

  init() {
    if (!this.form) return;
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  handleSubmit(e) {
    e.preventDefault();

    const nameInput = document.getElementById('rsvpName');
    const phoneInput = document.getElementById('rsvpPhone');
    const countInput = document.getElementById('rsvpGuestCount');
    const statusInput = document.querySelector('input[name="rsvpStatus"]:checked');
    const notesInput = document.getElementById('rsvpNotes');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const count = countInput ? countInput.value : '1';
    const status = statusInput ? statusInput.value : 'attending';
    const notes = notesInput ? notesInput.value.trim() : '';

    if (!name || !phone) {
      if (window.showToast) window.showToast('Please provide your name and phone number.');
      return;
    }

    const submission = {
      name,
      phone,
      guestCount: count,
      status,
      notes,
      timestamp: new Date().toISOString()
    };

    // Save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      existing.push(submission);
      localStorage.setItem(this.storageKey, JSON.stringify(existing));
    } catch (err) {}

    // Feedback
    const isAttending = status === 'attending';
    const statusMsg = isAttending 
      ? `Alhamdulillah! We can't wait to celebrate with you, ${name}!`
      : `Thank you for letting us know, ${name}. We will miss you!`;

    if (window.showToast) window.showToast(statusMsg);

    // Prepare WhatsApp RSVP message
    const targetPhone = window.WEDDING_CONFIG?.share?.whatsappNumber || '919876543210';
    const groomName = window.WEDDING_CONFIG?.groom?.name || 'Mohamed';
    const brideName = window.WEDDING_CONFIG?.bride?.name || 'Fathima';

    const waText = encodeURIComponent(
      `*Wedding RSVP for ${groomName} & ${brideName}*\n\n` +
      `👤 *Name:* ${name}\n` +
      `📞 *Phone:* ${phone}\n` +
      `👥 *Guests:* ${count}\n` +
      `✨ *Status:* ${isAttending ? 'Joyfully Attending ✅' : 'Regretfully Unable to Attend ❌'}\n` +
      (notes ? `💬 *Note:* ${notes}\n` : '')
    );

    const waUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${waText}`;

    // Prompt user to send confirmation via WhatsApp
    setTimeout(() => {
      if (confirm("Would you like to send this RSVP confirmation directly to the family on WhatsApp?")) {
        window.open(waUrl, '_blank');
      }
    }, 400);

    this.form.reset();
  }
}

window.weddingRSVP = new WeddingRSVP();

