import { Constituency, UPRegion, PoliticalParty } from '../types';

// Curated bellwether and prominent constituencies with historical accuracy from 2022 UP Vidhan Sabha
export const PROMINENT_CONSTITUENCIES: Constituency[] = [
  {
    acNumber: 343,
    name: "Gorakhpur Urban",
    nameHindi: "गोरखपुर शहर",
    district: "Gorakhpur",
    region: "Purvanchal",
    isReserved: "GEN",
    currentMla: "Yogi Adityanath",
    mlaParty: "BJP",
    winnerVotes2022: 165499,
    margin2022: 103390,
    runnerUpParty: "SP",
    runnerUpCandidate: "Subhawati Shukla",
    demographics: {
      totalVoters: 458000,
      ruralPercentage: 8,
      urbanPercentage: 92,
      literacyRate: 83.5,
      scPercentage: 14.2,
      muslimPercentage: 15.6,
      obcPercentage: 36.5,
      upperCastePercentage: 33.7,
      keyCasteFactor: "Brahmin, Kayastha, Nishad, Baniya"
    },
    emotions: {
      antiIncumbency: 12,
      developmentSatisfaction: 89,
      castePolarization: 28,
      lawAndOrderTrust: 94,
      youthDiscontent: 24
    },
    momentumScore: 8.6,
    projectedWinner2027: "BJP",
    status2027: "Safe Incumbent",
    keyLocalIssue: "Urban Drainage, AIIMS OPD expansion, Gorakhpur Metro"
  },
  {
    acNumber: 279,
    name: "Karhal",
    nameHindi: "करहल",
    district: "Mainpuri",
    region: "Braj",
    isReserved: "GEN",
    currentMla: "Akhilesh Yadav",
    mlaParty: "SP",
    winnerVotes2022: 148196,
    margin2022: 67504,
    runnerUpParty: "BJP",
    runnerUpCandidate: "Prof. S.P. Singh Baghel",
    demographics: {
      totalVoters: 372000,
      ruralPercentage: 88,
      urbanPercentage: 12,
      literacyRate: 74.2,
      scPercentage: 17.5,
      muslimPercentage: 9.8,
      obcPercentage: 54.2,
      upperCastePercentage: 18.5,
      keyCasteFactor: "Yadav (dominant ~38%), Shakya, Dalit"
    },
    emotions: {
      antiIncumbency: 22,
      developmentSatisfaction: 62,
      castePolarization: 68,
      lawAndOrderTrust: 52,
      youthDiscontent: 59
    },
    momentumScore: 7.4,
    projectedWinner2027: "SP",
    status2027: "Safe Incumbent",
    keyLocalIssue: "Potato Cold Storage MSP, Irrigation Power, Rural Roads"
  },
  {
    acNumber: 384,
    name: "Varanasi South",
    nameHindi: "वाराणसी दक्षिण",
    district: "Varanasi",
    region: "Purvanchal",
    isReserved: "GEN",
    currentMla: "Dr. Neelkanth Tiwari",
    mlaParty: "BJP",
    winnerVotes2022: 99650,
    margin2022: 10722,
    runnerUpParty: "SP",
    runnerUpCandidate: "Kameshwar Nath Dixit",
    demographics: {
      totalVoters: 312000,
      ruralPercentage: 0,
      urbanPercentage: 100,
      literacyRate: 81.2,
      scPercentage: 11.2,
      muslimPercentage: 32.4,
      obcPercentage: 27.8,
      upperCastePercentage: 28.6,
      keyCasteFactor: "Muslim Weavers, Brahmin, Gujarati/Marwari traders"
    },
    emotions: {
      antiIncumbency: 38,
      developmentSatisfaction: 74,
      castePolarization: 72,
      lawAndOrderTrust: 86,
      youthDiscontent: 42
    },
    momentumScore: 2.1,
    projectedWinner2027: "BJP",
    status2027: "Lean Incumbent",
    keyLocalIssue: "Weaver electricity subsidy, Kashi Corridor tourism management"
  },
  {
    acNumber: 171,
    name: "Lucknow Cantt",
    nameHindi: "लखनऊ छावनी",
    district: "Lucknow",
    region: "Awadh",
    isReserved: "GEN",
    currentMla: "Brajesh Pathak",
    mlaParty: "BJP",
    winnerVotes2022: 108147,
    margin2022: 39512,
    runnerUpParty: "SP",
    runnerUpCandidate: "Surendra Singh Gandhi",
    demographics: {
      totalVoters: 395000,
      ruralPercentage: 2,
      urbanPercentage: 98,
      literacyRate: 86.4,
      scPercentage: 16.8,
      muslimPercentage: 14.1,
      obcPercentage: 29.5,
      upperCastePercentage: 39.6,
      keyCasteFactor: "Brahmin, Punjabi/Khatri, Defense personnel"
    },
    emotions: {
      antiIncumbency: 26,
      developmentSatisfaction: 80,
      castePolarization: 34,
      lawAndOrderTrust: 88,
      youthDiscontent: 36
    },
    momentumScore: 5.3,
    projectedWinner2027: "BJP",
    status2027: "Safe Incumbent",
    keyLocalIssue: "Cantonment civil land mutation, Smart City infrastructure"
  },
  {
    acNumber: 14,
    name: "Muzaffarnagar",
    nameHindi: "मुजफ्फरनगर",
    district: "Muzaffarnagar",
    region: "Western UP",
    isReserved: "GEN",
    currentMla: "Kapil Dev Aggarwal",
    mlaParty: "BJP",
    winnerVotes2022: 111794,
    margin2022: 18694,
    runnerUpParty: "RLD",
    runnerUpCandidate: "Saurabh Swaroop",
    demographics: {
      totalVoters: 365000,
      ruralPercentage: 12,
      urbanPercentage: 88,
      literacyRate: 77.8,
      scPercentage: 13.9,
      muslimPercentage: 36.2,
      obcPercentage: 28.4,
      upperCastePercentage: 21.5,
      keyCasteFactor: "Vaishya, Muslim, Jat, Gurjar"
    },
    emotions: {
      antiIncumbency: 44,
      developmentSatisfaction: 66,
      castePolarization: 65,
      lawAndOrderTrust: 81,
      youthDiscontent: 54
    },
    momentumScore: 1.4,
    projectedWinner2027: "BJP",
    status2027: "Toss-up / Battleground",
    keyLocalIssue: "Sugarcane payment schedule, Steel & Paper mill tariffs"
  },
  {
    acNumber: 125,
    name: "Chhibramau",
    nameHindi: "छिबरामऊ",
    district: "Kannauj",
    region: "Awadh",
    isReserved: "GEN",
    currentMla: "Archana Pandey",
    mlaParty: "BJP",
    winnerVotes2022: 124390,
    margin2022: 1111,
    runnerUpParty: "SP",
    runnerUpCandidate: "Arvind Yadav",
    demographics: {
      totalVoters: 442000,
      ruralPercentage: 81,
      urbanPercentage: 19,
      literacyRate: 72.8,
      scPercentage: 19.3,
      muslimPercentage: 12.1,
      obcPercentage: 46.2,
      upperCastePercentage: 22.4,
      keyCasteFactor: "Brahmin vs Yadav + Lodhi balance"
    },
    emotions: {
      antiIncumbency: 58,
      developmentSatisfaction: 51,
      castePolarization: 62,
      lawAndOrderTrust: 68,
      youthDiscontent: 64
    },
    momentumScore: -2.8,
    projectedWinner2027: "SP",
    status2027: "Probable Flip",
    keyLocalIssue: "Potato Cold storage rates, Rural Mandi expansion"
  },
  {
    acNumber: 177,
    name: "Amethi",
    nameHindi: "अमेठी",
    district: "Amethi",
    region: "Awadh",
    isReserved: "GEN",
    currentMla: "Maharaji Prajapati",
    mlaParty: "SP",
    winnerVotes2022: 89417,
    margin2022: 18096,
    runnerUpParty: "BJP",
    runnerUpCandidate: "Dr. Sanjay Sinh",
    demographics: {
      totalVoters: 348000,
      ruralPercentage: 91,
      urbanPercentage: 9,
      literacyRate: 69.2,
      scPercentage: 26.4,
      muslimPercentage: 18.2,
      obcPercentage: 35.8,
      upperCastePercentage: 19.6,
      keyCasteFactor: "Dalit (Pasi), Prajapati (Kumhar), Brahmin, Rajput"
    },
    emotions: {
      antiIncumbency: 32,
      developmentSatisfaction: 58,
      castePolarization: 49,
      lawAndOrderTrust: 61,
      youthDiscontent: 58
    },
    momentumScore: 4.2,
    projectedWinner2027: "SP",
    status2027: "Lean Incumbent",
    keyLocalIssue: "Industrial cluster revival, Youth employment, Primary healthcare"
  },
  {
    acNumber: 275,
    name: "Ayodhya",
    nameHindi: "अयोध्या",
    district: "Ayodhya",
    region: "Awadh",
    isReserved: "GEN",
    currentMla: "Ved Prakash Gupta",
    mlaParty: "BJP",
    winnerVotes2022: 113414,
    margin2022: 19990,
    runnerUpParty: "SP",
    runnerUpCandidate: "Tej Narayan Pandey alias Pawan Pandey",
    demographics: {
      totalVoters: 387000,
      ruralPercentage: 42,
      urbanPercentage: 58,
      literacyRate: 76.5,
      scPercentage: 16.5,
      muslimPercentage: 14.8,
      obcPercentage: 38.2,
      upperCastePercentage: 30.5,
      keyCasteFactor: "Vaishya, Brahmin, Kurmi, Yadav"
    },
    emotions: {
      antiIncumbency: 46,
      developmentSatisfaction: 81,
      castePolarization: 55,
      lawAndOrderTrust: 89,
      youthDiscontent: 49
    },
    momentumScore: -1.2,
    projectedWinner2027: "BJP",
    status2027: "Toss-up / Battleground",
    keyLocalIssue: "Land acquisition compensation for Ram Path, local trader livelihood"
  },
  {
    acNumber: 56,
    name: "Noida",
    nameHindi: "नोएडा",
    district: "Gautam Buddha Nagar",
    region: "Western UP",
    isReserved: "GEN",
    currentMla: "Pankaj Singh",
    mlaParty: "BJP",
    winnerVotes2022: 244319,
    margin2022: 181513,
    runnerUpParty: "SP",
    runnerUpCandidate: "Sunil Choudhary",
    demographics: {
      totalVoters: 712000,
      ruralPercentage: 4,
      urbanPercentage: 96,
      literacyRate: 88.9,
      scPercentage: 9.4,
      muslimPercentage: 11.2,
      obcPercentage: 24.1,
      upperCastePercentage: 55.3,
      keyCasteFactor: "Rajput, Brahmin, High-income apartment owners, Gurjar"
    },
    emotions: {
      antiIncumbency: 16,
      developmentSatisfaction: 85,
      castePolarization: 22,
      lawAndOrderTrust: 91,
      youthDiscontent: 31
    },
    momentumScore: 9.1,
    projectedWinner2027: "BJP",
    status2027: "Safe Incumbent",
    keyLocalIssue: "Flat registry delays, builder-buyer disputes, pollution"
  },
  {
    acNumber: 356,
    name: "Mau",
    nameHindi: "मऊ",
    district: "Mau",
    region: "Purvanchal",
    isReserved: "GEN",
    currentMla: "Abbas Ansari",
    mlaParty: "SBSP",
    winnerVotes2022: 124691,
    margin2022: 38116,
    runnerUpParty: "BJP",
    runnerUpCandidate: "Ashok Kumar Singh",
    demographics: {
      totalVoters: 492000,
      ruralPercentage: 35,
      urbanPercentage: 65,
      literacyRate: 74.5,
      scPercentage: 17.8,
      muslimPercentage: 34.6,
      obcPercentage: 33.4,
      upperCastePercentage: 14.2,
      keyCasteFactor: "Muslim Weavers, Rajbhar, Dalit (Jatav)"
    },
    emotions: {
      antiIncumbency: 52,
      developmentSatisfaction: 44,
      castePolarization: 82,
      lawAndOrderTrust: 55,
      youthDiscontent: 68
    },
    momentumScore: -3.5,
    projectedWinner2027: "SP",
    status2027: "Toss-up / Battleground",
    keyLocalIssue: "Power loom tariffs, Jail detention legal battles, Yarn prices"
  },
  {
    acNumber: 222,
    name: "Banda",
    nameHindi: "बांदा",
    district: "Banda",
    region: "Bundelkhand",
    isReserved: "GEN",
    currentMla: "Prakash Dwivedi",
    mlaParty: "BJP",
    winnerVotes2022: 96547,
    margin2022: 12114,
    runnerUpParty: "SP",
    runnerUpCandidate: "Manjula Singh",
    demographics: {
      totalVoters: 326000,
      ruralPercentage: 72,
      urbanPercentage: 28,
      literacyRate: 71.4,
      scPercentage: 22.1,
      muslimPercentage: 13.5,
      obcPercentage: 42.1,
      upperCastePercentage: 22.3,
      keyCasteFactor: "Brahmin, Nishad/Kewat, Yadav, Dalit"
    },
    emotions: {
      antiIncumbency: 48,
      developmentSatisfaction: 62,
      castePolarization: 45,
      lawAndOrderTrust: 75,
      youthDiscontent: 67
    },
    momentumScore: -0.8,
    projectedWinner2027: "BJP",
    status2027: "Lean Incumbent",
    keyLocalIssue: "Ken-Betwa river linking project, stray cattle, drinking water"
  },
  {
    acNumber: 111,
    name: "Katra",
    nameHindi: "कटरा",
    district: "Shahjahanpur",
    region: "Rohilkhand",
    isReserved: "GEN",
    currentMla: "Veer Vikram Singh alias Prince",
    mlaParty: "BJP",
    winnerVotes2022: 78540,
    margin2022: 357,
    runnerUpParty: "SP",
    runnerUpCandidate: "Rajesh Yadav",
    demographics: {
      totalVoters: 341000,
      ruralPercentage: 86,
      urbanPercentage: 14,
      literacyRate: 64.8,
      scPercentage: 21.4,
      muslimPercentage: 19.2,
      obcPercentage: 41.5,
      upperCastePercentage: 17.9,
      keyCasteFactor: "Yadav, Kurmi, Muslim, Rajput"
    },
    emotions: {
      antiIncumbency: 59,
      developmentSatisfaction: 49,
      castePolarization: 64,
      lawAndOrderTrust: 65,
      youthDiscontent: 72
    },
    momentumScore: -4.1,
    projectedWinner2027: "SP",
    status2027: "Probable Flip",
    keyLocalIssue: "Flood relief in Garra river basin, Sugarcane mill arrears"
  }
];

