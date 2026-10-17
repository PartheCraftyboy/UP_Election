import { NewsArticle, GraphNode, GraphLink } from '../types';
import { ALL_CONSTITUENCIES } from './upConstituencies';

export const INITIAL_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: "news-01",
    title: "UP Cabinet Approves Stringent Anti-Paper Leak Law with Life Imprisonment & 1 Cr Fine",
    titleHindi: "यूपी कैबिनेट ने कड़े पेपर लीक विरोधी कानून को दी मंजूरी: उम्रकैद और 1 करोड़ जुर्माने का प्रावधान",
    source: "Dainik Jagran / UP Bureau",
    timestamp: "18 mins ago",
    summary: "Chief Minister Yogi Adityanath announced emergency ordinance to curb recruitment exam malpractices, ordering fast-track special courts and strict confiscation of solver gang assets.",
    sentimentScore: 0.72,
    impactMagnitude: 8.5,
    relatedParties: ["BJP"],
    affectedConstituencies: [171, 343, 275, 14, 222], // Lucknow Cantt, Gorakhpur, Ayodhya, etc.
    affectedRegion: "Statewide",
    primaryIssue: "Youth & Paper Leaks",
    emotionVector: {
      anger: 18,
      hope: 78,
      discontent: 25,
      pride: 84
    },
    pollImpactSummary: "Significantly cushions youth discontent across 62 student-heavy urban & semi-urban constituencies in Awadh and Purvanchal. Reassures competitive exam aspirants."
  },
  {
    id: "news-02",
    title: "Kisan Mahapanchayat in Muzaffarnagar Demands Immediate Sugarcane SAP Hike to ₹425/Quintal",
    titleHindi: "मुजफ्फरनगर में किसान महापंचायत: गन्ने का राज्य परामर्शित मूल्य (SAP) ₹425 प्रति क्विंटल करने की मांग",
    source: "Amar Ujala / Western UP Desk",
    timestamp: "42 mins ago",
    summary: "Bharatiya Kisan Union (BKU) along with RLD and SP grassroots cadres hold massive rally at GIC ground demanding early clearance of sugar mill dues and free tubewell electricity rollout.",
    sentimentScore: -0.48,
    impactMagnitude: 7.9,
    relatedParties: ["RLD", "SP", "BJP"],
    affectedConstituencies: [14, 56, 111], // Muzaffarnagar, Noida, Katra
    affectedRegion: "Western UP",
    primaryIssue: "Sugarcane & Farm MSP",
    emotionVector: {
      anger: 68,
      hope: 42,
      discontent: 74,
      pride: 30
    },
    pollImpactSummary: "Mounts competitive pressure on BJP-RLD alliance in 38 sugarcane-belt seats. SP cadre attempts to capitalize on payment delay narratives."
  },
  {
    id: "news-03",
    title: "Samajwadi PDA Samvad Expands Across Purvanchal: Akhilesh Emphasizes Caste Census Demand",
    titleHindi: "पूर्वांचल में सपा का पीडीए संवाद तेज: अखिलेश यादव ने जातिगत जनगणना और आरक्षण सीमा हटाने पर दिया जोर",
    source: "Hindustan / Lucknow",
    timestamp: "1 hr ago",
    summary: "SP Chief Akhilesh Yadav addresses massive grassroots gathering in Azamgarh and Mau, consolidating Pichhda-Dalit-Alpsankhyak (PDA) coalition ahead of 2027 Vidhan Sabha preparations.",
    sentimentScore: 0.65,
    impactMagnitude: 8.2,
    relatedParties: ["SP", "INC"],
    affectedConstituencies: [279, 356, 177, 125], // Karhal, Mau, Amethi, Chhibramau
    affectedRegion: "Purvanchal",
    primaryIssue: "Caste Census / Reservation",
    emotionVector: {
      anger: 44,
      hope: 81,
      discontent: 60,
      pride: 75
    },
    pollImpactSummary: "Solidifies core non-Yadav OBC and Dalit outreach in 45 Purvanchal constituencies, tightening projected contest in Mau, Ghazipur, and Azamgarh."
  },
  {
    id: "news-04",
    title: "Ayodhya Ram Path Traders Reach New Compensation & Rehabilitation Settlement with Administration",
    titleHindi: "अयोध्या राम पथ व्यापारियों और प्रशासन के बीच पुनर्वास और मुआवजा पैकेज पर सहमति",
    source: "The Hindu / UP Bureau",
    timestamp: "2 hrs ago",
    summary: "District administration formalizes upgraded commercial compensation and multi-level vendor shopping plaza allocations for shopkeepers displaced along the Ram Path corridor.",
    sentimentScore: 0.58,
    impactMagnitude: 6.8,
    relatedParties: ["BJP"],
    affectedConstituencies: [275, 171], // Ayodhya, Lucknow Cantt
    affectedRegion: "Awadh",
    primaryIssue: "Urban Development & Traders",
    emotionVector: {
      anger: 22,
      hope: 69,
      discontent: 31,
      pride: 77
    },
    pollImpactSummary: "Helps defuse urban merchant disquiet in Ayodhya Assembly (AC 275), stabilizing local trading community sentiment in Awadh."
  },
  {
    id: "news-05",
    title: "Bundelkhand Expressway Industrial Corridor: ₹12,000 Cr Defense & EV Manufacturing MoUs Grounded",
    titleHindi: "बुंदेलखंड एक्सप्रेसवे औद्योगिक गलियारा: ₹12,000 करोड़ के डिफेंस और ईवी विनिर्माण एमओयू धरातल पर",
    source: "Financial Express / Invest UP",
    timestamp: "3 hrs ago",
    summary: "Invest UP confirms fast-tracked land allotments across Jalaun, Jhansi, and Banda nodes. Over 28,000 direct youth employment opportunities projected over the next 24 months.",
    sentimentScore: 0.82,
    impactMagnitude: 7.4,
    relatedParties: ["BJP"],
    affectedConstituencies: [222], // Banda
    affectedRegion: "Bundelkhand",
    primaryIssue: "AIIMS & Infrastructure",
    emotionVector: {
      anger: 10,
      hope: 88,
      discontent: 15,
      pride: 89
    },
    pollImpactSummary: "Injects substantial pro-development momentum in Bundelkhand's 19 seats, neutralizing drought and water distress narratives."
  },
  {
    id: "news-06",
    title: "BSP Supremo Mayawati Convenes All-UP Zonal Coordinators; Reaffirms Solo 403-Seat Contest Strategy",
    titleHindi: "बसपा सुप्रीमो मायावती ने बुलाई राज्यस्तरीय बैठक: 403 सीटों पर अकेले दम पर चुनाव लड़ने का संकल्प दोहराया",
    source: "NDTV India / Lucknow",
    timestamp: "4 hrs ago",
    summary: "Mayawati warns grassroots workers against coalition rumors, prioritizing cadre revival in Western UP and Braj belts to reclaim core Bahujan vote share from SP and Congress.",
    sentimentScore: 0.20,
    impactMagnitude: 6.5,
    relatedParties: ["BSP"],
    affectedConstituencies: [14, 111, 356, 384],
    affectedRegion: "Statewide",
    primaryIssue: "Caste Census / Reservation",
    emotionVector: {
      anger: 35,
      hope: 52,
      discontent: 48,
      pride: 62
    },
    pollImpactSummary: "Guarantees three-way or four-way triangular contests in 110 reserved and semi-rural constituencies, elevating tactical margin volatility."
  }
];

