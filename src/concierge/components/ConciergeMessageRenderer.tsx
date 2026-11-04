/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Concierge Message Presentation & Structured Rendering System
 * Replaces raw Markdown with art-directed, accessible, sanitized UI components.
 * Zero raw asterisks (**), zero raw hashtags (##), zero raw dashes.
 */

import React from 'react';
import {
  Clock,
  Truck,
  Ruler,
  ShoppingBag,
  CreditCard,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  MapPin,
  HelpCircle,
  Scissors
} from 'lucide-react';

interface ConciergeMessageRendererProps {
  text: string;
  sender: 'concierge' | 'user';
  intent?: string;
}

/**
 * Parses inline formatting safely into React nodes.
 * Replaces **bold** with <strong> and cleans raw markdown syntax.
 */
export function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Clean trailing punctuation or raw formatting artifacts
  let clean = text.replace(/^#+\s*/g, '');

  // Split on **bold** tokens
  const parts = clean.split(/(\*\*[^*]+\*\*)/g);

  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
          const inner = part.slice(2, -2);
          return (
            <strong key={idx} className="font-semibold text-plum-dark">
              {inner}
            </strong>
          );
        }

        // Parse internal hashes or links like (#/checkout) or (#/contact)
        if (part.includes('(#/')) {
          const linkParts = part.split(/(\(#\/[a-z0-9_-]+\))/gi);
          return (
            <React.Fragment key={idx}>
              {linkParts.map((sub, sIdx) => {
                if (sub.startsWith('(#/') && sub.endsWith(')')) {
                  const target = sub.slice(3, -1);
                  return (
                    <span
                      key={sIdx}
                      className="inline-block font-medium text-plum underline underline-offset-2"
                    >
                      {target}
                    </span>
                  );
                }
                return sub;
              })}
            </React.Fragment>
          );
        }

        return part;
      })}
    </>
  );
}

interface ParsedBlock {
  type: 'heading' | 'numbered_list' | 'bullet_list' | 'processing_badge' | 'paragraph';
  headingText?: string;
  items?: {
    num?: number;
    key?: string;
    value?: string;
    rawText: string;
  }[];
  paragraphText?: string;
}

/**
 * Parses raw text into semantic blocks for typography and visual layout.
 */