// Helper to generate representative 403 constituencies dataset
const REGION_DISTRICT_MAP: Record<UPRegion, string[]> = {
  "Western UP": ["Saharanpur", "Shamli", "Muzaffarnagar", "Baghpat", "Meerut", "Ghaziabad", "Hapur", "Gautam Buddha Nagar", "Bulandshahr"],
  "Rohilkhand": ["Bijnor", "Moradabad", "Sambhal", "Rampur", "Amroha", "Badaun", "Bareilly", "Pilibhit", "Shahjahanpur"],
  "Braj": ["Aligarh", "Hathras", "Mathura", "Agra", "Firozabad", "Kasganj", "Etah", "Mainpuri"],
  "Awadh": ["Kheri", "Sitapur", "Hardoi", "Unnao", "Lucknow", "Rae Bareli", "Amethi", "Sultanpur", "Barabanki", "Ayodhya", "Ambedkar Nagar", "Bahraich", "Shravasti", "Balrampur", "Gonda"],
  "Purvanchal": ["Siddharthnagar", "Basti", "Sant Kabir Nagar", "Maharajganj", "Gorakhpur", "Kushinagar", "Deoria", "Azamgarh", "Mau", "Ballia", "Jaunpur", "Ghazipur", "Chandauli", "Varanasi", "Bhadohi", "Mirzapur", "Sonbhadra", "Prayagraj", "Pratapgarh", "Kaushambi", "Fatehpur"],
  "Bundelkhand": ["Jalaun", "Jhansi", "Lalitpur", "Hamirpur", "Mahoba", "Banda", "Chitrakoot"]
};

