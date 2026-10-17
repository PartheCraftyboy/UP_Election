import { UPRegion } from '../types';

/**
 * Legislative tracker.
 *
 * `up-exam-unfair-means` reflects the real Uttar Pradesh Public Examinations
 * (Prevention of Unfair Means) Act. Every other row is sample data shaped
 * like the real pipeline so the UI can be built against it; replace them
 * with scraped Vidhan Sabha bulletins when the backend lands.
 */

export type LawStage =
  | 'Drafting'
  | 'Tabled'
  | 'In committee'
  | 'Passed'
  | 'Assented'
  | 'In force';

export const LAW_STAGES: LawStage[] = [
  'Drafting',
  'Tabled',
  'In committee',
  'Passed',
  'Assented',
  'In force'
];

export interface LawTrackItem {
  id: string;
  title: string;
  titleHindi: string;
  stage: LawStage;
  stageDate: string;
  house: 'Vidhan Sabha' | 'Vidhan Parishad' | 'Cabinet';
  ministry: string;
  ministryHindi: string;
  /** Assembly constituency of the member moving it, links the law to a seat. */
  sponsorAc?: number;
  primaryIssue: string;
  affectedRegion: UPRegion | 'Statewide';
  affectedSeats: number;
  summary: string;
  summaryHindi: string;
  /** Model read of public reaction, -1 to 1. */
  sentimentScore: number;
  isSample: boolean;
}

