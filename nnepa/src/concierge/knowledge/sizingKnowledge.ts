/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * NNEPA Knowledge Module — C. Sizing & Fit Knowledge
 * Connects directly to `src/sizeChartData.ts` so NNEPA always uses the brand's
 * published international conversions, body coordinates, and standard length guides.
 */

import {
  WOMEN_SIZE_CHART,
  MEN_SIZE_CHART,
  WOMEN_REGIONAL_MAP,
  MEN_REGIONAL_MAP,
  DRESS_LENGTH_GUIDE,
  PANTS_LENGTH_GUIDE,
  MEASURING_TIPS
} from '../../sizeChartData.ts';

export const SIZING_KNOWLEDGE = {
  sizeChartPageHash: '#/size-chart',
  womenChart: WOMEN_SIZE_CHART,
  menChart: MEN_SIZE_CHART,
  womenRegionalMap: WOMEN_REGIONAL_MAP,
  menRegionalMap: MEN_REGIONAL_MAP,
  dressLengthGuide: DRESS_LENGTH_GUIDE,
  pantsLengthGuide: PANTS_LENGTH_GUIDE,
  measuringTips: MEASURING_TIPS,
  fitGuidance: [
    'Boubous, Kaftans, and Agbadas are cut with generous, comfortable ease.',
    'Fitted gowns and structured two-piece sets feature tailored darting and internal facings.',
    'Accessories and handcrafted bags are offered in One Size.',
    'Standard sample lengths are calibrated around 5\'4" – 5\'7" (162–170 cm); complimentary hem reductions (1.5"–2" for Petite under 5\'3") or extended allowances (+2"–3" for Tall 5\'8"+) can be requested in checkout notes or via WhatsApp.',
    'We never guarantee an identical fit without individual measurements; if you sit between two sizes or prefer made-to-measure tailoring, our Accra team can guide you directly.'
  ]
};

/**
 * Extracts a normalized alpha size ('XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'One Size')
 * from natural-language phrasing such as "medium", "size M", "small", "extra large", or "UK 12".
 */
export function parseRequestedSizeFromText(
  text: string,
  preferredCategory: 'women' | 'men' | 'bags' = 'women'
): { alpha: string; matchedFromRegional?: string } | null {
  const lower = text.toLowerCase();

  // Check explicit regional sizes first: e.g. "US 8", "UK 12", "EU 40"
  const regionalMatch = lower.match(/\b(us|uk|eu)\s*(\d{1,2})\b/i);
  if (regionalMatch) {
    const regPrefix = regionalMatch[1].toUpperCase();
    const regNum = regionalMatch[2];
    const token = `${regPrefix} ${regNum}`;
    const map = preferredCategory === 'men' ? MEN_REGIONAL_MAP : WOMEN_REGIONAL_MAP;
    const found = map.find((row) => {
      if (regPrefix === 'US') return row.us === token;
      if (regPrefix === 'UK') return row.uk === token;
      return row.eu === token;
    });
    if (found) {
      return { alpha: found.alpha, matchedFromRegional: token };
    }
  }

  if (/\bone\s*size\b/i.test(lower)) return { alpha: 'One Size' };
  if (/\b(xxl|2xl|double\s*extra\s*large|double\s*xl)\b/i.test(lower)) return { alpha: 'XXL' };
  if (/\b(xl|extra[-\s]*large|x-large)\b/i.test(lower)) return { alpha: 'XL' };
  if (/\b(xs|extra[-\s]*small|x-small)\b/i.test(lower)) return { alpha: 'XS' };
  if (/\b(small|size\s+s)\b/i.test(lower) || /\bin\s+s\b/i.test(lower)) return { alpha: 'S' };
  if (/\b(medium|med|size\s+m)\b/i.test(lower) || /\bin\s+m\b/i.test(lower)) return { alpha: 'M' };
  if (/\b(large|size\s+l)\b/i.test(lower) || /\bin\s+l\b/i.test(lower)) return { alpha: 'L' };

  // Standalone single-letter check when context clearly mentions size
  if (/\bsizes?\b/i.test(lower)) {
    const single = lower.match(/\b(s|m|l)\b/i);
    if (single) return { alpha: single[1].toUpperCase() };
  }

  return null;
}

/**
 * Formats exact published measurements for a given alpha size and gender category.
 */
export function getSizeSpecificationSummary(alpha: string, category: 'women' | 'men' | 'bags'): string | null {
  if (category === 'bags' || alpha === 'One Size') {
    return 'Crafted in One Size for handcrafted bags and evening clutches.';
  }

  if (category === 'men') {
    const row = MEN_SIZE_CHART.find((r) => r.alphaSize === alpha);
    if (!row) return null;
    return `**Size ${row.alphaSize}** (${row.usSize} · ${row.ukSize} · ${row.euSize}): Chest ${row.chestIn} (${row.chestCm}), Waist ${row.waistIn} (${row.waistCm}), Shoulder ${row.shoulderIn}, Agbada Length ${row.agbadaLengthIn}, Trousers Inseam ${row.trousersInseamIn}.`;
  }

  const row = WOMEN_SIZE_CHART.find((r) => r.alphaSize === alpha);
  if (!row) return null;
  return `**Size ${row.alphaSize}** (${row.usSize} · ${row.ukSize} · ${row.euSize}): Bust ${row.bustIn} (${row.bustCm}), Waist ${row.waistIn} (${row.waistCm}), Hips ${row.hipsIn} (${row.hipsCm}), Dress Length ${row.dressLengthIn}, Pants Inseam ${row.pantsInseamIn}.`;
}
