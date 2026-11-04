/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SizingRegion = 'US' | 'EU' | 'UK';
export type SizingCategory = 'women' | 'men';
export type SizingUnit = 'in' | 'cm';

export interface WomenSizeRow {
  alphaSize: string;
  usSize: string;
  ukSize: string;
  euSize: string;
  bustIn: string;
  bustCm: string;
  waistIn: string;
  waistCm: string;
  hipsIn: string;
  hipsCm: string;
  shoulderIn: string;
  shoulderCm: string;
  dressLengthIn: string;
  dressLengthCm: string;
  pantsInseamIn: string;
  pantsInseamCm: string;
  pantsOutseamIn: string;
  pantsOutseamCm: string;
}

export interface MenSizeRow {
  alphaSize: string;
  usSize: string;
  ukSize: string;
  euSize: string;
  chestIn: string;
  chestCm: string;
  waistIn: string;
  waistCm: string;
  neckIn: string;
  neckCm: string;
  shoulderIn: string;
  shoulderCm: string;
  shirtLengthIn: string;
  shirtLengthCm: string;
  agbadaLengthIn: string;
  agbadaLengthCm: string;
  trousersInseamIn: string;
  trousersInseamCm: string;
  trousersOutseamIn: string;
  trousersOutseamCm: string;
}

export const WOMEN_SIZE_CHART: WomenSizeRow[] = [
  {
    alphaSize: 'XS',
    usSize: 'US 0 – 2',
    ukSize: 'UK 4 – 6',
    euSize: 'EU 32 – 34',
    bustIn: '31 – 32.5"',
    bustCm: '78 – 82 cm',
    waistIn: '23 – 25"',
    waistCm: '58 – 63.5 cm',
    hipsIn: '33 – 35"',
    hipsCm: '84 – 89 cm',
    shoulderIn: '14.5 – 15"',
    shoulderCm: '37 – 38 cm',
    dressLengthIn: '54"',
    dressLengthCm: '137 cm',
    pantsInseamIn: '30"',
    pantsInseamCm: '76 cm',
    pantsOutseamIn: '40"',
    pantsOutseamCm: '101.5 cm'
  },
  {
    alphaSize: 'S',
    usSize: 'US 4 – 6',
    ukSize: 'UK 8 – 10',
    euSize: 'EU 36 – 38',
    bustIn: '33.5 – 35"',
    bustCm: '85 – 89 cm',
    waistIn: '26 – 28"',
    waistCm: '66 – 71 cm',
    hipsIn: '36 – 38"',
    hipsCm: '91.5 – 96.5 cm',
    shoulderIn: '15 – 15.5"',
    shoulderCm: '38 – 39.5 cm',
    dressLengthIn: '55"',
    dressLengthCm: '140 cm',
    pantsInseamIn: '30.5"',
    pantsInseamCm: '77.5 cm',
    pantsOutseamIn: '40.5"',
    pantsOutseamCm: '103 cm'
  },
  {
    alphaSize: 'M',
    usSize: 'US 8 – 10',
    ukSize: 'UK 12 – 14',
    euSize: 'EU 40 – 42',
    bustIn: '36 – 38"',
    bustCm: '91.5 – 96.5 cm',
    waistIn: '29 – 31"',
    waistCm: '73.5 – 79 cm',
    hipsIn: '39 – 41"',
    hipsCm: '99 – 104 cm',
    shoulderIn: '15.5 – 16"',
    shoulderCm: '39.5 – 40.5 cm',
    dressLengthIn: '56"',
    dressLengthCm: '142 cm',
    pantsInseamIn: '31"',
    pantsInseamCm: '79 cm',
    pantsOutseamIn: '41"',
    pantsOutseamCm: '104 cm'
  },
  {
    alphaSize: 'L',
    usSize: 'US 12 – 14',
    ukSize: 'UK 16 – 18',
    euSize: 'EU 44 – 46',
    bustIn: '39 – 41"',
    bustCm: '99 – 104 cm',
    waistIn: '32 – 34.5"',
    waistCm: '81 – 87.5 cm',
    hipsIn: '42 – 44.5"',
    hipsCm: '106.5 – 113 cm',
    shoulderIn: '16 – 16.5"',
    shoulderCm: '40.5 – 42 cm',
    dressLengthIn: '57"',
    dressLengthCm: '145 cm',
    pantsInseamIn: '31.5"',
    pantsInseamCm: '80 cm',
    pantsOutseamIn: '41.5"',
    pantsOutseamCm: '105.5 cm'
  },
  {
    alphaSize: 'XL',
    usSize: 'US 16 – 18',
    ukSize: 'UK 20 – 22',
    euSize: 'EU 48 – 50',
    bustIn: '42 – 45"',
    bustCm: '106.5 – 114 cm',
    waistIn: '35 – 38"',
    waistCm: '89 – 96.5 cm',
    hipsIn: '45 – 48"',
    hipsCm: '114 – 122 cm',
    shoulderIn: '16.5 – 17"',
    shoulderCm: '42 – 43 cm',
    dressLengthIn: '58"',
    dressLengthCm: '147 cm',
    pantsInseamIn: '32"',
    pantsInseamCm: '81 cm',
    pantsOutseamIn: '42"',
    pantsOutseamCm: '106.5 cm'
  },
  {
    alphaSize: 'XXL',
    usSize: 'US 20 – 22',
    ukSize: 'UK 24 – 26',
    euSize: 'EU 52 – 54',
    bustIn: '46 – 49"',
    bustCm: '117 – 124.5 cm',
    waistIn: '39 – 42"',
    waistCm: '99 – 106.5 cm',
    hipsIn: '49 – 52"',
    hipsCm: '124.5 – 132 cm',
    shoulderIn: '17 – 17.5"',
    shoulderCm: '43 – 44.5 cm',
    dressLengthIn: '58"',
    dressLengthCm: '147 cm',
    pantsInseamIn: '32"',
    pantsInseamCm: '81 cm',
    pantsOutseamIn: '42"',
    pantsOutseamCm: '106.5 cm'
  }
];

