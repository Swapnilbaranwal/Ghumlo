// ============================================
// DEPRECATED — kept only as a backward-compatible re-export.
//
// This project originally called Gemini directly from this file. It has
// since been replaced by src/services/aiService.js, which retries transient
// Gemini errors, falls back to a second Gemini model, and — if configured —
// falls back further to Groq as an independent provider. All real logic now
// lives there; nothing in the app imports from this file anymore.
// ============================================

export {
  generateCulturalStory,
  generateHiddenGems,
  generateItinerary,
  generateCulturalInsight,
  checkAIHealth as checkGeminiHealth,
} from './aiService.js';
