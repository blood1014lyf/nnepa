import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getEasterSunday,
  getBlackFriday,
  getNextOccasionTarget,
  calculateLiveCountdown,
  getSeasonalGreetingPool,
  getNextGreetingIndex
} from '../knowledge/seasonalGreetings.ts';

test('Seasonal Greetings: Calculates Easter Sunday correctly', () => {
  // Easter 2026 is April 5, 2026
  const easter2026 = getEasterSunday(2026);
  assert.equal(easter2026.getUTCFullYear(), 2026);
  assert.equal(easter2026.getUTCMonth(), 3); // 3 = April (0-indexed)
  assert.equal(easter2026.getUTCDate(), 5);

  // Easter 2027 is March 28, 2027
  const easter2027 = getEasterSunday(2027);
  assert.equal(easter2027.getUTCFullYear(), 2027);
  assert.equal(easter2027.getUTCMonth(), 2); // 2 = March
  assert.equal(easter2027.getUTCDate(), 28);
});

test('Seasonal Greetings: Calculates Black Friday correctly', () => {
  // In 2026, Nov 1 is Sunday. 4th Thursday is Nov 26. Black Friday is Nov 27, 2026.
  const bf2026 = getBlackFriday(2026);
  assert.equal(bf2026.getUTCFullYear(), 2026);
  assert.equal(bf2026.getUTCMonth(), 10); // 10 = Nov
  assert.equal(bf2026.getUTCDate(), 27);
});

test('Seasonal Greetings: Targets Christmas in November and calculates live countdown', () => {
  const novDate = new Date(Date.UTC(2026, 10, 4, 12, 0, 0));
  const occasion = getNextOccasionTarget(novDate);

  // Since Black Friday is Nov 27 and within 25 days or Christmas is Dec 25:
  assert.ok(occasion.id === 'black_friday' || occasion.id === 'christmas');

  // Christmas target specifically
  const xmasTarget = new Date(Date.UTC(2026, 11, 25, 0, 0, 0));
  const countdown = calculateLiveCountdown(xmasTarget, novDate);

  assert.equal(countdown.isPast, false);
  assert.ok(countdown.days >= 50, 'Days to Christmas from early Nov is 50+');
  assert.match(countdown.formatted, /^\d+d \d{2}h \d{2}m \d{2}s$/);
});

test('Seasonal Greetings: Switches to New Year after Christmas', () => {
  const dec26 = new Date(Date.UTC(2026, 11, 26, 10, 0, 0));
  const occasion = getNextOccasionTarget(dec26);
  assert.equal(occasion.id, 'new_year');
  assert.equal(occasion.targetDate.getUTCFullYear(), 2027);
  assert.equal(occasion.targetDate.getUTCMonth(), 0);
  assert.equal(occasion.targetDate.getUTCDate(), 1);
});

test('Seasonal Greetings: Switches to Valentines Day in January', () => {
  const jan10 = new Date(Date.UTC(2027, 0, 10, 10, 0, 0));
  const occasion = getNextOccasionTarget(jan10);
  assert.equal(occasion.id, 'valentines');
  assert.equal(occasion.targetDate.getUTCMonth(), 1);
  assert.equal(occasion.targetDate.getUTCDate(), 14);
});

test('Seasonal Greetings: Greeting pool contains zero emoji characters', () => {
  const dates = [
    new Date(Date.UTC(2026, 10, 4)), // Nov
    new Date(Date.UTC(2026, 11, 20)), // Christmas
    new Date(Date.UTC(2026, 11, 28)), // New Year
    new Date(Date.UTC(2027, 1, 10)), // Valentine
    new Date(Date.UTC(2027, 3, 1)) // Easter
  ];

  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;

  for (const d of dates) {
    const pool = getSeasonalGreetingPool(d);
    assert.ok(pool.length >= 3, 'Contains at least 3 greetings in pool');
    for (const item of pool) {
      assert.ok(!emojiRegex.test(item.tag), `Tag "${item.tag}" must not contain emojis`);
      assert.ok(!emojiRegex.test(item.headline), `Headline "${item.headline}" must not contain emojis`);
      assert.ok(!emojiRegex.test(item.message), `Message "${item.message}" must not contain emojis`);
      if (item.actionLabel) {
        assert.ok(!emojiRegex.test(item.actionLabel), `Action label "${item.actionLabel}" must not contain emojis`);
      }
    }
  }
});

test('Seasonal Greetings: Rotation avoids repeating consecutive greetings', () => {
  const total = 5;
  let current = 0;
  for (let i = 0; i < 10; i++) {
    const next = getNextGreetingIndex(current, total);
    assert.notEqual(next, current, 'Next index must differ from current');
    current = next;
  }
});