const COMMON_PARTIES: PoliticalParty[] = ['BJP', 'SP', 'RLD', 'AD(S)', 'NISHAD', 'SBSP', 'INC', 'BSP', 'Jansatta Dal'];

export function generateAll403Constituencies(): Constituency[] {
  const list: Constituency[] = [...PROMINENT_CONSTITUENCIES];
  const prominentIds = new Set(PROMINENT_CONSTITUENCIES.map(c => c.acNumber));

  let currentAc = 1;
  const regions: UPRegion[] = ["Western UP", "Rohilkhand", "Braj", "Awadh", "Purvanchal", "Bundelkhand"];

  // Weights representing 2022 Vidhan Sabha results
  // BJP alliance won 273 (BJP 255, AD(S) 12, NISHAD 6)
  // SP alliance won 125 (SP 111, RLD 8, SBSP 6)
  // INC 2, BSP 1, Jansatta Dal 2
  while (currentAc <= 403) {
    if (prominentIds.has(currentAc)) {
      currentAc++;
      continue;
    }

    // Determine region and district
    const regionIdx = Math.floor((currentAc - 1) / (403 / regions.length));
    const region = regions[Math.min(regionIdx, regions.length - 1)];
    const districts = REGION_DISTRICT_MAP[region];
    const district = districts[(currentAc * 7) % districts.length];

    // Party probability according to region & historical ground reality
    let mlaParty: PoliticalParty = 'BJP';
    const rand = (currentAc * 1337) % 100;
    
    if (region === 'Western UP') {
      if (rand < 55) mlaParty = 'BJP';
      else if (rand < 75) mlaParty = 'RLD';
      else if (rand < 95) mlaParty = 'SP';
      else mlaParty = 'BSP';
    } else if (region === 'Rohilkhand') {
      if (rand < 48) mlaParty = 'SP';
      else if (rand < 92) mlaParty = 'BJP';
      else mlaParty = 'BSP';
    } else if (region === 'Purvanchal') {
      if (rand < 58) mlaParty = 'BJP';
      else if (rand < 82) mlaParty = 'SP';
      else if (rand < 90) mlaParty = 'AD(S)';
      else if (rand < 95) mlaParty = 'NISHAD';
      else mlaParty = 'SBSP';
    } else if (region === 'Awadh') {
      if (rand < 68) mlaParty = 'BJP';
      else if (rand < 90) mlaParty = 'SP';
      else if (rand < 96) mlaParty = 'INC';
      else mlaParty = 'Jansatta Dal';
    } else {
      // Bundelkhand / Braj
      if (rand < 72) mlaParty = 'BJP';
      else mlaParty = 'SP';
    }

    const runnerUpParty: PoliticalParty = mlaParty === 'BJP' ? 'SP' : 'BJP';
    const margin = 2000 + ((currentAc * 311) % 28000);
    const winnerVotes = 65000 + ((currentAc * 487) % 45000);
    const isReserved: 'GEN' | 'SC' | 'ST' = currentAc % 5 === 0 ? 'SC' : (currentAc === 402 ? 'ST' : 'GEN');

    // Emotion & momentum calculus
    const antiIncumbency = 25 + ((currentAc * 17) % 55);
    const developmentSatisfaction = 45 + ((currentAc * 23) % 45);
    const castePolarization = 35 + ((currentAc * 31) % 50);
    const lawAndOrderTrust = 50 + ((currentAc * 19) % 45);
    const youthDiscontent = 30 + ((currentAc * 29) % 55);

    // Momentum delta for 2027
    const momentum = ((100 - antiIncumbency) - 50) / 7 + ((currentAc % 7) - 3) * 0.4;
    const roundedMomentum = Math.round(momentum * 10) / 10;

    let status2027: Constituency['status2027'] = 'Lean Incumbent';
    let projectedWinner2027: PoliticalParty = mlaParty;

    if (Math.abs(margin) < 5000 && roundedMomentum < 0) {
      status2027 = 'Probable Flip';
      projectedWinner2027 = runnerUpParty;
    } else if (Math.abs(roundedMomentum) < 1.5 || margin < 8000) {
      status2027 = 'Toss-up / Battleground';
      projectedWinner2027 = roundedMomentum >= 0 ? mlaParty : runnerUpParty;
    } else if (roundedMomentum > 4.0) {
      status2027 = 'Safe Incumbent';
      projectedWinner2027 = mlaParty;
    }

    list.push({
      acNumber: currentAc,
      name: `AC-${currentAc} ${district} Segment`,
      nameHindi: `विधान सभा क्षेत्र संख्या ${currentAc} (${district})`,
      district,
      region,
      isReserved,
      currentMla: `MLA ${district} ${currentAc}`,
      mlaParty,
      winnerVotes2022: winnerVotes,
      margin2022: margin,
      runnerUpParty,
      runnerUpCandidate: `Runner-up ${runnerUpParty}`,
      demographics: {
        totalVoters: 310000 + ((currentAc * 791) % 120000),
        ruralPercentage: Math.max(10, 85 - ((currentAc * 3) % 70)),
        urbanPercentage: Math.min(90, 15 + ((currentAc * 3) % 70)),
        literacyRate: 67 + ((currentAc * 5) % 22),
        scPercentage: 14 + ((currentAc * 3) % 16),
        muslimPercentage: 10 + ((currentAc * 7) % 30),
        obcPercentage: 35 + ((currentAc * 4) % 25),
        upperCastePercentage: 15 + ((currentAc * 2) % 20),
        keyCasteFactor: "OBC + Dalit + Upper Caste dynamic"
      },
      emotions: {
        antiIncumbency,
        developmentSatisfaction,
        castePolarization,
        lawAndOrderTrust,
        youthDiscontent
      },
      momentumScore: roundedMomentum,
      projectedWinner2027,
      status2027,
      keyLocalIssue: "Youth employment, Rural roads, Irrigation power tariff"
    });

    currentAc++;
  }

  return list.sort((a, b) => a.acNumber - b.acNumber);
}

