// ============================================
// REFERENCE INDIAN HERITAGE DATA
// This file is static reference/seed content only (destination descriptions,
// public festival dates, well-known heritage sites). It is NEVER presented to
// the user as AI-generated output — the UI always labels it as curated
// reference material. All personalized narratives, hidden gems, itineraries
// and cultural insights come from a live Gemini API call (see services/geminiAI.js).
// ============================================

export const INDIAN_DESTINATIONS = [
  {
    id: 'varanasi',
    name: 'Varanasi, Uttar Pradesh',
    tagline: 'The Eternal City on the Ganges',
    state: 'Uttar Pradesh',
    type: 'Spiritual & Heritage',
    image: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?w=800&q=80',
    heritageSites: [
      { name: 'Kashi Vishwanath Temple', type: 'Jyotirlinga', built: '1780 (rebuilt)', significance: 'One of 12 Jyotirlingas, destroyed and rebuilt multiple times' },
      { name: 'Sarnath', type: 'Buddhist', built: '3rd century BCE', significance: 'Where Buddha gave his first sermon' },
      { name: 'Ramnagar Fort', type: 'Fort', built: '1750', significance: 'Mughal-era fort with a Veda museum' },
      { name: 'Manikarnika Ghat', type: 'Cremation Ghat', built: 'Ancient', significance: 'One of the oldest and most sacred cremation grounds' },
    ],
    vibe: ['Spiritual', 'Ancient', 'Intense', 'Sacred'],
    bestTime: 'October - March',
    localConnectors: [
      { name: 'Pandit Ramashankar', role: 'Vedic Scribe', avatar: '🕉️', bio: '4th generation palm-leaf manuscript scribe, teaches Sanskrit to visitors' },
      { name: 'Gudiya Devi', role: 'Banarasi Sari Weaver', avatar: '🧵', bio: 'Master weaver preserving centuries-old motifs' },
      { name: 'Bhaiyaji', role: 'Ghat Storyteller', avatar: '📿', bio: 'Grew up on the ghats, knows the history of every stone' },
    ],
    events: [
      { title: 'Ganga Aarti at Dashashwamedh Ghat', date: 'Daily, 6:30 PM', host: 'Ganga Seva Samiti', isReal: true },
      { title: 'Dev Deepawali', date: 'November 4, 2026', host: 'City of Varanasi', isReal: true },
      { title: 'Buddha Purnima at Sarnath', date: 'May 2, 2026', host: 'Local Monastic Community', isReal: true },
    ],
    cuisine: ['Kachori Sabzi', 'Banarasi Paan', 'Litti Chokha', 'Thandai', 'Malaiyo'],
    intangibleHeritage: ['Banarasi Sari Weaving', 'Santoor Music', 'Ramleela Performance'],
  },
  {
    id: 'jaipur',
    name: 'Jaipur, Rajasthan',
    tagline: 'The Pink City of Kings and Craftsmen',
    state: 'Rajasthan',
    type: 'Heritage & Craft',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80',
    heritageSites: [
      { name: 'Amber Fort', type: 'Fort', built: '1592', significance: 'UNESCO World Heritage Site, Hindu-Mughal fusion architecture' },
      { name: 'Hawa Mahal', type: 'Palace', built: '1799', significance: '953 windows, built for royal women to observe street life' },
      { name: 'Jantar Mantar', type: 'Observatory', built: '1734', significance: "UNESCO WHS, world's largest stone sundial" },
      { name: 'City Palace', type: 'Palace', built: '1727', significance: 'Still the residence of the Jaipur royal family' },
    ],
    vibe: ['Royal', 'Colorful', 'Artisanal', 'Vibrant'],
    bestTime: 'October - March',
    localConnectors: [
      { name: 'Mohammed Yunus', role: 'Block Printer', avatar: '🎨', bio: '7th generation Sanganer block printer' },
      { name: 'Lakshmi Devi', role: 'Blue Pottery Artisan', avatar: '🏺', bio: "Master of Jaipur's blue pottery tradition" },
      { name: 'Raja Singh', role: 'Folk Musician', avatar: '🎵', bio: 'Manganiyar singer performing at desert festivals' },
    ],
    events: [
      { title: 'Jaipur Literature Festival', date: 'January 22-26, 2026', host: 'Teamwork Arts', isReal: true },
      { title: 'Teej Festival', date: 'August 28, 2026', host: 'Local Communities', isReal: true },
      { title: 'Gangaur Festival', date: 'March 27 - April 2, 2026', host: 'Rajasthan Tourism', isReal: true },
    ],
    cuisine: ['Dal Baati Churma', 'Laal Maas', 'Ghewar', 'Kachori', 'Lassi'],
    intangibleHeritage: ['Jaipur Blue Pottery', 'Kathputli Puppetry', 'Manganiyar Folk Music'],
  },
  {
    id: 'hampi',
    name: 'Hampi, Karnataka',
    tagline: 'Where Stones Tell Stories of an Empire',
    state: 'Karnataka',
    type: 'Archaeological & Spiritual',
    image: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800&q=80',
    heritageSites: [
      { name: 'Virupaksha Temple', type: 'Temple', built: '7th century', significance: 'One of the oldest continuously functioning temples in India' },
      { name: 'Vittala Temple Complex', type: 'Temple', built: '15th century', significance: 'Famous stone chariot and musical pillars' },
      { name: 'Hemakuta Hill', type: 'Sacred Site', built: 'Ancient', significance: '360° sunset views over the ruins' },
      { name: "Queen's Bath", type: 'Monument', built: '15th century', significance: 'Indo-Islamic royal bathing complex' },
    ],
    vibe: ['Mystical', 'Ruined', 'Serene', 'Epic'],
    bestTime: 'October - February',
    localConnectors: [
      { name: 'Raju', role: 'Coracle Boatman', avatar: '⛵', bio: '3rd generation boatman, knows every hidden cave and carving' },
      { name: 'Lakshmi Amma', role: 'Banana Fiber Weaver', avatar: '🍌', bio: "Crafts from Hampi's famous banana fiber" },
      { name: 'Guru Prasad', role: 'Kannada Poet', avatar: '✍️', bio: "Writes poetry about Hampi's ruins" },
    ],
    events: [
      { title: 'Hampi Utsav', date: 'November 3-5, 2026', host: 'Karnataka Tourism', isReal: true },
      { title: 'Vijaya Utsav', date: 'January 2026', host: 'Local Heritage Trust', isReal: true },
    ],
    cuisine: ['Bisi Bele Bath', 'Maddur Vada', 'Dosa', 'Filter Coffee', 'Obbattu'],
    intangibleHeritage: ['Vijayanagara Architecture', 'Kannada Haridasa Music', 'Coracle Making'],
  },
  {
    id: 'kochi',
    name: 'Kochi, Kerala',
    tagline: 'Where the Spice Route Still Breathes',
    state: 'Kerala',
    type: 'Coastal & Cultural',
    image: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&q=80',
    heritageSites: [
      { name: 'Paradesi Synagogue', type: 'Synagogue', built: '1568', significance: 'Oldest active synagogue in the Commonwealth' },
      { name: 'Mattancherry Palace', type: 'Palace', built: '1555', significance: 'Kerala murals depicting the Ramayana and Mahabharata' },
      { name: 'Chinese Fishing Nets', type: 'Fishing', built: '14th century', significance: 'Unique cantilever fishing nets, a Kochi icon' },
      { name: 'Fort Kochi', type: 'Fort', built: '1503', significance: 'First European fort in India' },
    ],
    vibe: ['Coastal', 'Multicultural', 'Relaxed', 'Historic'],
    bestTime: 'October - March',
    localConnectors: [
      { name: 'Abraham', role: 'Synagogue Caretaker', avatar: '🕎', bio: 'Caretaker of the Paradesi Synagogue' },
      { name: 'Mariam', role: 'Kathakali Teacher', avatar: '🎭', bio: 'Teaches Kathakali expressions to visitors' },
      { name: 'Varghese', role: 'Spice Trader', avatar: '🌶️', bio: '4th generation spice merchant' },
    ],
    events: [
      { title: 'Kochi-Muziris Biennale', date: 'December 2026 - March 2027', host: 'Kochi Biennale Foundation', isReal: true },
      { title: 'Onam Celebrations', date: 'August 26, 2026', host: 'Kerala Communities', isReal: true },
    ],
    cuisine: ['Appam with Stew', 'Kerala Fish Curry', 'Puttu', 'Sadhya', 'Banana Chips'],
    intangibleHeritage: ['Kathakali Dance-Drama', 'Kalaripayattu Martial Art', 'Chenda Melam Music'],
  },
  {
    id: 'shillong',
    name: 'Shillong, Meghalaya',
    tagline: 'The Scotland of the East, Where Music is Air',
    state: 'Meghalaya',
    type: 'Nature & Music',
    image: 'https://images.unsplash.com/photo-1593813738953-fb3c93e0769d?w=800&q=80',
    heritageSites: [
      { name: 'Living Root Bridges', type: 'Natural', built: 'Living/Growing', significance: 'Khasi bio-engineering, 500+ years old' },
      { name: 'Nohkalikai Falls', type: 'Waterfall', built: 'Natural', significance: "India's tallest plunge waterfall (340m)" },
      { name: 'Mawphlang Sacred Grove', type: 'Sacred Forest', built: 'Ancient', significance: 'Unbroken animist tradition' },
      { name: 'All Saints Cathedral', type: 'Church', built: '1902', significance: 'Gothic architecture' },
    ],
    vibe: ['Musical', 'Misty', 'Ancient', 'Soulful'],
    bestTime: 'October - April',
    localConnectors: [
      { name: 'Bah Ryntathiang', role: 'Duitara Master', avatar: '🎸', bio: '7th generation musician' },
      { name: 'Ibaiah', role: 'Living Root Bridge Keeper', avatar: '🌉', bio: 'Maintains root bridges' },
      { name: 'Wanshai', role: 'Khasi Storyteller', avatar: '📖', bio: 'Preserves Khasi oral epics' },
    ],
    events: [
      { title: 'Shillong Autumn Festival', date: 'October 2026', host: 'Meghalaya Tourism', isReal: true },
      { title: 'Nongkrem Dance Festival', date: 'November 2026', host: 'Khasi Hills Autonomous District', isReal: true },
    ],
    cuisine: ['Jadoh', 'Tungrymbai', 'Dohneiiong', 'Pukhlein', 'Sakin Gata'],
    intangibleHeritage: ['Khasi Oral Epics', 'Duitara Music', 'Living Root Bridge Craft'],
  },
  {
    id: 'udaipur',
    name: 'Udaipur, Rajasthan',
    tagline: 'The City of Lakes and Living Palaces',
    state: 'Rajasthan',
    type: 'Royal & Romantic',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80',
    heritageSites: [
      { name: 'City Palace', type: 'Palace', built: '1559', significance: 'Largest palace complex in Rajasthan, still a royal residence' },
      { name: 'Lake Palace', type: 'Palace', built: '1746', significance: 'Marble palace on Lake Pichola' },
      { name: 'Jagdish Temple', type: 'Temple', built: '1651', significance: 'Indo-Aryan architecture dedicated to Lord Vishnu' },
      { name: 'Saheliyon-ki-Bari', type: 'Garden', built: '1710', significance: 'Garden of the Maidens, fountains and lotus pools' },
    ],
    vibe: ['Romantic', 'Royal', 'Artistic', 'Serene'],
    bestTime: 'October - March',
    localConnectors: [
      { name: 'Bannaji', role: 'Miniature Painter', avatar: '🖌️', bio: '5th generation Mewar painter' },
      { name: 'Gulabo', role: 'Ghoomar Dancer', avatar: '💃', bio: 'Performs Rajasthani folk dance' },
      { name: 'Pratap Singh', role: 'Royal Historian', avatar: '👑', bio: 'Descendant of Mewar nobility' },
    ],
    events: [
      { title: 'Mewar Festival', date: 'March 28-30, 2026', host: 'Udaipur Municipal Corporation', isReal: true },
      { title: 'Shilpgram Crafts Fair', date: 'December 21-31, 2026', host: 'Shilpgram Trust', isReal: true },
    ],
    cuisine: ['Dal Baati Churma', 'Laal Maas', 'Gatte ki Sabzi', 'Ker Sangri', 'Ghevar'],
    intangibleHeritage: ['Mewar Miniature Painting', 'Ghoomar Dance', 'Pichwai Painting'],
  },
];

