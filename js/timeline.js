/**
 * ==========================================================================
 * ROYAL WEDDING INVITATION - DYNAMIC EVENT TIMELINE
 * Renders unlimited events from WEDDING_CONFIG.timeline
 * ==========================================================================
 */

class WeddingTimeline {
  constructor() {
    this.container = document.getElementById('timelineContainer');
  }

  init() {
    if (!this.container || !window.WEDDING_CONFIG || !window.WEDDING_CONFIG.timeline) return;
    this.render();
  }

  getIconSvg(type) {
    switch (type) {
      case 'rings':
        return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="14" r="5"/><circle cx="16" cy="14" r="5"/><path d="M12 5l1.5 2h-3L12 5z"/></svg>`;
      case 'feast':
        return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`;
      case 'music':
      default:
        return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`;
    }
  }

  render() {
    const events = window.WEDDING_CONFIG.timeline;
    this.container.innerHTML = '';

    events.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = `timeline-item reveal reveal-delay-${(index % 3) + 1}`;
      
      itemEl.innerHTML = `
        <div class="timeline-node">
          ${this.getIconSvg(item.icon)}
        </div>
        <div class="timeline-card">
          <div class="ornate-corner-tl"></div>
          <div class="ornate-corner-tr"></div>
          <div class="ornate-corner-bl"></div>
          <div class="ornate-corner-br"></div>

          <span class="timeline-time-badge">${item.time}</span>
          <h3 class="timeline-title">${item.title}</h3>
          
          <div class="timeline-meta">
            <div><strong>📅 Date:</strong> ${item.date}</div>
            <div><strong>📍 Venue:</strong> ${item.venue}</div>
          </div>

          <p class="section-description" style="margin-top:0.5rem; margin-bottom:0.75rem;">${item.description}</p>
          
          ${item.dressCode ? `<div class="timeline-dress">👔 Dress Code: ${item.dressCode}</div>` : ''}
        </div>
      `;

      this.container.appendChild(itemEl);
    });
  }
}

window.weddingTimeline = new WeddingTimeline();