export const LAW_TRACK: LawTrackItem[] = [
  {
    id: 'up-exam-unfair-means',
    title: 'Public Examinations (Prevention of Unfair Means) Act',
    titleHindi: 'सार्वजनिक परीक्षा (अनुचित साधनों की रोकथाम) अधिनियम',
    stage: 'In force',
    stageDate: '2026-10-16',
    house: 'Cabinet',
    ministry: 'Basic Education and Recruitment Boards',
    ministryHindi: 'बेसिक शिक्षा एवं भर्ती बोर्ड',
    sponsorAc: 343,
    primaryIssue: 'Youth and paper leaks',
    affectedRegion: 'Statewide',
    affectedSeats: 62,
    summary:
      'Life imprisonment and a fine up to one crore for organised paper leaks, with recovery of examination costs from convicted organisers.',
    summaryHindi:
      'संगठित पेपर लीक पर आजीवन कारावास और एक करोड़ तक का जुर्माना, दोषियों से परीक्षा लागत की वसूली।',
    sentimentScore: 0.72,
    isSample: false
  },
  {
    id: 'sugarcane-sap-revision',
    title: 'Sugarcane State Advised Price revision for 2026-27 crush',
    titleHindi: 'गन्ना राज्य परामर्शित मूल्य संशोधन, पेराई सत्र 2026-27',
    stage: 'Drafting',
    stageDate: '2026-10-14',
    house: 'Cabinet',
    ministry: 'Sugar Industry and Cane Development',
    ministryHindi: 'चीनी उद्योग एवं गन्ना विकास',
    primaryIssue: 'Sugarcane and farm MSP',
    affectedRegion: 'Western UP',
    affectedSeats: 38,
    summary:
      'Mill owners oppose the demanded jump to ₹425 per quintal. Arrears schedule, not the headline price, is what the model reads as the live grievance.',
    summaryHindi:
      'मिल मालिक ₹425 प्रति क्विंटल की मांग का विरोध कर रहे हैं। मॉडल के अनुसार असली शिकायत बकाया भुगतान का कार्यक्रम है।',
    sentimentScore: -0.48,
    isSample: true
  },
  {
    id: 'caste-enumeration-resolution',
    title: 'Private member resolution seeking a state caste enumeration',
    titleHindi: 'राज्य जातिगत गणना हेतु निजी सदस्य संकल्प',
    stage: 'Tabled',
    stageDate: '2026-10-11',
    house: 'Vidhan Sabha',
    ministry: 'Moved from the opposition benches',
    ministryHindi: 'विपक्ष की ओर से प्रस्तुत',
    sponsorAc: 279,
    primaryIssue: 'Caste census and reservation',
    affectedRegion: 'Purvanchal',
    affectedSeats: 45,
    summary:
      'Seeks a state enumeration ahead of the 2027 poll. Unlikely to be admitted, which is itself the point the mover is making in the districts.',
    summaryHindi:
      '2027 चुनाव से पहले राज्य स्तरीय गणना की मांग। स्वीकृत होने की संभावना कम है, और प्रस्तावक का असली संदेश भी यही है।',
    sentimentScore: 0.65,
    isSample: true
  },
  {
    id: 'bundelkhand-industrial-policy',
    title: 'Bundelkhand defence and EV manufacturing incentive policy',
    titleHindi: 'बुंदेलखंड रक्षा एवं ईवी निर्माण प्रोत्साहन नीति',
    stage: 'In committee',
    stageDate: '2026-10-09',
    house: 'Cabinet',
    ministry: 'Invest UP and Industrial Development',
    ministryHindi: 'इन्वेस्ट यूपी एवं औद्योगिक विकास',
    sponsorAc: 222,
    primaryIssue: 'Infrastructure and jobs',
    affectedRegion: 'Bundelkhand',
    affectedSeats: 19,
    summary:
      'Stamp duty waiver and power tariff subsidy against ₹12,000 crore of grounded memoranda along the expressway corridor.',
    summaryHindi:
      'एक्सप्रेसवे कॉरिडोर पर ₹12,000 करोड़ के करारों के बदले स्टाम्प शुल्क छूट और बिजली दर सब्सिडी।',
    sentimentScore: 0.82,
    isSample: true
  },
  {
    id: 'ram-path-rehabilitation',
    title: 'Ram Path trader compensation and rehabilitation scheme',
    titleHindi: 'राम पथ व्यापारी मुआवजा एवं पुनर्वास योजना',
    stage: 'Passed',
    stageDate: '2026-10-07',
    house: 'Vidhan Sabha',
    ministry: 'Urban Development',
    ministryHindi: 'नगर विकास',
    sponsorAc: 275,
    primaryIssue: 'Urban development and traders',
    affectedRegion: 'Awadh',
    affectedSeats: 7,
    summary:
      'Settles shopfront acquisition claims along the corridor and funds relocation to the new market block.',
    summaryHindi:
      'कॉरिडोर पर दुकान अधिग्रहण के दावों का निपटारा और नए बाजार खंड में पुनर्वास के लिए धन।',
    sentimentScore: 0.58,
    isSample: true
  },
  {
    id: 'ward-reorganisation',
    title: 'Urban local body ward reorganisation ordinance',
    titleHindi: 'नगरीय निकाय वार्ड पुनर्गठन अध्यादेश',
    stage: 'Assented',
    stageDate: '2026-10-02',
    house: 'Vidhan Parishad',
    ministry: 'Urban Development',
    ministryHindi: 'नगर विकास',
    primaryIssue: 'Urban development and traders',
    affectedRegion: 'Rohilkhand',
    affectedSeats: 12,
    summary:
      'Redraws ward boundaries in six municipal corporations before the civic poll, which moves the urban vote arithmetic in twelve assembly segments.',
    summaryHindi:
      'निकाय चुनाव से पहले छह नगर निगमों में वार्ड सीमाओं का पुनर्निर्धारण, जिससे बारह विधानसभा क्षेत्रों का शहरी गणित बदलता है।',
    sentimentScore: 0.11,
    isSample: true
  }
];

export const STAGE_INDEX = (stage: LawStage): number => LAW_STAGES.indexOf(stage);

export const lawsBySponsorAc = (acNumber: number): LawTrackItem[] =>
  LAW_TRACK.filter((l) => l.sponsorAc === acNumber);