// Real, publicly known 2026 Indian festival dates (national calendar).
export const INDIAN_FESTIVALS_2026 = [
  { name: 'Makar Sankranti', date: '2026-01-14', type: 'Harvest Festival', states: ['All India'] },
  { name: 'Vasant Panchami', date: '2026-01-23', type: 'Religious', states: ['North India', 'West Bengal'] },
  { name: 'Maha Shivratri', date: '2026-02-15', type: 'Religious', states: ['All India'] },
  { name: 'Holi', date: '2026-03-04', type: 'Festival of Colors', states: ['All India'] },
  { name: 'Ugadi / Gudi Padwa', date: '2026-03-19', type: 'New Year', states: ['Karnataka', 'Andhra Pradesh', 'Maharashtra'] },
  { name: 'Ram Navami', date: '2026-03-26', type: 'Religious', states: ['All India'] },
  { name: 'Baisakhi', date: '2026-04-14', type: 'Harvest Festival', states: ['Punjab', 'Haryana'] },
  { name: 'Buddha Purnima', date: '2026-05-02', type: 'Religious', states: ['All India'] },
  { name: 'Rath Yatra', date: '2026-07-16', type: 'Religious', states: ['Odisha', 'Gujarat'] },
  { name: 'Guru Purnima', date: '2026-07-29', type: 'Religious', states: ['All India'] },
  { name: 'Onam', date: '2026-08-26', type: 'Harvest Festival', states: ['Kerala'] },
  { name: 'Raksha Bandhan', date: '2026-08-28', type: 'Family', states: ['North India'] },
  { name: 'Ganesh Chaturthi', date: '2026-09-14', type: 'Religious', states: ['Maharashtra', 'Goa', 'Karnataka'] },
  { name: 'Navratri', date: '2026-10-11', type: 'Religious', states: ['All India'] },
  { name: 'Dussehra', date: '2026-10-20', type: 'Religious', states: ['All India'] },
  { name: 'Diwali', date: '2026-11-08', type: 'Festival of Lights', states: ['All India'] },
  { name: 'Chhath Puja', date: '2026-11-15', type: 'Religious', states: ['Bihar', 'Jharkhand', 'Uttar Pradesh'] },
  { name: 'Guru Nanak Jayanti', date: '2026-11-24', type: 'Religious', states: ['Punjab', 'Haryana', 'Delhi'] },
  { name: 'Christmas', date: '2026-12-25', type: 'Religious', states: ['All India'] },
];

