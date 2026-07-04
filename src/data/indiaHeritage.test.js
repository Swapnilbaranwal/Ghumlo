import { describe, it, expect } from 'vitest';
import {
  INDIAN_DESTINATIONS,
  INDIAN_FESTIVALS_2026,
  getUpcomingFestivals,
  matchDestinations,
  matchScoreToPercent,
} from './indiaHeritage.js';

const ALL_INTEREST_VALUES = ['music', 'craft', 'temples', 'food', 'folklore', 'textiles', 'spiritual', 'nature', 'royal', 'coastal'];

describe('INDIAN_DESTINATIONS', () => {
  it('has at least one destination with the required shape', () => {
    expect(INDIAN_DESTINATIONS.length).toBeGreaterThan(0);
    for (const dest of INDIAN_DESTINATIONS) {
      expect(dest.id).toBeTruthy();
      expect(dest.name).toBeTruthy();
      expect(Array.isArray(dest.heritageSites)).toBe(true);
      expect(dest.heritageSites.length).toBeGreaterThan(0);
      expect(Array.isArray(dest.intangibleHeritage)).toBe(true);
      expect(Array.isArray(dest.interestTags)).toBe(true);
      expect(dest.interestTags.length).toBeGreaterThan(0);
      for (const tag of dest.interestTags) {
        expect(ALL_INTEREST_VALUES).toContain(tag);
      }
    }
  });

  it('every onboarding interest option matches at least one destination', () => {
    // Regression test for a real bug: interests that never appeared in any
    // destination's interestTags silently contributed zero score no matter
    // what a traveler picked (see matchDestinations' doc comment).
    for (const value of ALL_INTEREST_VALUES) {
      const matches = INDIAN_DESTINATIONS.filter((d) => d.interestTags.includes(value));
      expect(matches.length).toBeGreaterThan(0);
    }
  });

  it('has unique destination ids', () => {
    const ids = INDIAN_DESTINATIONS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('getUpcomingFestivals', () => {
  it('returns only festivals on/after the reference date, sorted ascending', () => {
    const ref = new Date('2026-06-01');
    const result = getUpcomingFestivals(ref);
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(5);
    for (const f of result) {
      expect(new Date(f.date).getTime()).toBeGreaterThanOrEqual(ref.getTime());
    }
    const dates = result.map((f) => new Date(f.date).getTime());
    expect(dates).toEqual([...dates].sort((a, b) => a - b));
  });

  it('returns an empty array when every festival has passed', () => {
    const farFuture = new Date('2030-01-01');
    expect(getUpcomingFestivals(farFuture)).toEqual([]);
  });

  it('never returns more results than the source list has', () => {
    const past = new Date('2000-01-01');
    expect(getUpcomingFestivals(past).length).toBeLessThanOrEqual(INDIAN_FESTIVALS_2026.length);
  });
});

describe('matchDestinations', () => {
  it('is deterministic for the same input', () => {
    const a = matchDestinations(['temples', 'music'], 'spiritual');
    const b = matchDestinations(['temples', 'music'], 'spiritual');
    expect(a.map((d) => d.id)).toEqual(b.map((d) => d.id));
  });

  it('returns every destination, ranked by descending matchScore', () => {
    const ranked = matchDestinations(['textiles', 'royal'], 'romantic');
    expect(ranked.length).toBe(INDIAN_DESTINATIONS.length);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].matchScore).toBeGreaterThanOrEqual(ranked[i].matchScore);
    }
  });

  it('scores a destination whose vibe/interests overlap higher than one with no overlap', () => {
    const ranked = matchDestinations(['spiritual', 'temples'], 'spiritual');
    const varanasi = ranked.find((d) => d.id === 'varanasi');
    const shillong = ranked.find((d) => d.id === 'shillong');
    expect(varanasi.matchScore).toBeGreaterThan(shillong.matchScore);
  });

  it('handles empty interests without throwing', () => {
    expect(() => matchDestinations([], '')).not.toThrow();
  });

  it('lets previously dead interests (food, folklore, textiles) change the ranking', () => {
    // Before the interestTags fix, these three values never matched any
    // destination text and always contributed 0 points.
    const foodRanked = matchDestinations(['food'], '');
    const jaipur = foodRanked.find((d) => d.id === 'jaipur');
    const shillong = foodRanked.find((d) => d.id === 'shillong');
    expect(jaipur.matchScore).toBeGreaterThan(shillong.matchScore);

    const textilesRanked = matchDestinations(['textiles'], '');
    expect(textilesRanked[0].id).toBe('varanasi');

    const folkloreRanked = matchDestinations(['folklore'], '');
    expect(folkloreRanked[0].matchScore).toBeGreaterThan(0);
  });

  it('applies a mood bonus for every MOOD_OPTIONS value, including foodie and historical', () => {
    // Before the fix, "foodie" and "historical" moods contributed no bonus
    // at all, unlike spiritual/adventurous/romantic/creative.
    const noMood = matchDestinations(['royal'], '');
    const foodieMood = matchDestinations(['royal'], 'foodie');
    const jaipurNoMood = noMood.find((d) => d.id === 'jaipur').matchScore;
    const jaipurFoodie = foodieMood.find((d) => d.id === 'jaipur').matchScore;
    expect(jaipurFoodie).toBeGreaterThan(jaipurNoMood);

    const historicalMood = matchDestinations(['craft'], 'historical');
    const varanasiHistorical = historicalMood.find((d) => d.id === 'varanasi').matchScore;
    const varanasiNoMood = matchDestinations(['craft'], '').find((d) => d.id === 'varanasi').matchScore;
    expect(varanasiHistorical).toBeGreaterThan(varanasiNoMood);
  });
});

describe('matchScoreToPercent', () => {
  it('never exceeds the 35-97 display range', () => {
    expect(matchScoreToPercent(0)).toBeGreaterThanOrEqual(35);
    expect(matchScoreToPercent(1000)).toBeLessThanOrEqual(97);
  });

  it('increases monotonically with score', () => {
    expect(matchScoreToPercent(5)).toBeLessThanOrEqual(matchScoreToPercent(10));
  });
});
