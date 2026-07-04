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
