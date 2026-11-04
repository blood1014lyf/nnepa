/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Ruler, ArrowLeft } from 'lucide-react';
import SizeChart from './SizeChart.tsx';
import { SizingCategory, SizingRegion } from '../sizeChartData.ts';

interface SizeChartViewProps {
  onBackToShop: () => void;
  initialCategory?: SizingCategory;
  initialRegion?: SizingRegion;
}

export default function SizeChartView({
  onBackToShop,
  initialCategory = 'women',
  initialRegion = 'US'
}: SizeChartViewProps) {
  return (
    <div className="pt-28 pb-20 bg-pearl min-h-screen text-plum-dark" id="size-chart-page-view">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Navigation Breadcrumb & Back button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBackToShop}
            className="flex items-center gap-2 px-3 py-2 bg-white/60 border border-lilac/15 hover:bg-white text-xs font-bold tracking-[0.2em] uppercase text-mauve-deep cursor-pointer rounded-[2px] transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-lavender" />
            Back to Collection
          </button>

          <div className="flex items-center gap-1.5 text-xs text-text-light">
            <Ruler className="w-4 h-4 text-lavender" />
            <span className="font-semibold text-plum-dark">Studio Size Calibration</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-lavender block mb-2">
            Nnepa Foriwaa • Size & Fit Guide
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-plum-dark">
            International Size Chart & Length Guide
          </h1>
          <p className="text-sm sm:text-base text-text-light max-w-xl mx-auto mt-3 leading-relaxed">
            Accurate sizing conversions across US, UK, and EU standards, paired with our official High-Waist-to-Feet Length Guide for a flawless tailored drape.
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-lavender to-mauve mx-auto mt-6" />
        </div>

        {/* Interactive Size Chart Tool */}
        <SizeChart
          defaultCategory={initialCategory}
          defaultRegion={initialRegion}
          isModal={false}
        />

      </div>
    </div>
  );
}
