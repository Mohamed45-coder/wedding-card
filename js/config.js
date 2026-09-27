/**
 * ==========================================================================
 * WEDDING INVITATION CONFIGURATION
 * ==========================================================================
 * Easily customize all details for the wedding ceremony, couple, venue,
 * schedule, family blessings, and social sharing here.
 */

const WEDDING_CONFIG = {
  // Couple Information
  groom: {
    name: "Mohamed Rahamathullah",
    fullName: "I. Mohamed Rahamathullah, B.E.",
    degree: "B.E.",
    father: "Mohamed Ismail",
    mother: "Zeenath Begam",
    parents: "Mohamed Ismail & Zeenath Begam",
    paternalGrandparents: "Late Jamaludeen & Late Khasim Bee",
    maternalGrandparents: "Late Ummar Basha & Choti Bee",
    city: "Chennai, Tamil Nadu",
    title: "Groom"
  },
  bride: {
    name: "Maseera Kowsar",
    fullName: "A. Maseera Kowsar, B.Sc.",
    degree: "B.Sc.",
    father: "Ansar Khan",
    mother: "Mubashira Rizwana",
    parents: "Ansar Khan & Mubashira Rizwana",
    paternalGrandparents: "Late Majeed Khan & Late Safiya Bee",
    maternalGrandparents: "Shaik Mahamood & Late Shamsunissa",
    city: "Bengalore, Karnataka",
    title: "Bride"
  },

  // Main Event Target Date & Time (Used for Countdown & Scratch Card)
  // Format: YYYY-MM-DDTHH:MM:SS
  weddingDate: "2027-01-02T17:00:00",
  weddingTimeDisplay: "Mehfil-E-Nikkah: 5:00 PM | Dawat-E-Valima (Reception): 7:00 PM Onwards",
  muhurthamTimeDisplay: "Mehfil-E-Nikkah: 5:00 PM | Dinner: 7:00 PM Onwards",

  // Invitation Verse & Intro
  bismillahText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  bismillahMeaning: "In the name of Allah, the Most Gracious, the Most Merciful",
  quranVerse: {
    arabic: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
    english: "“And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquility with them, and He has put love and mercy between your hearts.”",
    surah: "— Surah Ar-Rum [30:21]"
  },
  invitationNote: "Together with our families, we joyfully invite you to celebrate the beginning of our forever as we unite in holy matrimony, In Sha Allah.",

  // Schedule & Event Timeline (Unlimited events supported)
  timeline: [
    {
      id: "nikah-ceremony",
      title: "Mehfil-E-Nikkah",
      date: "Saturday, 2nd January 2027",
      time: "05:00 PM",
      venue: "Perunthalaivar Kamarajar Community Hall",
      dressCode: "Traditional / Festive Ethnic",
      description: "The solemn and sacred wedding ceremony uniting Rahamathullah & Maseera in holy wedlock with divine blessings, In Sha Allah.",
      icon: "rings"
    },
    {
      id: "valima-reception",
      title: "Dawat-E-Valima (Reception)",
      date: "Saturday, 2nd January 2027",
      time: "Dinner: 07:00 PM Onwards",
      venue: "Perunthalaivar Kamarajar Community Hall",
      dressCode: "Elegant Traditional / Formal",
      description: "Join us for a grand royal feast and wedding reception to celebrate the newlyweds with family and friends.",
      icon: "feast"
    }
  ],

  // Venue & Location
  venue: {
    name: "Perunthalaivar Kamarajar Community Hall",
    hallName: "Perunthalaivar Kamarajar Community Hall",
    address: "225, SRP Koil street (North), Peravallur, Tiru.Vi.Ka Nagar, Perambur, Chennai - 600082",
    landmark: "Opposite Bus depots",
    bloomQrUrl: "https://www.bubbbly.com/bloom?u=https%3A%2F%2Fmaps.app.goo.gl%2FWrunQKfkcurjyNUC9",
    googleMapsLink: "https://maps.google.com/?q=Perunthalaivar+K+Kamarajar+Thirumana+Maligai+225+SRP+Koil+Street+Peravallur+Perambur+Chennai+600082",
    contactPhones: ["+91 98765 43210"]
  },

  // Family Blessings
  familyBlessings: {
    groomFamily: {
      title: "Groom's Family",
      parents: "Mohamed Ismail & Zeenath Begam",
      grandparents: "Paternal Grand S/O. Late Jamaludeen & Late Khasim Bee | Maternal Grand S/O. Late Ummar Basha & Choti Bee",
      blessing: "“With the grace of Almighty Allah, we cordially invite you and your family to bless Rahamathullah on this sacred milestone.”",
      withBestCompliments: "Mohamed Samiullah"
    },
    brideFamily: {
      title: "Bride's Family",
      parents: "Ansar Khan & Mubashira Rizwana",
      grandparents: "Paternal Grand D/O. Late Majeed Khan & Late Safiya Bee | Maternal Grand D/O. Shaik Mahamood & Late Shamsunissa",
      blessing: "“Seeking the blessings of Allah (SWT) and your heartfelt presence as our beloved daughter Maseera embarks on this blessed union.”",
      withBestCompliments: "Ayisha Mariyam & Asra Uzma"
    }
  },

  // Audio / Music Settings
  music: {
    autoPlayAfterDoorOpen: true,
    defaultMuted: false,
    useSynthesizer: false, // Set false to use custom background audio track
    customAudioUrl: "assets/tunes/tera_mera_pyar_amar_1.mp3" // Background audio track
  },

  // Social Sharing & RSVP
  share: {
    whatsappNumber: "919876543210", // Number to receive RSVP via WhatsApp
    shareTitle: "🌿✨ Wedding Invitation | Mohamed Rahamathullah & Maseera Kowsar",
    shareMessage: "🌿✨ A little something special from our hearts… Mohamed Rahamathullah & Maseera Kowsar invite you to be part of a beautiful new beginning. 🤍 💌 Open the invitation and discover the rest…",
    inviteLink: window.location.href
  },

  // Preloaded Warm Wishes (Displayed along with local storage submissions)
  initialWishes: [
    {
      name: "Aarif & Zoya",
      message: "May Allah shower His boundless blessings, joy, and peace on Rahamathullah & Maseera for an eternity! So thrilled for you both! ❤️✨",
      date: "2 days ago",
      avatarBg: "#D4AF37"
    },
    {
      name: "Uncle Tariq & Family",
      message: "Barakallahu lakuma wa baraka alaykuma wa jama'a baynakuma fee khayr. Wishing you a blissful and blessed married life ahead!",
      date: "Yesterday",
      avatarBg: "#6B1426"
    },
    {
      name: "Dr. Farhan & Rehana",
      message: "Congratulations Rahamathullah and Maseera! Looking forward to celebrating this beautiful occasion with the entire family!",
      date: "Today",
      avatarBg: "#8B263E"
    }
  ]
};

// Export to window
if (typeof window !== "undefined") {
  window.WEDDING_CONFIG = WEDDING_CONFIG;
}