export const MEN_SIZE_CHART: MenSizeRow[] = [
  {
    alphaSize: 'XS',
    usSize: 'US 34',
    ukSize: 'UK 34',
    euSize: 'EU 44',
    chestIn: '34 – 35"',
    chestCm: '86 – 89 cm',
    waistIn: '28 – 29"',
    waistCm: '71 – 74 cm',
    neckIn: '14 – 14.5"',
    neckCm: '36 – 37 cm',
    shoulderIn: '16.5"',
    shoulderCm: '42 cm',
    shirtLengthIn: '31"',
    shirtLengthCm: '78.5 cm',
    agbadaLengthIn: '53"',
    agbadaLengthCm: '135 cm',
    trousersInseamIn: '30.5"',
    trousersInseamCm: '77.5 cm',
    trousersOutseamIn: '40.5"',
    trousersOutseamCm: '103 cm'
  },
  {
    alphaSize: 'S',
    usSize: 'US 36',
    ukSize: 'UK 36',
    euSize: 'EU 46',
    chestIn: '36 – 37"',
    chestCm: '91 – 94 cm',
    waistIn: '30 – 31"',
    waistCm: '76 – 79 cm',
    neckIn: '14.5 – 15"',
    neckCm: '37 – 38 cm',
    shoulderIn: '17"',
    shoulderCm: '43 cm',
    shirtLengthIn: '32"',
    shirtLengthCm: '81 cm',
    agbadaLengthIn: '54"',
    agbadaLengthCm: '137 cm',
    trousersInseamIn: '31"',
    trousersInseamCm: '79 cm',
    trousersOutseamIn: '41"',
    trousersOutseamCm: '104 cm'
  },
  {
    alphaSize: 'M',
    usSize: 'US 38 – 40',
    ukSize: 'UK 38 – 40',
    euSize: 'EU 48 – 50',
    chestIn: '38 – 40"',
    chestCm: '96.5 – 101.5 cm',
    waistIn: '32 – 34"',
    waistCm: '81 – 86.5 cm',
    neckIn: '15 – 15.5"',
    neckCm: '38 – 39.5 cm',
    shoulderIn: '17.5 – 18"',
    shoulderCm: '44.5 – 45.5 cm',
    shirtLengthIn: '33"',
    shirtLengthCm: '84 cm',
    agbadaLengthIn: '55"',
    agbadaLengthCm: '140 cm',
    trousersInseamIn: '31.5"',
    trousersInseamCm: '80 cm',
    trousersOutseamIn: '41.5"',
    trousersOutseamCm: '105.5 cm'
  },
  {
    alphaSize: 'L',
    usSize: 'US 42 – 44',
    ukSize: 'UK 42 – 44',
    euSize: 'EU 52 – 54',
    chestIn: '42 – 44"',
    chestCm: '106.5 – 112 cm',
    waistIn: '36 – 38"',
    waistCm: '91.5 – 96.5 cm',
    neckIn: '16 – 16.5"',
    neckCm: '40.5 – 42 cm',
    shoulderIn: '18.5 – 19"',
    shoulderCm: '47 – 48 cm',
    shirtLengthIn: '34"',
    shirtLengthCm: '86.5 cm',
    agbadaLengthIn: '56"',
    agbadaLengthCm: '142 cm',
    trousersInseamIn: '32"',
    trousersInseamCm: '81.5 cm',
    trousersOutseamIn: '42"',
    trousersOutseamCm: '107 cm'
  },
  {
    alphaSize: 'XL',
    usSize: 'US 46 – 48',
    ukSize: 'UK 46 – 48',
    euSize: 'EU 56 – 58',
    chestIn: '46 – 48"',
    chestCm: '117 – 122 cm',
    waistIn: '40 – 42"',
    waistCm: '101.5 – 106.5 cm',
    neckIn: '17 – 17.5"',
    neckCm: '43 – 44.5 cm',
    shoulderIn: '19.5 – 20"',
    shoulderCm: '49.5 – 51 cm',
    shirtLengthIn: '35"',
    shirtLengthCm: '89 cm',
    agbadaLengthIn: '57"',
    agbadaLengthCm: '145 cm',
    trousersInseamIn: '32.5"',
    trousersInseamCm: '82.5 cm',
    trousersOutseamIn: '42.5"',
    trousersOutseamCm: '108 cm'
  },
  {
    alphaSize: 'XXL',
    usSize: 'US 50 – 52',
    ukSize: 'UK 50 – 52',
    euSize: 'EU 60 – 62',
    chestIn: '50 – 52"',
    chestCm: '127 – 132 cm',
    waistIn: '44 – 46"',
    waistCm: '112 – 117 cm',
    neckIn: '18 – 18.5"',
    neckCm: '45.5 – 47 cm',
    shoulderIn: '20.5 – 21"',
    shoulderCm: '52 – 53.5 cm',
    shirtLengthIn: '35.5"',
    shirtLengthCm: '90 cm',
    agbadaLengthIn: '57"',
    agbadaLengthCm: '145 cm',
    trousersInseamIn: '32.5"',
    trousersInseamCm: '82.5 cm',
    trousersOutseamIn: '42.5"',
    trousersOutseamCm: '108 cm'
  }
];

