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
    dressLengthCm: '137 cm'
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
    dressLengthCm: '140 cm'
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
    dressLengthCm: '142 cm'
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
    dressLengthCm: '145 cm'
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
    dressLengthCm: '147 cm'
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
    dressLengthCm: '147 cm'
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
    agbadaLengthCm: '135 cm'
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
    agbadaLengthCm: '137 cm'
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
    agbadaLengthCm: '140 cm'
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
    agbadaLengthCm: '142 cm'
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
    agbadaLengthCm: '145 cm'
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
    agbadaLengthCm: '145 cm'
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
    title: 'Shoulders & Neck',
    desc: 'For tailored jackets, shirts and agbadas, measure across the back from shoulder tip to shoulder tip, and measure loosely around the base of the neck.'
  }
];
