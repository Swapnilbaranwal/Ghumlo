import { describe, it, expect } from 'vitest';
import { checkGeminiHealth } from './geminiAI.js';
import { checkAIHealth } from './aiService.js';

// geminiAI.js is a deprecated re-export shim over aiService.js — verify the
// re-export actually points at the same implementation rather than silently
// drifting out of sync.
describe('geminiAI.js compatibility shim', () => {
  it('checkGeminiHealth is the same function as aiService.checkAIHealth', () => {
    expect(checkGeminiHealth).toBe(checkAIHealth);
  });
});