// ═══ STANDARD LENGTH GUIDES (PANTS & DRESSES) ═══

export interface DressLengthCategory {
  id: string;
  silhouette: string;
  lengthIn: string;
  lengthCm: string;
  hemPosition: string;
  proportionNote: string;
  bestPairedWith: string;
  measuringInstruction: string;
}

export interface PantsLengthCategory {
  id: string;
  style: string;
  inseamIn: string;
  inseamCm: string;
  outseamIn: string;
  outseamCm: string;
  hemBreak: string;
  footwearGuide: string;
  measuringInstruction: string;
}

export const DRESS_LENGTH_GUIDE: DressLengthCategory[] = [
  {
    id: 'mini',
    silhouette: 'Mini Dress & Tunics',
    lengthIn: '34 – 36"',
    lengthCm: '86 – 91 cm',
    hemPosition: 'Mid-thigh (approx. 4–6" above knee cap)',
    proportionNote: 'Youthful, contemporary silhouette with room for dynamic movement.',
    bestPairedWith: 'Flat sandals, mules, or sculptural block heels.',
    measuringInstruction: 'Measure from High Point Shoulder (HPS) down across the apex of the bust to the mid-thigh hemline.'
  },
  {
    id: 'knee',
    silhouette: 'Knee-Length & Shift Ensembles',
    lengthIn: '39 – 42"',
    lengthCm: '99 – 107 cm',
    hemPosition: 'Directly at the knee or just skimming the lower patella',
    proportionNote: 'Refined corporate and daytime cocktail elegance.',
    bestPairedWith: 'Classic pumps, slingbacks, or pointed-toe heels.',
    measuringInstruction: 'Measure from HPS straight down over the bust apex to the exact center of the knee cap.'
  },
  {
    id: 'midi',
    silhouette: 'Midi & Tea-Length Creations',
    lengthIn: '45 – 49"',
    lengthCm: '114 – 124 cm',
    hemPosition: 'Mid-calf (harmonious balance between knee and ankle)',
    proportionNote: 'Sophisticated editorial drape for galas, high teas, and weddings.',
    bestPairedWith: 'Stilettos, ankle-strap sandals, or embellished heels.',
    measuringInstruction: 'Measure from HPS down past the waist curve to the widest point of the lower calf.'
  },
  {
    id: 'maxi',
    silhouette: 'Floor Gown, Maxi & Royal Boubou',
    lengthIn: '55 – 60"',
    lengthCm: '140 – 152 cm',
    hemPosition: 'Floor-skimming / Ankle drape with bespoke sweep',
    proportionNote: 'Cut with majestic ease to float gracefully without catching the ground.',
    bestPairedWith: 'Designed to pair with 2"–4" formal heels or couture flats.',
    measuringInstruction: 'Measure standing upright from HPS straight to the floor, wearing your intended heels or footwear.'
  }
];

