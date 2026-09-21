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
    name: "Mohamed",
    fullName: "Mohamed Rahamathullah",
    father: "Janab. K. S. Ibrahim",
    mother: "Smt. Noorjahan Ibrahim",
    city: "Chennai, Tamil Nadu",
    title: "Groom"
  },
  bride: {
    name: "Fathima",
    fullName: "Fathima Zehra",
    father: "Janab. A. M. Hameed",
    mother: "Smt. Raziya Begum",
    city: "Bangalore, Karnataka",
    title: "Bride"
  },

  // Main Event Target Date & Time (Used for Countdown & Scratch Card)
  // Format: YYYY-MM-DDTHH:MM:SS
  weddingDate: "2026-11-22T10:30:00",
  weddingDateDisplay: "Sunday, 22nd November 2026",
  weddingTimeDisplay: "10:30 AM onwards (Nikah Ceremony: 11:00 AM)",
  muhurthamTimeDisplay: "Auspicious Nikah Time: 11:00 AM to 11:45 AM",

  // Invitation Verse & Intro
  bismillahText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  bismillahMeaning: "In the name of Allah, the Most Gracious, the Most Merciful",
  quranVerse: {
    arabic: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
    english: "“And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquility with them, and He has put love and mercy between your hearts.”",
    surah: "— Surah Ar-Rum [30:21]"
  },
  invitationNote: "Together with our families, we invite you to celebrate the beginning of our forever as we unite in holy matrimony.",

  // Schedule & Event Timeline (Unlimited events supported)
  timeline: [
    {
      id: "reception-eve",
      title: "Grand Welcoming & Sangeet",
      date: "Saturday, 21st November 2026",
      time: "07:00 PM onwards",
      venue: "Grand Crystal Ballroom, The Royal Palace",
      dressCode: "Festive Traditional / Indo-Western",
      description: "An evening of joyful music, traditional delicacies, and warm welcomes to celebrate the bride and groom.",
      icon: "music"
    },
    {
      id: "nikah-ceremony",
      title: "Auspicious Nikah Ceremony",
      date: "Sunday, 22nd November 2026",
      time: "10:30 AM – 12:30 PM",
      venue: "Grand Majestic Hall, The Royal Palace",
      dressCode: "Royal Traditional Attire / Ethnic",
      description: "The solemn and sacred wedding ceremony uniting Mohamed & Fathima in holy wedlock with divine blessings.",
      icon: "rings"
    },
    {
      id: "walima-lunch",
      title: "Royal Walima Feast & Lunch",
      date: "Sunday, 22nd November 2026",
      time: "12:30 PM – 04:00 PM",
      venue: "Royal Banquet Pavilion, The Royal Palace",
      dressCode: "Elegant Traditional",
      description: "A sumptuous grand feast of traditional royal biryani, desserts, and celebration with family and friends.",
      icon: "feast"
    }
  ],

  // Venue & Location
  venue: {
    name: "The Royal Palace Banquet & Convention Center",
    hallName: "Grand Crystal & Majestic Halls",
    address: "No. 77, Grand Palace Boulevard, Near Royal Lake, Chennai - 600028, Tamil Nadu, India",
    landmark: "Opposite to Heritage Garden, 10 Mins from Central Metro",
    googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.586111003445!2d80.2450!3d13.0600!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDAzJzM2LjAiTiA4MMKwMTQnNDIuMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin",
    googleMapsLink: "https://maps.google.com/?q=Chennai+Convention+Center",
    contactPhones: ["+91 98765 43210", "+91 98765 43211"]
  },

  // Family Blessings
  familyBlessings: {
    groomFamily: {
      title: "Groom's Family",
      parents: "Janab K. S. Ibrahim & Smt. Noorjahan Ibrahim",
      grandparents: "Late Janab K. Sultan & Late Smt. Ameena Bi",
      blessing: "“With the grace of Almighty Allah, we cordially invite you and your family to bless our son Mohamed on this sacred milestone.”",
      withBestCompliments: "Brothers, Sisters, Relatives & Friends"
    },
    brideFamily: {
      title: "Bride's Family",
      parents: "Janab A. M. Hameed & Smt. Raziya Begum",
      grandparents: "Late Janab A. Mohammed & Late Smt. Mariam Beevi",
      blessing: "“Seeking the blessings of Allah (SWT) and your heartfelt presence as our beloved daughter Fathima embarks on this blessed union.”",
      withBestCompliments: "Brothers, Sisters, Relatives & Friends"
    }
  },

  // Audio / Music Settings
  music: {
    autoPlayAfterDoorOpen: true,
    defaultMuted: false,
    useSynthesizer: true, // Procedural Web Audio API sitar/shehnai/harp ambient drone
    customAudioUrl: "" // Optional custom .mp3 audio URL if provided
  },

  // Social Sharing & RSVP
  share: {
    whatsappNumber: "919876543210", // Number to receive RSVP via WhatsApp
    shareTitle: "Wedding Invitation: Mohamed ❤️ Fathima",
    shareMessage: "Together with our families, Mohamed & Fathima joyfully invite you to celebrate their wedding on Sunday, 22nd November 2026. Please view our royal wedding invitation card:",
    inviteLink: window.location.href
  },

  // Preloaded Warm Wishes (Displayed along with local storage submissions)
  initialWishes: [
    {
      name: "Ayaan & Zoya",
      message: "May Allah shower His boundless blessings, joy, and peace on Mohamed & Fathima for an eternity! So thrilled for you both! ❤️✨",
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
      message: "Congratulations Mohamed and Fathima! Looking forward to celebrating this beautiful royal occasion with the entire family!",
      date: "Today",
      avatarBg: "#8B263E"
    }
  ]
};

// Export to window
if (typeof window !== "undefined") {
  window.WEDDING_CONFIG = WEDDING_CONFIG;
}

