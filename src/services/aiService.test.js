import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkAIHealth, generateCulturalStory } from './aiService.js';

// These tests must behave the same regardless of whatever real API keys a
// developer happens to have in their local .env — so we explicitly stub both
// provider keys to "unset" for every test in this file rather than relying
// on ambient environment state. This guarantees the "no provider configured"
// path is actually exercised, and that a real network call never fires from
// the test suite.
describe('aiService with no provider configured', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    vi.stubEnv('VITE_GROQ_API_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('checkAIHealth reports offline without making a network call', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const online = await checkAIHealth();
    expect(online).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('generateCulturalStory returns a structured error, never fabricated text', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const result = await generateCulturalStory({
      mood: 'spiritual',
      interests: ['temples'],
      destination: { name: 'Test City', state: 'Test State', intangibleHeritage: ['Test Craft'] },
      travelerName: 'Test Traveler',
    });
    expect(result.ok).toBe(false);
    expect(typeof result.error).toBe('string');
    expect(result.error.length).toBeGreaterThan(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('checkAIHealth caching', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key-not-a-placeholder');
    vi.stubEnv('VITE_GROQ_API_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reuses the result of a recent check instead of firing a fresh network call every time', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: 'OK' }] } }] }),
    });

    const first = await checkAIHealth();
    const second = await checkAIHealth();

    expect(first).toBe(true);
    expect(second).toBe(true);
    // DestinationDetail mounts this on every destination view — without
    // caching this would be 2 (or more) real network calls per traveler
    // session just to render a status badge.
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