// ═══ OFFICIAL NNEPA FORIWAA LENGTH GUIDE (HIGH WAIST TO FEET) ═══

export interface OfficialLengthCategory {
  id: string;
  name: string;
  heightRange: string;
  heightMinInches: number;
  heightMaxInches: number;
  heightRangeCm: string;
  pantsSkirtsLengthIn: number;
  pantsSkirtsLengthCm: number;
  dressLengthIn: number;
  dressLengthCm: number;
  description: string;
}

export const OFFICIAL_LENGTH_GUIDE: OfficialLengthCategory[] = [
  {
    id: 'petite',
    name: 'Petite',
    heightRange: "5'0 – 5'3",
    heightMinInches: 60,
    heightMaxInches: 63,
    heightRangeCm: '152 – 160 cm',
    pantsSkirtsLengthIn: 42,
    pantsSkirtsLengthCm: 106.7,
    dressLengthIn: 56,
    dressLengthCm: 142.2,
    description: 'Calibrated for heights 5\'0" to 5\'3". Clean proportions without fabric dragging.'
  },
  {
    id: 'petite-plus',
    name: 'Petite +',
    heightRange: "5'4 – 5'5",
    heightMinInches: 64,
    heightMaxInches: 65,
    heightRangeCm: '162 – 165 cm',
    pantsSkirtsLengthIn: 43,
    pantsSkirtsLengthCm: 109.2,
    dressLengthIn: 57,
    dressLengthCm: 144.8,
    description: 'Calibrated for heights 5\'4" to 5\'5". Perfect drape for standard footwear.'
  },
  {
    id: 'average',
    name: 'Average',
    heightRange: "5'6 – 5'7",
    heightMinInches: 66,
    heightMaxInches: 67,
    heightRangeCm: '167 – 170 cm',
    pantsSkirtsLengthIn: 45,
    pantsSkirtsLengthCm: 114.3,
    dressLengthIn: 58,
    dressLengthCm: 147.3,
    description: 'Classic bespoke standard for heights 5\'6" to 5\'7".'
  },
  {
    id: 'average-plus',
    name: 'Average +',
    heightRange: "5'10 – 5'11",
    heightMinInches: 70,
    heightMaxInches: 71,
    heightRangeCm: '178 – 180 cm',
    pantsSkirtsLengthIn: 47,
    pantsSkirtsLengthCm: 119.4,
    dressLengthIn: 60,
    dressLengthCm: 152.4,
    description: 'Elevated cut for heights 5\'10" to 5\'11".'
  },
  {
    id: 'tall',
    name: 'Tall',
    heightRange: "5'8 – 5'9",
    heightMinInches: 68,
    heightMaxInches: 69,
    heightRangeCm: '173 – 175 cm',
    pantsSkirtsLengthIn: 49,
    pantsSkirtsLengthCm: 124.5,
    dressLengthIn: 63,
    dressLengthCm: 160.0,
    description: 'Elongated proportion for heights 5\'8" to 5\'9".'
  },
  {
    id: 'very-tall',
    name: 'Very Tall',
    heightRange: '6+',
    heightMinInches: 72,
    heightMaxInches: 84,
    heightRangeCm: '183+ cm',
    pantsSkirtsLengthIn: 52,
    pantsSkirtsLengthCm: 132.1,
    dressLengthIn: 65,
    dressLengthCm: 165.1,
    description: 'Majestic proportions for heights 6\'0" and above.'
  }
];