// Generate Knowledge Graph Nodes and Links
export function generateObsidianGraphData(): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  // 1. Parties
  const parties: { id: string; label: string; party: any; val: number }[] = [
    { id: "party-bjp", label: "BJP (NDA)", party: "BJP", val: 32 },
    { id: "party-sp", label: "Samajwadi Party", party: "SP", val: 30 },
    { id: "party-bsp", label: "Bahujan Samaj Party", party: "BSP", val: 22 },
    { id: "party-inc", label: "INC (Congress)", party: "INC", val: 18 },
    { id: "party-rld", label: "Rashtriya Lok Dal", party: "RLD", val: 16 },
    { id: "party-ad", label: "Apna Dal (S)", party: "AD(S)", val: 15 },
    { id: "party-nishad", label: "NISHAD Party", party: "NISHAD", val: 14 }
  ];

  parties.forEach(p => {
    nodes.push({
      id: p.id,
      label: p.label,
      category: "party",
      val: p.val,
      party: p.party,
      desc: "Major Political Formation in UP 2027"
    });
  });

  // 2. Leaders
  const leaders: { id: string; label: string; party: any; desc: string; val: number }[] = [
    { id: "ldr-yogi", label: "Yogi Adityanath", party: "BJP", desc: "Chief Minister, UP (Gorakhpur Urban MLA)", val: 28 },
    { id: "ldr-akhilesh", label: "Akhilesh Yadav", party: "SP", desc: "Former CM, Leader of Opposition (Karhal)", val: 26 },
    { id: "ldr-mayawati", label: "Mayawati", party: "BSP", desc: "BSP National President, 4-time former CM", val: 20 },
    { id: "ldr-jayant", label: "Jayant Chaudhary", party: "RLD", desc: "RLD Chief, Union Minister", val: 16 },
    { id: "ldr-brajesh", label: "Brajesh Pathak", party: "BJP", desc: "Deputy CM, Lucknow Cantt MLA", val: 15 },
    { id: "ldr-keshav", label: "Keshav Prasad Maurya", party: "BJP", desc: "Deputy CM, OBC Face", val: 16 },
    { id: "ldr-anupriya", label: "Anupriya Patel", party: "AD(S)", desc: "Union Minister, Kurmi Base Leader", val: 14 }
  ];

  leaders.forEach(l => {
    nodes.push({
      id: l.id,
      label: l.label,
      category: "leader",
      val: l.val,
      party: l.party,
      desc: l.desc
    });
  });

  // 3. Core Issues
  const issues: { id: string; label: string; desc: string; val: number }[] = [
    { id: "iss-paperleak", label: "Youth & Paper Leaks", desc: "Recruitment exams, aspirant welfare, anti-cheating law", val: 22 },
    { id: "iss-sugarcane", label: "Sugarcane & Farm MSP", desc: "SAP price hike, private mill payment arrears, irrigation", val: 20 },
    { id: "iss-caste", label: "Caste Census & Reservation", desc: "PDA arithmetic, non-Yadav OBC, Dalit outreach, sub-categorization", val: 24 },
    { id: "iss-laworder", label: "Law & Order / Bulldozer Action", desc: "Mafia crackdown, public safety, policing reforms", val: 22 },
    { id: "iss-infra", label: "Expressways & Defense Corridor", desc: "Bundelkhand Corridor, Gorakhpur Link, Ayodhya & Kashi infra", val: 20 },
    { id: "iss-welfare", label: "Direct Welfare & Free Ration", desc: "PMAY housing, PM-Kisan, free ration scheme saturation", val: 19 }
  ];

  issues.forEach(i => {
    nodes.push({
      id: i.id,
      label: i.label,
      category: "issue",
      val: i.val,
      desc: i.desc
    });
  });

  // 4. Prominent Constituencies as anchor nodes
  ALL_CONSTITUENCIES.slice(0, 16).forEach(c => {
    nodes.push({
      id: `ac-${c.acNumber}`,
      label: `${c.name} (#${c.acNumber})`,
      labelHindi: c.nameHindi,
      category: "constituency",
      val: 18,
      party: c.mlaParty,
      region: c.region,
      acNumber: c.acNumber,
      desc: `Incumbent: ${c.currentMla} (${c.mlaParty}) | Margin: ${c.margin2022.toLocaleString()}`
    });
  });

  // 5. News Nodes
  INITIAL_NEWS_ARTICLES.forEach(n => {
    nodes.push({
      id: n.id,
      label: n.title.slice(0, 36) + "...",
      labelHindi: n.titleHindi,
      category: "news",
      val: 20,
      sentiment: n.sentimentScore,
      desc: n.summary
    });
  });

  // Create Obsidian Force-Links:
  // Link Leaders to Parties
  links.push(
    { source: "ldr-yogi", target: "party-bjp", weight: 3, impactType: "favorable", description: "Chief Executive Face" },
    { source: "ldr-brajesh", target: "party-bjp", weight: 2, impactType: "favorable" },
    { source: "ldr-keshav", target: "party-bjp", weight: 2, impactType: "favorable" },
    { source: "ldr-akhilesh", target: "party-sp", weight: 3, impactType: "favorable" },
    { source: "ldr-mayawati", target: "party-bsp", weight: 3, impactType: "favorable" },
    { source: "ldr-jayant", target: "party-rld", weight: 3, impactType: "favorable" },
    { source: "party-rld", target: "party-bjp", weight: 2, impactType: "favorable", description: "NDA Coalition Partner" },
    { source: "ldr-anupriya", target: "party-ad", weight: 2, impactType: "favorable" },
    { source: "party-ad", target: "party-bjp", weight: 2, impactType: "favorable" }
  );

  // Link Constituencies to Incumbents & Leaders
  links.push(
    { source: "ldr-yogi", target: "ac-343", weight: 4, impactType: "favorable", description: "Home Constituency" },
    { source: "ldr-akhilesh", target: "ac-279", weight: 4, impactType: "favorable", description: "Home Constituency" },
    { source: "ldr-brajesh", target: "ac-171", weight: 3, impactType: "favorable" }
  );

  // Link Issues to Parties
  links.push(
    { source: "iss-laworder", target: "party-bjp", weight: 3, impactType: "favorable", description: "Flagship Governance Plank" },
    { source: "iss-caste", target: "party-sp", weight: 3, impactType: "favorable", description: "PDA Ideological Focus" },
    { source: "iss-sugarcane", target: "party-rld", weight: 2, impactType: "neutral" },
    { source: "iss-paperleak", target: "party-sp", weight: 2, impactType: "polarizing", description: "Major Opposition Battleground" },
    { source: "iss-infra", target: "party-bjp", weight: 3, impactType: "favorable" }
  );

  // Synaptic Links from News to Issues and Constituencies
  INITIAL_NEWS_ARTICLES.forEach(n => {
    // News to primary issue
    const issueMap: Record<string, string> = {
      "Youth & Paper Leaks": "iss-paperleak",
      "Sugarcane & Farm MSP": "iss-sugarcane",
      "Caste Census / Reservation": "iss-caste",
      "Urban Development & Traders": "iss-infra",
      "AIIMS & Infrastructure": "iss-infra"
    };

    const targetIssue = issueMap[n.primaryIssue];
    if (targetIssue) {
      links.push({
        source: n.id,
        target: targetIssue,
        weight: 3,
        impactType: n.sentimentScore > 0 ? "favorable" : "unfavorable",
        description: `Catalyzes ${n.primaryIssue}`
      });
    }

    // News to affected constituencies
    n.affectedConstituencies.forEach(acNum => {
      const targetAcNode = `ac-${acNum}`;
      links.push({
        source: n.id,
        target: targetAcNode,
        weight: 2,
        impactType: n.sentimentScore > 0 ? "favorable" : "unfavorable",
        description: n.pollImpactSummary
      });
    });
  });

  return { nodes, links };
}

export const H200_METRICS_DATA = {
  gpuName: "NVIDIA H200 SXM5 Tensor Core (141GB HBM3e)",
  vramTotalGb: 141.0,
  vramUsedGb: 46.8,
  utilizationPct: 93.4,
  temperatureC: 54,
  tflops: 989.4,
  modelName: "UP-IndicLlama-3.3-70B-ElectionSentinel-v2",
  parameterCount: "70.6 Billion (LoRA Rank=64, Alpha=128)",
  contextWindow: "128k Tokens (RoPE scaled)",
  avgInferenceMs: 14.8,
  lossValue: 0.842,
  samplesProcessed: 284910,
  activeBatchSize: 32
};
