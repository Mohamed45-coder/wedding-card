/**
 * ==========================================================================
 * ROYAL WEDDING INVITATION - MASTER APPLICATION ENTRYPOINT
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Populate Dynamic Content from config.js
  populateConfigData();

  // 2. Initialize Theme & Audio
  if (window.weddingTheme) window.weddingTheme.init();
  if (window.weddingAudio) window.weddingAudio.init();

  // 3. Initialize Interactive Components
  if (window.weddingDoor) window.weddingDoor.init();
  if (window.weddingCountdown) window.weddingCountdown.init();
  if (window.weddingScratchCard) window.weddingScratchCard.init();
  if (window.weddingPetals) window.weddingPetals.init();
  if (window.weddingTimeline) window.weddingTimeline.init();
  if (window.weddingGuestbook) window.weddingGuestbook.init();
  if (window.weddingRSVP) window.weddingRSVP.init();
  if (window.weddingShare) window.weddingShare.init();
  if (window.weddingScroll) window.weddingScroll.init();

  // 4. Initialize Scroll Animations
  setTimeout(() => {
    if (window.weddingObserver) window.weddingObserver.init();
  }, 100);
});

function populateConfigData() {
  const cfg = window.WEDDING_CONFIG;
  if (!cfg) return;

  // Couple names & text
  setElText('.cfg-groom-name', cfg.groom.name);
  setElText('.cfg-bride-name', cfg.bride.name);
  setElText('.cfg-invitation-note', cfg.invitationNote);
  setElText('.cfg-bismillah-arabic', cfg.bismillahText);
  setElText('.cfg-bismillah-meaning', cfg.bismillahMeaning);

  // Scratch card revealed data
  setElText('#revealedWeddingDate', cfg.weddingDateDisplay);
  setElText('#revealedWeddingTime', cfg.weddingTimeDisplay);
  setElText('#revealedMuhurtham', cfg.muhurthamTimeDisplay);

  // Venue information
  setElText('#venueName', cfg.venue.name);
  setElText('#venueHall', cfg.venue.hallName);
  setElText('#venueAddress', cfg.venue.address);
  setElText('#venueLandmark', `Landmark: ${cfg.venue.landmark}`);
  
  const mapIframe = document.getElementById('venueMapIframe');
  if (mapIframe && cfg.venue.googleMapsEmbedUrl) {
    mapIframe.src = cfg.venue.googleMapsEmbedUrl;
  }

  const directionsBtn = document.getElementById('getDirectionsBtn');
  if (directionsBtn && cfg.venue.googleMapsLink) {
    directionsBtn.href = cfg.venue.googleMapsLink;
  }

  // Family Blessings
  if (cfg.familyBlessings) {
    setElText('#groomFamilyTitle', cfg.familyBlessings.groomFamily.title);
    setElText('#groomParents', cfg.familyBlessings.groomFamily.parents);
    setElText('#groomGrandparents', cfg.familyBlessings.groomFamily.grandparents);
    setElText('#groomBlessing', cfg.familyBlessings.groomFamily.blessing);
    setElText('#groomCompliments', cfg.familyBlessings.groomFamily.withBestCompliments);

    setElText('#brideFamilyTitle', cfg.familyBlessings.brideFamily.title);
    setElText('#brideParents', cfg.familyBlessings.brideFamily.parents);
    setElText('#brideGrandparents', cfg.familyBlessings.brideFamily.grandparents);
    setElText('#brideBlessing', cfg.familyBlessings.brideFamily.blessing);
    setElText('#brideCompliments', cfg.familyBlessings.brideFamily.withBestCompliments);
  }

  // Quran Verse in Footer
  if (cfg.quranVerse) {
    setElText('#quranArabic', cfg.quranVerse.arabic);
    setElText('#quranEnglish', cfg.quranVerse.english);
    setElText('#quranSurah', cfg.quranVerse.surah);
  }
}

function setElText(selector, text) {
  if (!text) return;
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    el.textContent = text;
  });
}