export const OFFICIAL_LENGTH_NOTES = [
  'All measurements are in inches.',
  'These are high waist to feet measurements.',
  'If you would like it to fit longer, please go for a taller length or share your exact length.',
  'Custom Length Available upon request.'
];

export const PANTS_LENGTH_GUIDE: PantsLengthCategory[] = [
  {
    id: 'ankle',
    style: 'Ankle / Cropped Cigarette Trousers',
    inseamIn: '27 – 29"',
    inseamCm: '68.5 – 73.5 cm',
    outseamIn: '37 – 39"',
    outseamCm: '94 – 99 cm',
    hemBreak: 'Zero break: Sits cleanly at or just above the ankle bone',
    footwearGuide: 'Low heels, leather loafers, pointed mules, or minimalist sandals.',
    measuringInstruction: 'Inseam: inner crotch point to ankle bone. Outseam: natural waistband down the outer hip to ankle.'
  },
  {
    id: 'regular',
    style: 'Classic Straight / Standard Trousers',
    inseamIn: '31 – 32"',
    inseamCm: '78.5 – 81.5 cm',
    outseamIn: '40.5 – 42"',
    outseamCm: '103 – 107 cm',
    hemBreak: 'Slight break: Rests gently on the top of the shoe without folding',
    footwearGuide: 'Standard dress pumps, block heels, or polished leather shoes.',
    measuringInstruction: 'Standard fit calibrated for heights 5\'4" – 5\'7" (162–170 cm). Measure waist to shoe instep.'
  },
  {
    id: 'palazzo',
    style: 'Wide-Leg / Palazzo & Flared Pants',
    inseamIn: '33 – 35"',
    inseamCm: '84 – 89 cm',
    outseamIn: '43 – 45"',
    outseamCm: '109 – 114 cm',
    hemBreak: 'Full break / Floor-sweep: 0.5" above the floor with heels',
    footwearGuide: 'Platform wedges, 3"–4" stilettos, or elevated evening heels.',
    measuringInstruction: 'Measure from high waist over the hip to the floor while wearing your chosen heel height.'
  },
  {
    id: 'kaftan-trouser',
    style: 'Men\'s Kaftan & Agbada Trousers (Sokoto)',
    inseamIn: '31 – 33"',
    inseamCm: '78.5 – 84 cm',
    outseamIn: '41 – 43"',
    outseamCm: '104 – 109 cm',
    hemBreak: 'Clean drape: Tapers subtly over the instep without dragging',
    footwearGuide: 'Traditional leather mules, velvet loafers, or tailored dress slippers.',
    measuringInstruction: 'Measure from waistband (or drawstring position) down the side to the ankle shoe contact.'
  }
];