function parseMessageBlocks(rawText: string): ParsedBlock[] {
  const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const blocks: ParsedBlock[] = [];

  let currentNumberedItems: { num: number; key?: string; value?: string; rawText: string }[] = [];
  let currentBulletItems: { key?: string; value?: string; rawText: string }[] = [];

  const flushNumbered = () => {
    if (currentNumberedItems.length > 0) {
      blocks.push({
        type: 'numbered_list',
        items: [...currentNumberedItems]
      });
      currentNumberedItems = [];
    }
  };

  const flushBullets = () => {
    if (currentBulletItems.length > 0) {
      blocks.push({
        type: 'bullet_list',
        items: [...currentBulletItems]
      });
      currentBulletItems = [];
    }
  };

  for (const line of lines) {
    // 1. Check for Headings: e.g. "**How to Place an Order at Nnepa Foriwaa:**" or "### Title"
    const headingMatch = line.match(/^(?:#+\s*|\*\*)\s*([^*#]+?)\s*(?:\*\*:?|:)$/);
    if (headingMatch && line.length < 90 && !line.startsWith('•') && !line.startsWith('-') && !/^\d+\./.test(line)) {
      flushNumbered();
      flushBullets();
      blocks.push({
        type: 'heading',
        headingText: headingMatch[1].replace(/:$/, '')
      });
      continue;
    }

    // 2. Check for Numbered Steps: e.g. "1. **Select Piece**: Description"
    const stepMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (stepMatch) {
      flushBullets();
      const num = parseInt(stepMatch[1], 10);
      const rest = stepMatch[2];

      const kvMatch = rest.match(/^\*\*([^*:]+)\*\*:\s*(.*)$/);
      if (kvMatch) {
        currentNumberedItems.push({
          num,
          key: kvMatch[1].trim(),
          value: kvMatch[2].trim(),
          rawText: rest
        });
      } else {
        currentNumberedItems.push({
          num,
          rawText: rest
        });
      }
      continue;
    }

    // 3. Check for Bullets / Key-Value Pairs: e.g. "• **Garment**: Queen Mother..."
    const bulletMatch = line.match(/^[•\-\*]\s+(.*)$/);
    if (bulletMatch) {
      flushNumbered();
      const content = bulletMatch[1];
      const kvMatch = content.match(/^\*\*([^*:]+)\*\*:\s*(.*)$/);

      if (kvMatch) {
        const key = kvMatch[1].trim();
        const value = kvMatch[2].trim();

        // If it's a standalone turnaround line, flush previous bullets and emit as a badge
        if (/turnaround|processing time|tailoring turnaround/i.test(key) && currentBulletItems.length === 0) {
          blocks.push({
            type: 'processing_badge',
            items: [{ key, value, rawText: content }]
          });
          continue;
        }

        currentBulletItems.push({
          key,
          value,
          rawText: content
        });
      } else {
        currentBulletItems.push({
          rawText: content
        });
      }
      continue;
    }

    // 4. Regular Paragraph Line
    flushNumbered();
    flushBullets();

    // Check if line is a processing badge line on its own
    if (/^tailoring takes \d+ to \d+ working days/i.test(line)) {
      blocks.push({
        type: 'processing_badge',
        items: [{ key: 'Tailoring Turnaround', value: line, rawText: line }]
      });
      continue;
    }

    blocks.push({
      type: 'paragraph',
      paragraphText: line
    });
  }

  flushNumbered();
  flushBullets();

  return blocks;
}

export default function ConciergeMessageRenderer({ text, sender, intent }: ConciergeMessageRendererProps) {
  // If user message, render clean aligned paragraph
  if (sender === 'user') {
    return <p className="leading-relaxed text-[15px] sm:text-[15.5px]">{text}</p>;
  }

  const blocks = parseMessageBlocks(text);

  return (
    <div className="space-y-3 text-[15px] sm:text-[15.5px] text-zinc-900 leading-relaxed font-normal">
      {blocks.map((block, bIdx) => {
        // ─── 1. HEADING ──────────────────────────────────────────────────────
        if (block.type === 'heading') {
          return (
            <div key={bIdx} className="pt-1 pb-1 border-b border-lilac/25 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lavender shrink-0" />
              <h4 className="font-bold text-plum-dark text-sm sm:text-[14.5px] uppercase tracking-wider">
                {block.headingText}
              </h4>
            </div>
          );
        }

        // ─── 2. NUMBERED STEPS ──────────────────────────────────────────────
        if (block.type === 'numbered_list' && block.items) {
          return (
            <div key={bIdx} className="space-y-2.5 my-2.5 bg-zinc-50/90 rounded-xl p-3.5 border border-zinc-200/80">
              {block.items.map((item, iIdx) => (
                <div key={iIdx} className="flex items-start gap-2.5 text-[14px] sm:text-[15px]">
                  <span className="w-5.5 h-5.5 rounded-full bg-plum-dark text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    {item.num ?? iIdx + 1}
                  </span>
                  <div className="flex-1 leading-snug">
                    {item.key && (
                      <strong className="font-bold text-plum-dark mr-1.5">
                        {item.key}:
                      </strong>
                    )}
                    <span className="text-zinc-800">
                      {renderInlineMarkdown(item.value || item.rawText)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        }

        // ─── 3. PROCESSING TIME BADGE ────────────────────────────────────────
        if (block.type === 'processing_badge' && block.items && block.items[0]) {
          const item = block.items[0];
          return (
            <div
              key={bIdx}
              className="flex items-center gap-2 px-3.5 py-2 bg-lavender/15 rounded-lg border border-lilac/30 text-plum-dark shadow-2xs my-2"
            >
              <Clock className="w-4 h-4 text-lavender shrink-0" />
              <span className="text-[13.5px] sm:text-[14px] font-medium leading-tight">
                {item.key ? <strong className="font-semibold mr-1">{item.key}:</strong> : null}
                {renderInlineMarkdown(item.value || item.rawText)}
              </span>
            </div>
          );
        }

        // ─── 4. STRUCTURED BULLET LIST / CARDS ────────────────────────────────
        if (block.type === 'bullet_list' && block.items) {
          const isOrderSummary = block.items.some(
            (it) => it.key && /garment|total|total price|quantity/i.test(it.key)
          );

          const isSizingSpecs = block.items.some(
            (it) => it.key && /your measurements|brand size chart|recommended size/i.test(it.key)
          );

          const isDeliverySchedule = block.items.some(
            (it) => it.key && /accra|regional|international|turnaround/i.test(it.key)
          );

          // 4a. Order Summary Card
          if (isOrderSummary) {
            return (
              <div
                key={bIdx}
                className="my-2.5 bg-gradient-to-b from-white to-zinc-50/70 border border-zinc-200/90 rounded-xl p-4 shadow-xs"
              >
                <div className="flex items-center gap-2 text-xs sm:text-[13px] uppercase font-bold tracking-wider text-plum-dark pb-2 mb-2 border-b border-zinc-200/80">
                  <ShoppingBag className="w-4 h-4 text-lavender" />
                  <span>Order Specification</span>
                </div>
                <div className="space-y-2 text-[14px] sm:text-[15px]">
                  {block.items.map((item, iIdx) => {
                    const isTotal = item.key && /total/i.test(item.key);
                    return (
                      <div
                        key={iIdx}
                        className={`flex items-center justify-between gap-2 py-0.5 ${
                          isTotal ? 'pt-2 mt-2 border-t border-zinc-200 font-bold text-plum-dark text-[15px] sm:text-[16px]' : 'text-zinc-800'
                        }`}
                      >
                        <span className={isTotal ? 'text-plum-dark font-bold' : 'text-zinc-600 font-medium'}>
                          {item.key || 'Item'}
                        </span>
                        <span className={`text-right ${isTotal ? 'text-plum-dark text-[15px] sm:text-[16px] font-bold' : 'text-zinc-950 font-medium'}`}>
                          {renderInlineMarkdown(item.value || item.rawText)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // 4b. Sizing Recommendation Card
          if (isSizingSpecs) {
            return (
              <div
                key={bIdx}
                className="my-2.5 bg-gradient-to-b from-white to-zinc-50/60 border border-lilac/30 rounded-xl p-4 shadow-xs space-y-2.5"
              >
                <div className="flex items-center gap-2 text-xs sm:text-[13px] uppercase font-bold tracking-wider text-plum-dark pb-2 border-b border-lilac/20">
                  <Ruler className="w-4 h-4 text-lavender" />
                  <span>Size Recommendation</span>
                </div>
                <div className="space-y-2 text-[14px] sm:text-[15px]">
                  {block.items.map((item, iIdx) => {
                    const isRec = item.key && /recommended size/i.test(item.key);
                    if (isRec) {
                      return (
                        <div
                          key={iIdx}
                          className="flex items-center justify-between p-3 bg-plum-dark text-white rounded-lg shadow-xs mt-1.5"
                        >
                          <span className="text-xs uppercase tracking-wider font-semibold text-lavender">
                            {item.key}
                          </span>
                          <span className="text-sm sm:text-base font-bold px-2.5 py-0.5 bg-white/15 rounded text-white">
                            {renderInlineMarkdown(item.value || item.rawText)}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div key={iIdx} className="flex flex-col gap-0.5 text-zinc-800">
                        {item.key && (
                          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
                            {item.key}
                          </span>
                        )}
                        <span className="text-zinc-950 font-medium">
                          {renderInlineMarkdown(item.value || item.rawText)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // 4c. Delivery Schedule Card
          if (isDeliverySchedule) {
            return (
              <div
                key={bIdx}
                className="my-2.5 bg-white border border-zinc-200/90 rounded-xl p-4 shadow-xs space-y-2.5"
              >
                <div className="flex items-center gap-2 text-xs sm:text-[13px] uppercase font-bold tracking-wider text-plum-dark pb-2 border-b border-zinc-100">
                  <Truck className="w-4 h-4 text-lavender" />
                  <span>Delivery Schedule & Transit</span>
                </div>
                <div className="space-y-2.5 text-[14px] sm:text-[15px]">
                  {block.items.map((item, iIdx) => {
                    const isTurnaround = item.key && /turnaround/i.test(item.key);
                    return (
                      <div
                        key={iIdx}
                        className={`p-3 rounded-lg ${
                          isTurnaround
                            ? 'bg-lavender/10 border border-lilac/30 text-plum-dark'
                            : 'bg-zinc-50 border border-zinc-200/60'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-plum-dark">
                          {isTurnaround ? (
                            <Clock className="w-3.5 h-3.5 text-lavender" />
                          ) : (
                            <MapPin className="w-3.5 h-3.5 text-lavender" />
                          )}
                          <span>{item.key}</span>
                        </div>
                        <p className="text-zinc-800 text-[13.5px] sm:text-[14px] mt-1 leading-relaxed">
                          {renderInlineMarkdown(item.value || item.rawText)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // 4d. Default Clean Key-Value / Bullet List
          return (
            <div key={bIdx} className="space-y-2 my-2">
              {block.items.map((item, iIdx) => (
                <div key={iIdx} className="flex items-start gap-2.5 text-[14.5px] sm:text-[15px] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-lavender shrink-0 mt-2" />
                  <div className="flex-1">
                    {item.key && (
                      <strong className="font-semibold text-plum-dark mr-1.5">
                        {item.key}:
                      </strong>
                    )}
                    <span className="text-zinc-800">
                      {renderInlineMarkdown(item.value || item.rawText)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        }

        // ─── 5. REGULAR PARAGRAPH ────────────────────────────────────────────
        return (
          <p key={bIdx} className="leading-relaxed text-zinc-900 text-[15px] sm:text-[15.5px]">
            {renderInlineMarkdown(block.paragraphText || '')}
          </p>
        );
      })}
    </div>
  );
}
