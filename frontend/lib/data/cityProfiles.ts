// Comprehensive UAE City Profiles - Accurate, researched data

export interface CityProfile {
  id: string;
  name: string;
  arabicName: string;
  coordinates: { lat: number; lon: number };
  overview: {
    introduction: string;
    area: string;
    founded: string;
    ruler: string;
  };
  history: {
    timeline: Array<{ year: string; event: string }>;
    significance: string;
  };
  economy: {
    gdp: string;
    mainSectors: string[];
    keyFacts: string[];
  };
  landmarks: Array<{ name: string; description: string; established: string }>;
  achievements: Array<{ title: string; description: string; year: string }>;
  demographics: { population: string; density: string; nationalityMix: string };
  climate: { averageTemp: string; rainfall: string; humidity: string; dustSeasons: string };
  transportation: { airports: string[]; ports: string[]; publicTransit: string[] };
  culture: { heritage: string; festivals: string[]; cuisine: string };
}

export const cityProfiles: Record<string, CityProfile> = {
  dubai: {
    id: 'dubai',
    name: 'Dubai',
    arabicName: 'دبي',
    coordinates: { lat: 25.2048, lon: 55.2708 },
    overview: {
      introduction: 'Dubai is the most populous city in the UAE and the capital of the Emirate of Dubai. It has evolved from a small fishing village to one of the most cosmopolitan cities in the world.',
      area: '4,114 km²',
      founded: '1833',
      ruler: 'Sheikh Mohammed bin Rashid Al Maktoum'
    },
    history: {
      timeline: [
        { year: '1833', event: 'Al Maktoum dynasty established Dubai' },
        { year: '1966', event: 'Oil discovered, beginning transformation' },
        { year: '1971', event: 'Dubai became founding member of UAE' },
        { year: '2010', event: 'Burj Khalifa inaugurated as world\'s tallest' },
        { year: '2020', event: 'Hosted Expo 2020 with 24 million visitors' }
      ],
      significance: 'Dubai transformed from a pearl diving settlement into a global hub for commerce and tourism in less than 50 years.'
    },
    economy: {
      gdp: 'USD 108 billion (2022)',
      mainSectors: ['Tourism', 'Aviation', 'Real Estate', 'Financial Services', 'Trade'],
      keyFacts: ['Contributes 26% of UAE GDP', 'Home to 30+ free zones', 'World\'s busiest international airport']
    },
    landmarks: [
      { name: 'Burj Khalifa', description: 'World\'s tallest building at 828m with 163 floors', established: '2010' },
      { name: 'Palm Jumeirah', description: 'Largest artificial island shaped like a palm tree', established: '2006' },
      { name: 'Dubai Mall', description: 'One of world\'s largest shopping centers with 1,200+ stores', established: '2008' },
      { name: 'Burj Al Arab', description: 'Iconic sail-shaped luxury hotel, world\'s only 7-star', established: '1999' },
      { name: 'Dubai Frame', description: '150m tall landmark offering panoramic views', established: '2018' },
      { name: 'Museum of the Future', description: 'Award-winning innovation museum', established: '2022' }
    ],
    achievements: [
      { title: 'World\'s Tallest Building', description: 'Burj Khalifa at 828 meters', year: '2010' },
      { title: 'Busiest International Airport', description: '89 million passengers in 2018', year: '2018' },
      { title: 'World Expo Host', description: 'Expo 2020 with 24 million visitors', year: '2020' }
    ],
    demographics: { population: '3.5 million', density: '860/km²', nationalityMix: '200+ nationalities, 85% expatriates' },
    climate: { averageTemp: '27°C (Summer 41°C, Winter 19°C)', rainfall: '94mm annually', humidity: '60% average', dustSeasons: 'March-May and September-November' },
    transportation: { airports: ['Dubai International (DXB)', 'Al Maktoum International (DWC)'], ports: ['Jebel Ali Port', 'Port Rashid'], publicTransit: ['Dubai Metro', 'Dubai Tram', 'Bus Network', 'Water Taxi'] },
    culture: { heritage: 'Al Fahidi Historical Neighbourhood, Dubai Museum, traditional souks', festivals: ['Dubai Shopping Festival', 'Dubai Food Festival', 'Art Dubai'], cuisine: 'Global cuisines with Emirati dishes like Machboos and Luqaimat' }
  },
  abu_dhabi: {
    id: 'abu_dhabi',
    name: 'Abu Dhabi',
    arabicName: 'أبوظبي',
    coordinates: { lat: 24.4539, lon: 54.3773 },
    overview: {
      introduction: 'Abu Dhabi is the capital and second most populous city of the UAE. It is the seat of government and home to vast oil reserves that funded its remarkable development.',
      area: '67,340 km²',
      founded: '1761',
      ruler: 'Sheikh Mohamed bin Zayed Al Nahyan'
    },
    history: {
      timeline: [
        { year: '1761', event: 'Bani Yas tribe discovered fresh water' },
        { year: '1958', event: 'Oil discovered, transforming economy' },
        { year: '1971', event: 'Became capital of newly formed UAE' },
        { year: '2017', event: 'Louvre Abu Dhabi opened' },
        { year: '2020', event: 'Hope Probe Mars mission launched' }
      ],
      significance: 'Abu Dhabi\'s oil wealth has been strategically invested in diversification, education, and culture.'
    },
    economy: {
      gdp: 'USD 250 billion (2022)',
      mainSectors: ['Oil and Gas', 'Financial Services', 'Tourism', 'Renewable Energy'],
      keyFacts: ['Controls 6% of world\'s oil reserves', 'ADIA manages USD 700+ billion', 'Masdar City pioneering sustainability']
    },
    landmarks: [
      { name: 'Sheikh Zayed Grand Mosque', description: 'One of world\'s largest mosques with 82 domes', established: '2007' },
      { name: 'Louvre Abu Dhabi', description: 'Art museum designed by Jean Nouvel', established: '2017' },
      { name: 'Emirates Palace', description: 'Iconic luxury hotel with 394 suites', established: '2005' },
      { name: 'Qasr Al Watan', description: 'Presidential palace open to public', established: '2019' },
      { name: 'Yas Island', description: 'Entertainment hub with Ferrari World and F1 circuit', established: '2009' }
    ],
    achievements: [
      { title: 'First Arab Mars Mission', description: 'Hope Probe launched successfully', year: '2020' },
      { title: 'Nuclear Energy Pioneer', description: 'Barakah became first Arab nuclear plant', year: '2020' },
      { title: 'F1 Host', description: 'Yas Marina Circuit hosts Abu Dhabi GP', year: '2009' }
    ],
    demographics: { population: '1.5 million city, 2.9 million emirate', density: '408/km²', nationalityMix: '80% expatriates from 150+ countries' },
    climate: { averageTemp: '28°C (Summer 42°C, Winter 18°C)', rainfall: '78mm annually', humidity: '65% average', dustSeasons: 'March-August with Shamal winds' },
    transportation: { airports: ['Abu Dhabi International (AUH)', 'Al Bateen Executive'], ports: ['Khalifa Port', 'Mina Zayed'], publicTransit: ['Bus Network', 'Intercity coaches', 'Ferry services'] },
    culture: { heritage: 'Heritage Village, Qasr Al Hosn, extensive arts support', festivals: ['Abu Dhabi Art Fair', 'Mother of the Nation Festival'], cuisine: 'Traditional Emirati with Arabic coffee ceremonies' }
  },
  sharjah: {
    id: 'sharjah',
    name: 'Sharjah',
    arabicName: 'الشارقة',
    coordinates: { lat: 25.3573, lon: 55.4033 },
    overview: {
      introduction: 'Sharjah is the cultural capital of the UAE and the only emirate with land on both the Arabian Gulf and Gulf of Oman.',
      area: '2,590 km²',
      founded: '1727',
      ruler: 'Sheikh Sultan bin Muhammad Al-Qasimi'
    },
    history: {
      timeline: [
        { year: '1727', event: 'Al Qasimi family established rule' },
        { year: '1932', event: 'First airport in Gulf region built' },
        { year: '1998', event: 'Named Cultural Capital of Arab World' },
        { year: '2019', event: 'Named World Book Capital by UNESCO' }
      ],
      significance: 'Sharjah positioned itself as the cultural and educational heart of the UAE.'
    },
    economy: {
      gdp: 'USD 34 billion (2022)',
      mainSectors: ['Manufacturing', 'Trade', 'Education', 'Publishing'],
      keyFacts: ['Largest manufacturing base in UAE', 'Home to 18 universities', 'Publishing hub for Arabic content']
    },
    landmarks: [
      { name: 'Museum of Islamic Civilization', description: '5,000+ artifacts spanning 1,400 years', established: '2008' },
      { name: 'Al Noor Mosque', description: 'Stunning mosque inspired by Istanbul\'s Sultan Ahmed', established: '2005' },
      { name: 'Sharjah Art Museum', description: 'Largest art museum in UAE with 72 galleries', established: '1997' },
      { name: 'Heart of Sharjah', description: 'Heritage restoration project', established: 'Ongoing' }
    ],
    achievements: [
      { title: 'Cultural Capital of Arab World', description: 'First city with UNESCO designation', year: '1998' },
      { title: 'World Book Capital', description: 'Recognized for promoting literacy', year: '2019' },
      { title: 'First Gulf Airport', description: 'Built region\'s first airport', year: '1932' }
    ],
    demographics: { population: '1.8 million', density: '695/km²', nationalityMix: '88% expatriates' },
    climate: { averageTemp: '27°C (Summer 40°C, Winter 18°C)', rainfall: '110mm annually', humidity: '65% average', dustSeasons: 'Spring and summer months' },
    transportation: { airports: ['Sharjah International (SHJ)'], ports: ['Port Khalid', 'Hamriyah Port', 'Khor Fakkan'], publicTransit: ['SRTA buses', 'Inter-emirate services'] },
    culture: { heritage: 'Strict Islamic and Arab heritage preservation, alcohol banned', festivals: ['Sharjah Light Festival', 'International Book Fair', 'Sharjah Biennial'], cuisine: 'Traditional Arab cuisine with halal emphasis' }
  },
  al_ain: {
    id: 'al_ain',
    name: 'Al Ain',
    arabicName: 'العين',
    coordinates: { lat: 24.2075, lon: 55.7447 },
    overview: {
      introduction: 'Al Ain, the Garden City, is a UNESCO World Heritage Site and birthplace of Sheikh Zayed, the founding father of the UAE.',
      area: '15,100 km²',
      founded: 'Ancient (4,000+ years)',
      ruler: 'Part of Abu Dhabi Emirate'
    },
    history: {
      timeline: [
        { year: '3000 BCE', event: 'Bronze Age settlements established' },
        { year: '1918', event: 'Sheikh Zayed born in Al Ain' },
        { year: '1976', event: 'UAE University established' },
        { year: '2011', event: 'UNESCO World Heritage inscription' }
      ],
      significance: 'Al Ain represents UAE\'s ancient heritage with evidence of 5,000+ years of human settlement.'
    },
    economy: {
      gdp: 'USD 8 billion (2022)',
      mainSectors: ['Agriculture', 'Education', 'Tourism', 'Date Production'],
      keyFacts: ['Largest date producer in UAE', 'Home to UAE\'s first university', 'Growing medical tourism']
    },
    landmarks: [
      { name: 'Jebel Hafeet', description: 'UAE\'s second highest peak at 1,249m', established: 'Natural' },
      { name: 'Al Ain Oasis', description: 'UNESCO site with 147,000 date palms', established: 'Ancient' },
      { name: 'Al Jahili Fort', description: 'Historic fort built in 1891', established: '1891' },
      { name: 'Al Ain Zoo', description: 'Largest zoo in UAE, 400 hectares', established: '1968' }
    ],
    achievements: [
      { title: 'UNESCO World Heritage', description: 'Cultural sites recognized', year: '2011' },
      { title: 'Birthplace of UAE Founder', description: 'Sheikh Zayed born here', year: '1918' },
      { title: 'First UAE University', description: 'UAE University established', year: '1976' }
    ],
    demographics: { population: '766,000', density: '51/km²', nationalityMix: '30% Emiratis (highest ratio)' },
    climate: { averageTemp: '28°C (Summer 44°C, Winter 14°C)', rainfall: '80mm annually', humidity: '45% (lower inland)', dustSeasons: 'Higher activity due to desert proximity' },
    transportation: { airports: ['Al Ain International (AAN)'], ports: ['None (inland)'], publicTransit: ['Al Ain Bus Service', 'Inter-city to Abu Dhabi/Dubai'] },
    culture: { heritage: 'Bedouin traditions, camel racing, falconry, date farming', festivals: ['Al Ain Date Festival', 'Camel Racing Season'], cuisine: 'Authentic Emirati with dates, camel meat, Arabic coffee' }
  },
  ajman: {
    id: 'ajman',
    name: 'Ajman',
    arabicName: 'عجمان',
    coordinates: { lat: 25.4052, lon: 55.5136 },
    overview: {
      introduction: 'Ajman is the smallest emirate by area but features rich history, beautiful beaches, and traditional dhow-building industry.',
      area: '259 km²',
      founded: '1775',
      ruler: 'Sheikh Humaid bin Rashid Al Nuaimi III'
    },
    history: {
      timeline: [
        { year: '1775', event: 'Al Nuaimi tribe established control' },
        { year: '1971', event: 'Founding member of UAE' },
        { year: '1988', event: 'Ajman Free Zone established' },
        { year: '2018', event: 'City Centre Ajman opened' }
      ],
      significance: 'Despite being smallest, Ajman maintains distinct identity through dhow-building and pearl diving heritage.'
    },
    economy: {
      gdp: 'USD 5 billion (2022)',
      mainSectors: ['Trade', 'Manufacturing', 'Real Estate', 'Fishing'],
      keyFacts: ['Ajman Free Zone hosts 9,000+ companies', 'Traditional dhow-building active', 'Affordable business setup']
    },
    landmarks: [
      { name: 'Ajman Museum', description: '18th-century fort showcasing heritage', established: '1991' },
      { name: 'Ajman Corniche', description: '3km waterfront promenade', established: '2000s' },
      { name: 'Al Zorah Nature Reserve', description: 'Mangrove sanctuary, 12 km²', established: '2008' },
      { name: 'Ajman Dhow Yard', description: 'Traditional boatbuilding facility', established: 'Historic' }
    ],
    achievements: [
      { title: 'Dhow Building Heritage', description: 'Preserved traditional craft', year: 'Ongoing' },
      { title: 'Free Zone Success', description: '9,000+ companies registered', year: '2020' },
      { title: 'Mangrove Conservation', description: 'Al Zorah environmental preservation', year: '2015' }
    ],
    demographics: { population: '540,000', density: '2,085/km²', nationalityMix: '90% expatriates' },
    climate: { averageTemp: '27°C (Summer 40°C, Winter 18°C)', rainfall: '100mm annually', humidity: '60% average', dustSeasons: 'Moderate, similar to Dubai/Sharjah' },
    transportation: { airports: ['Sharjah International (nearest)'], ports: ['Ajman Port'], publicTransit: ['Inter-emirate buses', 'Taxi services'] },
    culture: { heritage: 'Seafaring heritage, dhow building, pearl diving museums', festivals: ['Ajman Heritage Festival', 'National Day'], cuisine: 'Fresh seafood, traditional Emirati dishes' }
  },
  ras_al_khaimah: {
    id: 'ras_al_khaimah',
    name: 'Ras Al Khaimah',
    arabicName: 'رأس الخيمة',
    coordinates: { lat: 25.7895, lon: 55.9432 },
    overview: {
      introduction: 'Ras Al Khaimah is the northernmost emirate with diverse geography including beaches, deserts, and the Hajar Mountains with UAE\'s highest peak.',
      area: '1,684 km²',
      founded: '1708',
      ruler: 'Sheikh Saud bin Saqr Al Qasimi'
    },
    history: {
      timeline: [
        { year: '1708', event: 'Al Qasimi clan established settlement' },
        { year: '1972', event: 'Joined UAE (initially declined in 1971)' },
        { year: '2016', event: 'Jebel Jais Road completed' },
        { year: '2018', event: 'World\'s longest zipline opened' }
      ],
      significance: 'RAK leveraged unique geography to develop adventure tourism while maintaining traditional industries.'
    },
    economy: {
      gdp: 'USD 9 billion (2022)',
      mainSectors: ['Tourism', 'Manufacturing', 'Mining', 'Ceramics'],
      keyFacts: ['RAK Ceramics is world\'s largest', 'Growing adventure tourism', 'RAK Free Zone hosts 15,000+ companies']
    },
    landmarks: [
      { name: 'Jebel Jais', description: 'UAE\'s highest peak at 1,934m', established: 'Natural' },
      { name: 'Dhayah Fort', description: 'Only hilltop fort in UAE', established: '16th century' },
      { name: 'Jais Adventure Peak', description: 'World\'s longest zipline (2.83km)', established: '2018' },
      { name: 'National Museum', description: 'Archaeological and ethnographic collections', established: '1987' }
    ],
    achievements: [
      { title: 'World\'s Longest Zipline', description: 'Jebel Jais Flight spans 2.83km', year: '2018' },
      { title: 'UAE\'s Highest Peak', description: 'Jebel Jais at 1,934m', year: 'Natural' },
      { title: 'Industrial Leader', description: 'RAK Ceramics world\'s largest', year: 'Ongoing' }
    ],
    demographics: { population: '400,000', density: '238/km²', nationalityMix: '70% expatriates' },
    climate: { averageTemp: '26°C (Summer 38°C, Winter 16°C)', rainfall: '120mm (highest in UAE)', humidity: '55% average', dustSeasons: 'Less dust due to mountain barrier' },
    transportation: { airports: ['RAK International (RKT)'], ports: ['Saqr Port', 'RAK Maritime City'], publicTransit: ['Inter-emirate buses', 'Taxi services'] },
    culture: { heritage: 'Maritime and pearling history, mountain communities', festivals: ['RAK Fine Arts Festival', 'Heritage Events'], cuisine: 'Fresh seafood, mountain honey, traditional dishes' }
  },
  fujairah: {
    id: 'fujairah',
    name: 'Fujairah',
    arabicName: 'الفجيرة',
    coordinates: { lat: 25.1288, lon: 56.3265 },
    overview: {
      introduction: 'Fujairah is the only emirate entirely on the eastern coast, facing the Gulf of Oman. It is strategically vital as a bunkering hub bypassing the Strait of Hormuz.',
      area: '1,165 km²',
      founded: '1879',
      ruler: 'Sheikh Hamad bin Mohammed Al Sharqi'
    },
    history: {
      timeline: [
        { year: '1879', event: 'Recognized as independent from Sharjah' },
        { year: '1971', event: 'Founding member of UAE' },
        { year: '1983', event: 'Fujairah Port established' },
        { year: '2012', event: 'ADCOP pipeline became operational' }
      ],
      significance: 'Fujairah\'s strategic location made it vital for oil export diversification, bypassing the Strait of Hormuz.'
    },
    economy: {
      gdp: 'USD 4 billion (2022)',
      mainSectors: ['Oil Bunkering', 'Shipping', 'Tourism', 'Fishing'],
      keyFacts: ['World\'s second largest bunkering hub', 'ADCOP pipeline 1.5M barrels/day', 'Growing diving tourism']
    },
    landmarks: [
      { name: 'Fujairah Fort', description: 'One of oldest forts in UAE, 500+ years', established: '16th century' },
      { name: 'Al Bidya Mosque', description: 'Oldest mosque in UAE with four domes', established: '15th century' },
      { name: 'Snoopy Island', description: 'Popular diving destination', established: 'Natural' },
      { name: 'Ain Al Madhab Hot Springs', description: 'Natural mineral springs', established: 'Natural' }
    ],
    achievements: [
      { title: 'Strategic Oil Hub', description: 'ADCOP bypasses Strait of Hormuz', year: '2012' },
      { title: 'Global Bunkering Center', description: 'Second largest ship refueling port', year: 'Ongoing' },
      { title: 'Oldest Mosque in UAE', description: 'Al Bidya dates to 15th century', year: '1446' }
    ],
    demographics: { population: '250,000', density: '215/km²', nationalityMix: '75% expatriates' },
    climate: { averageTemp: '27°C (Summer 38°C, Winter 18°C)', rainfall: '130mm (highest due to mountains)', humidity: '70% (coastal)', dustSeasons: 'Lower activity due to sea breezes' },
    transportation: { airports: ['Fujairah International (FJR)'], ports: ['Port of Fujairah', 'VOPAK Terminal'], publicTransit: ['Inter-emirate buses', 'Taxi services'] },
    culture: { heritage: 'East Coast culture, bull-fighting traditions, fishing heritage', festivals: ['Fujairah Arts Festival', 'Bull Butting Championships'], cuisine: 'Fresh Gulf of Oman seafood, coastal specialties' }
  },
  umm_al_quwain: {
    id: 'umm_al_quwain',
    name: 'Umm Al Quwain',
    arabicName: 'أم القيوين',
    coordinates: { lat: 25.5647, lon: 55.5532 },
    overview: {
      introduction: 'Umm Al Quwain is the second smallest and least populated emirate, known for peaceful atmosphere, mangrove islands, and traditional fishing.',
      area: '777 km²',
      founded: '1775',
      ruler: 'Sheikh Saud bin Rashid Al Mualla'
    },
    history: {
      timeline: [
        { year: '1775', event: 'Al Mualla family established control' },
        { year: '1971', event: 'Founding member of UAE' },
        { year: '2009', event: 'Current ruler assumed power' },
        { year: '2020', event: 'Free zone expansion' }
      ],
      significance: 'UAQ maintains traditional character as fishing community while developing eco-tourism around mangrove ecosystem.'
    },
    economy: {
      gdp: 'USD 2 billion (2022)',
      mainSectors: ['Fishing', 'Agriculture', 'Poultry', 'Tourism'],
      keyFacts: ['Major poultry production center', 'Traditional fishing active', 'Developing eco-tourism']
    },
    landmarks: [
      { name: 'UAQ Fort', description: 'Historic fort housing national museum', established: '1768' },
      { name: 'Mangrove Islands', description: 'Natural ecosystem for kayaking and bird watching', established: 'Natural' },
      { name: 'Al Sinniyah Island', description: 'Protected nature reserve with 5,000 BCE sites', established: 'Natural' },
      { name: 'UAQ Marine Club', description: 'Water sports center', established: '2000s' }
    ],
    achievements: [
      { title: 'Eco-Tourism Pioneer', description: 'Protected mangrove ecosystem', year: 'Ongoing' },
      { title: 'Archaeological Significance', description: 'Al Dour site dates to 1st century CE', year: '1970s' },
      { title: 'Marine Conservation', description: 'Protected breeding grounds', year: 'Ongoing' }
    ],
    demographics: { population: '80,000', density: '103/km²', nationalityMix: '75% expatriates' },
    climate: { averageTemp: '27°C (Summer 40°C, Winter 18°C)', rainfall: '90mm annually', humidity: '65% average', dustSeasons: 'Moderate, buffered by coast' },
    transportation: { airports: ['Sharjah/Dubai (nearest)'], ports: ['UAQ Port', 'Ahmed Bin Rashid Free Zone'], publicTransit: ['Inter-emirate buses', 'Taxi services'] },
    culture: { heritage: 'Fishing and pearling heritage, dhow building, date agriculture', festivals: ['Fishing Festivals', 'National Day'], cuisine: 'Fresh seafood, locally produced dates and poultry' }
  }
};

export const getCityProfile = (cityId: string): CityProfile | undefined => {
  return cityProfiles[cityId.toLowerCase().replace(/ /g, '_')];
};