// Single Regional Conversion Table for rapid lookups
export interface RegionalEquivalency {
  us: string;
  uk: string;
  eu: string;
  alpha: string;
  category: SizingCategory;
}

export const WOMEN_REGIONAL_MAP: RegionalEquivalency[] = [
  { us: 'US 0', uk: 'UK 4', eu: 'EU 32', alpha: 'XS', category: 'women' },
  { us: 'US 2', uk: 'UK 6', eu: 'EU 34', alpha: 'XS', category: 'women' },
  { us: 'US 4', uk: 'UK 8', eu: 'EU 36', alpha: 'S', category: 'women' },
  { us: 'US 6', uk: 'UK 10', eu: 'EU 38', alpha: 'S', category: 'women' },
  { us: 'US 8', uk: 'UK 12', eu: 'EU 40', alpha: 'M', category: 'women' },
  { us: 'US 10', uk: 'UK 14', eu: 'EU 42', alpha: 'M', category: 'women' },
  { us: 'US 12', uk: 'UK 16', eu: 'EU 44', alpha: 'L', category: 'women' },
  { us: 'US 14', uk: 'UK 18', eu: 'EU 46', alpha: 'L', category: 'women' },
  { us: 'US 16', uk: 'UK 20', eu: 'EU 48', alpha: 'XL', category: 'women' },
  { us: 'US 18', uk: 'UK 22', eu: 'EU 50', alpha: 'XL', category: 'women' },
  { us: 'US 20', uk: 'UK 24', eu: 'EU 52', alpha: 'XXL', category: 'women' },
  { us: 'US 22', uk: 'UK 26', eu: 'EU 54', alpha: 'XXL', category: 'women' },
];

export const MEN_REGIONAL_MAP: RegionalEquivalency[] = [
  { us: 'US 34', uk: 'UK 34', eu: 'EU 44', alpha: 'XS', category: 'men' },
  { us: 'US 36', uk: 'UK 36', eu: 'EU 46', alpha: 'S', category: 'men' },
  { us: 'US 38', uk: 'UK 38', eu: 'EU 48', alpha: 'M', category: 'men' },
  { us: 'US 40', uk: 'UK 40', eu: 'EU 50', alpha: 'M', category: 'men' },
  { us: 'US 42', uk: 'UK 42', eu: 'EU 52', alpha: 'L', category: 'men' },
  { us: 'US 44', uk: 'UK 44', eu: 'EU 54', alpha: 'L', category: 'men' },
  { us: 'US 46', uk: 'UK 46', eu: 'EU 56', alpha: 'XL', category: 'men' },
  { us: 'US 48', uk: 'UK 48', eu: 'EU 58', alpha: 'XL', category: 'men' },
  { us: 'US 50', uk: 'UK 50', eu: 'EU 60', alpha: 'XXL', category: 'men' },
  { us: 'US 52', uk: 'UK 52', eu: 'EU 62', alpha: 'XXL', category: 'men' },
];

export const MEASURING_TIPS = [
  {
    step: '1',
    title: 'Bust / Chest',
    desc: 'Pass the tape measure around the fullest part of your chest or bust, keeping the tape level across your shoulder blades.'
  },
  {
    step: '2',
    title: 'Waist',
    desc: 'Measure around your natural waistline, generally 1-2 inches above your belly button where your body bends.'
  },
  {
    step: '3',
    title: 'Hips (Womenswear)',
    desc: 'Stand with your heels together and measure around the fullest point of your hips and seat.'
  },
  {
    step: '4',
    title: 'Dress Length (HPS to Hem)',
    desc: 'Measure from High Point Shoulder (where your shoulder meets your neck), passing over the bust apex down to your desired hemline.'
  },
  {
    step: '5',
    title: 'Pants Inseam & Outseam',
    desc: 'Inseam: measure along the inner leg seam from crotch to hem. Outseam: measure from the top of the waistband down the outer hip to the floor or ankle.'
  },
  {
    step: '6',
    title: 'Shoulders & Neck',
    desc: 'For tailored jackets, shirts and agbadas, measure across the back from shoulder tip to shoulder tip, and measure loosely around the base of the neck.'
  }
];
