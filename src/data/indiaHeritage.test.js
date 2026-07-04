import { describe, it, expect } from 'vitest';
import {
  INDIAN_DESTINATIONS,
  INDIAN_FESTIVALS_2026,
  getUpcomingFestivals,
  matchDestinations,
  matchScoreToPercent,
} from './indiaHeritage.js';

describe('INDIAN_DESTINATIONS', () => {
  it('has at least one destination with the required shape', () => {
    expect(INDIAN_DESTINATIONS.length).toBeGreaterThan(0);
    for (const dest of INDIAN_DESTINATIONS) {
      expect(dest.id).toBeTruthy();
      expect(dest.name).toBeTruthy();
      expect(Array.isArray(dest.heritageSites)).toBe(true);
      expect(dest.heritageSites.length).toBeGreaterThan(0);
      expect(Array.isArray(dest.intangibleHeritage)).toBe(true);
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
