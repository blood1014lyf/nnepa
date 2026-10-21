/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Ruler, Sparkles, Check, HelpCircle, MessageSquare, Info, ArrowRight } from 'lucide-react';
import {
  SizingRegion,
  SizingCategory,
  SizingUnit,
  WOMEN_SIZE_CHART,
  MEN_SIZE_CHART,
  WOMEN_REGIONAL_MAP,
  MEN_REGIONAL_MAP,
  MEASURING_TIPS
} from '../sizeChartData.ts';

interface SizeChartProps {
  defaultCategory?: SizingCategory;
  defaultRegion?: SizingRegion;
  highlightAlpha?: string;
  onSelectSize?: (size: string) => void;
  isModal?: boolean;
}

export default function SizeChart({
  defaultCategory = 'women',
  defaultRegion = 'US',
  highlightAlpha,
  onSelectSize,
  isModal = false
}: SizeChartProps) {
  const [category, setCategory] = useState<SizingCategory>(defaultCategory);
  const [region, setRegion] = useState<SizingRegion>(defaultRegion);
  const [unit, setUnit] = useState<SizingUnit>('in');
  const [selectedRow, setSelectedRow] = useState<string | null>(highlightAlpha || null);

  // Quick Finder State
  const [finderRegion, setFinderRegion] = useState<SizingRegion>(defaultRegion);
  const [finderSize, setFinderSize] = useState<string>('');

  const regionalOptions = category === 'women'
    ? (finderRegion === 'US'
        ? ['US 0', 'US 2', 'US 4', 'US 6', 'US 8', 'US 10', 'US 12', 'US 14', 'US 16', 'US 18', 'US 20', 'US 22']
        : finderRegion === 'UK'
        ? ['UK 4', 'UK 6', 'UK 8', 'UK 10', 'UK 12', 'UK 14', 'UK 16', 'UK 18', 'UK 20', 'UK 22', 'UK 24', 'UK 26']
        : ['EU 32', 'EU 34', 'EU 36', 'EU 38', 'EU 40', 'EU 42', 'EU 44', 'EU 46', 'EU 48', 'EU 50', 'EU 52', 'EU 54'])
    : (finderRegion === 'US'
        ? ['US 34', 'US 36', 'US 38', 'US 40', 'US 42', 'US 44', 'US 46', 'US 48', 'US 50', 'US 52']
        : finderRegion === 'UK'
        ? ['UK 34', 'UK 36', 'UK 38', 'UK 40', 'UK 42', 'UK 44', 'UK 46', 'UK 48', 'UK 50', 'UK 52']
        : ['EU 44', 'EU 46', 'EU 48', 'EU 50', 'EU 52', 'EU 54', 'EU 56', 'EU 58', 'EU 60', 'EU 62']);

  const getFinderResult = () => {
    if (!finderSize) return null;
    const map = category === 'women' ? WOMEN_REGIONAL_MAP : MEN_REGIONAL_MAP;
    const match = map.find((m) => {
      if (finderRegion === 'US') return m.us === finderSize;
      if (finderRegion === 'UK') return m.uk === finderSize;
      return m.eu === finderSize;
    });
    return match;
  };

  const finderResult = getFinderResult();

  const handleFinderSelect = (sizeStr: string) => {
    setFinderSize(sizeStr);
    const map = category === 'women' ? WOMEN_REGIONAL_MAP : MEN_REGIONAL_MAP;
    const match = map.find((m) => {
      if (finderRegion === 'US') return m.us === sizeStr;
      if (finderRegion === 'UK') return m.uk === sizeStr;
      return m.eu === sizeStr;
    });
    if (match) {
      setSelectedRow(match.alpha);
    }
  };

  const whatsappInquiryUrl = `https://wa.me/233538795669?text=${encodeURIComponent(
    `Hello Nnepa Foriwaa! I need sizing assistance with your ${category === 'women' ? "Women's" : "Men's"} Collection. My standard size is ${region} ${finderSize || ''}. Could you advise on the best tailored fit?`
  )}`;

  return (
    <div className={`w-full text-plum-dark ${isModal ? '' : 'max-w-5xl mx-auto py-6'}`} id="size-chart-root">
      
      {/* ═══ TOP CONTROLS & FILTER BAR ═══ */}
      <div className="bg-white p-4 sm:p-6 rounded-md border border-lilac/20 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Collection Filter (Women / Men) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-text-light">
              Collection Gender
            </label>
            <div className="inline-flex p-1 bg-zinc-100 rounded-[3px] border border-zinc-200">
              <button
                type="button"
                id="btn-filter-women"
                onClick={() => {
                  setCategory('women');
                  setFinderSize('');
                }}
                className={`px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-[2px] transition-all cursor-pointer border-none ${
                  category === 'women'
                    ? 'bg-gradient-to-br from-lavender to-mauve-deep text-white shadow-xs'
                    : 'bg-transparent text-text-muted hover:text-plum-dark'
                }`}
              >
                Women's Collection
              </button>
              <button
                type="button"
                id="btn-filter-men"
                onClick={() => {
                  setCategory('men');
                  setFinderSize('');
                }}
                className={`px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-[2px] transition-all cursor-pointer border-none ${
                  category === 'men'
                    ? 'bg-gradient-to-br from-lavender to-mauve-deep text-white shadow-xs'
                    : 'bg-transparent text-text-muted hover:text-plum-dark'
                }`}
              >
                Men's Elegance
              </button>
            </div>
          </div>

          {/* Region Filter (US, UK, EU) - Primary User Requirement */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-text-light flex items-center gap-1.5">
              <span>Filter By Standard Region</span>
              <span className="text-[0.55rem] font-semibold text-lavender normal-case">(US · UK · EU)</span>
            </label>
            <div className="inline-flex p-1 bg-zinc-100 rounded-[3px] border border-zinc-200">
              {(['US', 'UK', 'EU'] as SizingRegion[]).map((reg) => (
                <button
                  key={reg}
                  type="button"
                  id={`btn-region-${reg.toLowerCase()}`}
                  onClick={() => {
                    setRegion(reg);
                    setFinderRegion(reg);
                  }}
                  className={`min-w-16 px-4 py-2 text-xs font-bold tracking-widest uppercase rounded-[2px] transition-all cursor-pointer border-none ${
                    region === reg
                      ? 'bg-plum-dark text-white shadow-xs font-extrabold'
                      : 'bg-transparent text-text-muted hover:text-plum-dark'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          {/* Unit Toggle (Inches vs Centimeters) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-text-light">
              Measurement Unit
            </label>
            <div className="inline-flex p-1 bg-zinc-100 rounded-[3px] border border-zinc-200">
              <button
                type="button"
                id="btn-unit-inches"
                onClick={() => setUnit('in')}
                className={`px-3 py-2 text-xs font-bold tracking-wider uppercase rounded-[2px] transition-all cursor-pointer border-none ${
                  unit === 'in'
                    ? 'bg-lavender text-white shadow-xs'
                    : 'bg-transparent text-text-muted hover:text-plum-dark'
                }`}
              >
                Inches (in)
              </button>
              <button
                type="button"
                id="btn-unit-cm"
                onClick={() => setUnit('cm')}
                className={`px-3 py-2 text-xs font-bold tracking-wider uppercase rounded-[2px] transition-all cursor-pointer border-none ${
                  unit === 'cm'
                    ? 'bg-lavender text-white shadow-xs'
                    : 'bg-transparent text-text-muted hover:text-plum-dark'
                }`}
              >
                Metric (cm)
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ═══ INTERACTIVE REGIONAL SIZE FINDER ═══ */}
      <div className="bg-gradient-to-r from-lavender/10 via-lilac/10 to-pearl p-4 sm:p-5 rounded-md border border-lilac/25 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-lavender/20 flex items-center justify-center shrink-0 text-mauve-deep mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-plum-dark">
                Instant Size Matcher
              </h4>
              <p className="text-[0.7rem] text-text-light mt-0.5 leading-relaxed">
                Select your usual <strong className="font-semibold text-plum-dark">{finderRegion}</strong> size to highlight your tailored fit:
              </p>
            </div>
          </div>

          {/* Quick Select Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              id="select-finder-size"
              value={finderSize}
              onChange={(e) => handleFinderSelect(e.target.value)}
              className="px-3 py-2 bg-white border border-lilac/30 rounded text-xs font-semibold text-plum-dark outline-none focus:border-lavender cursor-pointer shadow-xs"
            >
              <option value="">Select your standard {finderRegion} size...</option>
              {regionalOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {finderResult && (
              <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded border border-lavender/40 shadow-xs animate-in fade-in duration-300">
                <span className="text-[0.62rem] font-bold tracking-wider uppercase text-text-light">
                  Tailored Size:
                </span>
                <span className="text-xs font-extrabold text-mauve-deep bg-lavender/20 px-2 py-0.5 rounded">
                  {finderResult.alpha}
                </span>
                <span className="text-[0.65rem] text-text-light font-mono">
                  ({finderResult.us} · {finderResult.uk} · {finderResult.eu})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ MAIN INTERNATIONAL SIZE SPECIFICATION TABLE ═══ */}
      <div className="bg-white rounded-md border border-lilac/20 shadow-xs overflow-hidden mb-6">
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-zinc-50/70">
          <div>
            <h3 className="font-serif text-lg sm:text-xl text-plum-dark font-light flex items-center gap-2">
              <Ruler className="w-4 h-4 text-lavender" />
              <span>
                {category === 'women' ? "Women's International Tailoring Table" : "Men's International Tailoring Table"}
              </span>
            </h3>
            <p className="text-[0.68rem] text-text-light mt-0.5">
              Filtered for <strong className="text-plum-dark font-semibold">{region}</strong> sizing standard with full UK & EU conversions and verified garment measurements ({unit === 'in' ? 'Inches' : 'Centimeters'}).
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[0.6rem] font-bold uppercase tracking-wider text-text-light">
              Active Focus:
            </span>
            <span className="px-2.5 py-0.5 bg-plum-dark text-white text-[0.65rem] font-bold tracking-widest rounded-full uppercase">
              {region} System
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {category === 'women' ? (
            /* ═══ WOMEN'S TABLE ═══ */
            <table className="w-full text-left text-xs border-collapse min-w-[680px]">
              <thead>
                <tr className="bg-lavender/10 text-plum-dark border-b border-lilac/15 font-bold tracking-wider text-[0.65rem] uppercase">
                  <th className="p-3.5 pl-5">Tailored Size</th>
                  <th className={`p-3.5 ${region === 'US' ? 'bg-lavender/20 text-plum-dark font-extrabold border-x border-lavender/20' : ''}`}>
                    US Size {region === 'US' && '★'}
                  </th>
                  <th className={`p-3.5 ${region === 'UK' ? 'bg-lavender/20 text-plum-dark font-extrabold border-x border-lavender/20' : ''}`}>
                    UK Size {region === 'UK' && '★'}
                  </th>
                  <th className={`p-3.5 ${region === 'EU' ? 'bg-lavender/20 text-plum-dark font-extrabold border-x border-lavender/20' : ''}`}>
                    EU Size {region === 'EU' && '★'}
                  </th>
                  <th className="p-3.5">Bust ({unit})</th>
                  <th className="p-3.5">Waist ({unit})</th>
                  <th className="p-3.5">Hips ({unit})</th>
                  <th className="p-3.5">Shoulder ({unit})</th>
                  <th className="p-3.5 pr-5">Length ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-[0.72rem] text-plum-dark">
                {WOMEN_SIZE_CHART.map((row) => {
                  const isHighlighted = selectedRow === row.alphaSize;
                  return (
                    <tr
                      key={row.alphaSize}
                      onClick={() => {
                        setSelectedRow(row.alphaSize);
                        if (onSelectSize) onSelectSize(row.alphaSize);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isHighlighted
                          ? 'bg-lavender/15 font-semibold text-plum-dark'
                          : 'hover:bg-zinc-50'
                      }`}
                    >
                      <td className="p-3.5 pl-5 font-sans font-bold flex items-center gap-2">
                        {isHighlighted && <Check className="w-3.5 h-3.5 text-lavender shrink-0" />}
                        <span className="px-2 py-0.5 rounded bg-zinc-100 font-mono text-xs">
                          {row.alphaSize}
                        </span>
                      </td>
                      <td className={`p-3.5 font-mono ${region === 'US' ? 'bg-lavender/10 font-bold text-plum-dark border-x border-lavender/20' : ''}`}>
                        {row.usSize}
                      </td>
                      <td className={`p-3.5 font-mono ${region === 'UK' ? 'bg-lavender/10 font-bold text-plum-dark border-x border-lavender/20' : ''}`}>
                        {row.ukSize}
                      </td>
                      <td className={`p-3.5 font-mono ${region === 'EU' ? 'bg-lavender/10 font-bold text-plum-dark border-x border-lavender/20' : ''}`}>
                        {row.euSize}
                      </td>
                      <td className="p-3.5 font-mono">
                        {unit === 'in' ? row.bustIn : row.bustCm}
                      </td>
                      <td className="p-3.5 font-mono">
                        {unit === 'in' ? row.waistIn : row.waistCm}
                      </td>
                      <td className="p-3.5 font-mono">
                        {unit === 'in' ? row.hipsIn : row.hipsCm}
                      </td>
                      <td className="p-3.5 font-mono">
                        {unit === 'in' ? row.shoulderIn : row.shoulderCm}
                      </td>
                      <td className="p-3.5 pr-5 font-mono">
                        {unit === 'in' ? row.dressLengthIn : row.dressLengthCm}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* ═══ MEN'S TABLE ═══ */
            <table className="w-full text-left text-xs border-collapse min-w-[680px]">
              <thead>
                <tr className="bg-lavender/10 text-plum-dark border-b border-lilac/15 font-bold tracking-wider text-[0.65rem] uppercase">
                  <th className="p-3.5 pl-5">Tailored Size</th>
                  <th className={`p-3.5 ${region === 'US' ? 'bg-lavender/20 text-plum-dark font-extrabold border-x border-lavender/20' : ''}`}>
                    US Suit/Chest {region === 'US' && '★'}
                  </th>
                  <th className={`p-3.5 ${region === 'UK' ? 'bg-lavender/20 text-plum-dark font-extrabold border-x border-lavender/20' : ''}`}>
                    UK Suit/Chest {region === 'UK' && '★'}
                  </th>
                  <th className={`p-3.5 ${region === 'EU' ? 'bg-lavender/20 text-plum-dark font-extrabold border-x border-lavender/20' : ''}`}>
                    EU Size {region === 'EU' && '★'}
                  </th>
                  <th className="p-3.5">Chest ({unit})</th>
                  <th className="p-3.5">Waist ({unit})</th>
                  <th className="p-3.5">Neck ({unit})</th>
                  <th className="p-3.5">Shoulder ({unit})</th>
                  <th className="p-3.5 pr-5">Agbada / Length ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-[0.72rem] text-plum-dark">
                {MEN_SIZE_CHART.map((row) => {
                  const isHighlighted = selectedRow === row.alphaSize;
                  return (
                    <tr
                      key={row.alphaSize}
                      onClick={() => {
                        setSelectedRow(row.alphaSize);
                        if (onSelectSize) onSelectSize(row.alphaSize);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isHighlighted
                          ? 'bg-lavender/15 font-semibold text-plum-dark'
                          : 'hover:bg-zinc-50'
                      }`}
                    >
                      <td className="p-3.5 pl-5 font-sans font-bold flex items-center gap-2">
                        {isHighlighted && <Check className="w-3.5 h-3.5 text-lavender shrink-0" />}
                        <span className="px-2 py-0.5 rounded bg-zinc-100 font-mono text-xs">
                          {row.alphaSize}
                        </span>
                      </td>
                      <td className={`p-3.5 font-mono ${region === 'US' ? 'bg-lavender/10 font-bold text-plum-dark border-x border-lavender/20' : ''}`}>
                        {row.usSize}
                      </td>
                      <td className={`p-3.5 font-mono ${region === 'UK' ? 'bg-lavender/10 font-bold text-plum-dark border-x border-lavender/20' : ''}`}>
                        {row.ukSize}
                      </td>
                      <td className={`p-3.5 font-mono ${region === 'EU' ? 'bg-lavender/10 font-bold text-plum-dark border-x border-lavender/20' : ''}`}>
                        {row.euSize}
                      </td>
                      <td className="p-3.5 font-mono">
                        {unit === 'in' ? row.chestIn : row.chestCm}
                      </td>
                      <td className="p-3.5 font-mono">
                        {unit === 'in' ? row.waistIn : row.waistCm}
                      </td>
                      <td className="p-3.5 font-mono">
                        {unit === 'in' ? row.neckIn : row.neckCm}
                      </td>
                      <td className="p-3.5 font-mono">
                        {unit === 'in' ? row.shoulderIn : row.shoulderCm}
                      </td>
                      <td className="p-3.5 pr-5 font-mono">
                        {unit === 'in' ? row.agbadaLengthIn : row.agbadaLengthCm}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer info inside table card */}
        <div className="p-3 bg-zinc-50 border-t border-zinc-100 text-[0.65rem] text-text-light flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            Click any row to select your tailored fitting coordinate.
          </span>
          <span className="font-mono text-text-muted">
            All coordinates measured flat on finished garments with bespoke ease.
          </span>
        </div>
      </div>

      {/* ═══ STEP-BY-STEP MEASURING GUIDE ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 rounded-md border border-lilac/20 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-lavender" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-plum-dark">
              How to Take Accurate Body Measurements
            </h4>
          </div>
          <div className="space-y-3 text-xs text-text-light">
            {MEASURING_TIPS.map((tip) => (
              <div key={tip.step} className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-lavender/15 text-mauve-deep text-[0.62rem] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {tip.step}
                </span>
                <div>
                  <strong className="text-plum-dark font-medium block text-[0.72rem]">
                    {tip.title}
                  </strong>
                  <p className="text-[0.68rem] text-text-light leading-relaxed">
                    {tip.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Tailoring & WhatsApp Direct Consultation Card */}
        <div className="bg-pearl-2/30 p-5 rounded-md border border-lilac/25 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-mauve-deep" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-plum-dark">
                Custom Tailoring & Bespoke Proportions
              </h4>
            </div>
            <p className="text-xs text-text-light leading-relaxed mb-3">
              Because Nnepa Foriwaa specializes in authentic Ghanaian handcrafted luxury, we understand that standard sizes do not fit everyone identically.
            </p>
            <ul className="text-[0.7rem] text-text-light space-y-1.5 list-disc pl-4 mb-4">
              <li>Our Boubous, Kaftans, and Agbadas are cut with majestic, comfortable ease.</li>
              <li>Fitted gowns and wedding suits feature tailored darting and internal facings.</li>
              <li>Free alteration consultations available directly with our master tailors in Accra.</li>
            </ul>
          </div>

          <a
            href={whatsappInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2px] font-bold text-[0.65rem] tracking-[0.2em] uppercase border-none cursor-pointer transition-all flex items-center justify-center gap-2 shadow-xs text-center no-underline"
          >
            <MessageSquare className="w-4 h-4" />
            Send Custom Measurements on WhatsApp
          </a>
        </div>
      </div>

    </div>
  );
}
