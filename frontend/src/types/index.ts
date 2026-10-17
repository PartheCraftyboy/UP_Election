export type PoliticalParty = 
  | 'BJP' 
  | 'SP' 
  | 'BSP' 
  | 'INC' 
  | 'RLD' 
  | 'AD(S)' 
  | 'NISHAD' 
  | 'SBSP' 
  | 'Jansatta Dal' 
  | 'IND' 
  | 'OTH';

export type UPRegion = 
  | 'Western UP' 
  | 'Rohilkhand' 
  | 'Braj' 
  | 'Awadh' 
  | 'Purvanchal' 
  | 'Bundelkhand';

export interface DemographicProfile {
  totalVoters: number;
  ruralPercentage: number;
  urbanPercentage: number;
  literacyRate: number;
  scPercentage: number;
  muslimPercentage: number;
  obcPercentage: number;
  upperCastePercentage: number;
  keyCasteFactor: string;
}

export interface EmotionMetrics {
  antiIncumbency: number; // 0 to 100
  developmentSatisfaction: number; // 0 to 100
  castePolarization: number; // 0 to 100
  lawAndOrderTrust: number; // 0 to 100
  youthDiscontent: number; // 0 to 100
}

export interface Constituency {
  acNumber: number;
  name: string;
  nameHindi: string;
  district: string;
  region: UPRegion;
  isReserved: 'GEN' | 'SC' | 'ST';
  currentMla: string;
  mlaParty: PoliticalParty;
  winnerVotes2022: number;
  margin2022: number;
  runnerUpParty: PoliticalParty;
  runnerUpCandidate: string;
  demographics: DemographicProfile;
  emotions: EmotionMetrics;
  momentumScore: number; // -10.0 to +10.0 (% swing favorability)
  projectedWinner2027: PoliticalParty;
  status2027: 'Safe Incumbent' | 'Lean Incumbent' | 'Toss-up / Battleground' | 'Lean Challenger' | 'Probable Flip';
  keyLocalIssue: string;
}

export type NodeCategory = 'news' | 'constituency' | 'party' | 'leader' | 'issue';

export interface GraphNode {
  id: string;
  label: string;
  labelHindi?: string;
  category: NodeCategory;
  val: number; // size
  party?: PoliticalParty;
  sentiment?: number; // -1 to 1
  region?: UPRegion;
  acNumber?: number;
  desc?: string;
  // D3 physics coordinates
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  weight: number;
  impactType: 'favorable' | 'unfavorable' | 'neutral' | 'polarizing';
  description?: string;
  pulseActive?: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  titleHindi: string;
  source: string;
  timestamp: string;
  summary: string;
  url?: string;
  sentimentScore: number; // -1.0 to 1.0
  impactMagnitude: number; // 1 to 10
  relatedParties: PoliticalParty[];
  affectedConstituencies: number[]; // AC numbers
  affectedRegion: UPRegion | 'Statewide';
  primaryIssue: string;
  emotionVector: {
    anger: number;
    hope: number;
    discontent: number;
    pride: number;
  };
  pollImpactSummary: string;
}

export interface AppTelemetry {
  gpuName: string;
  vramTotalGb: number;
  vramUsedGb: number;
  utilizationPct: number;
  temperatureC: number;
  tflops: number;
  modelName: string;
  parameterCount: string;
  contextWindow: string;
  avgInferenceMs: number;
  lossValue: number;
  samplesProcessed: number;
  activeBatchSize: number;
}