/** Returns the next 5 upcoming festivals relative to now. */
export function getUpcomingFestivals(referenceDate = new Date()) {
  return INDIAN_FESTIVALS_2026
    .filter((f) => new Date(f.date) >= referenceDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);
}

/**
 * Scores and ranks destinations against a traveler's declared mood + interests.
 * Pure function — deterministic and unit-testable (see src/data/indiaHeritage.test.js).
 */
export function matchDestinations(interests = [], mood = '') {
  const norm = (s) => s.toLowerCase();
  const scored = INDIAN_DESTINATIONS.map((dest) => {
    let score = 0;

    score += dest.vibe.filter((v) =>
      interests.some((i) => norm(v).includes(norm(i)) || norm(i).includes(norm(v)))
    ).length * 3;

    if (interests.some((i) => norm(dest.type).includes(norm(i)))) score += 5;

    score += dest.intangibleHeritage.filter((h) =>
      interests.some((i) => norm(h).includes(norm(i)) || norm(i).includes(norm(h)))
    ).length * 4;

    score += dest.cuisine.filter((c) =>
      interests.some((i) => norm(c).includes(norm(i)) || norm(i).includes(norm(c)))
    ).length * 2;

    if (mood === 'spiritual' && dest.type.includes('Spiritual')) score += 5;
    if (mood === 'adventurous' && dest.type.includes('Nature')) score += 5;
    if (mood === 'romantic' && dest.type.includes('Romantic')) score += 5;
    if (mood === 'creative' && dest.intangibleHeritage.some((h) => /art|music/i.test(h))) score += 5;

    return { ...dest, matchScore: score };
  });

  return scored.sort((a, b) => b.matchScore - a.matchScore);
}

/** Converts a raw match score into a bounded, display-friendly percentage. */
export function matchScoreToPercent(score) {
  return Math.max(35, Math.min(97, 40 + score * 4));
}
