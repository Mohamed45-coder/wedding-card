# Royal Wedding Invitation Website 👑✨

A luxury, mobile-first, single-page wedding invitation website built with **pure HTML5, CSS3, and Vanilla JavaScript** (Zero external heavy frameworks).

Designed with a **Royal Gold, Ivory, and Deep Maroon** color palette and Islamic/Indian architectural motifs.

---

## 🌟 Key Features

1. **3D Antique Royal Door Entry**:
   - Fullscreen landing section featuring 3D double arched royal doors.
   - Interactive golden seal button (*"Open Invitation"*).
   - Realistic 3D perspective swing with synchronized opening sound effect.

2. **Ambient Royal Music & Sound Synthesizer**:
   - Built-in **Web Audio API synthesizer** generating gentle ambient sitar/shehnai/harp melodies and realistic sound effects (no missing audio assets).
   - Floating music toggle with animated equalizer bars.
   - Supports custom `.mp3` background music via `config.js`.

3. **Couple Introduction**:
   - Bismillah calligraphy with English translation.
   - Elegant typography (*"Mohamed ❤️ Fathima"*).
   - Romantic message with decorative gold corner ornaments.

4. **Live Glassmorphism Countdown Timer**:
   - Real-time countdown to the wedding date & time (Days, Hours, Minutes, Seconds).
   - Dynamic flip/pulse animations.

5. **Interactive Heart Scratch Card**:
   - HTML5 Canvas heart-shaped scratch foil with golden metallic luster.
   - Supports mouse drag, pointer events, and mobile touch gestures.
   - **70% Reveal Threshold**: Automatically dissolves remaining foil once 70% is scratched.
   - **Post-Reveal Celebration**: Launches fullscreen fireworks, confetti bursts, celebration chimes, and reveals the exact date, time, and Nikah Muhurtham.

6. **Dynamic Event Timeline**:
   - Vertical timeline supporting unlimited events rendered directly from `config.js` (Welcoming, Sangeet, Nikah Ceremony, Walima Feast).
   - Interactive cards with dress code and venue tags.

7. **The Royal Venue & Directions**:
   - Grand Palace address, hall details, and landmarks.
   - Embedded Google Maps view.
   - **Get Directions** button (Google Maps navigation).
   - **Add to Calendar** dropdown (1-click direct add to Google Calendar, Apple Calendar / iCal, Outlook, Yahoo Calendar, and `.ics` download).

8. **Family Blessings**:
   - Symmetrical royal framed cards for the Groom's Family and Bride's Family.

9. **Wishes Guestbook**:
   - Interactive guestbook form with `localStorage` persistence.
   - Preloaded with warm blessings + real-time user submissions with avatar badges.

10. **RSVP System**:
    - Name, Phone, Guest count, and Attendance status.
    - One-click WhatsApp RSVP submission to the family's WhatsApp number.

11. **Share & QR Code**:
    - Instant WhatsApp share button with pre-formatted invite text.
    - One-click Copy Invitation Link with toast notifications.

12. **Islamic Footer**:
    - Holy Quran verse: *Surah Ar-Rum (30:21)* in Arabic calligraphy with translation.
    - Floating animated Fanous Islamic lanterns with flickering flames.

13. **Global Enhancements**:
    - Floating romantic rose petals & golden fairy dust particles.
    - Royal Ivory & Gold theme design.
    - Back-to-Top button with circular SVG scroll progress ring.
    - Responsive mobile-first layout (Lighthouse 90+ score ready).

---

## 📁 Folder Structure

```
wedding-site/
├── index.html              # Main semantic HTML5 document
├── README.md               # Documentation and setup guide
├── css/
│   ├── style.css           # Core theme variables, typography, reset, floating controls
│   ├── animations.css      # Keyframes for 3D doors, lantern sway, heart beats, glow
│   └── components.css      # Styling for scratch card, countdown, timeline, forms, cards
└── js/
    ├── config.js           # Central configuration for names, dates, venues, events
    ├── audio.js            # Web Audio API procedural synthesizer & sound effects
    ├── door.js             # 3D antique door interaction and opening logic
    ├── countdown.js        # Live countdown timer
    ├── scratch-card.js     # HTML5 Canvas heart scratch card with 70% threshold
    ├── celebration.js      # Fullscreen canvas fireworks and gold confetti particle engine
    ├── petals.js           # Floating rose petals & gold dust particle canvas
    ├── timeline.js         # Dynamic timeline generator
    ├── guestbook.js        # Wishes form & localStorage persistence
    ├── rsvp.js             # RSVP form validation & WhatsApp submission
    ├── utils.js            # Calendar .ics export, clipboard, scroll observer
    └── app.js              # Main application initializer
```

---

## ⚙️ How to Customize (`js/config.js`)

All details can be updated easily inside `js/config.js`:

```javascript
const WEDDING_CONFIG = {
  groom: {
    name: "Mohamed",
    fullName: "Mohamed Rahamathullah",
    father: "Janab. K. S. Ibrahim",
    mother: "Smt. Noorjahan Ibrahim",
    city: "Chennai, Tamil Nadu"
  },
  bride: {
    name: "Fathima",
    fullName: "Fathima Zehra",
    father: "Janab. A. M. Hameed",
    mother: "Smt. Raziya Begum",
    city: "Bangalore, Karnataka"
  },
  weddingDate: "2026-11-22T10:30:00",
  weddingDateDisplay: "Sunday, 22nd November 2026",
  weddingTimeDisplay: "10:30 AM onwards (Nikah Ceremony: 11:00 AM)",
  // Add timeline events, venue details, and WhatsApp number here
};
```

---

## 🚀 How to Run Locally

You can open `index.html` directly in any modern web browser or serve it with any local static HTTP server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve .
```

Then visit `http://localhost:8000` in your browser.

---

## 📄 License
Created for personal wedding celebrations. Free to customize and share with family and friends!