export const ALL_CONSTITUENCIES: Constituency[] = generateAll403Constituencies();

export const PARTY_COLORS: Record<PoliticalParty, { bg: string; text: string; hex: string; border: string; glow: string }> = {
  BJP: { bg: 'bg-orange-100', text: 'text-orange-700', hex: '#ea580c', border: 'border-orange-200', glow: 'none' },
  SP: { bg: 'bg-red-100', text: 'text-red-700', hex: '#dc2626', border: 'border-red-200', glow: 'none' },
  BSP: { bg: 'bg-blue-100', text: 'text-blue-700', hex: '#2563eb', border: 'border-blue-200', glow: 'none' },
  INC: { bg: 'bg-emerald-100', text: 'text-emerald-700', hex: '#059669', border: 'border-emerald-200', glow: 'none' },
  RLD: { bg: 'bg-amber-100', text: 'text-amber-700', hex: '#d97706', border: 'border-amber-200', glow: 'none' },
  'AD(S)': { bg: 'bg-purple-100', text: 'text-purple-700', hex: '#9333ea', border: 'border-purple-200', glow: 'none' },
  NISHAD: { bg: 'bg-cyan-100', text: 'text-cyan-700', hex: '#0891b2', border: 'border-cyan-200', glow: 'none' },
  SBSP: { bg: 'bg-yellow-100', text: 'text-yellow-700', hex: '#ca8a04', border: 'border-yellow-200', glow: 'none' },
  'Jansatta Dal': { bg: 'bg-pink-100', text: 'text-pink-700', hex: '#db2777', border: 'border-pink-200', glow: 'none' },
  IND: { bg: 'bg-stone-100', text: 'text-stone-700', hex: '#57534e', border: 'border-stone-200', glow: 'none' },
  OTH: { bg: 'bg-neutral-100', text: 'text-neutral-700', hex: '#525252', border: 'border-neutral-200', glow: 'none' }
};
